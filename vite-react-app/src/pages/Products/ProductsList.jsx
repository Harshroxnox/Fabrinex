import React, { useState } from 'react';
import ProductItem from './ProductItem';
import ProductFilters from './ProductFilters';
import AddProductDialog from './AddProductDialog';
import './ProductsList.css';

const ProductsList = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      category: 'Clothing',
      variants: [
        { id: 1, price: 20, stock: 100, color: 'Red', size: 'M', image: 'tshirt-red.jpg' },
        { id: 2, price: 20, stock: 80, color: 'Blue', size: 'M', image: 'tshirt-blue.jpg' }
      ]
    },
    {
      id: 2,
      name: 'Jeans',
      description: 'Slim fit jeans',
      category: 'Clothing',
      variants: [
        { id: 3, price: 50, stock: 50, color: 'Black', size: '32', image: 'jeans-black.jpg' }
      ]
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleSearch = (searchTerm) => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleVariantSearch = (searchTerm) => {
    const filtered = products.map(product => ({
      ...product,
      variants: product.variants.filter(variant => 
        variant.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variant.size.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(product => product.variants.length > 0);
    setFilteredProducts(filtered);
  };

  const addProduct = (newProduct) => {
    setProducts([...products, newProduct]);
    setFilteredProducts([...filteredProducts, newProduct]);
    setIsAddDialogOpen(false);
  };

  const updateProduct = (updatedProduct) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const updateVariant = (productId, updatedVariant) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          variants: product.variants.map(v => 
            v.id === updatedVariant.id ? updatedVariant : v
          )
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const deleteVariant = (productId, variantId) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          variants: product.variants.filter(v => v.id !== variantId)
        };
      }
      return product;
    }).filter(product => product.variants.length > 0 || product.id === productId);
    
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h5>Products</h5>
        <button 
          className="add-product-btn"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Product
        </button>
      </div>

      <ProductFilters 
        onSearch={handleSearch}
        onVariantSearch={handleVariantSearch}
      />

      <div className="products-list">
        {filteredProducts.map(product => (
          <ProductItem
            key={product.id}
            product={product}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            onVariantUpdate={updateVariant}
            onVariantDelete={deleteVariant}
          />
        ))}
      </div>

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addProduct}
      />
    </div>
  );
};

export default ProductsList;