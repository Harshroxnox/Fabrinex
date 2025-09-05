import React, { useState, useContext, useDebugValue, useEffect } from 'react';
import VariantsList from './VariantsList';
import EditProductDialog from './EditProductDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './ProductsList.css';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { ProductContext } from '../../contexts/ProductContext';
import AddProductDialog from './AddProductDialog';
import AddVariantDialog from './AddVariantDialog';

const ProductItem = ({ product, onUpdate ,onAdd}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {deleteProduct, getProductByIDByAdmin , createVariant} = useContext(ProductContext);
  // console.log(product);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const [loading,setLoading]=useState(false);
  const [variants,setVariants]= useState([]);
  useEffect(()=>{
    let isMounted = true;

    const fetchVariants= async ()=>{
      setLoading(true);
      try {
        // console.log(product);
        const productData= await getProductByIDByAdmin(product.productID);
        const variantsData = productData.product.variants;
        setVariants(variantsData);
        // console.log(variantsData);
      } catch (error) {
        console.error("error fetching variants:", error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchVariants();

    return ()=>{
      isMounted = false;
    }
  },[]);
  // console.log(variants);
  const handleUpdate = (updatedProduct) => {
    onUpdate(updatedProduct);
    setIsEditDialogOpen(false);
  };

  // const handleAdd = (updatedProduct) => {
  //   onAdd(updatedProduct);
  //   setIsAddDialogOpen(false);
  // }

   const handleAddVariant = async (variant) => {
    // setVariants((prev) => [...prev, variant]);
    // setShowVariantDialog(false);
    // setError('');
    setLoading(true);
    try {
      await createVariant(product.productID , variant);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding new variant', err);
    }
    finally{
      setLoading(true);
    }
  };


  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(product.productID);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
    finally{
      setLoading(true);
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
            className="hover:bg-green" style={{padding:'0.5rem 0.75rem' , borderRadius:'50%',borderColor:'transparent',cursor:'pointer'}}
            onClick={(e) => {
              e.stopPropagation();
              setIsAddDialogOpen(true);
            }}
            disabled={loading}
          >
            <PlusCircleIcon size={20} color="green"/>
            </button>
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
            className="delete-icon"
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
    
      <AddVariantDialog
      isOpen={isAddDialogOpen}
      onClose={()=> setIsAddDialogOpen(false)}
      onAdd={handleAddVariant}
      />

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