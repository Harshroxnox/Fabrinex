import React, { useState, useEffect } from 'react';
import './Message.css';
import axios from 'axios';
import RenderPreviewContent from './PreviewMessage';
const MessageTemplates = () => {
  const [activePreview, setActivePreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/marketing/get-message-templates');
        const apiData = response.data;
        
        // Transform API data into our template structure
        const transformedTemplates = {
          smsMarketingTemplate: {
            title: "SMS Marketing",
            description: "Discount promotion via SMS",
            icon: "📱",
            color: "#3B82F6",
            content: apiData.smsMarketingTemplate,
            type: "sms"
          },
          whatsappMarketingTemplate: {
            title: "WhatsApp Marketing",
            description: "WhatsApp promotional message",
            icon: "💬",
            color: "#25D366",
            content: apiData.whatsappMarketingTemplate,
            type: "whatsapp"
          },
          emailMarketingTemplate: {
            title: "Email Marketing",
            description: "HTML email template",
            icon: "✉️",
            color: "#EC4899",
            content: apiData.emailMarketingTemplate,
            type: "email"
          },
          orderUpdateTemplate: {
            title: "Order Update",
            description: "Order status notification",
            icon: "📦",
            color: "#F59E0B",
            content: apiData.orderUpdateTemplate,
            type: "whatsapp"
          },
          emailOtpTemplate: {
            title: "Email OTP",
            description: "One-time password email",
            icon: "🔒",
            color: "#10B981",
            content: apiData.emailOtpTemplate,
            type: "email"
          }
        };
        
        setTemplates(transformedTemplates);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (loading) {
    return (
      <div className="templates-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="templates-dashboard">
        <div className="error-message">
          <p>Error loading templates: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!templates) {
    return (
      <div className="templates-dashboard">
        <div className="no-templates">
          <p>No templates available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-dashboard">
      <div className="dashboard-header">
        <h1>Message Templates</h1>
        <p>Pre-designed templates for your marketing needs</p>
      </div>
      
      <div className="templates-grid">
        {Object.entries(templates).map(([key, template]) => (
          <div 
            key={key} 
            className="template-card"
            style={{ '--accent-color': template.color }}
          >
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: template.color }}>
                {template.icon}
              </div>
              <div>
                <h3>{template.title}</h3>
                <p className="card-description">{template.description}</p>
              </div>
            </div>
            
            <div className="template-content">
              <pre>{template.type === 'email' ? 'HTML content (see preview)' : template.content}</pre>
            </div>
            
            <div className="card-actions">
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(template.content)}
              >
                {copied ? 'Copied!' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V8M10 20H18C19.1046 20 20 19.1046 20 18V10C20 8.89543 19.1046 8 18 8H10C8.89543 8 8 8.89543 8 10V18C8 19.1046 8.89543 20 10 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copy Template
                  </>
                )}
              </button>
              <button 
                className="preview-btn"
                onClick={() => setActivePreview(template)}
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {activePreview && (
        <div className="preview-modal">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setActivePreview(null)}
            >
              &times;
            </button>
            <h3>{activePreview.title} Template</h3>
            <div className="preview-container">
              {/* {renderPreviewContent(activePreview)} */}
              <RenderPreviewContent template={activePreview}/>
            </div>
            <div className="modal-actions">
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(activePreview.content)}
              >
                {copied ? 'Copied!' : 'Copy Template'}
              </button>
              <button 
                className="close-btn"
                onClick={() => setActivePreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;