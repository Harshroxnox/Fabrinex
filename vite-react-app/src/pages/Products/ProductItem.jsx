import React, { useState, useEffect } from 'react';
import VariantsList from './VariantsList';
import EditProductDialog from './EditProductDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './ProductsList.css';
import { EditIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import AddVariantDialog from './AddVariantDialog';
import { 
  deleteProduct, 
  getProductByIDByAdmin, 
  uploadSecondaryImages, 
  createVariant 
} from '../../contexts/api/products';

const ProductItem = ({ product, onUpdate, onAdd, onDeleted }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await getProductByIDByAdmin(product.productID);
      if (error) {
        console.error("Error fetching variants:", error);
        return;
      }
      setVariants(data.product.variants);
    } catch (err) {
      console.error("Unexpected error fetching variants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [product.productID]);

  const handleUpdate = (updatedProduct) => {
    onUpdate(updatedProduct);
    setIsEditDialogOpen(false);
    if (onDeleted) onDeleted();
  };

  const handleAddVariant = async (variant) => {
    setLoading(true);
    try {
      const variantFormData = new FormData();
      for (const key in variant) {
        if (key !== 'secondaryImages') {
          variantFormData.append(key, variant[key]);
        }
      }

      const { data: createData, error: createError } = await createVariant(
        product.productID,
        variantFormData
      );

      if (createError) {
        throw new Error(`Failed to create variant: ${createError}`);
      }

      const newVariantID = createData.variantID;

      if (variant.secondaryImages && variant.secondaryImages.length > 0) {
        const { error: uploadError } = await uploadSecondaryImages(
          newVariantID,
          variant.secondaryImages
        );

        if (uploadError) {
          console.warn(`Variant created, but failed to upload secondary images: ${uploadError}`);
        }
      }
      
      fetchVariants();
      setIsAddDialogOpen(false);

    } catch (error) {
      console.error("Error adding new variant:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data, error } = await deleteProduct(product.productID);

      if (error) throw new Error(error);
      setIsDeleteDialogOpen(false);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error("Error deleting product :", err);
    } finally {
      setLoading(false);
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
            {variants?.length > 0 && (
              <div className="product-variants-count">
                {variants.length} variant{variants.length !== 1 ? 's' : ''}
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
              onDeleted={fetchVariants}
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