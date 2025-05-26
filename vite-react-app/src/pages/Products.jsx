import React, { useState } from 'react';
import { Search, ChevronDown, Upload, X } from 'lucide-react';
import { productData } from '../constants/ProductsData';
const ProductsPage = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All products');
  const [activeFilter, setActiveFilter] = useState('Active');
  const [inactiveFilter, setInactiveFilter] = useState('Inactive');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: []
  });

  const [products, setProducts] = useState(productData);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: []
    });
    setCurrentView('edit');
  };

  const handleDelete = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleAddProduct = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      images: []
    });
    setCurrentView('add');
  };

  const handleSaveProduct = () => {
    if (currentView === 'add') {
      const newProduct = {
        id: products.length + 1,
        name: productForm.name,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        icon: '📦',
        color: '#3b82f6',
        barcode: Math.random().toString().substr(2, 12)
      };
      setProducts([...products, newProduct]);
    } else if (currentView === 'edit') {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name: productForm.name, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) }
          : p
      ));
    }
    setCurrentView('list');
    setProductForm({ name: '', description: '', price: '', stock: '', images: [] });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProductForm({
      ...productForm,
      images: [...productForm.images, ...files]
    });
  };

  const removeImage = (index) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== index)
    });
  };

  const styles = `
    .products-container {
      min-height: 100vh;
      background-color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      border: 0.01rem solid black;
      border-radius: 2rem;
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
    //   display: flex;
      width: 84vw;
    }

    .products-main {
      display: flex;
      flex-direction: column;
      padding-right: 3.5rem;
      gap: 1rem;
      min-width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .products-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .products-title {
      font-size: 2rem;
      text-decoration: none;
      font-weight: 400;
      margin: 0;
      color: black;
    }

    .add-product-btn {
      background-color: #111827;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      font-weight: 300;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .add-product-btn:hover {
      background-color: #1f2937;
    }

    .search-filters-card {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
      margin-bottom: 24px;
    }

    .search-container {
      position: relative;
      margin-bottom: 24px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 65%;
      transform: translateY(-50%);
      color: #9ca3af;
      width: 20px;
      height: 20px;
    }

    .search-input {
      width: 100%;
      padding-left: 40px;
      padding-right: 16px;
      padding-top: 8px;
      padding-bottom: 8px;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      background-color: #FDFDFD;
      outline: none;
    }

    .search-input:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .filters-container {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-wrapper {
      position: relative;
    }

    .filter-select {
      appearance: none;
      background-color: #FDFDFD;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      padding: 8px 32px 8px 16px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      cursor: pointer;
      outline: none;
      min-width: 120px;
    }

    .filter-select:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .chevron-icon {
      position: absolute;
      right: 8px;
      top: 70%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #9ca3af;
    }

    .table-container {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .products-table {
      border-collapse: separate;
      border-spacing: 0;
    //   border: 0.1rem solid #a2a2a2;
      border-radius: 0.8rem;
      font-size: 1rem;
      width: 100%;
    }

    .table-header {
      background-color: #FDFDFD;
    }

    .table-th {
      font-weight: 500;
      padding: 0.6rem 3rem;
      text-align: left;
      border-bottom: 0.1rem solid #a2a2a2;
      font-size: 1rem;
    }

    .table-tbody {
      background-color: #FDFDFD;
    }

    .table-tr {
      transition: background-color 0.2s;
    }

    .table-tr:hover {
      background-color: #f9fafb;
    }

    .table-td {
      padding: 0.6rem 3rem;
      text-align: left;
    //   border-bottom: 0.1rem solid #a2a2a2;
      font-size: 1rem;
    }

    .last-row-td {
      padding: 0.6rem 3rem;
      text-align: left;
      font-size: 1rem;
    }

    .product-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
      font-size: 20px;
    }

    .product-name {
      color: #6ba1a9;
      font-weight: 300;
    }

    .product-price {
      color: #2c2c2c;
      font-weight: 600;
    }

    .product-stock {
      color: #2c2c2c;
      font-weight: 300;
    }

    .product-barcode {
      color: #6ba1a9;
      font-weight: 300;
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-btn {
      color: #6ba1a9;
      cursor: pointer;
      text-decoration: none;
      font-weight: 300;
      font-size: 1rem;
      background: none;
      border: none;
    }

    .action-btn:hover {
      color: #1d4ed8;
    }

    .action-separator {
      color: #a2a2a2;
    }

    .delete-btn {
      color: #dc2626;
    }

    .delete-btn:hover {
      color: #b91c1c;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      font-size: 1rem;
      font-weight: 300;
    //   minWeight: 100vw;
    //   weight: 100%;
    }

    .breadcrumb-link {
      color: #6ba1a9;
      text-decoration: none;
      cursor: pointer;
    }

    .breadcrumb-link:hover {
      color: #1d4ed8;
    }

    .breadcrumb-separator {
      color: #a2a2a2;
    }

    .breadcrumb-current {
      color: #2c2c2c;
    }

    .form-container {
      border: 0.01rem solid #a2a2a2;
      padding: 2rem;
      border-radius: 2rem;
      background-color: #FDFDFD;
    }

    .form-header {
      margin-bottom: 24px;
    }

    .form-title {
      font-size: 2rem;
      text-decoration: none;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #6ba1a9;
    }

    .form-description {
      color: #2c2c2c;
      font-weight: 300;
      font-size: 1rem;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      display: block;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      margin-bottom: 8px;
    }

    .field-input {
      width: 100%;
      padding: 8px 16px;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      background-color: #FDFDFD;
      outline: none;
    }

    .field-input:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .field-textarea {
      width: 100%;
      padding: 8px 16px;
      border: 0.01rem solid #a2a2a2;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 300;
      color: #2c2c2c;
      background-color: #FDFDFD;
      outline: none;
      resize: vertical;
      min-height: 100px;
    }

    .field-textarea:focus {
      border-color: #6ba1a9;
      box-shadow: 0 0 0 2px rgba(107, 161, 169, 0.1);
    }

    .field-row {
      display: flex;
      gap: 24px;
    }

    .field-row .field-group {
      flex: 1;
    }

    .upload-area {
      border: 2px dashed #a2a2a2;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .upload-area:hover {
      border-color: #6ba1a9;
    }

    .upload-icon {
      width: 32px;
      height: 32px;
      color: #a2a2a2;
      margin: 0 auto 8px;
    }

    .upload-text {
      color: #2c2c2c;
      font-weight: 300;
      margin-bottom: 4px;
    }

    .upload-subtext {
      color: #a2a2a2;
      font-size: 0.9rem;
      font-weight: 300;
    }

    .sample-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .sample-image {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
    }

    .uploaded-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .uploaded-image {
      position: relative;
    }

    .uploaded-image img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .remove-image-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background-color: #dc2626;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
    }

    .remove-image-btn:hover {
      background-color: #b91c1c;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 0.01rem solid #a2a2a2;
    }

    .delete-product-btn {
      margin-right: auto;
      background-color: #fef2f2;
      color: #dc2626;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 300;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .delete-product-btn:hover {
      background-color: #fecaca;
    }

    .cancel-btn {
      padding: 8px 24px;
      border: 0.01rem solid #a2a2a2;
      color: #2c2c2c;
      border-radius: 8px;
      font-weight: 300;
      background-color: #FDFDFD;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cancel-btn:hover {
      background-color: #f9fafb;
    }

    .save-btn {
      background-color: #6ba1a9;
      color: white;
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 300;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .save-btn:hover {
      background-color: #5a8a92;
    }

    .hidden-input {
      display: none;
    }

    @media (max-width: 768px) {
      .products-main {
        padding-right: 1rem;
      }

      .field-row {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }

      .delete-product-btn {
        margin-right: 0;
        margin-bottom: 12px;
      }
    }
  `;

  // Products List View
  if (currentView === 'list') {
    return (
      <div className="products-container">
        <style>{styles}</style>
        <div className="products-main">
          {/* Header */}
          <div className="products-header">
            <h1 className="products-title">Products</h1>
            <button onClick={handleAddProduct} className="add-product-btn">
              Add product
            </button>
          </div>

          {/* Search and Filters */}
          <div className="search-filters-card">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-container">
              <div className="filter-wrapper">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option>All products</option>
                  <option>In stock</option>
                  <option>Out of stock</option>
                </select>
                <ChevronDown className="chevron-icon" size={16} />
              </div>

              <div className="filter-wrapper">
                <select 
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="filter-select"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <ChevronDown className="chevron-icon" size={16} />
              </div>

              <div className="filter-wrapper">
                <select 
                  value={inactiveFilter}
                  onChange={(e) => setInactiveFilter(e.target.value)}
                  className="filter-select"
                >
                  <option>Inactive</option>
                  <option>Active</option>
                </select>
                <ChevronDown className="chevron-icon" size={16} />
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-container">
            <div className="table-wrapper">
              <table className="products-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-th">Product</th>
                    <th className="table-th">Name</th>
                    <th className="table-th">Price</th>
                    <th className="table-th">Stock</th>
                    <th className="table-th">Barcode</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-tbody">
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} className="table-tr">
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <div className="product-icon" style={{ backgroundColor: product.color }}>
                          {product.icon}
                        </div>
                      </td>
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="product-name">{product.name}</span>
                      </td>
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="product-price">${product.price}</span>
                      </td>
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="product-stock">{product.stock}</span>
                      </td>
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <span className="product-barcode">{product.barcode}</span>
                      </td>
                      <td className={index === filteredProducts.length - 1 ? 'last-row-td' : 'table-td'}>
                        <div className="actions-container">
                          <button onClick={() => handleEdit(product)} className="action-btn">
                            Edit
                          </button>
                          <span className="action-separator">|</span>
                          <button onClick={() => handleDelete(product.id)} className="action-btn delete-btn">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit Product Form View
  return (
    <div className="products-container">
      <style>{styles}</style>
      <div className="products-main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => setCurrentView('list')} className="breadcrumb-link">
            Products
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {currentView === 'add' ? 'Add Product' : 'Edit Product'}
          </span>
        </div>

        {/* Form */}
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">
              {currentView === 'add' ? 'Add Product' : 'Edit Product'}
            </h1>
            <p className="form-description">
              {currentView === 'add' 
                ? 'Add a new product to your catalog.' 
                : 'Modify product details or remove it from the catalog.'
              }
            </p>
          </div>

          <div className="form-fields">
            {/* Product Name */}
            <div className="field-group">
              <label className="field-label">Product Name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="field-input"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="field-textarea"
                placeholder="Enter product description"
              />
            </div>

            {/* Price and Stock */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="field-input"
                  placeholder="0.00"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="field-input"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="field-group">
              <label className="field-label">Product Images</label>
              
              {/* Sample Images for Edit Mode */}
              {currentView === 'edit' && (
                <div className="sample-images">
                  <div className="sample-image" style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' }}>
                    <div>🦷</div>
                  </div>
                  <div className="sample-image" style={{ background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)' }}>
                    <div>📦</div>
                  </div>
                  <div className="sample-image" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                    <div>✋</div>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  <Upload className="upload-icon" />
                  <p className="upload-text">Click to upload images or drag and drop</p>
                  <p className="upload-subtext">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {/* Uploaded Images */}
              {productForm.images.length > 0 && (
                <div className="uploaded-images">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="uploaded-image">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {currentView === 'edit' && (
              <button 
                onClick={() => handleDelete(editingProduct.id)}
                className="delete-product-btn"
              >
                Delete Product
              </button>
            )}
            <button 
              onClick={() => setCurrentView('list')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProduct}
              className="save-btn"
            >
              {currentView === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;