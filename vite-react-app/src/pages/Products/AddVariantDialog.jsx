import React, { useState, useEffect, useContext } from 'react';
import './ProductsList.css';
import { ProductContext } from '../../contexts/ProductContext';

const AddVariantDialog = ({ isOpen, onClose, onAdd }) => {
  const [variant, setVariant] = useState({
    color: '',
    size: '',
    price: '',
    discount: '0',
    stock: '',
    main_image: null,
    barcode: Math.random().toString().slice(2, 15) // Generate random barcode
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const { loading, error: contextError, clearError } = useContext(ProductContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setVariant((prev) => ({
        ...prev,
        main_image: file
      }));
    }
  };

  useEffect(() => {
    if (variant.main_image) {
      const url = URL.createObjectURL(variant.main_image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [variant.main_image]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!variant.color || !variant.size || !variant.price || !variant.stock || !variant.main_image) {
      setError('Please fill all required fields and upload an image.');
      return;
    }

    if (parseFloat(variant.discount) < 0 || parseFloat(variant.discount) > 100) {
      setError('Discount must be between 0 and 100');
      return;
    }

    clearError();
    setError('');
    
    onAdd({
      ...variant,
      price: parseFloat(variant.price).toFixed(2),
      discount: parseFloat(variant.discount).toFixed(2),
      stock: parseInt(variant.stock)
    });

    // Reset form
    setVariant({
      color: '',
      size: '',
      price: '',
      discount: '0',
      stock: '',
      main_image: null,
      barcode: Math.random().toString().slice(2, 15)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Add Variant</h2>

        {(error || contextError) && <p className="error-message">{error || contextError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Color*</label>
              <input
                type="text"
                name="color"
                value={variant.color}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Size*</label>
              <input
                type="text"
                name="size"
                value={variant.size}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price*</label>
              <input
                type="number"
                name="price"
                value={variant.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={variant.discount}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock*</label>
              <input
                type="number"
                name="stock"
                value={variant.stock}
                onChange={handleChange}
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Barcode</label>
              <input
                type="text"
                name="barcode"
                value={variant.barcode}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image*</label>
            <input
              type="file"
              name="main_image"
              accept="image/*"
              onChange={handleFileChange}
              required
              disabled={loading}
            />
          </div>

          {previewUrl && (
            <div className="image-preview-container">
              <img
                src={previewUrl}
                alt="Preview"
                className="image-preview"
              />
            </div>
          )}

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
              {loading ? 'Adding...' : 'Add Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariantDialog;