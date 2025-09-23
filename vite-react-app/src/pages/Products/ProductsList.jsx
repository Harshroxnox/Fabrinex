import React, { useContext, useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import ProductFilters from './ProductFilters';
import AddProductDialog from './AddProductDialog';
import './ProductsList.css';
import { ProductContext } from '../../contexts/ProductContext';
import { downloadProductLabels, getAllProducts } from '../../contexts/api/products';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading,setLoading]=useState(false);
  const [error, setError] = useState('');


  //roles of the admin
  const roles = localStorage.getItem("role");
  const canCreateProduct = roles.includes("superadmin") || roles.includes("admin") || roles.includes("inventory-manager");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const {data,error} = await getAllProducts();
      if(error) throw new Error(error);
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    finally{
      setLoading(false);
    }
  };
  useEffect( () => {
    fetchProducts();
  }, []);
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
   const filtered = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name?.toLowerCase().includes(searchLower);
    const categoryMatch = product.category?.toLowerCase().includes(searchLower);
    
    let descriptionMatch = false;
    if (typeof product.description === 'object') {
      if (product.description.content) {
        descriptionMatch = product.description.content.toLowerCase().includes(searchLower);
      } else {
        descriptionMatch = Object.values(product.description).some(val => 
          String(val).toLowerCase().includes(searchLower)
        ); // Added missing parenthesis here
      }
    } else if (product.description) {
      descriptionMatch = String(product.description).toLowerCase().includes(searchLower);
    }
    
    return nameMatch || categoryMatch || descriptionMatch;
  });
    
    setFilteredProducts(filtered);
  };

  const handleVariantSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.map(product => ({
      ...product,
      variants: product.variants?.filter(variant => {
        const searchLower = searchTerm.toLowerCase();
        const colorMatch = variant.color?.toLowerCase().includes(searchLower);
        const sizeMatch = variant.size?.toLowerCase().includes(searchLower);
        return colorMatch || sizeMatch;
      }) || []
    })).filter(product => product.variants.length > 0);
    
    setFilteredProducts(filtered);
  };

  const handleResetFilters = () => {
    setFilteredProducts(products);
  };

  const handleAddProduct = async (newProduct) => {
    setLoading(true);
    try {
      setIsAddDialogOpen(false);
      const {data, error} = await getAllProducts();
      if(error) {
        console.error("Error refreshing products:" , error);
        return ;
      }
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      console.error('Unexpected error refreshing products:', err);
    }
    finally{
      setLoading(false);
    }
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(p => p.productID === updatedProduct.productID ? updatedProduct : p)
    );
    setFilteredProducts(prev => 
      prev.map(p => p.productID === updatedProduct.productID ? updatedProduct : p)
    );
  };

  const handleDownload = async () => {
    const {data , error} = await downloadProductLabels();
    if(error){
      console.error("Download Failed:" ,error);
      return ;
    }
    //create download link
    const url = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  

  return (
    <div className="products-container">
      <div className="products-header">
        <h5>Products</h5>
        <div className='products-btn-group'>

          <button
          className="add-product-btn"
          disabled={!canCreateProduct}
          onClick={handleDownload}
          >
            Download Barcodes
          </button>
          <button
            className="add-product-btn"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!canCreateProduct}
          >
            Add New Product
          </button>
          </div>
      </div>

      <ProductFilters
        onSearch={handleSearch}
        onVariantSearch={handleVariantSearch}
        onReset={handleResetFilters}
      />

      {error && <p className="error-message">{error}</p>}

      {loading && !products.length ? (
        <div className="loading-indicator">Loading products...</div>
      ) : (
        <div className="products-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductItem
                key={product.productID}
                product={product}
                onUpdate={handleUpdateProduct}
                onAdd = {handleAddProduct}
                onDeleted = {fetchProducts}
              />
            ))
          ) : (
            <p className="no-products-message">No products found matching your criteria</p>
          )}
        </div>
      )}

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddProduct}
      />
    </div>
  );
};

export default ProductsList;