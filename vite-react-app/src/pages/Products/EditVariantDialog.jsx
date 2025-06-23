import React, { useState } from 'react';
import './VariantsList.css';

const EditVariantDialog = ({ isOpen, onClose, variant, productId, onSave }) => {
  const [editedVariant, setEditedVariant] = useState(variant);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedVariant(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedVariant(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedVariant);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Edit Variant</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Color</label>
            <input
              type="text"
              name="color"
              value={editedVariant.color}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input
              type="text"
              name="size"
              value={editedVariant.size}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={editedVariant.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={editedVariant.stock}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {editedVariant.image && (
              <img 
                src={editedVariant.image} 
                alt="Variant preview" 
                className="image-preview"
              />
            )}
          </div>
          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantDialog;