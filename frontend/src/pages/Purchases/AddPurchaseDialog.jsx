import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './AddPurchaseDialog.css';
import { createPurchase } from '../../contexts/api/purchases';

const AddPurchaseDialog = ({ isOpen, onClose, onSave }) => {
    // --- State for the main purchase details ---
    const [invoiceDetails, setInvoiceDetails] = useState({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerDetails: { name: '', gstin: '' },
        buyerDetails: { billTo: { name: '', gstin: '' } },
        remarks: ''
    });

    // --- State for item entry ---
    const [items, setItems] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [newItemData, setNewItemData] = useState({ // Holds data for a new item form
        barcode: '',
        itemCode: '',
        hsnCode: '',
        taxPercent: '5',
        rate: '',
        unit: 'PCS'
    });
    const [showNewItemForm, setShowNewItemForm] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const barcodeRef = useRef(null);
    const itemCodeRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            barcodeRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (showNewItemForm) {
            itemCodeRef.current?.focus();
        }
    }, [showNewItemForm]);

    const handleBarcodeEnter = () => {
        const code = barcodeInput.trim();
        if (!code) return;

        const existingItemIndex = items.findIndex(item => item.barcode === code);

        if (existingItemIndex !== -1) {
            // --- BARCODE EXISTS: Just increase quantity ---
            const updatedItems = [...items];
            const item = updatedItems[existingItemIndex];
            item.quantity += 1;
            item.value = item.quantity * item.rate; // Recalculate value
            setItems(updatedItems);
            toast.success(`Quantity updated for barcode: ${code}`);
            setBarcodeInput('');
            setShowNewItemForm(false);
        } else {
            // --- NEW BARCODE: Show the form and pre-fill the barcode ---
            setNewItemData(prev => ({ ...prev, barcode: code }));
            setShowNewItemForm(true);
        }
    };

    const handleAddNewItem = () => {
        const { barcode, itemCode, hsnCode, rate, taxPercent, unit } = newItemData;
        if (!barcode.trim() || !itemCode.trim() || !hsnCode.trim() || !rate || !taxPercent) {
            toast.error("All fields are required for a new item.");
            return;
        }

        const newItem = {
            barcode: barcode.trim(),
            itemCode: itemCode.trim(),
            hsnCode: hsnCode.trim(),
            rate: parseFloat(rate),
            taxPercent: parseFloat(taxPercent),
            unit: unit,
            quantity: 1,
            value: parseFloat(rate) * 1, // Initial value for quantity 1
            description: `Item Code: ${itemCode.trim()}`
        };

        setItems([...items, newItem]);
        toast.success(`New item added: ${barcode.trim()}`);

        setBarcodeInput('');
        setNewItemData({ barcode: '', itemCode: '', hsnCode: '', taxPercent: '5', rate: '', unit: 'PCS' });
        setShowNewItemForm(false);
        barcodeRef.current?.focus();
    };
    const handleRemoveItem = (barcodeToRemove) => {
        setItems(items.filter(item => item.barcode !== barcodeToRemove));
    };
    
    const resetForm = () => {
        setItems([]);
        setInvoiceDetails({ /* ... */ });
        setBarcodeInput('');
        setNewItemData({ /* ... */ });
        setShowNewItemForm(false);
    };

    const handleSavePurchase = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error("Please add at least one item.");
            return;
        }
        setIsSaving(true);
        
        const totalAmount = items.reduce((sum, item) => sum + item.value, 0);
        const gstAmount = items.reduce((sum, item) => sum + (item.value * (item.taxPercent / 100)), 0);
        const grandTotal = totalAmount + gstAmount;

        const purchasePayload = {
            ...invoiceDetails,
            totalAmount: totalAmount.toFixed(2),
            gstAmount: gstAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            items: items
        };

        const { error } = await createPurchase(purchasePayload);
        if (error) {
            toast.error(`Failed to create purchase: ${error}`);
        } else {
            toast.success("Purchase created successfully!");
            resetForm();
            onSave();
            onClose();
        }
        setIsSaving(false);
    };
    
    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setInvoiceDetails(prev => ({
                ...prev,
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
            }));
        } else {
            setInvoiceDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-content no-scrollbar">
                <h2>Add New Purchase</h2>
                <form onSubmit={handleSavePurchase} className="purchase-dialog-form">
               
                    <fieldset className="purchase-dialog-metadata">
                        <legend>Invoice Details</legend>
                        <div className="input-group"><label>Invoice #</label><input name="invoiceNumber" value={invoiceDetails.invoiceNumber} onChange={handleHeaderChange} required /></div>
                        <div className="input-group"><label>Invoice Date</label><input type="date" name="invoiceDate" value={invoiceDetails.invoiceDate} onChange={handleHeaderChange} required /></div>
                        <div className="input-group"><label>Seller Name</label><input name="sellerDetails.name" value={invoiceDetails.sellerDetails.name} onChange={handleHeaderChange} required /></div>
                        <div className="input-group"><label>Seller GSTIN</label><input name="sellerDetails.gstin" value={invoiceDetails.sellerDetails.gstin} onChange={handleHeaderChange} /></div>
                    </fieldset>
                    
                    <div className="purchase-dialog-entry">
                        <div className="input-group">
                            <label>Scan/Enter Barcode</label>
                            <input ref={barcodeRef} value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeEnter(); } }}/>
                        </div>
                        
                        {showNewItemForm && (
                            <div className="new-item-group">
                                <p className="new-item-indicator">New Barcode Detected: <strong>{newItemData.barcode}</strong>. Please provide details:</p>
                                <div className="input-group"><label>Item Code</label><input ref={itemCodeRef} value={newItemData.itemCode} onChange={(e) => setNewItemData({ ...newItemData, itemCode: e.target.value })}/></div>
                                <div className="input-group"><label>HSN Code</label><input value={newItemData.hsnCode} onChange={(e) => setNewItemData({ ...newItemData, hsnCode: e.target.value })}/></div>
                                <div className="input-group"><label>Rate (₹)</label><input type="number" value={newItemData.rate} onChange={(e) => setNewItemData({ ...newItemData, rate: e.target.value })}/></div>
                                <div className="input-group"><label>Tax (%)</label><input type="number" value={newItemData.taxPercent} onChange={(e) => setNewItemData({ ...newItemData, taxPercent: e.target.value })}/></div>
                                <div className="input-group"><label>Unit</label><input value={newItemData.unit} onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewItem(); } }}/></div>
                                <button type="button" onClick={handleAddNewItem} className="add-item-btn">Add Item</button>
                            </div>
                        )}
                    </div>

                    <h4>Purchase Items</h4>
                    <div className="staged-items-container">
                        {items.length === 0 ? <p className="empty-list-message">Scan a barcode to begin.</p> : (
                            <table className="staged-items-table">
                                <thead><tr><th>Barcode</th><th>Item Code</th><th>HSN</th><th>Rate</th><th>Qty</th><th>Value</th><th>Action</th></tr></thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.barcode}</td>
                                            <td>{item.itemCode}</td>
                                            <td>{item.hsnCode}</td>
                                            <td>₹{item.rate.toFixed(2)}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.value.toFixed(2)}</td>
                                            <td><button type="button" onClick={() => handleRemoveItem(item.barcode)} className="remove-item-btn">X</button></td>
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