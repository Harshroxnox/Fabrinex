import React, { useState, useEffect, useContext } from 'react';
import './ProductsList.css';
import TextEditor from '../../Editor/TextEditor';
import { updateProduct } from '../../contexts/api/products';
import toast from 'react-hot-toast';

const EditProductDialog = ({ isOpen, onClose, product, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: product?.name || "",
    description: product?.description || { content: "" },
    category: product?.category || "",
    tax: product?.tax || 0,
  });

  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name || "",
        description: product.description || { content: "" },
        category: product.category || "",
        tax: product.tax || 0,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content) => {
    setEditedProduct(prev => ({
      ...prev,
      description: { content }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!editedProduct.name.trim()) {
      toast.error("Product name is required");
      setLoading(false);
      return;
    }
    
    if (!editedProduct.category.trim()) {
      toast.error("Category is required");
      setLoading(false);
      return;
    }
    const { data, error } = await updateProduct(product.productID, editedProduct);
    
    if (error) {
      toast.error("Error updating product: " + error);
    } else {
      onSave?.(data);
      toast.success("Product Updated successfully");
      onClose();
    }
    setLoading(false);
  };

  
  const PRODUCT_CATEGORIES = [
    'Casual - Unstitched suit',
    'Partywear - Unstitched suit',
    'Readymade suit',
    'Semistich suit',
    'Bansari Saree',
    'Partywear Saree',
    'Casual Lhenga',
    'Partywear Lhenga',
    'Bridal Lhenga'
  ];

  if (!isOpen) return null;
  
  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Edit Product</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name*</label>
            <input
              type="text"
              name="name"
              value={editedProduct.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <TextEditor
              value={editedProduct.description.content}
              onChange={handleDescriptionChange}
            />
            <label> Preview </label>
            <div
              className="product-preview"
              dangerouslySetInnerHTML={{
                __html: editedProduct.description.content,
              }}
            />
          </div>
<div className="form-group">
            <label>Tax (%)</label>
            <input
              type="number"
              name="tax"
              value={editedProduct.tax}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Category*</label>
            <select
              name="category"
              value={editedProduct.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Category</option>
              {PRODUCT_CATEGORIES.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductDialog;