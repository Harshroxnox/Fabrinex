import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './AddPurchaseDialog.css'; // The CSS for this component
import { createPurchase } from '../../contexts/api/purchases';

const AddPurchaseDialog = ({ isOpen, onClose, onSave }) => {
  // State for the overall purchase
  const [metaData, setMetaData] = useState({ supplier: '', invoice_number: '' });
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for the items list and the inputs
  const [items, setItems] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [hsnInput, setHsnInput] = useState('');
  const [showHsnInput, setShowHsnInput] = useState(false);

  // Refs for focusing inputs
  const barcodeRef = useRef(null);
  const hsnRef = useRef(null);

  // When the dialog opens, focus the first input
  useEffect(() => {
    if (isOpen) {
      barcodeRef.current?.focus();
    }
  }, [isOpen]);

  // Focus the HSN input when it appears
  useEffect(() => {
    if (showHsnInput) {
      hsnRef.current?.focus();
    }
  }, [showHsnInput]);

  const handleBarcodeEnter = () => {
    if (!barcodeInput.trim()) return;
    const existingItemIndex = items.findIndex(item => item.barcode === barcodeInput.trim());

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
      toast.success(`Quantity updated for barcode: ${barcodeInput.trim()}`);
      setBarcodeInput('');
      setShowHsnInput(false);
    } else {
      setShowHsnInput(true);
    }
  };

  const handleAddNewItem = () => {
    if (!barcodeInput.trim() || !hsnInput.trim()) {
      toast.error("Both barcode and HSN code are required for a new item.");
      return;
    }
    const newItem = { barcode: barcodeInput.trim(), hsn_code: hsnInput.trim(), quantity: 1 };
    setItems([...items, newItem]);
    toast.success(`New item added: ${barcodeInput.trim()}`);
    setBarcodeInput('');
    setHsnInput('');
    setShowHsnInput(false);
    barcodeRef.current?.focus();
  };
  
  const handleRemoveItem = (barcodeToRemove) => {
    setItems(items.filter(item => item.barcode !== barcodeToRemove));
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase.");
      return;
    }
    setIsSaving(true);
    const purchaseData = { metaData, purchaseDate, items };
    const { error } = await createPurchase(purchaseData);
    if (error) {
      toast.error(`Failed to create purchase: ${error}`);
      setIsSaving(false);
    } else {
      setItems([]);
      setMetaData({ supplier: '', invoice_number: '' });
      setBarcodeInput('');
      setHsnInput('');
      setShowHsnInput(false);
      setIsSaving(false);
      onSave();
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className=" dialog-overlay">
      <div className="dialog-content no-scrollbar" >
        <h2>Add New Purchase</h2>
        <form onSubmit={handleSavePurchase} className="purchase-dialog-form">
            <div className="purchase-dialog-metadata">
                <div className="input-group">
                  <label>Supplier</label>
                  <input name="supplier" value={metaData.supplier} onChange={(e) => setMetaData({...metaData, supplier: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Invoice Number</label>
                  <input name="invoice_number" value={metaData.invoice_number} onChange={(e) => setMetaData({...metaData, invoice_number: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
                </div>
            </div>
            
            <div className="purchase-dialog-entry">
              <div className="input-group">
                <label>Scan/Enter Barcode</label>
                <input 
                  ref={barcodeRef}
                  value={barcodeInput} 
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeEnter(); } }}
                />
              </div>
              
              {showHsnInput && (
                <div className="new-item-group">
                  <div className="input-group">
                    <label>Enter HSN Code (New Item)</label>
                    <input 
                      ref={hsnRef}
                      value={hsnInput}
                      onChange={(e) => setHsnInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewItem(); } }}
                    />
                  </div>
                  <button type="button" onClick={handleAddNewItem} className="add-item-btn">Add Item</button>
                </div>
              )}
            </div>

            <h4>Purchase Items</h4>

          <div className="staged-items-container">
            {items.length === 0 ? <p className="empty-list-message">Scan a barcode to begin adding items.</p> : (
              <table className="staged-items-table">
                <thead><tr><th>Barcode</th><th>HSN</th><th>Quantity</th><th>Action</th></tr></thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.barcode}</td>
                      <td>{item.hsn_code}</td>
                      <td>{item.quantity}</td>
                      <td><button type="button" onClick={() => handleRemoveItem(item.barcode)} className="remove-item-btn">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
            <div className="dialog-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" disabled={isSaving} className="save-btn">{isSaving ? 'Saving...' : 'Save Purchase'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseDialog;