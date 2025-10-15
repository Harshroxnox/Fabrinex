  
  import React from "react";
  function RenderPreviewContent({template}){
    switch(template.type) {
      case 'sms':
        return (
          <div className="sms-preview">
            <div className="preview-header">
              <span>SMS Preview</span>
              <div className="preview-meta">Noor Creations • SMS</div>
            </div>
            <div className="preview-content">
              {template.content}
            </div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="whatsapp-preview">
            <div className="preview-header">
              <span>WhatsApp Preview</span>
              <div className="preview-meta">Noor Creations• WhatsApp</div>
            </div>
            <div className="preview-content">
              {template.content.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="email-preview">
            <div className="preview-header">
              <span>Email Preview</span>
              <div className="preview-meta">Noor Creations • Email</div>
            </div>
            <div 
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          </div>
        );
      default:
        return <pre>{template.content}</pre>;
    }
  };

 export default  RenderPreviewContent;