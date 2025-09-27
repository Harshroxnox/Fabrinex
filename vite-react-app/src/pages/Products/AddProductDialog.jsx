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
    category: '',
    tax: 18
  });

  const [variants, setVariants] = useState([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // For multi-step form
  const { createProduct, createVariant,error: contextError, clearError } = useContext(ProductContext);
  const [loading,setLoading]=useState(false);
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
    setError("At least one variant is required.");
    return;
  }

  try {
    clearError(); // Clear any previous errors
    setLoading(true);

    // Step 1: Create product first
    const res = await createProduct(newProduct);

    const productID = res.productID;

    // Step 2: Create all variants
    const variantPromises = variants.map(async (variant) => {
      const formData = new FormData();
      for (let key in variant) {
        if (key !== "main_image" && key !== "secondaryImages") {
          formData.append(key, variant[key]);
        }
      }
      formData.append("main_image", variant.main_image);

      const response = await fetch(
        `http://localhost:5000/api/v1/products/create-variant/${productID}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to create variant");

      const data = await response.json();

      const variantID = data.variantID;

      // Step 3: Upload secondary images if any
      if (variant.secondaryImages && variant.secondaryImages.length > 0) {
        const secondaryImagesForm = new FormData();
        variant.secondaryImages.forEach((file) => {
          secondaryImagesForm.append("images", file);
        });

        const secImageRes = await fetch(
          `http://localhost:5000/api/v1/products/upload-secondary-images/${variantID}`,
          {
            method: "POST",
            body: secondaryImagesForm,
          }
        );

        if (!secImageRes.ok) throw new Error("Failed to upload secondary images");

        const secImageData = await secImageRes.json();
      }
    });

    await Promise.all(variantPromises);

    // Step 4: Reset form on success
    setNewProduct({
      name: "",
      description: { content: "" },
      category: "",
      tax: 18,
    });
    setVariants([]);
    setCurrentStep(1);

    onSave?.(); // Notify parent if callback exists
    onClose();
  } catch (err) {
    console.error("Error saving product or variants:", err);
    setError("Failed to save product. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;
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

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Add New Product</h2>
        
        {/* Progress indicator */}
        {/* <div className="form-progress">
          <div className={`progress-step ${currentStep === 1 ? 'active' : ''}`}>
            1. Product Details
          </div>
          <div className={`progress-step ${currentStep === 2 ? 'active' : ''}`}>
            2. Variants
          </div>
        </div> */}

        {(error || contextError) && (
          <div className="error-message">
            {error || contextError}
          </div>
        )}

      
        
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
                  <label>Tax ( % )*</label>
                  <input
                    type="text"
                    name="tax"
                    value={newProduct.tax}
                    onChange={handleChange}
                    required
                  />
                </div>
               <div className="form-group">
                <label>Category*</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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
                <button
                  type="button"
                  className="add-variant-btn"
                  onClick={() => setShowVariantDialog(true)}
                >
                  + Add Variant
                </button>
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