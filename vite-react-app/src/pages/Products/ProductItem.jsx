import React, { useState } from 'react';
import VariantsList from './VariantsList';
import EditProductDialog from './EditProductDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './ProductsList.css';
import { EditIcon, Trash2Icon } from 'lucide-react';

const ProductItem = ({ product, onUpdate, onDelete, onVariantUpdate, onVariantDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleUpdate = (updatedProduct) => {
    onUpdate(updatedProduct);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete(product.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="product-item">
      <div className="product-header" onClick={toggleExpand}>
        <div className="product-info">
          <span className="product-name">{product.name}</span>
          <span className="product-category">{product.category}</span>
          <span className="product-description">{product.description}</span>
        </div>
        <div className="product-actions">
          <button 
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditDialogOpen(true);
            }}
          >
            <EditIcon size={20} color="blue"/>
          </button>
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2Icon size={20} color="red"/>
          </button>
          <span className="expand-icon">
            {isExpanded ? '▼' : '►'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <VariantsList 
          variants={product.variants}
          productId={product.id}
          onUpdate={onVariantUpdate}
          onDelete={onVariantDelete}
        />
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
      />
    </div>
  );
};

export default ProductItem;