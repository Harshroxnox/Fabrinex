import { CheckCircle, Clock, XCircle } from "lucide-react";

  // Utility functions
export const statusColor = (status) => {
  switch (status) {
    case 'delivered':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'shipped':
      return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
    case 'pending':
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    case 'cancelled':
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#374151' };
  }
};


 export const paymentStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'failed':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

 export const paymentStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} />;
      case 'failed':
        return <XCircle size={14} />;
      case 'pending':
        return <Clock size={14} />;
      default:
        return null;
    }
  };