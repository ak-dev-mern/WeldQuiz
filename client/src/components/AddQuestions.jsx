import React, { useState } from "react";
import "../style/Questions.css";
import Questions from "./Questions.jsx";
import { getToken } from "../auth/auth.js";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = getToken();

const AddQuestions = () => {
  const [formData, setFormData] = useState({
    category: "",
    lesson: "",
    question: "",
    options: ["", "", "", ""],
    answer: "",
    image: null,
    excelFile: null,
  });

  const [errors, setErrors] = useState({});
  const [uploadMethod, setUploadMethod] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB.");
      return;
    }
    setFormData({ ...formData, image: file });
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      !file.name.endsWith(".xlsx") &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      alert("Please upload a valid Excel file.");
      return;
    }
    setFormData({ ...formData, excelFile: file });
  };

  const validateForm = () => {
    const newErrors = {};
    if (uploadMethod === "manual") {
      if (!formData.category) newErrors.category = "Category is required.";
      if (!formData.lesson) newErrors.lesson = "Lesson is required.";
      if (!formData.question.trim())
        newErrors.question = "Question is required.";
      formData.options.forEach((opt, i) => {
        if (!opt.trim())
          newErrors[`option${i}`] = `Option ${i + 1} is required.`;
      });
      if (!formData.answer)
        newErrors.answer = "Please select the correct answer.";
    } else if (uploadMethod === "excel") {
      if (!formData.excelFile) newErrors.excelFile = "Excel file is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    if (uploadMethod === "manual") {
      formDataToSend.append("category", formData.category);
      formDataToSend.append("lesson", formData.lesson);
      formDataToSend.append("question", formData.question);
      formData.options.forEach((opt, i) =>
        formDataToSend.append(`option${i + 1}`, opt)
      );
      formDataToSend.append("answer", formData.answer);
      if (formData.image) formDataToSend.append("image", formData.image);
    } else if (uploadMethod === "excel") {
      formDataToSend.append("excelFile", formData.excelFile);
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/questions/createquestions`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Question added successfully!");
        setFormData({
          category: "",
          lesson: "",
          question: "",
          options: ["", "", "", ""],
          answer: "",
          image: null,
          excelFile: null,
        });
        setErrors({});
      } else {
        alert("Failed to add question.");
      }
    } catch (err) {
      alert("Error while adding the question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { triggerFunction } = useAppContext();
  const handleButtonClick = () => triggerFunction();

  return (
    <>
      <ul className="nav nav-tabs justify-content-center border-0">
        <li className="nav-item">
          <button
            className="nav-link active text-light question-tab-link"
            data-bs-toggle="tab"
            data-bs-target="#tab1"
            type="button"
            role="tab"
          >
            Add New Question
          </button>
        </li>
        <li className="nav-item">
          <button
            className="nav-link question-tab-link"
            data-bs-toggle="tab"
            data-bs-target="#tab2"
            type="button"
            role="tab"
            onClick={handleButtonClick}
          >
            Questions List
          </button>
        </li>
      </ul>

      <div className="tab-content mt-2 rounded ">
        <div className="tab-pane fade  show active" id="tab1" role="tabpanel">
          <div className=" p-4 rounded shadow-sm">
            <h1 className="text-center mb-2 text-light fw-bold">
              Add Question
            </h1>

            <div className="mb-4 upload-method text-center">
              <label className="form-label ">Choose Upload Method</label>
              <select
                className="form-select"
                value={uploadMethod}
                onChange={(e) => setUploadMethod(e.target.value)}
              >
                <option value="manual">Manual Entry</option>
                <option value="excel">Upload Excel File</option>
              </select>
            </div>

            <form
              onSubmit={handleSubmit}
              className=" p-4 shadow-sm rounded rounded-4 add-question-form"
            >
              {uploadMethod === "manual" && (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option>PT General Paper</option>
                        <option>RT General Paper</option>
                        <option>MT General Paper</option>
                        <option>UT General Paper</option>
                        <option>PT Specific Paper</option>
                        <option>RT Specific Paper</option>
                        <option>MT Specific Paper</option>
                        <option>UT Specific Paper</option>
                      </select>
                      {errors.category && (
                        <small className="text-danger">{errors.category}</small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Lesson</label>
                      <input
                        type="text"
                        name="lesson"
                        value={formData.lesson}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter lesson name"
                        required
                      />
                      {errors.lesson && (
                        <small className="text-danger">{errors.lesson}</small>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter the question"
                      required
                    />
                    {errors.question && (
                      <small className="text-danger">{errors.question}</small>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="col-md-6">
                        <label className="form-label">Option {i + 1}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(i, e.target.value)
                          }
                          required
                        />
                        {errors[`option${i}`] && (
                          <small className="text-danger">
                            {errors[`option${i}`]}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Correct Answer</label>
                      <select
                        className="form-select"
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select correct answer</option>
                        {formData.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.answer && (
                        <small className="text-danger">{errors.answer}</small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Attach Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {uploadMethod === "excel" && (
                <div className="mb-4">
                  <label className="form-label">Attach Excel File</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".xlsx"
                    onChange={handleExcelFileChange}
                  />
                  {errors.excelFile && (
                    <small className="text-danger">{errors.excelFile}</small>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>

        <div className="tab-pane fade" id="tab2" role="tabpanel">
          <Questions />
        </div>
      </div>
    </>
  );
};

export default AddQuestions;
