import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "../style/Questions.css";
import { getToken } from "../auth/auth";
import { useEffect, useState, useMemo } from "react";
import { format, isValid } from "date-fns";
import { useAppContext } from "../context/AppContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const fetchQuestions = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${API_URL}/api/questions/getquestions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch questions"
    );
  }
};

const flattenQuestions = (data) => {
  return data.flatMap((category) =>
    category.lessons.flatMap((lesson) =>
      lesson.questions.map((question) => ({
        ...question,
        category: category.category,
        lesson: lesson.lesson,
      }))
    )
  );
};

const deleteQuestion = async (id) => {
  const token = getToken();
  await axios.delete(`${API_URL}/api/questions/deletequestion/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateQuestion = async (updatedQuestion) => {
  const token = getToken();
  const formDataToSend = new FormData();

  Object.keys(updatedQuestion).forEach((key) => {
    if (key !== "id" && updatedQuestion[key] !== null) {
      formDataToSend.append(key, updatedQuestion[key]);
    }
  });

  const response = await axios.put(
    `${API_URL}/api/questions/updatequestion/${updatedQuestion.id}`,
    formDataToSend,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd-MMM-yyyy HH:mm:ss") : "N/A";
};

const Questions = () => {
  const queryClient = useQueryClient();
  const { isFunctionEnabled } = useAppContext();
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    image: null,
    category: "",
    lesson: "",
    imageUrl: null,
  });
  const [filterData, setFilterData] = useState({
    question: "",
    answer: "",
    category: "",
    lesson: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const {
    data: questionsData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    staleTime: 1000 * 60 * 5,
  });

  const allQuestions = useMemo(() => {
    return flattenQuestions(questionsData);
  }, [questionsData]);

  const currentOptions = useMemo(() => {
    return [
      { value: formData.option1, label: "Option 1" },
      { value: formData.option2, label: "Option 2" },
      { value: formData.option3, label: "Option 3" },
      { value: formData.option4, label: "Option 4" },
    ].filter((option) => option.value.trim() !== "");
  }, [formData.option1, formData.option2, formData.option3, formData.option4]);

  useEffect(() => {
    if (isFunctionEnabled) {
      refetch();
    }
  }, [isFunctionEnabled, refetch]);

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
      setEditingQuestionId(null);
      setValidationErrors({});
      const modal = document.getElementById("editModal");
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal?.hide();
      }
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
    },
  });

const handleDelete = (id) => {
  setQuestionToDelete(id);
  setShowModal(true);
};

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteMutation.mutate(questionToDelete);
      setShowModal(false);
    }
  };


  const handleEdit = (question) => {
    setEditingQuestionId(question.id);
    setFormData({
      ...question,
      image: null,
      lesson: question.lesson || "",
    });
    setValidationErrors({});
    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.question.trim()) errors.question = "Question is required";
    if (!formData.option1.trim()) errors.option1 = "Option 1 is required";
    if (!formData.option2.trim()) errors.option2 = "Option 2 is required";
    if (!formData.option3.trim()) errors.option3 = "Option 3 is required";
    if (!formData.option4.trim()) errors.option4 = "Option 4 is required";
    if (!formData.answer.trim()) errors.answer = "Answer is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.lesson.trim()) errors.lesson = "Lesson is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateMutation.mutate({ ...formData, id: editingQuestionId });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] || null }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setValidationErrors({});
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editModal")
    );
    modal?.hide();
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      return (
        (!filterData.category || q.category.includes(filterData.category)) &&
        (!filterData.lesson || q.lesson.includes(filterData.lesson)) &&
        (!filterData.question || q.question.includes(filterData.question)) &&
        (!filterData.answer || q.answer.includes(filterData.answer))
      );
    });
  }, [allQuestions, filterData]);

  const categories = useMemo(() => {
    const unique = new Set(allQuestions.map((q) => q.category));
    return Array.from(unique).sort();
  }, [allQuestions]);

  const lessons = useMemo(() => {
    const unique = new Set(allQuestions.map((q) => q.lesson).filter(Boolean));
    return Array.from(unique).sort();
  }, [allQuestions]);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger">
        Error: {error.message}
        <button
          onClick={() => refetch()}
          className="btn btn-sm btn-warning ms-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="text-center fw-bold my-3 text-light">Questions</h1>

      <div className="mb-3 d-flex flex-wrap justify-content-center gap-3">
        <div>
          <select
            className="form-select"
            name="category"
            value={filterData.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={`cat-${cat}`} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="form-select"
            name="lesson"
            value={filterData.lesson}
            onChange={handleFilterChange}
          >
            <option value="">All Lessons</option>
            {lessons.map((lesson) => (
              <option key={`lesson-${lesson}`} value={lesson}>
                {lesson}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            className="form-control"
            name="question"
            placeholder="Filter by question"
            value={filterData.question}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <input
            className="form-control"
            name="answer"
            placeholder="Filter by answer"
            value={filterData.answer}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="table-responsive question-table-custom-scroll">
        <table className="table table-striped table-hover table-bordered border-secondary">
          <thead className="sticky-top">
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Lesson</th>
              <th>Question</th>
              <th>Options</th>
              <th>Answer</th>
              <th>Image</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  No questions found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((question, index) => (
                <tr key={`question-${question.id}`}>
                  <td>{index + 1}</td>
                  <td>{question.category}</td>
                  <td>{question.lesson}</td>
                  <td>{question.question}</td>
                  <td>
                    <ol className="ps-3">
                      {[1, 2, 3, 4].map((num) => (
                        <li
                          key={`view-option-${num}-${question.id}`}
                          className={
                            question.answer === question[`option${num}`]
                              ? "text-success fw-bold"
                              : ""
                          }
                        >
                          {question[`option${num}`]}
                        </li>
                      ))}
                    </ol>
                  </td>
                  <td className="text-success fw-bold">{question.answer}</td>
                  <td>
                    {question.imageUrl ? (
                      <button
                        className="btn btn-info btn-sm px-2 py-0"
                        onClick={() => handleViewImage(question.imageUrl)}
                        data-bs-toggle="modal"
                        data-bs-target="#imageModal"
                      >
                        View
                      </button>
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{formatDate(question.createdAt)}</td>
                  <td>{formatDate(question.updatedAt)}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2 px-2 py-0"
                      onClick={() => handleEdit(question)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm px-2 py-0"
                      onClick={() => handleDelete(question.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
            <DeleteConfirmModal
              show={showModal}
              onHide={() => setShowModal(false)}
              onConfirm={confirmDelete}
              title="Delete Question?"
              message="Are you sure you want to delete this question? This action cannot be undone."
            />
          </tbody>
        </table>
      </div>

      {/* Edit Question Modal */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingQuestionId ? "Edit Question" : "Add Question"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCancelEdit}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className={`form-control ${
                        validationErrors.category ? "is-invalid" : ""
                      }`}
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={`cat-${cat}`} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <div className="invalid-feedback">
                        {validationErrors.category}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Lesson</label>
                    <select
                      name="lesson"
                      className={`form-control ${
                        validationErrors.lesson ? "is-invalid" : ""
                      }`}
                      value={formData.lesson}
                      onChange={handleChange}
                    >
                      <option value="">Select Lesson</option>
                      {lessons.map((lesson) => (
                        <option key={`lesson-${lesson}`} value={lesson}>
                          {lesson}
                        </option>
                      ))}
                    </select>
                    {validationErrors.lesson && (
                      <div className="invalid-feedback">
                        {validationErrors.lesson}
                      </div>
                    )}
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      name="question"
                      className={`form-control ${
                        validationErrors.question ? "is-invalid" : ""
                      }`}
                      value={formData.question}
                      onChange={handleChange}
                    />
                    {validationErrors.question && (
                      <div className="invalid-feedback">
                        {validationErrors.question}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Option 1</label>
                    <input
                      type="text"
                      name="option1"
                      className={`form-control ${
                        validationErrors.option1 ? "is-invalid" : ""
                      }`}
                      value={formData.option1}
                      onChange={handleChange}
                    />
                    {validationErrors.option1 && (
                      <div className="invalid-feedback">
                        {validationErrors.option1}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Option 2</label>
                    <input
                      type="text"
                      name="option2"
                      className={`form-control ${
                        validationErrors.option2 ? "is-invalid" : ""
                      }`}
                      value={formData.option2}
                      onChange={handleChange}
                    />
                    {validationErrors.option2 && (
                      <div className="invalid-feedback">
                        {validationErrors.option2}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Option 3</label>
                    <input
                      type="text"
                      name="option3"
                      className={`form-control ${
                        validationErrors.option3 ? "is-invalid" : ""
                      }`}
                      value={formData.option3}
                      onChange={handleChange}
                    />
                    {validationErrors.option3 && (
                      <div className="invalid-feedback">
                        {validationErrors.option3}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Option 4</label>
                    <input
                      type="text"
                      name="option4"
                      className={`form-control ${
                        validationErrors.option4 ? "is-invalid" : ""
                      }`}
                      value={formData.option4}
                      onChange={handleChange}
                    />
                    {validationErrors.option4 && (
                      <div className="invalid-feedback">
                        {validationErrors.option4}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Correct Answer</label>
                    <select
                      name="answer"
                      className={`form-control ${
                        validationErrors.answer ? "is-invalid" : ""
                      }`}
                      value={formData.answer}
                      onChange={handleChange}
                    >
                      <option value="">Select Correct Answer</option>
                      {currentOptions.map((option, index) => (
                        <option key={`opt-${index}`} value={option.value}>
                          {option.label}: {option.value}
                        </option>
                      ))}
                    </select>
                    {validationErrors.answer && (
                      <div className="invalid-feedback">
                        {validationErrors.answer}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Image (optional)</label>
                    <input
                      type="file"
                      name="image"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <small>Current Image:</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-info ms-2"
                          onClick={() => handleViewImage(formData.imageUrl)}
                          data-bs-toggle="modal"
                          data-bs-target="#imageModal"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image View Modal */}
      <div
        className="modal fade"
        id="imageModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Question Image</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Question"
                  className="img-fluid"
                  style={{ maxHeight: "70vh" }}
                />
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
