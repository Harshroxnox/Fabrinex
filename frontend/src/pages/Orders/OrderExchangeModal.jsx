import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, CornerDownLeft, PlusCircle, RotateCcw, Search } from 'lucide-react';
import { getOrder, updateOrderForExchange } from '../../contexts/api/orders'; 
import axiosInstance from '../../utils/axiosInstance'; 
import { styles } from './Orders';
import { 
    modalOverlayStyle, modalContentStyle, closeButtonStyle, sectionStyle, sectionHeaderStyle, 
    tableStyle, thStyle, tdStyle, inputStyle, summaryStyle, summaryTextStyle, netChangeStyle, 
    submitButtonStyle, cancelButtonStyle, searchFormStyle, barcodeInputStyle, searchButtonStyle, 
    variantResultStyle, addItemButtonStyle, 
    ModalLayout
} from './OrderExchangeModalStyles';

const formatPrice = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

const handleRequest = (apiCall) => {
    return apiCall()
        .then(res => res.data) 
        .catch(error => {
            throw error.response?.data?.message || error.message || "An unknown error occurred.";
        });
};

const fetchProductVariantByBarcode = (barcode) =>
    handleRequest(() => axiosInstance.get(`/products/get-variant-barcode-admin/${barcode}`));

const OrderExchangeModal = ({ orderID, onClose, onSuccessfulUpdate, fetchOrders }) => {

  const [originalOrder, setOriginalOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [exchangePayload, setExchangePayload] = useState([]);
  const [newExchangeItems, setNewExchangeItems] = useState([]);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchedVariant, setSearchedVariant] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newExchangeQuantity, setNewExchangeQuantity] = useState(1);

  // ===========================================
  // FETCH ORDER DETAILS
  // ===========================================
  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getOrder(orderID);
      setOriginalOrder(res.order);

      // IMPORTANT FIX: include orderItemID for unique keys
      setExchangePayload(
        res.items.map(item => ({
          orderItemID: item.orderItemID, // UNIQUE KEY
          variantID: item.variantID,
          name: item.name,
          color: item.color,
          size: item.size,
          price: parseFloat(item.price_at_purchase),
          originalQuantity: item.quantity,
          returnQuantity: 0,
        }))
      );

    } catch (error) {
      toast.error('Could not fetch order details.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [orderID, onClose]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // ===========================================
  // FIXED: UPDATE RETURN QUANTITY PER ITEM
  // ===========================================
  const handleReturnQuantityChange = (orderItemID, maxQuantity, value) => {
    let qty = parseInt(value, 10);

    if (isNaN(qty) || qty < 0) qty = 0;
    if (qty > maxQuantity) qty = maxQuantity;

    setExchangePayload(prev =>
      prev.map(item =>
        item.orderItemID === orderItemID
          ? { ...item, returnQuantity: qty }
          : item
      )
    );
  };

  // ===========================================
  // BARCODE SEARCH
  // ===========================================
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setSearchLoading(true);
    setSearchedVariant(null);
    setNewExchangeQuantity(1);

    try {
      const response = await fetchProductVariantByBarcode(barcodeInput.trim());

      const variant = response.variant;
      if (!variant) throw new Error("Product variant not found.");

      if (parseFloat(variant.stock) <= 0) {
        toast.error("This product is out of stock.");
        return;
      }

      setSearchedVariant({
        variantID: variant.variantID,
        name: variant.name || variant.product_name,
        color: variant.color,
        size: variant.size,
        price: parseFloat(variant.price),
        stock: parseFloat(variant.stock),
      });

    } catch (error) {
      toast.error(error.toString());
    } finally {
      setSearchLoading(false);
    }
  };

  // ===========================================
  // ADD SEARCHED ITEM
  // ===========================================
  const handleAddSearchedItem = () => {
    if (!searchedVariant || newExchangeQuantity <= 0 || newExchangeQuantity > searchedVariant.stock) {
      toast.error("Invalid quantity.");
      return;
    }

    const exists = newExchangeItems.find(i => i.variantID === searchedVariant.variantID);

    if (exists) {
      setNewExchangeItems(prev =>
        prev.map(i =>
          i.variantID === searchedVariant.variantID
            ? { ...i, quantity: i.quantity + newExchangeQuantity }
            : i
        )
      );
    } else {
      setNewExchangeItems(prev => [
        ...prev,
        { ...searchedVariant, quantity: newExchangeQuantity },
      ]);
    }

    toast.success(`Added ${newExchangeQuantity}x ${searchedVariant.name}`);
    setBarcodeInput('');
    setSearchedVariant(null);
    setNewExchangeQuantity(1);
  };

  const handleNewExchangeQuantityChange = (variantID, value) => {
    const qty = parseInt(value, 10);

    setNewExchangeItems(prev =>
      prev.map(item => {
        if (item.variantID === variantID) {
          let newQty = isNaN(qty) || qty < 1 ? 1 : qty;
          if (newQty > item.stock) newQty = item.stock;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveExchangeItem = (variantID) => {
    setNewExchangeItems(prev => prev.filter(item => item.variantID !== variantID));
  };

  // ===========================================
  // NET AMOUNT CALCULATION
  // ===========================================
  const calculateNetChange = () => {
    let net = 0;

    exchangePayload.forEach(item =>
      net -= item.returnQuantity * item.price
    );

    newExchangeItems.forEach(item =>
      net += item.price * item.quantity
    );

    return net;
  };

  const netChange = calculateNetChange();

  // ===========================================
  // SUBMIT EXCHANGE
  // ===========================================
  const handleSubmit = async () => {
    const itemsToSubmit = [];

    exchangePayload.forEach(item => {
      if (item.returnQuantity > 0) {
        itemsToSubmit.push({
          variantID: item.variantID,
          quantity: -item.returnQuantity,
        });
      }
    });

    newExchangeItems.forEach(item => {
      if (item.quantity > 0) {
        itemsToSubmit.push({
          variantID: item.variantID,
          quantity: item.quantity,
        });
      }
    });

    if (itemsToSubmit.length === 0) {
      toast.error("Please add return or exchange items.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateOrderForExchange(orderID, itemsToSubmit);
      toast.success("Exchange processed successfully!");
      alert(result.balanceInfo);

      onSuccessfulUpdate();
      fetchOrders();

    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===========================================
  // UI
  // ===========================================
  if (isLoading) {
    return (
      <ModalLayout onClose={onClose}>
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout onClose={onClose}>
      <h2 style={{ ...styles.title, marginTop: 0 }}>
        <RotateCcw size={24} /> Return & Exchange | Order {orderID}
      </h2>

      {/* RETURN ITEMS */}
      <div style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <CornerDownLeft size={16} /> Items to Return (Credit)
        </h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Original Qty</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Qty to Return</th>
            </tr>
          </thead>
          <tbody>
            {exchangePayload.map(item => (
              <tr key={item.orderItemID}>
                <td style={tdStyle}>{item.name} ({item.size}, {item.color})</td>
                <td style={tdStyle}>{item.originalQuantity}</td>
                <td style={tdStyle}>{formatPrice(item.price)}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    max={item.originalQuantity}
                    value={item.returnQuantity}
                    onChange={(e) =>
                      handleReturnQuantityChange(
                        item.orderItemID,
                        item.originalQuantity,
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXCHANGE SECTION */}
      <div style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <PlusCircle size={16} /> Items for Exchange / New Purchase
        </h3>

        <form onSubmit={handleBarcodeSearch} style={searchFormStyle}>
          <input
            type="text"
            placeholder="Scan or enter barcode"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={barcodeInputStyle}
          />
          <button type="submit" style={searchButtonStyle}>
            {searchLoading ? '...' : <Search size={16} />}
          </button>
        </form>

        {/* SEARCHED VARIANT */}
        {searchedVariant && (
          <div style={variantResultStyle}>
            <div style={{ flexGrow: 1 , fontSize: '0.9rem'}}>
              <p style={{ fontWeight: '600' }}>{searchedVariant.name}</p>
              <p>Size: {searchedVariant.size} | Color: {searchedVariant.color}</p>
              <p>Price: {formatPrice(searchedVariant.price)} | Stock: {searchedVariant.stock}</p>
            </div>

            <div>
              <input
                type="number"
                min="1"
                max={searchedVariant.stock}
                value={newExchangeQuantity}
                onChange={(e) =>
                  setNewExchangeQuantity(parseInt(e.target.value) || 1)
                }
                style={{ ...inputStyle, width: '60px' }}
              />
              <button style={addItemButtonStyle} onClick={handleAddSearchedItem}>
                Add
              </button>
            </div>
          </div>
        )}

        {/* NEW EXCHANGE ITEMS TABLE */}
        {newExchangeItems.length > 0 && (
          <table style={{ ...tableStyle, marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {newExchangeItems.map(item => (
                <tr key={item.variantID}>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{formatPrice(item.price)}</td>
                  <td style={tdStyle}>{item.stock}</td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) =>
                        handleNewExchangeQuantityChange(
                          item.variantID,
                          e.target.value
                        )
                      }
                      style={{ ...inputStyle, width: '60px' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <X
                      size={16}
                      color="#ef4444"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveExchangeItem(item.variantID)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* NET CHANGE */}
      <div style={summaryStyle}>
        <p style={summaryTextStyle}>Net Balance Change:</p>
        <p style={netChangeStyle(netChange)}>
          {netChange < 0 ? "Customer Credit Due: " : "Customer Charge: "}
          {formatPrice(Math.abs(netChange))}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={onClose} style={cancelButtonStyle}>Cancel</button>
        <button onClick={handleSubmit} style={submitButtonStyle} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Complete Exchange"}
        </button>
      </div>
    </ModalLayout>
  );
};

export default OrderExchangeModal;
