import React, { useState } from 'react';
import './ImageViewerModal.css';

export default function ImageViewerModal({ details, onClose }) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    if (!details) return null;

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Handle ESC key to exit full screen
    React.useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && isFullScreen) {
                setIsFullScreen(false);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isFullScreen]);

    return (
        <div 
            className={`modal-backdrop ${isFullScreen ? 'full-screen' : ''}`} 
            onClick={isFullScreen ? toggleFullScreen : onClose}
        >
            <div 
                className={`modal-content-container ${isFullScreen ? 'full-screen' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {!isFullScreen && (
                    <header className="modal-header">
                        <h3 className="modal-title">{details.title || "Details Viewer"}</h3>
                        <button className="modal-close-button" onClick={onClose}>&times;</button>
                    </header>
                )}
                
                <div className="modal-body">
                    {details.type === 'image' ? (
                        <div className={`image-container ${isFullScreen ? 'full-screen' : ''}`}>
                            <img 
                                src={details.content} 
                                alt={details.title || "Dimension Image"} 
                                className={`modal-image ${isFullScreen ? 'full-screen' : ''}`}
                            />
                            <button 
                                className="fullscreen-button"
                                onClick={toggleFullScreen}
                                title={isFullScreen ? "Exit Full Screen (ESC)" : "Enter Full Screen"}
                            >
                                {isFullScreen ? '✕' : '⛶'}
                            </button>
                        </div>
                    ) : details.type === 'text' ? (
                        <div className="text-container">
                            <pre className="modal-text">
                                {details.content}
                            </pre>
                        </div>
                    ) : (
                        <p className="no-content">No content available</p>
                    )}
                </div>
            </div>
        </div>
    );
}