import React, { useState } from 'react';
import { Plus, Upload, Calendar as CalendarIcon, X, ChevronDown, Clock } from 'lucide-react';

const WebPage = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [showCreateBannerDialog, setShowCreateBannerDialog] = useState(false);
  const [showUploadBannerDialog, setShowUploadBannerDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const banners = [
    { id: 1, title: 'Passion sale', status: 'upcoming', user: 'user' },
    { id: 2, title: 'New Arrivals', description: 'Your phone sells technology access tools.', status: 'active' },
    { id: 3, title: 'HOLIDAY Sale', status: 'past' },
    { id: 4, title: 'SPRING Natural', status: 'past' }
  ];

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCreateBanner = () => {
    // Add create banner logic here
    console.log('Creating banner:', newBannerTitle);
    setShowCreateBannerDialog(false);
    setNewBannerTitle('');
  };

  const handleUploadBanner = () => {
    // Add upload banner logic here
    console.log('Uploading file:', selectedFile);
    setShowUploadBannerDialog(false);
    setSelectedFile(null);
  };

  const handleScheduleBanner = () => {
    // Add schedule banner logic here
    console.log('Scheduling banner for:', scheduleDate);
    setShowScheduleDialog(false);
    setScheduleDate('');
  };

  const styles = {
    container: {
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      border: '0.01rem solid black',
      borderRadius: '2rem',
      width: '84vw',
      overflow: 'hidden'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: '3.5rem',
      gap: '1rem',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '32px 24px',
      overflow: 'hidden',
      fontSize: '1rem',
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
      margin: 0,
      color: 'black'
    },
    tabsContainer: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '1.5rem'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      fontWeight: '500',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    activeTab: {
      color: '#111827',
      borderBottomColor: '#111827'
    },
    section: {
      marginBottom: '2rem'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#111827'
    },
    actionButton: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    bannerCard: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    bannerTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#111827'
    },
    bannerDescription: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    bannerMeta: {
      color: '#6b7280',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    upcomingBanner: {
      borderLeft: '4px solid #f59e0b'
    },
    activeBanner: {
      borderLeft: '4px solid #10b981'
    },
    pastBanner: {
      borderLeft: '4px solid #9ca3af'
    },
    emptyState: {
      backgroundColor: '#FDFDFD',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      color: '#6b7280'
    },
    emptyStateTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#111827'
    },
    emptyStateText: {
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    dialogOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    dialog: {
      backgroundColor: '#FDFDFD',
      borderRadius: '1rem',
      padding: '2rem',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    dialogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    dialogTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#111827'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '0.01rem solid #a2a2a2',
      borderRadius: '0.5rem',
      fontSize: '0.875rem'
    },
    fileInput: {
      display: 'none'
    },
    fileInputLabel: {
      display: 'block',
      width: '100%',
      padding: '1rem',
      border: '1px dashed #a2a2a2',
      borderRadius: '0.5rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    fileInputLabelHover: {
      backgroundColor: '#f3f4f6'
    },
    submitButton: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      width: '100%'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      textAlign: 'left',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#6b7280',
      fontWeight: '500',
      fontSize: '0.875rem'
    },
    tableCell: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827',
      fontSize: '0.875rem'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    upcomingBadge: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    activeBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    pastBadge: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Web</h1>
          <p>Manage your website banners and hero images</p>
        </div>

        <div style={styles.tabsContainer}>
          <div 
            style={{ ...styles.tab, ...(activeTab === 'banners' && styles.activeTab) }}
            onClick={() => setActiveTab('banners')}
          >
            Banners
          </div>
          <div 
            style={{ ...styles.tab, ...(activeTab === 'heroImages' && styles.activeTab) }}
            onClick={() => setActiveTab('heroImages')}
          >
            Hero Images
          </div>
          <div 
            style={{ ...styles.tab, ...(activeTab === 'settings' && styles.activeTab) }}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </div>
        </div>

        {activeTab === 'banners' && (
          <>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Current Banners</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={styles.actionButton}
                    onClick={() => setShowCreateBannerDialog(true)}
                  >
                    <Plus size={16} />
                    Create New Banner
                  </button>
                  <button 
                    style={styles.actionButton}
                    onClick={() => setShowUploadBannerDialog(true)}
                  >
                    <Upload size={16} />
                    Upload Banner
                  </button>
                </div>
              </div>

              {banners.filter(b => b.status === 'active').length > 0 ? (
                banners.filter(b => b.status === 'active').map(banner => (
                  <div key={banner.id} style={{ ...styles.bannerCard, ...styles.activeBanner }}>
                    <h3 style={styles.bannerTitle}>{banner.title}</h3>
                    {banner.description && <p style={styles.bannerDescription}>{banner.description}</p>}
                    <div style={styles.bannerMeta}>
                      <Clock size={12} />
                      Active
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <h3 style={styles.emptyStateTitle}>No current banners</h3>
                  <p style={styles.emptyStateText}>Create or upload a banner to display on your website</p>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Upcoming Banners</h2>
              </div>

              {banners.filter(b => b.status === 'upcoming').length > 0 ? (
                banners.filter(b => b.status === 'upcoming').map(banner => (
                  <div key={banner.id} style={{ ...styles.bannerCard, ...styles.upcomingBanner }}>
                    <h3 style={styles.bannerTitle}>{banner.title}</h3>
                    <div style={styles.bannerMeta}>
                      <Clock size={12} />
                      Upcoming • Created by {banner.user}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <h3 style={styles.emptyStateTitle}>No upcoming banners</h3>
                  <p style={styles.emptyStateText}>Schedule banners for future events and promotions.</p>
                  <button 
                    style={styles.actionButton}
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    <CalendarIcon size={16} />
                    Schedule Banner
                  </button>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Past Banners</h2>
              </div>

              <div style={{ backgroundColor: '#FDFDFD', border: '0.01rem solid #a2a2a2', borderRadius: '1rem', overflow: 'hidden' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Banner Title</th>
                      <th style={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.filter(b => b.status === 'past').map(banner => (
                      <tr key={banner.id}>
                        <td style={styles.tableCell}>{banner.title}</td>
                        <td style={styles.tableCell}>
                          <span style={{ ...styles.statusBadge, ...styles.pastBadge }}>
                            Past
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'heroImages' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Hero Images</h2>
              <button 
                style={styles.actionButton}
                onClick={() => setShowUploadBannerDialog(true)}
              >
                <Upload size={16} />
                Upload Hero Image
              </button>
            </div>

            <div style={styles.emptyState}>
              <h3 style={styles.emptyStateTitle}>No hero images uploaded</h3>
              <p style={styles.emptyStateText}>Upload images to use as hero sections on your website</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Web Settings</h2>
            </div>

            <div style={styles.bannerCard}>
              <h3 style={styles.bannerTitle}>Banner Display Settings</h3>
              <p style={styles.bannerDescription}>Configure how banners appear on your website</p>
              
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <input type="checkbox" id="autoRotate" style={{ marginRight: '0.5rem' }} />
                  <label htmlFor="autoRotate">Auto-rotate banners</label>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <input type="checkbox" id="showDots" style={{ marginRight: '0.5rem' }} defaultChecked />
                  <label htmlFor="showDots">Show navigation dots</label>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" id="showArrows" style={{ marginRight: '0.5rem' }} defaultChecked />
                  <label htmlFor="showArrows">Show navigation arrows</label>
                </div>
              </div>
            </div>

            <div style={{ ...styles.bannerCard, marginTop: '1rem' }}>
              <h3 style={styles.bannerTitle}>Hero Image Settings</h3>
              <p style={styles.bannerDescription}>Configure hero image display options</p>
              
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.label}>Transition Effect</label>
                  <select style={styles.input}>
                    <option>Fade</option>
                    <option>Slide</option>
                    <option>Zoom</option>
                  </select>
                </div>
                
                <div>
                  <label style={styles.label}>Transition Duration (seconds)</label>
                  <input type="number" min="1" max="10" defaultValue="3" style={styles.input} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Banner Dialog */}
        {showCreateBannerDialog && (
          <div style={styles.dialogOverlay}>
            <div style={styles.dialog}>
              <div style={styles.dialogHeader}>
                <h2 style={styles.dialogTitle}>Create New Banner</h2>
                <button style={styles.closeButton} onClick={() => setShowCreateBannerDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Banner Title</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="Enter banner title"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Banner Content</label>
                <textarea 
                  style={{ ...styles.input, minHeight: '100px' }} 
                  placeholder="Enter banner content (supports HTML)"
                />
              </div>
              <button 
                style={styles.submitButton}
                onClick={handleCreateBanner}
              >
                Create Banner
              </button>
            </div>
          </div>
        )}

        {/* Upload Banner Dialog */}
        {showUploadBannerDialog && (
          <div style={styles.dialogOverlay}>
            <div style={styles.dialog}>
              <div style={styles.dialogHeader}>
                <h2 style={styles.dialogTitle}>Upload Banner</h2>
                <button style={styles.closeButton} onClick={() => setShowUploadBannerDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Banner Title</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  placeholder="Enter banner title"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Image</label>
                <input 
                  type="file" 
                  id="bannerUpload"
                  style={styles.fileInput}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label 
                  htmlFor="bannerUpload" 
                  style={styles.fileInputLabel}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#FDFDFD'}
                >
                  {selectedFile ? selectedFile.name : 'Click to select an image file'}
                </label>
              </div>
              <button 
                style={styles.submitButton}
                onClick={handleUploadBanner}
                disabled={!selectedFile}
              >
                Upload Banner
              </button>
            </div>
          </div>
        )}

        {/* Schedule Banner Dialog */}
        {showScheduleDialog && (
          <div style={styles.dialogOverlay}>
            <div style={styles.dialog}>
              <div style={styles.dialogHeader}>
                <h2 style={styles.dialogTitle}>Schedule Banner</h2>
                <button style={styles.closeButton} onClick={() => setShowScheduleDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Banner</label>
                <select style={styles.input}>
                  <option>Select a banner to schedule</option>
                  {banners.filter(b => b.status !== 'past').map(banner => (
                    <option key={banner.id} value={banner.id}>{banner.title}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Schedule Date</label>
                <input 
                  type="date" 
                  style={styles.input} 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input 
                  type="date" 
                  style={styles.input} 
                />
              </div>
              <button 
                style={styles.submitButton}
                onClick={handleScheduleBanner}
              >
                Schedule Banner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebPage;