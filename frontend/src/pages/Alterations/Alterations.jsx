import { useCallback, useEffect, useState } from "react";
import { fetchAlterations } from "../../contexts/api/alterations";
import AddAlterationModal from "./AddAlterations";
import UpdateAlterationModal from "./UpdateAlterations";
import "./Alterations.css";
import ImageViewerModal from "./ImageViewerModal"; 
import { IoMdEye } from "react-icons/io";
import { FaEdit, FaFileAlt } from "react-icons/fa";

const AlterationsStatusPill = ({ status, type }) => {
    const className = `alterations-${type}-pill ${status.toLowerCase().replace(/\s/g, '-')}`;
    if (!status) return <span className="alterations-no-data-indicator">—</span>;
    return <span className={className}>{status}</span>;
};

export default function Alterations() {
    const [alterations, setAlterations] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedAlteration, setSelectedAlteration] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailsToView, setDetailsToView] = useState(null); 
    
    const loadAlterations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAlterations();
            setAlterations(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
            console.error("Error fetching alterations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlterations();
    }, [loadAlterations]);

    const handleViewDimensionText = (text) => {
        setDetailsToView({ 
            type: 'text', 
            content: text,
            title: "Alteration Details"
        });
    };

    const handleViewDimensionImage = (imageUrl) => {
        setDetailsToView({ 
            type: 'image', 
            content: imageUrl,
            title: "Dimension Image"
        });
    };

    return (
        <div className="alterations-page-container">
            <header className="alterations-header">
                <h2 className="alterations-header-title">Alterations Management</h2>
                <button
                    className="alterations-add-button"
                    onClick={() => setShowAdd(true)}
                >
                    <span className="alterations-icon"></span> Add New Alteration
                </button>
            </header>

            <main className="alterations-content">
                {loading ? (
                    <div className="alterations-loading-state">
                        Loading alterations...
                    </div>
                ) : alterations.length === 0 ? (
                    <div className="alterations-empty-state">
                        <p>No alterations found.</p>
                        <button
                             className="alterations-add-button alterations-primary-button"
                             onClick={() => setShowAdd(true)}
                        >
                            Create First Alteration
                        </button>
                    </div>
                ) : (
                    <div className="alterations-table-responsive">
                        <table className="alterations-table">
                            <thead>
                                <tr>
                                    <th>Bill No.</th>
                                    <th>Slip No.</th>
                                    <th>Customer</th>
                                    <th>Delivery Date</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Amount</th>
                                    <th>Dimensions</th>
                                    <th>Image</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alterations.map((a) => (
                                    <tr key={a.alterationID}>
                                        <td data-label="Bill No.">{a.bill_no || <span className="alterations-no-data-indicator">—</span>}</td>
                                        <td data-label="Slip No.">{a.slip_no || <span className="alterations-no-data-indicator">—</span>}</td>
                                        <td data-label="Customer">{a.customer_name}</td>
                                        <td data-label="Delivery Date">
                                            {a.date_of_delivery ? new Date(a.date_of_delivery).toLocaleDateString() : <span className="alterations-no-data-indicator">—</span>}
                                        </td>
                                        <td data-label="Status">
                                            <AlterationsStatusPill status={a.status} type="status" />
                                        </td>
                                        <td data-label="Payment">
                                            <AlterationsStatusPill status={a.payment_status} type="payment" />
                                        </td>
                                        <td data-label="Amount" className="alterations-amount-cell">₹{a.amount || '0.00'}</td>
                                        
                                        <td data-label="Dimensions" className="alterations-icon-cell">
                                            {a.dimension_text ? (
                                                <button
                                                    className="alterations-icon-btn"
                                                    onClick={() => handleViewDimensionText(a.dimension_text)}
                                                    title="View alteration details"
                                                >
                                                    <FaFileAlt size={16} />
                                                </button>
                                            ) : (
                                                <span className="alterations-no-data-indicator">—</span>
                                            )}
                                        </td>

                                        <td data-label="Image" className="alterations-icon-cell">
                                            {a.dimension_image ? (
                                                <button
                                                    className="alterations-icon-btn"
                                                    onClick={() => handleViewDimensionImage(a.dimension_image)}
                                                    title="View dimension image"
                                                >
                                                    <IoMdEye size={18} />
                                                </button>
                                            ) : (
                                                <span className="alterations-no-data-indicator">—</span>
                                            )}
                                        </td>

                                        <td data-label="Action" className="alterations-icon-cell">
                                            <button
                                                className="alterations-icon-btn"
                                                onClick={() => setSelectedAlteration(a)}
                                                title="Update alteration"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showAdd && (
                <AddAlterationModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={loadAlterations}
                />
            )}

            {selectedAlteration && (
                <UpdateAlterationModal
                    alteration={selectedAlteration}
                    onClose={() => setSelectedAlteration(null)}
                    onSuccess={loadAlterations}
                />
            )}
            
            {detailsToView && (
                <ImageViewerModal
                    details={detailsToView}
                    onClose={() => setDetailsToView(null)}
                />
            )}
        </div>
    );
}