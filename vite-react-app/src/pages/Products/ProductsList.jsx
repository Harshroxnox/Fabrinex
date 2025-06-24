import React, { useContext, useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import ProductFilters from './ProductFilters';
import AddProductDialog from './AddProductDialog';
import './ProductsList.css';
import { ProductContext } from '../../contexts/ProductContext';

const ProductsList = () => {
  const { 
    getAllProducts, 
    createProduct,
    loading, 
    error 
  } = useContext(ProductContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    
    fetchProducts();
  }, [getAllProducts]);

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
    try {
      setIsAddDialogOpen(false);
      const productsData = await getAllProducts(); // Refresh the list
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error('Error refreshing products:', err);
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

  return (
    <div className="products-container">
      <div className="products-header">
        <h5>Products</h5>
        <button
          className="add-product-btn"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={loading}
        >
          Add New Product
        </button>
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