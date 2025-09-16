import React, { useState, useEffect, useContext } from 'react';
import './ProductsList.css';
import TextEditor from '../../Editor/TextEditor';
import { ProductContext } from '../../contexts/ProductContext';

const EditProductDialog = ({ isOpen, onClose, product, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: product.name,
    description: product.description.content,
    category: product.category
  });
  const [error, setError] = useState('');
  const { updateProduct,error: contextError, clearError } = useContext(ProductContext);

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name || '',
        description: product.description || { content: '' },
        category: product.category || ''
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
  const [loading,setLoading]=useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!editedProduct.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!editedProduct.category.trim()) {
      setError('Category is required');
      return;
    }

    try {
      clearError();
      await updateProduct(product.productID, editedProduct);
      onSave(editedProduct);
      onClose();
    } catch (err) {
      console.error('Error updating product:', err);
      setError(contextError || 'Failed to update product');
    } finally{
      setLoading(false);
    }
  };

  
    const PRODUCT_CATEGORIES = [
    'Suits - stitched',
    'Suits - unstitched',
    'Bridal',
    'Other'
  ];
  if (!isOpen) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Edit Product</h2>

        {(error || contextError) && <p className="error-message">{error || contextError}</p>}

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
              value={''}
              onChange={handleDescriptionChange}
              />
              <label> Preview </label>
            <div className='product-preview'
              dangerouslySetInnerHTML={{ __html: editedProduct.description.content }}
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
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading === true ?'Saving' : 'Save Changes'}
              {/* Save Changes */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductDialog;