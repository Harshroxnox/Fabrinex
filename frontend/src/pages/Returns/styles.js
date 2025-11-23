export const returnsStyles = {
  container: {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    border: '1px solid #4b4f59ff',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    minHeight: '600px',
    marginRight: '1rem',
    padding: '30px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Softer, modern shadow
  },

  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
  },

  filterGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },

  input: {
    padding: '0.6rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    width: 'auto',
    minWidth: '150px',
    fontSize: '0.95rem',
    outline: 'none',
    color: '#374151',
  },

  filterButton: {
    backgroundColor: '#111827',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '0.5rem', // Matched to inputs
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },

  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px', // Ensures table doesn't squish too much
  },

  th: {
    textAlign: 'left',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb', // Light gray background for headers
    color: '#374151',
    fontWeight: '600',
    fontSize: '0.875rem', // Standard readable size (14px)
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  td: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f3f4f6',
    color: '#4b5563',
    fontSize: '0.95rem', // Slightly larger than header for readability
    verticalAlign: 'middle',
  },

  loadingMessage: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },

  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '25px',
    padding: '10px',
  },

  paginationButton: {
    padding: '8px 16px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#3b82f6',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  paginationText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  }
};