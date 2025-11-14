import React, { useState } from 'react';
import { Search, ChevronDown, Settings, CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import styles from './Integrations.module.css';

const IntegrationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All integrations');
  const [filterCategory, setFilterCategory] = useState('All categories');
  const [showSecrets, setShowSecrets] = useState({});

  // Sample integration data
  const integrations = [
    {
      id: 1,
      name: 'Razorpay',
      category: 'Payment Gateway',
      status: 'active',
      description: 'Payment processing and gateway integration',
      icon: '💳',
      color: '#3b82f6',
      lastUpdated: '2024-06-01',
      config: {
        keyId: 'rzp_test_1234567890',
        keySecret: '••••••••••••••••',
        webhookUrl: 'https://yourdomain.com/webhook/razorpay',
        mode: 'Test'
      }
    },
    {
      id: 2,
      name: 'Cloudinary',
      category: 'Media Storage',
      status: 'active',
      description: 'Image and video upload management',
      icon: '☁️',
      color: '#10b981',
      lastUpdated: '2024-05-28',
      config: {
        cloudName: 'your-cloud-name',
        apiKey: '123456789012345',
        apiSecret: '••••••••••••••••',
        folder: 'product-images'
      }
    },
    {
      id: 3,
      name: 'Email Service',
      category: 'Communication',
      status: 'active',
      description: 'SMTP email service for notifications',
      icon: '📧',
      color: '#f59e0b',
      lastUpdated: '2024-06-02',
      config: {
        provider: 'Gmail SMTP',
        email: 'noreply@yourdomain.com',
        password: '••••••••••••••••',
        port: '587'
      }
    },
    {
      id: 4,
      name: 'Delhivery',
      category: 'Logistics',
      status: 'inactive',
      description: 'Shipping and delivery service integration',
      icon: '🚚',
      color: '#ef4444',
      lastUpdated: '2024-05-15',
      config: {
        token: '••••••••••••••••',
        waybill: 'DEL123456789',
        pickupLocation: 'Mumbai, Maharashtra',
        mode: 'Surface'
      }
    },
    {
      id: 5,
      name: 'Hostinger Domain',
      category: 'Infrastructure',
      status: 'active',
      description: 'Domain and hosting management',
      icon: '🌐',
      color: '#8b5cf6',
      lastUpdated: '2024-06-01',
      config: {
        domain: 'yourdomain.com',
        registrar: 'Hostinger',
        expiry: '2025-06-01',
        nameservers: 'ns1.hostinger.com'
      }
    },
    {
      id: 6,
      name: 'Credit Card Vault',
      category: 'Payment Gateway',
      status: 'warning',
      description: 'Secure credit card information storage',
      icon: '🔒',
      color: '#f97316',
      lastUpdated: '2024-05-30',
      config: {
        encryption: 'AES-256',
        totalCards: '47',
        lastBackup: '2024-06-01',
        compliance: 'PCI DSS Level 1'
      }
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All integrations' || 
                         (filterStatus === 'Active' && integration.status === 'active') ||
                         (filterStatus === 'Inactive' && integration.status === 'inactive') ||
                         (filterStatus === 'Warning' && integration.status === 'warning');
    const matchesCategory = filterCategory === 'All categories' || integration.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleSecret = (integrationId, field) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${integrationId}_${field}`]: !prev[`integrationId}_${field}`]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} className={styles.statusIconActive} />;
      case 'inactive':
        return <XCircle size={20} className={styles.statusIconInactive} />;
      case 'warning':
        return <AlertCircle size={20} className={styles.statusIconWarning} />;
      default:
        return <XCircle size={20} className={styles.statusIconInactive} />;
    }
  };

  const maskSecret = (value) => {
    if (value.startsWith('••••')) return value;
    return '••••••••••••••••';
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const inactiveIntegrations = integrations.filter(i => i.status === 'inactive').length;
  const warningIntegrations = integrations.filter(i => i.status === 'warning').length;

  return (
    <div className={styles.integrationsContainer}>
      <div className={styles.integrationsMain}>
        {/* Header */}
        <div className={styles.integrationsHeader}>
          <h1 className={styles.integrationsTitle}>Integrations</h1>
          <button 
            className={styles.manageIntegrationsBtn}
            disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
            style={{ cursor: localStorage.getItem("roleLoggedIn") !== "webManager" ? 'not-allowed' : 'pointer' }}
          >
            <Settings size={16} />
            Manage Integrations
          </button>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{activeIntegrations}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{inactiveIntegrations}</div>
            <div className={styles.statLabel}>Inactive</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{warningIntegrations}</div>
            <div className={styles.statLabel}>Warning</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{integrations.length}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.searchFiltersCard}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search integrations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.filterWrapper}>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All integrations</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Warning</option>
              </select>
              <ChevronDown className={styles.chevronIcon} size={16} />
            </div>

            <div className={styles.filterWrapper}>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All categories</option>
                <option>Payment Gateway</option>
                <option>Media Storage</option>
                <option>Communication</option>
                <option>Logistics</option>
                <option>Infrastructure</option>
              </select>
              <ChevronDown className={styles.chevronIcon} size={16} />
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className={styles.integrationsGrid}>
          {filteredIntegrations.map((integration) => (
            <div 
              key={integration.id} 
              className={styles.integrationCard}
              style={{ '--card-color': integration.color }}
            >
              <div className={styles.integrationHeader}>
                <div className={styles.integrationInfo}>
                  <div className={styles.integrationIcon} style={{ backgroundColor: integration.color }}>
                    {integration.icon}
                  </div>
                  <div className={styles.integrationDetails}>
                    <h3>{integration.name}</h3>
                    <div className={styles.integrationCategory}>{integration.category}</div>
                  </div>
                </div>
                <div className={styles.integrationStatus}>
                  {getStatusIcon(integration.status)}
                </div>
              </div>

              <p className={styles.integrationDescription}>{integration.description}</p>

              <div className={styles.integrationConfig}>
                <div className={styles.configTitle}>Configuration</div>
                {Object.entries(integration.config).map(([key, value]) => (
                  <div key={key} className={styles.configItem}>
                    <span className={styles.configLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div className={styles.configValue}>
                      <span>
                        {(key.includes('secret') || key.includes('password') || key.includes('token')) && !showSecrets[`${integration.id}_${key}`]
                          ? maskSecret(value)
                          : value
                        }
                      </span>
                      {(key.includes('secret') || key.includes('password') || key.includes('token')) && (
                        <button
                          className={styles.secretToggle}
                          onClick={() => toggleSecret(integration.id, key)}
                        >
                          {showSecrets[`${integration.id}_${key}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.integrationFooter}>
                <span className={styles.lastUpdated}>
                  Updated {integration.lastUpdated}
                </span>
                <button 
                  className={styles.configureBtn}
                  disabled={localStorage.getItem("roleLoggedIn") !== "webManager"}
                >
                  <Settings size={12} />
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;