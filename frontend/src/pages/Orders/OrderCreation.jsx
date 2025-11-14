import { useCallback, useState } from 'react';
import { styles } from './Orders';
import { ArrowLeft, CheckCircle, Minus, Package, Plus, Scan, ShoppingCart } from 'lucide-react';
import { getVariantBarcodeAdmin } from '../../contexts/api/products';
import { getDiscountByBarcode } from '../../contexts/api/loyaltyCards';
import toast from 'react-hot-toast';

export function OrderCreation({ setCurrentView, handleAdd, fetchOrders, page, limit }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [salesPerson, setSalesperson] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone_number: '',
    location: 'Noor Creations',
    payment_method: ''
  });
  const [loading, setLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [product, setProduct] = useState({});
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [barcode, setBarcode] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);

  const fetchVariantByBarcode = useCallback(async (barcode) => {
    try {
      setLoading(true);
      const res = await getVariantBarcodeAdmin(barcode);
      setProduct(res.data.variant);
      return res.data.variant;
    } catch (error) {
      console.log("Error fetching product by barcode");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDiscount = useCallback(async (discountBarcode) => {
    try {
      setLoading(true);
      const res = await getDiscountByBarcode(discountBarcode);
      return res.data.discount;
    } catch (error) {
      console.log("Error fetching discount of loyalty card");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) return;
    const product = await fetchVariantByBarcode(barcodeInput);
    if (!product) return;
    setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (variantID, newQuantity) => {
    const product = selectedProducts.find(p => p.variantID === variantID);
    if (newQuantity < 0) return;
    if (newQuantity > product.stock) {
      toast.error(`Cannot exceed stock limit: ${product.stock}`);
      return;
    }
    setSelectedProducts(prev =>
      prev.map(p =>
        p.variantID === variantID ? { ...p, quantity: newQuantity } : p
      )
    );
  };

  const removeProduct = (variantId) => {
    setSelectedProducts(prev => prev.filter(p => p.variantID !== variantId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) =>
      total + (product.price * product.quantity), 0
    ).toFixed(2);
  };

  const calculateTotalAfterDiscount = (total, disc) => {
    return (disc * total) / 100;
  };

  const handleDiscountApply = async (barcode) => {
    const LoyaltyCardDiscount = await getDiscount(barcode);
    setDiscount(LoyaltyCardDiscount);
    setShowDiscount(true);
    setIsOpen(false);
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0 || !customerInfo.payment_method) {
      toast.error('Please fill all customer information and add at least one product');
      return;
    }

    const newOrder = {
      payment_method: customerInfo.payment_method,
      items: selectedProducts.map(p => ({
        barcode: p.barcode,
        quantity: p.quantity,
      })),
      salesPersonID: salesPerson
    };

    if (customerInfo.phone && customerInfo.name) {
      newOrder.name = customerInfo.name;
      newOrder.phone_number = '+91' + customerInfo.phone;
    }

    if (barcode !== 0) {
      newOrder.loyalty_barcode = barcode;
    }

    const success = await handleAdd(newOrder);

    if (success) {
      setSelectedProducts([]);
      setCustomerInfo({
        phone: '',
        name: '',
        location: 'Noor Creations',
        payment_method: '',
      });
      setBarcodeInput('');
      toast.success('Order created successfully!');
      fetchOrders(page, limit);
      setCurrentView('orders');
    } else {
      toast.error('Failed to create order. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Order</h1>
          <button
            style={styles.backButton}
            onClick={() => setCurrentView('orders')}
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Package size={20} />
            Salesperson Information
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}> Salesperson ID *</label>
              <input
                type="number"
                style={styles.input}
                value={salesPerson}
                onChange={(e) => setSalesperson(e.target.value)}
                placeholder='Enter Salesperson ID'
              />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Package size={20} />
            Customer Information
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Customer Name </label>
              <input
                type="text"
                style={styles.input}
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Customer Phone No. (+91)</label>
              <input
                type="text"
                style={styles.input}
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter customer Phone No."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                style={styles.input}
                value={customerInfo.location}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method</label>
              <select
                style={styles.select}
                value={customerInfo.payment_method}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerInfo(prev => ({ ...prev, payment_method: value }));
                }}
              >
                <option value="" disabled>Select Payment Method</option>
                <option value="card">Card</option>
                <option value="upi">Upi</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
                <option value="cash-on-delivery">Cash</option>
              </select>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Scan size={20} />
            Scan Products
          </h2>
          <div style={styles.scanContainer}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Barcode</label>
              <input
                type="text"
                style={styles.input}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode"
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
              />
            </div>
            <button
              style={{ ...styles.scanButton, backgroundColor: '#2563eb' }}
              onClick={handleBarcodeSubmit}
            >
              Add Product
            </button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <ShoppingCart size={20} />
              Selected Products ({selectedProducts.length})
            </h2>
            {selectedProducts.map(product => (
              <div key={product.productID} style={styles.productCard}>
                <div style={styles.productHeader}>
                  <div>
                    <div style={styles.productName}>{product.product_name} ({product.color}, {product.size})</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      ID: {product.variantID} | Stock: {product.stock}
                    </div>
                  </div>
                  <div style={styles.productPrice}>Subtotal: ₹{(product.price * product.quantity).toFixed(2)}</div>
                </div>
                <div style={styles.quantityControls}>
                  <button
                    style={styles.quantityButton}
                    onClick={() => updateQuantity(product.variantID, product.quantity - 1)}
                    disabled={(product.quantity === 0)}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    style={styles.quantityInput}
                    value={product.quantity}
                    onChange={(e) => updateQuantity(product.variantID, parseInt(e.target.value) || 0)}
                    min="1"
                    max={product.stock}
                  />
                  <button
                    style={styles.quantityButton}
                    onClick={() => updateQuantity(product.variantID, product.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                  <span style={{ marginLeft: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <div>Product price: ₹{product.price}</div>
                  </span>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeProduct(product.variantID)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div style={styles.orderSummary}>
              <div style={styles.summaryRow}>
                <span>Items:</span>
                <span>{selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>₹{calculateTotal()}</span>
              </div>
              {showDiscount &&
                <div style={styles.summaryRow}>
                  <span>Loyalty Discount ({discount} %):</span>
                  <span>₹{calculateTotalAfterDiscount(calculateTotal(), discount)}</span>
                </div>
              }
              <div style={styles.totalRow}>
                <span>Total Amount:</span>
                <span>{calculateTotal() - calculateTotalAfterDiscount(calculateTotal(), discount)}</span>
              </div>
            </div>

            <div style={styles.LoyaltyButtonDiv}>
              <button style={styles.LoyaltyButton} onClick={() => setIsOpen(true)}>
                Add Loyalty Card
              </button>
            </div>

            <button
              style={styles.createOrderButton}
              onClick={handleCreateOrder}
            >
              <CheckCircle size={20} />
              Create Order
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add loyalty Cards into order</h2>
            <input
              type="text"
              placeholder="Enter loyalty card barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelButton} onClick={() => { setIsOpen(false); setBarcode(0); }}>
                Cancel
              </button>
              <button
                style={styles.applyButton}
                onClick={() => handleDiscountApply(barcode)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
