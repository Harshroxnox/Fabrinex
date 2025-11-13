export const returnsStyles = {
  container: {
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    border: '0.01rem solid #776969ff', // Slightly lighter border for container
    borderRadius: '2rem',
    overflow: 'hidden',
    minHeight: '600px',
    marginRight: '1rem',
    padding: '35px',
    fontSize: '0.9rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },

  listWrapper: {
    border: '0.01rem solid #a2a2a2',
    padding: '2rem',
    borderRadius: '2rem',
    backgroundColor: '#FDFDFD',
    fontSize: 'large',
    display: 'grid',
    gap: '20px',
  },

  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem', // Keeping separate from date filter for clarity
  },

  filterGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },

  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    width: '180px', 
    fontSize: '1rem',
  },

  filterButton: {
    backgroundColor: '#111827', // Using the dark color from .add-purchase-btn
    color: 'white',
    padding: '12px 20px',
    borderRadius: '2rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  tableContainer: {
    overflowX: 'auto',
    borderRadius: '1rem', // Slightly rounder borders for consistency
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)', // More pronounced shadow
    backgroundColor: '#FDFDFD',
    border: '1px solid #e5e7eb', // Light border for definition
    marginTop: '1rem',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '1rem 1.25rem',
    borderBottom: '2px solid #e5e7eb',
    color: '#4b5563',
    fontWeight: '600',
    fontSize: '0.9rem',
    backgroundColor: '#f3f4f6', // Light gray header background
  },
  td: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f3f4f6', // Very light row separator
    verticalAlign: 'middle',
    fontSize: '0.9rem',
    color: '#1f2937',
  },

  loadingMessage: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#777',
  },
};
