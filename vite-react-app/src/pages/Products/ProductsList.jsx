import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import ProductFilters from './ProductFilters';
import AddProductDialog from './AddProductDialog';
import './ProductsList.css';
import { downloadLabelsByDate, downloadProductLabels, getAllProducts } from '../../contexts/api/products';
import toast from 'react-hot-toast';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading,setLoading]=useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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
      toast.error("Error fetching products: " + err.message);
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

  const handleResetFilters = () => {
    setFilteredProducts(products);
  };

  const handleAddProduct = async (newProduct) => {
    setLoading(true);
    try {
      setIsAddDialogOpen(false);
      const {data, error} = await getAllProducts();
      if(error) {
        throw new Error(error);
      }
      setProducts(data.products);
      setFilteredProducts(data.products);
      // toast.success("Product added successfully");
    } catch (err) {
      toast.error("Error refreshing products: " + err.message);
    // toast.error(`Unexpected error refreshing products: ${err.message}`);
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
  
const handleDownloadByDate = async () => {
    // console.log(dateFrom, dateTo);
    if(!dateFrom || !dateTo){
      toast.error("Please select both date from and date to");
      return ;
    }
    if(dateFrom > dateTo){
      toast.error("Date From cannot be greater than Date To");
      return ;
    }
    const {data , error} = await downloadLabelsByDate({dateFrom,dateTo});
    if(error){
      toast.error(`Download failed:  ${error}`);
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
    toast.success("Barcode list added!");
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h5>Products</h5>
        
        <div className='products-btn-group'>
<div className="products-barcode-group">
          <label>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="products-barcode-group">
          <label>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
          <button
          className="add-product-btn"
          disabled={!canCreateProduct}
          onClick={handleDownloadByDate}
          >
            Download Barcodes By Date
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
        onReset={handleResetFilters}
      />


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