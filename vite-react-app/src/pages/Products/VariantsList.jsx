import React, { useState } from 'react';
import EditVariantDialog from './EditVariantDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './VariantsList.css';
import { EditIcon, Trash2Icon } from 'lucide-react';

const VariantsList = ({ variants, productId, onUpdate, onDelete }) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [deletingVariant, setDeletingVariant] = useState(null);

  return (
    <div className="variants-container">
      <table className="variants-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Color</th>
            <th>Size</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map(variant => (
            <tr key={variant.id}>
              <td>
                <img 
                  src={variant.image} 
                  alt={`${variant.color} ${variant.size}`} 
                  className="variant-image"
                />
              </td>
              <td>{variant.color}</td>
              <td>{variant.size}</td>
              <td>${variant.price}</td>
              <td>{variant.stock}</td>
              <td>
                <button 
                  className="edit-btn"
                  onClick={() => setEditingVariant(variant)}
                >
                  <EditIcon color="blue" size={20} />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => setDeletingVariant(variant)}
                >
                  <Trash2Icon color="red" size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingVariant && (
        <EditVariantDialog
          isOpen={!!editingVariant}
          onClose={() => setEditingVariant(null)}
          variant={editingVariant}
          productId={productId}
          onSave={(updatedVariant) => {
            onUpdate(productId, updatedVariant);
            setEditingVariant(null);
          }}
        />
      )}

      {deletingVariant && (
        <DeleteConfirmationDialog
          isOpen={!!deletingVariant}
          onClose={() => setDeletingVariant(null)}
          onConfirm={() => {
            onDelete(productId, deletingVariant.id);
            setDeletingVariant(null);
          }}
          itemName={`${deletingVariant.color} ${deletingVariant.size} variant`}
        />
      )}
    </div>
  );
};

export default VariantsList;