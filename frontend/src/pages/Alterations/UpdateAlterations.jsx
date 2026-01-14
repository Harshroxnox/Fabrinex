import { useState } from "react";
import { updateAlterations } from "../../contexts/api/alterations";
import "./updateAlterationsModal.css";

export default function UpdateAlterationModal({ alteration, onClose, onSuccess }) {
  const [form, setForm] = useState({
    bill_no: alteration.bill_no || "",
    slip_no: alteration.slip_no || "",
    customer_name: alteration.customer_name || "",
    dimension_text: alteration.dimension_text || "",
    date_of_delivery: alteration.date_of_delivery
      ? alteration.date_of_delivery.split("T")[0]
      : "",
    status: alteration.status || "Pending",
    payment_status: alteration.payment_status || "Unpaid",
    amount: alteration.amount || "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== "" && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (image) {
        formData.append("dimension_image", image);
      }

      await updateAlterations(alteration.alterationID, formData);

      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update alteration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-alteration-modal-backdrop" onClick={onClose}>
      <div
        className="update-alteration-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="update-alteration-form-title">
          Update Alteration (Bill No: {alteration.bill_no || "N/A"})
        </h3>

        {error && <p className="update-alteration-error-text">{error}</p>}

        <div className="update-alteration-form-wrapper">
          <input
            className="update-alteration-select"
            placeholder="Bill No"
            name="bill_no"
            value={form.bill_no}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            className="update-alteration-select"
            placeholder="Slip No"
            name="slip_no"
            value={form.slip_no}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            className="update-alteration-select"
            placeholder="Customer Name"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            disabled={loading}
          />

          <textarea
            className="update-alteration-select"
            placeholder="Dimension / Notes"
            name="dimension_text"
            value={form.dimension_text}
            onChange={handleChange}
            disabled={loading}
            rows={3}
          />

          <input
            type="date"
            className="update-alteration-select"
            name="date_of_delivery"
            value={form.date_of_delivery}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="number"
            className="update-alteration-select"
            placeholder="Amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            disabled={loading}
          />

          <div className="update-alteration-select-group">
            <label>Order Status</label>
            <select
              className="update-alteration-select"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Pending">Pending</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="update-alteration-select-group">
            <label>Payment Status</label>
            <select
              className="update-alteration-select"
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="update-alteration-select-group">
            <label>Replace Dimension Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              disabled={loading}
            />
          </div>
        </div>

        <div className="update-alteration-modal-actions">
          <button
            className="update-alteration-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="update-alteration-update-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
