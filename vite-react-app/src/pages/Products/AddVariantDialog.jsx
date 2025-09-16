import React, { useState, useEffect, useContext } from 'react';
import './ProductsList.css';
import { ProductContext } from '../../contexts/ProductContext';
import { Upload } from 'lucide-react';

const AddVariantDialog = ({ isOpen, onClose, onAdd }) => {
  const [variant, setVariant] = useState({
    color: '',
    size: '',
    price: '',
    discount: '0',
    stock: '',
    main_image: null,
    myWallet:'0',
    source: '',
    floor: '0',
    barcode: Math.random().toString().slice(2, 15) // Generate random barcode
  });

  const [secondaryImages,setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const { error: contextError, clearError } = useContext(ProductContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if(files.length > 0){
      //first file is main_image
      if(!variant.main_image){
        setVariant((prev) => ({
          ...prev,
          main_image:files[0]
        }));
        //remaining_files are secondary images
        if (files.length > 1) {
          setSecondaryImages( (prev) => [...prev , ...files.slice(1)]);
        }
      }
      else {
        //if main image is set , all new images are secondary
        setSecondaryImages( (prev) => [...prev , ...files]);
      }
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

  useEffect( () => {
    if(secondaryImages.length > 0) {
      const urls = secondaryImages.map( img => URL.createObjectURL(img));
      setSecondaryPreviews(urls);
      //clean up
      return () => {
        urls.forEach( url => URL.revokeObjectURL(url));
      }
    }
    else{
      setSecondaryPreviews([]);
    }
  } , [ secondaryImages]);

  const removeSecondaryImage = (index) => {
    setSecondaryImages( (prev) => prev.filter( (_,i) => i !== index));
  }

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
    // console.log(secondaryImages); 
    clearError();
    setError('');

    
    onAdd({
      ...variant,
      price: parseFloat(variant.price).toFixed(2),
      discount: parseFloat(variant.discount).toFixed(2),
      stock: parseInt(variant.stock),
      myWallet: parseFloat(variant.myWallet).toFixed(2),
      source: variant.source,
      floor: parseFloat(variant.floor),
      secondaryImages:secondaryImages
    });
    // Reset form
    setVariant({
      color: '',
      size: '',
      price: '',
      discount: '0',
      stock: '',
      main_image: null,
      myWallet:'0',
      source: '',
      floor: '0',
      barcode: Math.random().toString().slice(2, 15)
    });
    setSecondaryImages([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2 className='variant-heading'>Add Variant</h2>

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
                // disabled={loading}
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
                // disabled={loading}
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
                // disabled={loading}
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

           
          <div className="form-row">
            <div className="form-group">
              
              <label>My Wallet</label>
              <input
                type="number"
                name="myWallet"
                value={variant.myWallet}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Floor No </label>
              <input
                type="number"
                name="floor"
                value={variant.floor}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Source*</label>
              <input
                type="text"
                name="source"
                value={variant.source}
                onChange={handleChange}
                required
              />
            </div>
            
          </div>
          <div className="form-group-image">
            <label>Image*</label>
            <input
              type="file"
              name="main_image"
              accept="image/*"
              onChange={handleFileChange}
              required= {!variant.main_image}
            />
            {/* <Upload /> */}
          </div>

          {previewUrl && (
            <div className="image-preview-container">
              <h5>Main Image</h5>
              <img
                src={previewUrl}
                alt="Preview"
                className="image-preview"
              />
            </div>
          )}
          {/* //secondary image */}
          {secondaryPreviews.length > 0 && (
            <div className='secondary-images-containter'>
              <h4>Secondary Images</h4>
              <div className='secondary-images-grid'>
                {secondaryPreviews.map((url, index) => (
                  <div key={index} className='secondary-image-wrapper'> 
                    <img src={url} alt={`Secondary ${index}`} className='secondary-preview'/>
                    <button
                      type="button"
                      className='remove-btn'
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
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
            >
              Add Variant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariantDialog;