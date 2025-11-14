import React, { useState } from 'react';
import { Plus, Upload, Calendar as CalendarIcon, X, ChevronDown, Clock } from 'lucide-react';
import './Web.css'; // Changed from module CSS to regular CSS

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
    console.log('Creating banner:', newBannerTitle);
    setShowCreateBannerDialog(false);
    setNewBannerTitle('');
  };

  const handleUploadBanner = () => {
    console.log('Uploading file:', selectedFile);
    setShowUploadBannerDialog(false);
    setSelectedFile(null);
  };

  const handleScheduleBanner = () => {
    console.log('Scheduling banner for:', scheduleDate);
    setShowScheduleDialog(false);
    setScheduleDate('');
  };

  return (
    <div className="container">
      <div className="mainContent">
        <div className="header">
          <h1 className="title">Web</h1>
          <p>Manage your website banners and hero images</p>
        </div>

        <div className="tabsContainer">
          <div 
            className={`tab ${activeTab === 'banners' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            Banners
          </div>
          <div 
            className={`tab ${activeTab === 'heroImages' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('heroImages')}
          >
            Hero Images
          </div>
          <div 
            className={`tab ${activeTab === 'settings' ? 'activeTab' : ''}`}
            style={{ cursor: localStorage.getItem("roleLoggedIn") === "webManager" ? 'pointer' : 'not-allowed' }}
            disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </div>
        </div>

        {activeTab === 'banners' && (
          <>
            <div className="section">
              <div className="sectionHeader">
                <h2 className="sectionTitle">Current Banners</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="actionButton"
                    style={{ cursor: localStorage.getItem("roleLoggedIn") !== "webManager" ? 'not-allowed' : 'pointer' }}
                    onClick={() => setShowCreateBannerDialog(true)}
                    disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
                  >
                    <Plus size={16} />
                    Create New Banner
                  </button>
                  <button 
                    className="actionButton"
                    style={{ cursor: localStorage.getItem("roleLoggedIn") !== "webManager" ? 'not-allowed' : 'pointer' }}
                    onClick={() => setShowUploadBannerDialog(true)}
                    disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
                  >
                    <Upload size={16} />
                    Upload Banner
                  </button>
                </div>
              </div>

              {banners.filter(b => b.status === 'active').length > 0 ? (
                banners.filter(b => b.status === 'active').map(banner => (
                  <div key={banner.id} className={`bannerCard activeBanner`}>
                    <h3 className="bannerTitle">{banner.title}</h3>
                    {banner.description && <p className="bannerDescription">{banner.description}</p>}
                    <div className="bannerMeta">
                      <Clock size={12} />
                      Active
                    </div>
                  </div>
                ))
              ) : (
                <div className="emptyState">
                  <h3 className="emptyStateTitle">No current banners</h3>
                  <p className="emptyStateText">Create or upload a banner to display on your website</p>
                </div>
              )}
            </div>

            <div className="section">
              <div className="sectionHeader">
                <h2 className="sectionTitle">Upcoming Banners</h2>
              </div>

              {banners.filter(b => b.status === 'upcoming').length > 0 ? (
                banners.filter(b => b.status === 'upcoming').map(banner => (
                  <div key={banner.id} className={`bannerCard upcomingBanner`}>
                    <h3 className="bannerTitle">{banner.title}</h3>
                    <div className="bannerMeta">
                      <Clock size={12} />
                      Upcoming • Created by {banner.user}
                    </div>
                  </div>
                ))
              ) : (
                <div className="emptyState">
                  <h3 className="emptyStateTitle">No upcoming banners</h3>
                  <p className="emptyStateText">Schedule banners for future events and promotions.</p>
                  <button 
                    className="actionButton"
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    <CalendarIcon size={16} />
                    Schedule Banner
                  </button>
                </div>
              )}
            </div>

            <div className="section">
              <div className="sectionHeader">
                <h2 className="sectionTitle">Past Banners</h2>
              </div>

              <div style={{ backgroundColor: '#FDFDFD', border: '0.01rem solid #a2a2a2', borderRadius: '1rem', overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="tableHeader">Banner Title</th>
                      <th className="tableHeader">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.filter(b => b.status === 'past').map(banner => (
                      <tr key={banner.id}>
                        <td className="tableCell">{banner.title}</td>
                        <td className="tableCell">
                          <span className={`statusBadge pastBadge`}>
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
          <div className="section">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Hero Images</h2>
              <button 
                className="actionButton"
                style={{ cursor: localStorage.getItem("roleLoggedIn") !== "webManager" ? 'not-allowed' : 'pointer' }}
                onClick={() => setShowUploadBannerDialog(true)}
                disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
              >
                <Upload size={16} />
                Upload Hero Image
              </button>
            </div>

            <div className="emptyState">
              <h3 className="emptyStateTitle">No hero images uploaded</h3>
              <p className="emptyStateText">Upload images to use as hero sections on your website</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="section">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Web Settings</h2>
            </div>

            <div className="bannerCard">
              <h3 className="bannerTitle">Banner Display Settings</h3>
              <p className="bannerDescription">Configure how banners appear on your website</p>
              
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

            <div className="bannerCard" style={{ marginTop: '1rem' }}>
              <h3 className="bannerTitle">Hero Image Settings</h3>
              <p className="bannerDescription">Configure hero image display options</p>
              
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Transition Effect</label>
                  <select className="input">
                    <option>Fade</option>
                    <option>Slide</option>
                    <option>Zoom</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Transition Duration (seconds)</label>
                  <input type="number" min="1" max="10" defaultValue="3" className="input" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Banner Dialog */}
        {showCreateBannerDialog && (
          <div className="dialogOverlay">
            <div className="dialog">
              <div className="dialogHeader">
                <h2 className="dialogTitle">Create New Banner</h2>
                <button className="closeButton" onClick={() => setShowCreateBannerDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="formGroup">
                <label className="label">Banner Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="Enter banner title"
                />
              </div>
              <div className="formGroup">
                <label className="label">Banner Content</label>
                <textarea 
                  className="input" 
                  style={{ minHeight: '100px' }}
                  placeholder="Enter banner content (supports HTML)"
                />
              </div>
              <button 
                className="submitButton"
                onClick={handleCreateBanner}
              >
                Create Banner
              </button>
            </div>
          </div>
        )}

        {/* Upload Banner Dialog */}
        {showUploadBannerDialog && (
          <div className="dialogOverlay">
            <div className="dialog">
              <div className="dialogHeader">
                <h2 className="dialogTitle">Upload Banner</h2>
                <button className="closeButton" onClick={() => setShowUploadBannerDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="formGroup">
                <label className="label">Banner Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter banner title"
                />
              </div>
              <div className="formGroup">
                <label className="label">Upload Image</label>
                <input 
                  type="file" 
                  id="bannerUpload"
                  className="fileInput"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label 
                  htmlFor="bannerUpload" 
                  className="fileInputLabel"
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#FDFDFD'}
                >
                  {selectedFile ? selectedFile.name : 'Click to select an image file'}
                </label>
              </div>
              <button 
                className="submitButton"
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
          <div className="dialogOverlay">
            <div className="dialog">
              <div className="dialogHeader">
                <h2 className="dialogTitle">Schedule Banner</h2>
                <button className="closeButton" onClick={() => setShowScheduleDialog(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="formGroup">
                <label className="label">Select Banner</label>
                <select className="input">
                  <option>Select a banner to schedule</option>
                  {banners.filter(b => b.status !== 'past').map(banner => (
                    <option key={banner.id} value={banner.id}>{banner.title}</option>
                  ))}
                </select>
              </div>
              <div className="formGroup">
                <label className="label">Schedule Date</label>
                <input 
                  type="date" 
                  className="input" 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">End Date</label>
                <input 
                  type="date" 
                  className="input" 
                />
              </div>
              <button 
                className="submitButton"
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