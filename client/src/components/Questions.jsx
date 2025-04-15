import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "../style/Questions.css";
import { getToken } from "../auth/auth";
import { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { useAppContext } from "../context/AppContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fetch questions from the backend using axios with filters
const fetchQuestions = async (filters) => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/api/questions/getquestions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filters,
  });
  return response.data;
};

// Delete question function
const deleteQuestion = async (id) => {
  const token = getToken();
  await axios.delete(`${API_URL}/api/questions/deletequestion/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update question function
const updateQuestion = async (updatedQuestion) => {
  const token = getToken();
  const formDataToSend = new FormData();
  formDataToSend.append("category", updatedQuestion.category);
  formDataToSend.append("question", updatedQuestion.question);
  formDataToSend.append("option1", updatedQuestion.option1);
  formDataToSend.append("option2", updatedQuestion.option2);
  formDataToSend.append("option3", updatedQuestion.option3);
  formDataToSend.append("option4", updatedQuestion.option4);
  formDataToSend.append("answer", updatedQuestion.answer);
  if (updatedQuestion.image) {
    formDataToSend.append("image", updatedQuestion.image);
  }

  try {
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
  } catch (error) {
    throw error;
  }
};

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd-MMM-yyyy HH:mm:ss") : "N/A";
};

const Questions = () => {
  const queryClient = useQueryClient();
  const { isFunctionEnabled } = useAppContext();
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    image: null,
    category: "",
  });
  const [filterData, setFilterData] = useState({
    question: "",
    answer: "",
    category: "",
  });
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image URL

  // Fetch Questions with filters
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["questions", filterData],
    queryFn: () => fetchQuestions(filterData),
    enabled: true,
    staleTime: 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Refetch questions when `isFunctionEnabled` or `filterData` changes
  useEffect(() => {
    if (isFunctionEnabled) {
      queryClient.invalidateQueries(["questions"]);
    }
  }, [isFunctionEnabled, filterData, queryClient]);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
      setEditingQuestionId(null);
    },
  });

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle Edit
  const handleEdit = (question) => {
    if (!question || !question.id) {
      return;
    }

    setEditingQuestionId(question.id);
    setFormData({
      question: question.question || "",
      option1: question.option1 || "",
      option2: question.option2 || "",
      option3: question.option3 || "",
      option4: question.option4 || "",
      answer: question.answer || "",
      image: question.image || null,
      category: question.category || "",
    });
  };

  // Handle form submit for editing
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingQuestionId) {
      updateMutation.mutate({ ...formData, id: editingQuestionId });
    }
  };

  // Handle input change for form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change (image)
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image click to open modal
  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container-fluid">
      <h1 className="text-center fw-bold my-3 text-light">Questions</h1>

      {/* Filter Section */}
      <div className="mb-3 d-flex justify-content-center align-items-center gap-3">
        <input
          type="text"
          className="form-control w-25"
          name="category"
          placeholder="Filter by Category"
          value={filterData.category}
          onChange={handleFilterChange}
          aria-label="Filter by Category"
        />
        <input
          type="text"
          className="form-control w-25"
          name="question"
          placeholder="Filter by Question"
          value={filterData.question}
          onChange={handleFilterChange}
          aria-label="Filter by Question"
        />
        <input
          type="text"
          className="form-control w-25"
          name="answer"
          placeholder="Filter by Answer"
          value={filterData.answer}
          onChange={handleFilterChange}
          aria-label="Filter by Answer"
        />
      </div>

      <div className="table-responsive question-table-custom-scroll">
        <table className="table table-striped table-hover table-bordered border-secondary text-center">
          <thead>
            <tr className="sticky-top">
              <th>#</th>
              <th>Category</th>
              <th>Question</th>
              <th>Option 1</th>
              <th>Option 2</th>
              <th>Option 3</th>
              <th>Option 4</th>
              <th>Correct Answer</th>
              <th>Image</th>
              <th>CreatedAt</th>
              <th>UpdatedAt</th>
              <th colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!categories || categories.length === 0 ? (
              <div className="mt-3 text-light">No questions found</div>
            ) : null}
            {categories.map((category, categoryIndex) =>
              category.questions.map((question, index) => (
                <tr
                  key={question.id}
                  className={
                    editingQuestionId === question.id ? "table-danger" : ""
                  }
                >
                  {editingQuestionId === question.id ? (
                    <>
                      <td>{index + 1}</td>
                      <td>
                        <select
                          name="category"
                          id="category"
                          className="form-select"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          aria-label="Category"
                        >
                          <option value="PT General Paper">
                            PT General Paper
                          </option>
                          <option value="RT General Paper">
                            RT General Paper
                          </option>
                          <option value="MT General Paper">
                            MT General Paper
                          </option>
                          <option value="UT General Paper">
                            UT General Paper
                          </option>
                          <option value="PT Specific Paper">
                            PT Specific Paper
                          </option>
                          <option value="RT Specific Paper">
                            RT Specific Paper
                          </option>
                          <option value="MT Specific Paper">
                            MT Specific Paper
                          </option>
                          <option value="UT Specific Paper">
                            UT Specific Paper
                          </option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="question"
                          value={formData.question}
                          onChange={handleChange}
                          required
                          aria-label="Question"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="option1"
                          value={formData.option1}
                          onChange={handleChange}
                          required
                          aria-label="Option 1"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="option2"
                          value={formData.option2}
                          onChange={handleChange}
                          required
                          aria-label="Option 2"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="option3"
                          value={formData.option3}
                          onChange={handleChange}
                          required
                          aria-label="Option 3"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="option4"
                          value={formData.option4}
                          onChange={handleChange}
                          required
                          aria-label="Option 4"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          name="answer"
                          value={formData.answer}
                          onChange={handleChange}
                          required
                          aria-label="Correct Answer"
                        />
                      </td>
                      <td>
                        <input
                          type="file"
                          className="form-control"
                          name="image"
                          onChange={handleFileChange}
                          aria-label="Image"
                        />
                      </td>
                      <td>{formatDate(question.createdAt)}</td>
                      <td>{formatDate(question.updatedAt)}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm w-100 w-md-auto px-2 py-0"
                          onClick={handleSubmit}
                          aria-label="Save"
                        >
                          Save
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm w-100 w-md-auto px-2 py-0"
                          onClick={() => setEditingQuestionId(null)}
                          aria-label="Cancel"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{index + 1}</td>
                      <td>{category.category}</td>
                      <td>{question.question}</td>
                      <td>{question.option1}</td>
                      <td>{question.option2}</td>
                      <td>{question.option3}</td>
                      <td>{question.option4}</td>
                      <td>{question.answer}</td>
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
                          "N/A"
                        )}
                      </td>
                      <td>{formatDate(question.createdAt)}</td>
                      <td>{formatDate(question.updatedAt)}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm px-2 py-0"
                          onClick={() => handleEdit(question)}
                          aria-label="Edit"
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm px-2 py-0"
                          onClick={() => handleDelete(question.id)}
                          aria-label="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      <div
        className="modal fade"
        id="imageModal"
        tabIndex="-1"
        aria-labelledby="imageModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="imageModalLabel">
                Question Image
              </h5>
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
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm py-0 px-2"
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
