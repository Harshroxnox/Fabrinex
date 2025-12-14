import React, { useState } from 'react';

const AddBillModal = ({ isOpen, onClose, onSubmit, isUploading }) => {
    const [wholesalerName, setWholesalerName] = useState('');
    const [billDate, setBillDate] = useState('');
    const [billPdf, setBillPdf] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!wholesalerName || !billDate || !billPdf) {
            setError('All fields are required.');
            return;
        }
        setError('');
        
        const formData = new FormData();
        formData.append('wholesaler_name', wholesalerName);
        formData.append('bill_date', billDate);
        formData.append('bill-pdf', billPdf);

        onSubmit(formData);
    };

    const handleClose = () => {
        // Reset form state before closing
        setWholesalerName('');
        setBillDate('');
        setBillPdf(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="bills-modal-overlay">
            <div className="bills-modal-content">
                <h2 className="bills-modal-title">Add New Bill</h2>
                {error && <p className="bills-modal-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="bills-form-group">
                        <label htmlFor="wholesalerName" className="bills-form-label">Wholesaler Name</label>
                        <input
                            type="text"
                            id="wholesalerName"
                            value={wholesalerName}
                            onChange={(e) => setWholesalerName(e.target.value)}
                            className="bills-form-input"
                            required
                        />
                    </div>
                    <div className="bills-form-group">
                        <label htmlFor="billDate" className="bills-form-label">Bill Date</label>
                        <input
                            type="date"
                            id="billDate"
                            value={billDate}
                            onChange={(e) => setBillDate(e.target.value)}
                            className="bills-form-input"
                            required
                        />
                    </div>
                    <div className="bills-form-group">
                        <label htmlFor="billPdf" className="bills-form-label">Bill PDF</label>
                        <input
                            type="file"
                            id="billPdf"
                            accept=".pdf"
                            onChange={(e) => setBillPdf(e.target.files[0])}
                            className="bills-form-file-input"
                            required
                        />
                    </div>
                    <div className="bills-modal-actions">
                        <button type="button" onClick={handleClose} className="bills-secondaryButton">
                            Cancel
                        </button>
                        <button type="submit" disabled={isUploading} className="bills-primaryButton">
                            {isUploading ? 'Uploading...' : 'Add Bill'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBillModal;