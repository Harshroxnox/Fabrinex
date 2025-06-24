import React, { useState, useContext, useDebugValue, useEffect } from 'react';
import VariantsList from './VariantsList';
import EditProductDialog from './EditProductDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './ProductsList.css';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { ProductContext } from '../../contexts/ProductContext';

const ProductItem = ({ product, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {deleteProduct, loading, error ,getVariantsByProduct} = useContext(ProductContext);
  // console.log(product);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const [variants,setVariants]= useState([]);
  useEffect(()=>{
    const fetchVariants= async ()=>{
      try {
        const variantsData= await getVariantsByProduct(product.productID);
        setVariants(variantsData);
      } catch (error) {
        console.error("error fetching variants:", error);
      }
    };
    fetchVariants();
  },[getVariantsByProduct]);
  getVariantsByProduct(product.productID);
  // console.log(variants);
  const handleUpdate = (updatedProduct) => {
    onUpdate(updatedProduct);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product.productID);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const renderDescription = () => {
    if (!product.description) return 'No description';
    if (typeof product.description === 'object' && product.description.content) {
      return <div dangerouslySetInnerHTML={{ __html: product.description.content }} />;
    }
    if (typeof product.description === 'object') {
      return Object.entries(product.description).map(([key, val], idx) => (
        <div key={idx}><strong>{key}:</strong> {val}</div>
      ));
    }
    return product.description.toString();
  };

  return (
    <div className={`product-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="product-header" onClick={toggleExpand}>
        <div className="product-info">
          <div className="product-name-row">
            <span className="product-name">{product.name}</span>
            <span className="product-category">{product.category}</span>
          </div>
          
          <div className="product-description">
            {renderDescription()}
          </div>

          <div className="product-meta">
            <div className="product-rating">
              <span>Rated by {product.people_rated || 0} people</span>
              <span>Average: {product.average_rating ?? 'N/A'}</span>
            </div>
            {product.variants?.length > 0 && (
              <div className="product-variants-count">
                {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="product-actions">
          <button 
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditDialogOpen(true);
            }}
            disabled={loading}
          >
            <EditIcon size={20} color="blue"/>
          </button>
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            disabled={loading}
          >
            <Trash2Icon size={20} color="red"/>
          </button>
          <span className="expand-icon">
            {isExpanded ? '▼' : '►'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="product-variants-section">
          {variants?.length > 0 ? (
            <VariantsList
              productId={product.productID}
              variants={variants}
            />
          ) : (
            <p className="no-variants-message">No variants available for this product</p>
          )}
        </div>
      )}

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        product={product}
        onSave={handleUpdate}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={product.name}
        loading={loading}
      />
    </div>
  );
};

export default ProductItem;