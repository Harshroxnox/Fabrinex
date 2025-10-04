import React, { useState } from 'react';
import EditVariantDialog from './EditVariantDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import './VariantsList.css';
import { EditIcon, Trash2Icon } from 'lucide-react';
import { deleteVariant, updateVariant } from '../../contexts/api/products';
import toast from 'react-hot-toast';

const VariantsList = ({ variants, productId, onDeleted }) => {
  const [editingVariant, setEditingVariant] = useState(null);
  const [deletingVariant, setDeletingVariant] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (updatedVariantData) => {
    setLoading(true);
    try {
      const payload = {
        price: updatedVariantData.price,
        discount: updatedVariantData.discount,
        stock: updatedVariantData.stock,
        my_wallet: updatedVariantData.my_wallet,
        ...(updatedVariantData.main_image instanceof File && { main_image: updatedVariantData.main_image }),
      };

      const { data, error } = await updateVariant(editingVariant.variantID, payload);

      if (error) {
        throw new Error(error);
      }
      
      setEditingVariant(null);
      if (onDeleted) onDeleted();
      toast.success('Variant Updated!');
    } catch (err) {
      toast.error('Error updating variant:' ,error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId) => {
    setLoading(true);
    try {
      const { data, error } = await deleteVariant(variantId);
      if (error) throw new Error(error);
      
      setDeletingVariant(null);
      if (onDeleted) onDeleted();
      toast.success('Variant Deleted!');  
    } catch (err) {
      toast.error('Error updating variant:' ,error);
    } finally {
      setLoading(false);
    }
  };

  if (!variants || variants.length === 0) {
    return <p className="no-variants-message">No variants available</p>;
  }

  return (
    <div className="variants-container">
      <div className="variants-table-container no-scrollbar">
        <table className="variants-table no-scrollbar">
          <thead>
            <tr>
              <th>Image</th>
              <th>Color</th>
              <th>Size</th>
              <th>Price</th>
              <th>My Wallet</th>
              <th>Profit</th>
              <th>Source</th>
              <th>Floor No</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Barcode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.variantID}>
                <td>
                  {variant.main_image ? (
                    <img
                      src={variant.main_image}
                      alt={`${variant.color} ${variant.size}`}
                      className="variant-image"
                    />
                  ) : (
                    <span className="no-image">No image</span>
                  )}
                </td>
                <td>{variant.color}</td>
                <td>{variant.size}</td>
                <td>₹{variant.price}</td>
                <td>₹{variant.my_wallet}</td>
                <td>₹{variant.profit}</td>
                <td>{variant.source}</td>
                <td>{variant.floor}</td>
                <td>{variant.discount}%</td>
                <td>{variant.stock}</td>
                <td>{variant.barcode}</td>
                <td>
                  <div className="variant-actions">
                    <button
                      className="edit-btn"
                      onClick={() => setEditingVariant(variant)}
                      disabled={loading}
                    >
                      <EditIcon size={18} color="blue" />
                    </button>
                    <button
                      className="delete-icon m-2"
                      onClick={() => setDeletingVariant(variant)}
                      disabled={loading}
                    >
                      <Trash2Icon size={18} color="red" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingVariant && (
        <EditVariantDialog
          isOpen={!!editingVariant}
          onClose={() => setEditingVariant(null)}
          variantId={editingVariant.variantID}
          productId={productId}
          onSave={handleUpdate}
        />
      )}

      {deletingVariant && (
        <DeleteConfirmationDialog
          isOpen={!!deletingVariant}
          onClose={() => setDeletingVariant(null)}
          onConfirm={() => handleDelete(deletingVariant.variantID)}
          itemName={`${deletingVariant.color} ${deletingVariant.size} variant`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default VariantsList;