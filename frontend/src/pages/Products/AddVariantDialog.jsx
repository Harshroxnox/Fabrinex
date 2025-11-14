import React, { useState, useEffect } from 'react';
import './ProductsList.css';
import toast from 'react-hot-toast';

const AddVariantDialog = ({ isOpen, onClose, onAdd }) => {
  const [variant, setVariant] = useState({
    color: '',
    size: '',
    price: '',
    discount: '0',
    stock: '',
    main_image: null,
    myWallet: '0',
    source: '',
    floor: '0',
    barcode: ''
  });

  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Simplified main image handler
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setVariant((prev) => ({
        ...prev,
        main_image: file,
      }));
    }
  };

  const handleSecondaryImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSecondaryImages((prev) => [...prev, ...files]);
    }
  };

  useEffect(() => {
    if (variant.main_image && variant.main_image instanceof File) {
      const url = URL.createObjectURL(variant.main_image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [variant.main_image]);

  useEffect(() => {
    if (secondaryImages.length > 0) {
      const urls = secondaryImages.map((img) => URL.createObjectURL(img));
      setSecondaryPreviews(urls);
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    } else {
      setSecondaryPreviews([]);
    }
  }, [secondaryImages]);

  const removeSecondaryImage = (index) => {
    setSecondaryImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!variant.color || !variant.size || !variant.price || !variant.stock || !variant.main_image) {
      toast.error('Please fill all required fields and upload a main image.');
      return;
    }
    if (parseFloat(variant.discount) < 0 || parseFloat(variant.discount) > 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }
    const received_barcode = variant.barcode;
    delete variant.barcode; // remove barcode 

    const discountedPrice = variant.price - (variant.price * (variant.discount / 100));
    const profit = discountedPrice - variant.myWallet;
    if(profit < 0) {
      toast.error('Selling price after discount cannot be less than My Wallet price.');
      return;
    }

    onAdd({
      ...variant,
      price: parseFloat(variant.price).toFixed(2),
      discount: parseFloat(variant.discount).toFixed(2),
      stock: parseInt(variant.stock),
      myWallet: parseFloat(variant.myWallet).toFixed(2),
      source: variant.source,
      floor: parseFloat(variant.floor),
      secondaryImages: secondaryImages,
      received_barcode: received_barcode || null // send null if empty
    });

    setVariant({
      color: '', size: '', price: '', discount: '0', stock: '', main_image: null, myWallet: '0', source: '', floor: '0', barcode: ''
    });
    setSecondaryImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content no-scrollbar">
        <h2 className="variant-heading">Add Variant</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Color*</label>
              <input type="text" name="color" value={variant.color} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Size*</label>
              <input type="text" name="size" value={variant.size} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price*</label>
              <input type="number" name="price" value={variant.price} onChange={handleChange} min="0.01" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" name="discount" value={variant.discount} onChange={handleChange} min="0" max="100" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock*</label>
              <input type="number" name="stock" value={variant.stock} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Barcode</label>
              <input type="text" name="barcode" value={variant.barcode} onChange={handleChange} placeholder="Leave blank to auto-generate" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>My Wallet</label>
              <input type="number" name="myWallet" value={variant.myWallet} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Floor No</label>
              <input type="number" name="floor" value={variant.floor} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Source*</label>
              <input type="text" name="source" value={variant.source} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Main Image ( File Size less than 5 mb)*</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              required={!variant.main_image}
            />
          </div>

          {previewUrl && (
            <div className="image-preview-container">
              <img
                src={previewUrl}
                alt="Main image preview"
                className="image-preview"
              />
            </div>
          )}

          <div className="form-group">
            <label>Add Secondary Images (Optional)</label>
            <label> Upto 5 Images of sizes less than 5MB</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSecondaryImagesChange}
              multiple
            />
          </div>

          {secondaryPreviews.length > 0 && (
            <div className="secondary-images-container">
              <h4>Secondary Images</h4>
              <div className="secondary-images-grid">
                {secondaryPreviews.map((url, index) => (
                  <div key={index} className="secondary-image-wrapper">
                    <img src={url} alt={`Secondary ${index}`} className="secondary-preview" />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeSecondaryImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn">Add Variant</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariantDialog;