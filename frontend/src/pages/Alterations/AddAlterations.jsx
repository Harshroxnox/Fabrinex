import { useState } from "react";
import { createAlterations } from "../../contexts/api/alterations";
import "./addAlterationModal.css";

export default function AddAlterationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    slip_no: "",  // New field added here
    bill_no: "",
    customer_name: "",
    contact: "",
    date_of_delivery: "",
    amount: "",
    dimension_text: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Updated validation to include slip_no if needed
    if (!form.customer_name || !form.contact || !form.date_of_delivery || !form.amount) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (image) formData.append("dimension_image", image);

      await createAlterations(formData);

      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to create alteration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-alteration-modal-backdrop">
      <div className="add-alteration-modal-content add-alteration-form-wrapper">
        
        <h3 className="add-alteration-form-title">Add New Alteration</h3>

        <form onSubmit={handleSubmit} className="add-alteration-form-content">
          {error && <p className="add-alteration-error-text">{error}</p>}

          {/* New Slip No Field - Added at the top */}
          <input
            name="slip_no"
            placeholder="Slip No"
            value={form.slip_no}
            onChange={handleChange}
            className="add-alteration-input"
          />

          <input
            name="bill_no"
            placeholder="Bill No (Optional)"
            value={form.bill_no}
            onChange={handleChange}
            className="add-alteration-input"
          />

          <input
            name="customer_name"
            placeholder="Customer Name *"
            value={form.customer_name}
            onChange={handleChange}
            required
            className="add-alteration-input"
          />

          <input
            name="contact"
            placeholder="Contact *"
            value={form.contact}
            onChange={handleChange}
            required
            className="add-alteration-input"
          />

          <input
            type="date"
            name="date_of_delivery"
            value={form.date_of_delivery}
            onChange={handleChange}
            required
            className="add-alteration-date-input"
          />

          <input
            name="amount"
            type="number"
            placeholder="Amount *"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            className="add-alteration-input"
          />

          <textarea
            name="dimension_text"
            placeholder="Dimensions / Instructions"
            value={form.dimension_text}
            onChange={handleChange}
            className="add-alteration-textarea"
          />

          <label>Attach Dimension Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="add-alteration-file-input"
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="add-alteration-image-preview"
            />
          )}

          <div className="add-alteration-modal-actions">
            <button
              className="add-alteration-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="add-alteration-save-btn" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Alteration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}