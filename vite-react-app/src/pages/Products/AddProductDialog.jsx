import React, { useContext, useState } from 'react';
import './ProductsList.css';
import TextEditor from '../../Editor/TextEditor';
import { ProductContext } from '../../contexts/ProductContext';
import AddVariantDialog from './AddVariantDialog';

const AddProductDialog = ({ isOpen, onClose, onSave }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: {
      content: ''
    },
    category: ''
  });

  const [variants, setVariants] = useState([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // For multi-step form
  const { createProduct, createVariant, loading, error: contextError, clearError } = useContext(ProductContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariant = (variant) => {
    setVariants((prev) => [...prev, variant]);
    setShowVariantDialog(false);
    setError('');
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const validateProduct = () => {
    if (!newProduct.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!newProduct.category.trim()) {
      setError('Category is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateProduct()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (variants.length === 0) {
      setError('At least one variant is required.');
      return;
    }

    try {
      clearError(); // Clear any previous errors
      
      // Create product first
      const res = await createProduct(newProduct);
      console.log(newProduct);
      console.log(res);
      const productID = res.productID;

      // Then create all variants
      const variantPromises = variants.map(variant => 
        createVariant(productID, variant)
      );
      
      await Promise.all(variantPromises);

      // Reset form on success
      setNewProduct({
        name: '',
        description: { content: '' },
        category: ''
      });
      setVariants([]);
      setCurrentStep(1);
      
      onSave?.(); // Notify parent if callback exists
      onClose();
    } catch (err) {
      console.error('Error saving product or variants:', err);
      setError(contextError || 'Failed to save product. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Add New Product</h2>
        
        {/* Progress indicator */}
        <div className="form-progress">
          <div className={`progress-step ${currentStep === 1 ? 'active' : ''}`}>
            1. Product Details
          </div>
          <div className={`progress-step ${currentStep === 2 ? 'active' : ''}`}>
            2. Variants
          </div>
        </div>

        {(error || contextError) && (
          <div className="error-message">
            {error || contextError}
          </div>
        )}

        {loading ? (
          <div className="loading-indicator">
            <p>Saving product...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label>Product Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <TextEditor
                    value={newProduct.description.content}
                    onChange={(contenttext) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          content: contenttext
                        }
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Category*</label>
                  <input
                    type="text"
                    name="category"
                    value={newProduct.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="button" className="next-btn" onClick={handleNext}>
                    Next: Add Variants
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <h3>Product Variants</h3>
                <p className="info-text">
                  Each product must have at least one variant (color/size combination)
                </p>

                <button
                  type="button"
                  className="add-variant-btn"
                  onClick={() => setShowVariantDialog(true)}
                >
                  + Add Variant
                </button>

                {variants.length > 0 && (
                  <div className="variants-list">
                    <h4>Added Variants:</h4>
                    <ul>
                      {variants.map((v, i) => (
                        <li key={i}>
                          <span>
                            {v.color}, {v.size}, ₹{v.price} ({v.discount}% off) - Stock: {v.stock}
                          </span>
                          <button 
                            type="button" 
                            className="remove-variant-btn"
                            onClick={() => handleRemoveVariant(i)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="back-btn" onClick={handleBack}>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={variants.length === 0}
                  >
                    Save Product
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        <AddVariantDialog
          isOpen={showVariantDialog}
          onClose={() => {
            setShowVariantDialog(false);
            setError('');
          }}
          onAdd={handleAddVariant}
        />
      </div>
    </div>
  );
};

export default AddProductDialog;