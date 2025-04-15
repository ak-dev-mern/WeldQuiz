import React, { useState } from "react";
import "../style/Questions.css";
import Questions from "./Questions.jsx"; // Import the Questions component
import { getToken } from "../auth/auth.js";
import axios from "axios"; // Import axios
import { useAppContext } from "../context/AppContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = getToken();
const AddQuestions = () => {
  const [formData, setFormData] = useState({
    category: "", // Add category field
    question: "",
    options: ["", "", "", ""],
    answer: "", // Store the value of the answer
    image: null,
    excelFile: null, // State for the Excel file
  });

  const [errors, setErrors] = useState({});
  const [uploadMethod, setUploadMethod] = useState("manual"); // State to track whether user is adding questions manually or via Excel

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
      // Limit to 5MB
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
    let newErrors = {};

    if (uploadMethod === "manual") {
      // Validate the manual form fields only
      if (!formData.category) newErrors.category = "Category is required.";
      if (!formData.question.trim())
        newErrors.question = "Question is required.";
      formData.options.forEach((option, index) => {
        if (!option.trim())
          newErrors[`option${index}`] = `Option ${index + 1} is required.`;
      });
      if (!formData.answer)
        newErrors.answer = "Please select the correct answer.";
    } else if (uploadMethod === "excel") {
      // For Excel, validate the Excel file only
      if (!formData.excelFile) {
        newErrors.excelFile = "Excel file is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    if (uploadMethod === "manual") {
      // For manual, append manual form fields
      formDataToSend.append("category", formData.category);
      formDataToSend.append("question", formData.question);
      formData.options.forEach((option, index) => {
        formDataToSend.append(`option${index + 1}`, option);
      });
      formDataToSend.append("answer", formData.answer);

      if (formData.image) formDataToSend.append("image", formData.image);
    } else if (uploadMethod === "excel") {
      // For excel, append the excel file
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
          question: "",
          options: ["", "", "", ""],
          answer: "",
          image: null,
          excelFile: null,
        });
        setErrors({});
      } else {
        alert("Failed to add question");
      }
    } catch (error) {
      alert("An error occurred while adding the question.");
    }
  };

  const { triggerFunction } = useAppContext();

  const handleButtonClick = () => {
    triggerFunction(); // Enable the function in the context
  };

  return (
    <>
      {/* Nav Tabs */}
      <ul
        className="nav nav-tabs  d-flex justify-content-center align-items-center border-0"
        id="myTab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active  question-tab-link"
            id="tab1-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab1"
            type="button"
            role="tab"
            aria-controls="tab1"
            aria-selected="true"
          >
            Add New Questions
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link  question-tab-link"
            id="tab2-tab"
            data-bs-toggle="tab"
            data-bs-target="#tab2"
            type="button"
            role="tab"
            aria-controls="tab2"
            aria-selected="false"
            onClick={handleButtonClick}
          >
            Questions List
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3 mt-4" id="myTabContent">
        <div
          className="tab-pane fade show active"
          id="tab1"
          role="tabpanel"
          aria-labelledby="tab1-tab"
        >
          <div className="add-question-container">
            <h3 className="text-center mb-4">Add Question</h3>
            {/* Toggle between manual and Excel upload */}
            <div className="mb-4">
              <label className="form-label">Choose Upload Method</label>
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
              className="border p-4 shadow-sm bg-transparent rounded rounded-4"
            >
              {uploadMethod === "manual" && (
                <>
                  {/* Manual Question Entry */}
                  <div className="row">
                    {/* Category Input */}
                    <div className="col-md-12 mb-2">
                      <label className="form-label" htmlFor="category">
                        Category
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
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
                      {errors.category && (
                        <small className="text-danger">{errors.category}</small>
                      )}
                    </div>
                    {/* Question Input */}
                    <div className="col-md-12 mb-2">
                      <label className="form-label" htmlFor="question">
                        Question
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="question"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        required
                        placeholder="Enter your question"
                      />
                      {errors.question && (
                        <small className="text-danger">{errors.question}</small>
                      )}
                    </div>
                    {/* Options Input */}
                    {formData.options.map((option, index) => (
                      <div className="col-md-6 mb-2" key={index}>
                        <label
                          className="form-label"
                          htmlFor={`option${index}`}
                        >
                          Option {index + 1}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id={`option${index}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          required
                          placeholder={`Enter option ${index + 1}`}
                        />
                        {errors[`option${index}`] && (
                          <small className="text-danger">
                            {errors[`option${index}`]}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Correct Answer Input */}
                  <div className="mb-2 row">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="answer">
                        Correct Answer
                      </label>
                      <select
                        className="form-select"
                        id="answer"
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Correct Answer</option>
                        {formData.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.answer && (
                        <small className="text-danger">{errors.answer}</small>
                      )}
                    </div>
                    {/* Image Input */}
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label" htmlFor="image">
                          Attach Image (Optional)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="image"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {uploadMethod === "excel" && (
                <div className="mb-4">
                  <label className="form-label" htmlFor="excelFile">
                    Attach Excel File (Optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="excelFile"
                    accept=".xlsx"
                    onChange={handleExcelFileChange}
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div
          className="tab-pane fade"
          id="tab2"
          role="tabpanel"
          aria-labelledby="tab2-tab"
        >
          <Questions /> {/* Render the Questions component here */}
        </div>
      </div>
    </>
  );
};

export default AddQuestions;
