import React, { useState } from 'react';
import './ProductsList.css';
import TextEditor from '../../Editor/TextEditor';
import AddVariantDialog from './AddVariantDialog';
import { createProduct, createVariant, uploadSecondaryImages } from '../../contexts/api/products';
import toast from 'react-hot-toast';

const AddProductDialog = ({ isOpen, onClose, onSave }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: { content: '' },
    category: '',
    tax: 5,
  });

  const [variants, setVariants] = useState([]);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
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
      toast.error('Product name is required');
      return false;
    }
    if (!newProduct.category.trim()) {
      toast.error('Category is required');
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

    setLoading(true);
    setError('');

    try {
      // Step 1: Create the product
      const { data: productData, error: productError } = await createProduct(newProduct);
      if (productError){
        toast.error('Error while creating product');
        throw new Error(productError);
      } 

      const productID = productData.productID;

      // Step 2 & 3: Create all variants and upload their images
      const variantPromises = variants.map(async (variant) => {
        const formData = new FormData();
        for (const key in variant) {
          if (key !== 'secondaryImages') {
            formData.append(key, variant[key]);
          }
        }
        
        const { data: variantData, error: variantError } = await createVariant(productID, formData);
        if (variantError){
          toast.error(`Failed to create variant: ${variantError}`);
          throw new Error(`Failed to create variant: ${variantError}`);
        } 

        const variantID = variantData.variantID;

        if (variant.secondaryImages?.length > 0) {
          const { error: imageError } = await uploadSecondaryImages(variantID, variant.secondaryImages);
          if (imageError){
            // toast.error('Failed to upload secondary images');
            throw new Error(`Secondary Image ${imageError}`);
          } 
        }
      });

      await Promise.all(variantPromises);
      toast.success('Product created successfully!');
      toast.success('Variants added successfully!');
      // Step 4: Reset form and close on success
      setNewProduct({ name: '', description: { content: '' }, category: '', tax: 18 });
      setVariants([]);
      setCurrentStep(1);
      onSave?.();
      onClose();

    } catch (err) {
      toast.error('Error saving product or variants' + err);
      console.error("Error saving product or variants:", err);
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
    'Bridal Lhenga',
    'Winter Readymade',
    'Winter Unstitched'
  ];

  return (
    <div className="dialog-overlay no-scrollbar">
      <div className="dialog-content no-scrollbar">
        <h2>Add New Product</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Product Name*</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Product Description</label>
                <TextEditor
                  value={newProduct.description.content}
                  onChange={(contenttext) => setNewProduct((prev) => ({ ...prev, description: { content: contenttext } }))}
                />
              </div>
              <div className="form-group">
                <label>Tax ( % )*</label>
                <input type="text" name="tax" value={newProduct.tax} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category*</label>
                <select name="category" value={newProduct.category} onChange={handleChange} required >
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                <button type="button" className="next-btn" onClick={handleNext}>Next: Add Variants</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <h3>Product Variants</h3>
              {variants.length > 0 && (
                <div className="variants-list">
                  <h4>Added Variants:</h4>
                  <ul>
                    {variants.map((v, i) => (
                      <li key={i}>
                        <span>{v.color}, {v.size}, ₹{v.price}</span>
                        <button type="button" className="remove-variant-btn" onClick={() => handleRemoveVariant(i)}>×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button type="button" className="add-variant-btn" onClick={() => setShowVariantDialog(true)}>+ Add Variant</button>
              <div className="form-actions">
                <button type="button" className="back-btn" onClick={handleBack}>Back</button>
                <button type="submit" className="save-btn" disabled={loading || variants.length === 0}>
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          )}
        </form>

        <AddVariantDialog
          isOpen={showVariantDialog}
          onClose={() => setShowVariantDialog(false)}
          onAdd={handleAddVariant}
        />
      </div>
    </div>
  );
};

export default AddProductDialog;