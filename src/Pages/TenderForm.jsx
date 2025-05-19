import React, { useState } from "react";
import {
  FiUpload,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiSave,
  FiList,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "./TenderForm.css";

const TenderForm = () => {
  const [activeTab, setActiveTab] = useState("my-tenders");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    budget: "",
    category: "construction",
    location: "",
    projectDuration: "",
    requirements: {
      minExperience: 3,
      insuranceRequired: true,
      licenseRequired: true,
    },
    documents: null,
    drawings: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Sample data
  const [myTenders, setMyTenders] = useState([
    {
      id: 1,
      title: "Residential Villa Construction",
      category: "construction",
      description: "3-story luxury villa with pool and landscaping",
      budget: 1850000,
      deadline: "2023-12-15",
      status: "open",
      bids: 4,
      location: "Kathmandu, Nepal",
      projectDuration: 36,
      lastUpdated: "2023-11-10",
    },
  ]);

  const [selectedTender, setSelectedTender] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [name]: checked,
        },
      }));
    } else if (files) {
      const validations = {
        documents: {
          types: ["application/pdf", "application/msword"],
          maxSize: 5 * 1024 * 1024,
        },
        drawings: {
          types: ["image/jpeg", "image/png", "application/pdf"],
          maxSize: 10 * 1024 * 1024,
        },
      };

      if (validations[name]) {
        const { types, maxSize } = validations[name];
        if (!types.includes(files[0].type)) {
          showNotification(
            `Please upload a valid file type: ${types.join(", ")}`,
            "error"
          );
          return;
        }
        if (files[0].size > maxSize) {
          showNotification(
            `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
            "error"
          );
          return;
        }
      }

      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Required field";
    if (!formData.description.trim()) newErrors.description = "Required field";
    if (!formData.deadline) newErrors.deadline = "Required field";
    if (new Date(formData.deadline) < new Date())
      newErrors.deadline = "Must be future date";
    if (!formData.budget || formData.budget <= 0)
      newErrors.budget = "Invalid amount";
    if (!formData.location) newErrors.location = "Required field";
    if (!formData.projectDuration) newErrors.projectDuration = "Required field";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const tenderData = {
        ...formData,
        id: editingId || Math.max(0, ...myTenders.map((t) => t.id)) + 1,
        status: "open",
        bids: 0,
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      setMyTenders((prev) =>
        editingId
          ? prev.map((t) => (t.id === editingId ? tenderData : t))
          : [tenderData, ...prev]
      );

      showNotification(
        editingId
          ? "Tender updated successfully!"
          : "Tender published successfully!"
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        deadline: "",
        budget: "",
        category: "construction",
        location: "",
        projectDuration: "",
        requirements: {
          minExperience: 3,
          insuranceRequired: true,
          licenseRequired: true,
        },
        documents: null,
        drawings: null,
      });
      setEditingId(null);
      setActiveTab("my-tenders");
    } catch (error) {
      console.error("Tender submission error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save tender. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tender) => {
    setFormData({
      title: tender.title,
      description: tender.description,
      deadline: tender.deadline,
      budget: tender.budget,
      category: tender.category,
      location: tender.location,
      projectDuration: tender.projectDuration,
      requirements: tender.requirements || {
        minExperience: 3,
        insuranceRequired: true,
        licenseRequired: true,
      },
      documents: null,
      drawings: null,
    });
    setEditingId(tender.id);
    setActiveTab("create");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this tender?")) {
      setMyTenders((prev) => prev.filter((tender) => tender.id !== id));
      showNotification("Tender deleted successfully");
    }
  };

  const handleViewBids = (tender) => {
    setSelectedTender(tender);
    setActiveTab("bid-management");
  };

  return (
    <div className="tender-container">
      {/* Notification System */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? (
            <FiCheckCircle className="icon" />
          ) : (
            <FiAlertCircle className="icon" />
          )}
          {notification.message}
        </div>
      )}

      <div className="tender-header">
        <h1>My Tender Projects</h1>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "my-tenders" ? "active" : ""}`}
            onClick={() => setActiveTab("my-tenders")}
          >
            <FiList /> My Tenders
          </button>
          <button
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("create");
              setEditingId(null);
            }}
          >
            <FiPlus /> {editingId ? "Edit Tender" : "Create Tender"}
          </button>
        </div>
      </div>

      <main className="dashboard-content">
        {activeTab === "create" ? (
          <form className="modern-tender-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Project Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FiFileText /> Tender Title*
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Luxury Villa Construction"
                      className={errors.title ? "error" : ""}
                    />
                    {errors.title && (
                      <span className="error-message">{errors.title}</span>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <FiCalendar /> Deadline*
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={errors.deadline ? "error" : ""}
                    />
                    {errors.deadline && (
                      <span className="error-message">{errors.deadline}</span>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <FiDollarSign /> Budget (USD)*
                    <div className="input-with-symbol">
                      <span>$</span>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        placeholder="50000"
                        className={errors.budget ? "error" : ""}
                      />
                    </div>
                    {errors.budget && (
                      <span className="error-message">{errors.budget}</span>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    Project Location*
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className={errors.location ? "error" : ""}
                    />
                    {errors.location && (
                      <span className="error-message">{errors.location}</span>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    Expected Duration (weeks)*
                    <input
                      type="number"
                      name="projectDuration"
                      value={formData.projectDuration}
                      onChange={handleChange}
                      min="1"
                      placeholder="12"
                      className={errors.projectDuration ? "error" : ""}
                    />
                    {errors.projectDuration && (
                      <span className="error-message">
                        {errors.projectDuration}
                      </span>
                    )}
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    Project Category
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="construction">Construction</option>
                      <option value="renovation">Renovation</option>
                      <option value="landscaping">Landscaping</option>
                      <option value="interior">Interior Design</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Contractor Requirements</h2>
              <div className="requirements-grid">
                <div className="form-group">
                  <label>
                    Minimum Experience (years)
                    <input
                      type="number"
                      name="minExperience"
                      value={formData.requirements.minExperience}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            minExperience: e.target.value,
                          },
                        }))
                      }
                      min="0"
                    />
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="insuranceRequired"
                      checked={formData.requirements.insuranceRequired}
                      onChange={handleChange}
                    />
                    Insurance Required
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="licenseRequired"
                      checked={formData.requirements.licenseRequired}
                      onChange={handleChange}
                    />
                    Valid License Required
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Project Description</h2>
              <div className="form-group">
                <label>
                  Detailed Requirements*
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe your project in detail..."
                    className={errors.description ? "error" : ""}
                  />
                  {errors.description && (
                    <span className="error-message">{errors.description}</span>
                  )}
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Attachments</h2>
              <div className="file-upload-group">
                <div className="upload-card">
                  <FiUpload size={24} />
                  <h3>Supporting Documents</h3>
                  <p>PDF or Word (max 5MB)</p>
                  <input
                    type="file"
                    name="documents"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    id="documents-upload"
                  />
                  <label htmlFor="documents-upload">Choose File</label>
                  {formData.documents && (
                    <div className="file-preview">
                      <span>{formData.documents.name}</span>
                      <span>
                        ({Math.round(formData.documents.size / 1024)} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="upload-card">
                  <FiUpload size={24} />
                  <h3>Drawings/Plans</h3>
                  <p>JPG, PNG or PDF (max 10MB)</p>
                  <input
                    type="file"
                    name="drawings"
                    onChange={handleChange}
                    accept="image/jpeg,image/png,.pdf"
                    id="drawings-upload"
                  />
                  <label htmlFor="drawings-upload">Choose File</label>
                  {formData.drawings && (
                    <div className="file-preview">
                      <span>{formData.drawings.name}</span>
                      <span>
                        ({Math.round(formData.drawings.size / 1024)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setActiveTab("my-tenders");
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    {editingId ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <FiSave /> {editingId ? "Update Tender" : "Publish Tender"}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : activeTab === "bid-management" ? (
          <div className="bid-management-view">
            <button
              className="back-button"
              onClick={() => setActiveTab("my-tenders")}
            >
              ← Back to My Tenders
            </button>
            <h2>Bids for {selectedTender?.title}</h2>
            <div className="bid-list">
              {[].length > 0 ? (
                <p>Bid list would be displayed here</p>
              ) : (
                <div className="empty-state">
                  <p>No bids received yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="tenders-list">
            {myTenders.length === 0 ? (
              <div className="empty-state">
                <h3>No Tenders Created Yet</h3>
                <p>Get started by creating your first tender project</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab("create")}
                >
                  <FiPlus /> Create New Tender
                </button>
              </div>
            ) : (
              <div className="tenders-table-container">
                <table className="tenders-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Budget</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Bids</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTenders.map((tender) => (
                      <tr key={tender.id}>
                        <td>{tender.title}</td>
                        <td>{tender.category}</td>
                        <td>${tender.budget.toLocaleString()}</td>
                        <td>{tender.deadline}</td>
                        <td>
                          <span className={`status-badge ${tender.status}`}>
                            {tender.status}
                          </span>
                        </td>
                        <td>{tender.bids}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(tender)}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(tender.id)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                          <button
                            className="btn-text"
                            onClick={() => handleViewBids(tender)}
                          >
                            View Bids
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TenderForm;
