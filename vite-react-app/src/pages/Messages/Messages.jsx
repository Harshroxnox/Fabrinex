import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Calendar,
  Filter,
  Plus,
  Mail,
  MessageSquare,
  Edit3,
  Trash2,
  Send,
  X,
  Check,
  Clock,
  FileText,
} from "lucide-react";
import styles from "./Message.module.css";
import templates from "../../constants/messageTemplates.js";

const MessagingSection = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "Email",
    category: "Promotions",
    subject: "",
    content: "",
    variables: ["customerName", "orderTotal"],
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      case "Draft":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "Paused":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <Check size={14} />;
      case "Draft":
        return <Edit3 size={14} />;
      case "Paused":
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Email":
        return <Mail size={14} />;
      case "SMS":
        return <MessageSquare size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const statusMatch =
      statusFilter === "All" || template.status === statusFilter;
    const typeMatch = typeFilter === "All" || template.type === typeFilter;
    const categoryMatch =
      categoryFilter === "All" || template.category === categoryFilter;
    const searchMatch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());

    const dateMatch = (() => {
      if (!dateFromFilter && !dateToFilter) return true;
      const templateDate = new Date(template.lastUpdated);
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null;
      const toDate = dateToFilter ? new Date(dateToFilter) : null;

      if (fromDate && toDate) {
        return templateDate >= fromDate && templateDate <= toDate;
      } else if (fromDate) {
        return templateDate >= fromDate;
      } else if (toDate) {
        return templateDate <= toDate;
      }
      return true;
    })();

    return (
      statusMatch && typeMatch && categoryMatch && searchMatch && dateMatch
    );
  });

  const uniqueCategories = [
    ...new Set(templates.map((template) => template.category)),
  ];

  const handleCreateTemplate = () => {
    console.log("Creating template:", templateForm);
    setShowCreateTemplate(false);
    setTemplateForm({
      name: "",
      type: "Email",
      category: "Promotions",
      subject: "",
      content: "",
      variables: ["customerName", "orderTotal"],
    });
  };

  // Get user role for permission checks
  const userRole = typeof window !== 'undefined' ? localStorage.getItem("roleLoggedIn") : null;
  const isMarketingManager = userRole === "marketingManager";

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Templates</h1>
          <div className={styles.headerActions}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search templates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filtersContainer}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filterButton}
              >
                <Filter size={16} />
                Filters
                <ChevronDown
                  size={16}
                  style={{
                    transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {showFilters && (
                <div className={styles.filterDropdown}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                      <Calendar size={14} />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className={styles.dateInput}
                    />
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                      <Calendar size={14} />
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className={styles.dateInput}
                    />
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Status</label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.select}
                      >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Paused">Paused</option>
                      </select>
                      <ChevronDown className={styles.selectIcon} size={16} />
                    </div>
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Type</label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.select}
                      >
                        <option value="All">All Types</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                      </select>
                      <ChevronDown className={styles.selectIcon} size={16} />
                    </div>
                  </div>

                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Category</label>
                    <div className={styles.selectWrapper}>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={styles.select}
                      >
                        <option value="All">All Categories</option>
                        {uniqueCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={styles.selectIcon} size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateTemplate(true)}
              disabled={!isMarketingManager}
              className={styles.createButton}
              style={{
                cursor: !isMarketingManager ? "not-allowed" : "pointer",
                opacity: !isMarketingManager ? 0.5 : 1,
              }}
            >
              <Plus size={16} />
              Create Template
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Type</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Last Updated</th>
                  <th className={styles.th}>Sent Count</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filteredTemplates.map((template, index) => (
                  <tr key={template.id} className={styles.tr}>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      <span className={styles.templateName}>{template.name}</span>
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      <span className={styles.typeBadge}>
                        {getTypeIcon(template.type)}
                        {template.type}
                      </span>
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      {template.category}
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      <span
                        className={styles.statusBadge}
                        style={getStatusColor(template.status)}
                      >
                        {getStatusIcon(template.status)}
                        {template.status}
                      </span>
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      {template.lastUpdated}
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      {template.sentCount.toLocaleString()}
                    </td>
                    <td
                      className={
                        index === filteredTemplates.length - 1
                          ? styles.lastRowTd
                          : styles.td
                      }
                    >
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          disabled={!isMarketingManager}
                          style={{
                            cursor: !isMarketingManager ? "not-allowed" : "pointer",
                            opacity: !isMarketingManager ? 0.5 : 1,
                          }}
                          title="Edit template"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.sendButton}`}
                          disabled={!isMarketingManager}
                          style={{
                            cursor: !isMarketingManager ? "not-allowed" : "pointer",
                            opacity: !isMarketingManager ? 0.5 : 1,
                          }}
                          title="Send template"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          disabled={!isMarketingManager}
                          style={{
                            cursor: !isMarketingManager ? "not-allowed" : "pointer",
                            opacity: !isMarketingManager ? 0.5 : 1,
                          }}
                          title="Delete template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Template Modal */}
        {showCreateTemplate && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Create Template</h2>
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className={styles.closeButton}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                  placeholder="Enter template name"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Type</label>
                <div className={styles.selectWrapper}>
                  <select
                    value={templateForm.type}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, type: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <div className={styles.selectWrapper}>
                  <select
                    value={templateForm.category}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        category: e.target.value,
                      })
                    }
                    className={styles.select}
                  >
                    <option value="Promotions">Promotions</option>
                    <option value="Welcome">Welcome</option>
                    <option value="Order Updates">Order Updates</option>
                    <option value="Abandoned Cart">Abandoned Cart</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              {templateForm.type === "Email" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subject</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter email subject"
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Content</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Enter your message content..."
                  className={styles.textarea}
                />
                <div className={styles.variablesHint}>
                  Available variables: {`{{customerName}}`}, {`{{orderTotal}}`}, {`{{orderId}}`}, {`{{cartTotal}}`}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className={styles.saveButton}
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSection;