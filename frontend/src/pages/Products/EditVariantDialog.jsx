import React, { useState, useEffect } from "react";
import "./VariantsList.css";
import {
  deleteSecondaryImage,
  getVariantAdmin,
  uploadSecondaryImages,
  updateVariant,
} from "../../contexts/api/products";
import toast from "react-hot-toast";

const EditVariantDialog = ({ isOpen, onClose, variantId, productId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editedVariant, setEditedVariant] = useState({
    price: "",
    discount: "0",
    main_image: null,
    my_wallet: "0",
    source: "",
    floor: "0",
    secondary_images: [],
  });

  // fetch variant details
  const fetchVariant = async () => {
    setLoading(true);
    try {
      const { data, error } = await getVariantAdmin(variantId);
      if (error) throw new Error(error);
      setVariant(data.variant);
    } catch (err) {
      toast.error("Failed to fetch variant details" + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) {
      fetchVariant();
    }
  }, [variantId]);

  // sync fetched variant into form state
  useEffect(() => {
    if (variant) {
      setEditedVariant({
        price: variant.price ?? "",
        discount: variant.discount ?? "0",
        main_image: null,
        my_wallet: variant.my_wallet ?? "0",
        source: variant.source ?? "",
        floor: variant.floor ?? "0",
        secondary_images:
          variant.secondary_images?.map((img) => ({
            id: img.variantImageID,
            image_url: img.image_url,
            isNew: false,
          })) || [],
      });
      setPreviewUrl(variant.main_image ?? null);
    }
  }, [variant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedVariant((prev) => ({ ...prev, [name]: value }));
  };

  // main file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setEditedVariant((prev) => ({
        ...prev,
        main_image: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // secondary images change
  const handleSecondaryFiles = (e) => {
    if (editedVariant.secondary_images.length >= 5) {
      toast.error("You can upload a maximum of 5 secondary images.");
      return;
    }
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setEditedVariant((prev) => ({
      ...prev,
      secondary_images: [...prev.secondary_images, ...newImages],
    }));
  };

  // remove secondary image
  const handleRemoveSecondary = async (img, idx) => {
    if (!img.isNew && img.id) {
      try {
        await deleteSecondaryImage(img.id);
        setEditedVariant((prev) => ({
          ...prev,
          secondary_images: prev.secondary_images.filter((_, i) => i !== idx),
        }));
      } catch (err) {
        toast.error("Error deleting secondary image:", err);
        // setError("Failed to delete secondary image");
      }
    } else {
      setEditedVariant((prev) => ({
        ...prev,
        secondary_images: prev.secondary_images.filter((_, i) => i !== idx),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!editedVariant.price) {
      toast.error("Price is required");
      setLoading(false);
      return;
    }

    if (
      parseFloat(editedVariant.discount) < 0 ||
      parseFloat(editedVariant.discount) > 100
    ) {
      toast.error("Discount must be between 0 and 100");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        price: parseFloat(editedVariant.price).toFixed(2),
        discount: parseFloat(editedVariant.discount).toFixed(2),
        my_wallet: parseFloat(editedVariant.my_wallet).toFixed(2),
        source: editedVariant.source,
        floor: parseFloat(editedVariant.floor),
      };

      if (editedVariant.main_image) {
        updateData.main_image = editedVariant.main_image;
      }

      const { error: updateError } = await updateVariant(
        variant.variantID,
        updateData
      );

      if (updateError){
        // toast.error("Error updating variant" + updateError);
        throw new Error(updateError);
      } 
      // handle secondary images
      const newFiles = editedVariant.secondary_images
        .filter((img) => img.isNew)
        .map((img) => img.file);

      if (newFiles.length > 0) {
        const { error: uploadError } = await uploadSecondaryImages(variant.variantID, newFiles);
        if (uploadError){
          // toast.error("Error uploading secondary images");
          throw new Error(updateError);
        }
      }

      onSave?.({
        ...variant,
        ...updateData,
        main_image: previewUrl, // keep existing if no new image uploaded
      });

      toast.success("Variant updated successfully");
      onClose();
    } catch (err) {
      toast.error(`Error updating variant: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content no-scrollbar">
        <h2>
          Edit Variant ({variant.color}, {variant.size})
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Price*</label>
              <input
                type="number"
                name="price"
                value={editedVariant.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={editedVariant.discount}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>My Wallet</label>
              <input
                type="number"
                name="my_wallet"
                value={editedVariant.my_wallet}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Floor No</label>
              <input
                type="number"
                name="floor"
                value={editedVariant.floor}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Source*</label>
              <input
                type="text"
                name="source"
                value={editedVariant.source}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* main image */}
          <div className="form-group">
            <label>Main Image ( File Size less than 5 mb)*</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {(previewUrl || variant.main_image) && (
            <div className="image-preview-container">
              <img
                src={previewUrl || variant.main_image}
                alt="Variant preview"
                className="image-preview"
              />
            </div>
          )}

          {/* secondary images */}
          <div className="form-group">
            <label>Add Secondary Images (Optional)</label>
            <label> Upto 5 Images of sizes less than 5MB</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSecondaryFiles}
              disabled={loading}
            />
          </div>

          {editedVariant.secondary_images.length > 0 
           && (
            <div className="secondary-images-preview">
              {editedVariant.secondary_images.map((img, idx) => (
                <div key={idx} className="secondary-image-item">
                  <img
                    src={img.preview || img.image_url}
                    alt={`Secondary ${idx}`}
                    className="secondary-image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSecondary(img, idx)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="dialog-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantDialog;
