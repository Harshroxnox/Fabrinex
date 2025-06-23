import React, { useState } from 'react';
import './ProductsList.css';

const AddProductDialog = ({ isOpen, onClose, onSave }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    variants: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...newProduct,
      id: Date.now(),
      variants: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductDialog;