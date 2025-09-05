export const styles = {
    container: {
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      border: '0.01rem solid black',
      borderRadius: '2rem',
      width: '84vw',
      overflow: 'hidden',
      minHeight: '600px',
      margin: '0 auto',
      padding:'35px'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '100%',
      margin: '0 auto',
      // padding: '30px 24px',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    title: {
      fontSize: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      margin: '0',
      color: 'black'
    },
    createButton: {
      backgroundColor: '#111827',
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
      gap: '0.5rem'
    },
    backButton: {
      backgroundColor: '#6b7280',
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
      gap: '0.5rem'
    },
    section: {
      border: '0.01rem solid #a2a2a2',
      padding: '2rem',
      borderRadius: '2rem',
      backgroundColor: '#FDFDFD',
      marginBottom: '1rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: 'black',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'black',
      outline: 'none',
      width: '100%'
    },
    select: {
      appearance: 'none',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '2rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#2c2c2c',
      cursor: 'pointer',
      outline: 'none',
      width: '100%'
    },
    scanContainer: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'end',
      marginBottom: '1rem'
    },
    scanButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap'
    },
    productCard: {
      border: '0.01rem solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      marginBottom: '0.5rem'
    },
    productHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    productName: {
      fontWeight: '600',
      color: 'black',
      fontSize: '1.1rem',
    },
    productPrice: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#16a34a'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    quantityButton: {
      backgroundColor: '#e5e7eb',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    quantityInput: {
      width: '60px',
      textAlign: 'center',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '0.5rem',
      padding: '0.25rem'
    },
    removeButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      marginLeft: 'auto'
    },
    orderSummary: {
      backgroundColor: '#f3f4f6',
      padding: '1rem',
      borderRadius: '1rem',
      marginTop: '1rem'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '0.875rem'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: '600',
      fontSize: '1.1rem',
      borderTop: '1px solid #d1d5db',
      paddingTop: '0.5rem',
      marginTop: '0.5rem'
    },
    createOrderButton: {
      backgroundColor: '#16a34a',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      margin: '0 auto',
      marginTop: '1rem'
    },
    // Orders page styles (simplified)
    filtersContainer: { position: 'relative' },
    filterButton: {
      backgroundColor: '#111827',
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
      gap: '0.5rem'
    },
    filterDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '1rem',
      minWidth: '640px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 1000,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    tableContainer: {
      background: 'white',
      border: '0.5px solid rgb(207, 202, 202)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      fontSize: 'medium'
    },
    table: {
      borderRadius:'2rem',
      borderCollapse: 'separate',
      borderSpacing: '0',
      borderRadius: '0.8rem',
      fontSize: '1rem',
      width: '100%',
      minWidth: '900px'
    },
    th: {
      fontWeight: '500',
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '1rem',
      whiteSpace: 'nowrap',
      color:'#374151',
      backgroundColor: '#f9fafb',
      justifyContent: 'space-around'
    },
    td: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      borderBottom: '0.1rem solid #a2a2a2',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    }
  };