import React, { useState, useEffect, useContext } from 'react';
import './VariantsList.css';
import { ProductContext } from '../../contexts/ProductContext';

const EditVariantDialog = ({ isOpen, onClose, variant, productId, onSave }) => {
  const [editedVariant, setEditedVariant] = useState({
    price: '',
    discount: '0',
    main_image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const { updateVariant, loading, error: contextError, clearError } = useContext(ProductContext);

  useEffect(() => {
    if (variant) {
      setEditedVariant({
        price: variant.price || '',
        discount: variant.discount || '0',
        main_image: null
      });
      setPreviewUrl(variant.main_image || null);
    }
  }, [variant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedVariant(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setEditedVariant(prev => ({
        ...prev,
        main_image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedVariant.price) {
      setError('Price is required');
      return;
    }

    if (parseFloat(editedVariant.discount) < 0 || parseFloat(editedVariant.discount) > 100) {
      setError('Discount must be between 0 and 100');
      return;
    }

    try {
      clearError();
      const updateData = {
        price: parseFloat(editedVariant.price).toFixed(2),
        discount: parseFloat(editedVariant.discount).toFixed(2)
      };
      
      if (editedVariant.main_image) {
        updateData.main_image = editedVariant.main_image;
      }

      await updateVariant(variant.variantID, updateData);
      onSave({
        ...variant,
        ...updateData,
        main_image: previewUrl // Keep existing if no new image uploaded
      });
      onClose();
    } catch (err) {
      console.error('Error updating variant:', err);
      setError(contextError || 'Failed to update variant');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Edit Variant ({variant.color}, {variant.size})</h2>

        {(error || contextError) && <p className="error-message">{error || contextError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Price*</label>
              <input
                type="number"
                name="price"
                value={editedVariant.price}
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
                value={editedVariant.discount}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Update Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {(previewUrl || variant.main_image) && (
            <div className="image-preview-container">
              <img
                src={previewUrl || variant.main_image}
                alt="Variant preview"
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantDialog;