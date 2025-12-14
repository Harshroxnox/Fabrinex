import React from 'react';
import { X } from 'lucide-react';

// =======================================================
// Modal Layout Component
// =======================================================

export const ModalLayout = ({ children, onClose }) => (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
);

// =======================================================
// Styles
// =======================================================

export const modalOverlayStyle = {
  position: 'fixed', 
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  zIndex: 1001,
  backdropFilter: 'blur(2px)',
};

export const modalContentStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '2.5rem',
  maxWidth: '95vw',
  width: '900px',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
};

export const closeButtonStyle = {
  position: 'absolute', 
  top: '1rem', 
  right: '1rem',
  background: 'none', 
  border: 'none', 
  cursor: 'pointer',
  color: '#4b5563',
};

export const sectionStyle = {
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    backgroundColor: '#f9fafb',
};

export const sectionHeaderStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
};

export const tableStyle = {
    // marginTop: '1rem',
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '1.2rem',
};

export const thStyle = {
    textAlign: 'left',
    padding: '0.75rem 0.5rem',
    borderBottom: '2px solid #e5e7eb',
    color: '#4b5563',
    fontWeight: '600',
    backgroundColor: '#f3f4f6',
};

export const tdStyle = {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'middle',
};

export const inputStyle = {
    width: '70px',
    padding: '0.3rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    textAlign: 'center',
};

export const summaryStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
};

export const summaryTextStyle = {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#4b5563',
};

export const netChangeStyle = (netChange) => ({
    fontSize: '1.25rem',
    fontWeight: '700',
    color: netChange < 0 ? '#10b981' : '#ef4444', 
});

export const submitButtonStyle = {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
};

export const cancelButtonStyle = {
    backgroundColor: '#6b7280',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
};

// Barcode specific styles
export const searchFormStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
};

export const barcodeInputStyle = {
    flexGrow: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
};

export const searchButtonStyle = {
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
};

export const variantResultStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    marginBottom: '1rem',
};

export const addItemButtonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
};