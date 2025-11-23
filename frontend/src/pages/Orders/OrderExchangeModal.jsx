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

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [exchangePayload, setExchangePayload] = useState([]);
  const [newExchangeItems, setNewExchangeItems] = useState([]);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchedVariant, setSearchedVariant] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newExchangeQuantity, setNewExchangeQuantity] = useState(1);

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getOrder(orderID);
      // console.log("Fetched Order Data for Exchange:", res);
      const discountPercent = parseFloat(res.order.promo_discount || 0);
      
        const calculatedItems = res.items.map(item => {
        const price = parseFloat(item.price_at_purchase);
        const gstRate = parseFloat(item.tax || 0);

        // 1. Calculate Discount
        const discountAmt = (price * discountPercent) / 100;
        const discountedPrice = price - discountAmt;

        // 2. Calculate Tax on the discounted price
        const gstAmt = (discountedPrice * gstRate) / 100;

        // 3. Final Refundable Amount per Unit
        const finalUnitPrice = discountedPrice + gstAmt;
        // console.log(finalUnitPrice);
        return {
          orderItemID: item.orderItemID,
          variantID: item.variantID,
          name: item.name,
          color: item.color,
          size: item.size,
          
          // STORE THE CALCULATED FINAL PRICE HERE
          price: finalUnitPrice, 
          rawPrice: price, // Keep original for reference if needed
          
          originalQuantity: item.quantity,
          returnQuantity: 0,
        };
      });

      setExchangePayload(calculatedItems);

    } catch (error) {
      console.error(error);
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
  // UPDATE RETURN QUANTITY
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
      // console.log(response);
      
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
        discount: parseFloat(variant.discount || 0),
        tax: parseFloat(variant.tax || 0),
      });

    } catch (error) {
      toast.error(error.toString());
    } finally {
      setSearchLoading(false);
    }
  };

  // ===========================================
  // ADD / REMOVE NEW ITEMS
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

  const calculateNetChange = () => {
    let net = 0;

    // Subtract value of Returned Items (Credit)
    // Uses the 'price' we calculated in fetchOrderDetails (includes tax/discount)
    exchangePayload.forEach(item => {
      if(item.returnQuantity > 0) {
        net -= item.returnQuantity * item.price;
      }
    });

    // Add value of New Items (Charge)
    newExchangeItems.forEach(item => {
      net += item.price * item.quantity;
    });

    return net;
  };

  const netChange = calculateNetChange();

  const handleSubmit = async () => {
    const itemsToSubmit = [];

    // Add Returns (Negative Quantity)
    exchangePayload.forEach(item => {
      if (item.returnQuantity > 0) {
        itemsToSubmit.push({
          variantID: item.variantID,
          quantity: -item.returnQuantity,
        });
      }
    });

    // Add New Items (Positive Quantity)
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

    // console.log("Submitting Exchange Payload:", itemsToSubmit);
    setIsSubmitting(true);
    try {
      const result = await updateOrderForExchange(orderID, itemsToSubmit);
      toast.success("Exchange processed successfully!");
      
      // The backend result usually contains the authoritative balance info
      if(result.balanceInfo) toast.success(result.balanceInfo);

      onSuccessfulUpdate();
      fetchOrders();

    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };
  const getTotalUnitPrice = (price, discount, tax) => {
    const discountAmt = (price * discount) / 100;
    const discountedPrice = price - discountAmt;
    const taxAmt = (discountedPrice * tax) / 100;
    return discountedPrice + taxAmt;
  };
 
  if (isLoading) {
    return (
      <ModalLayout onClose={onClose}>
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Order Details...</div>
      </ModalLayout>
    );
  }

  return (
    <div className='no-scrollbar'>

    <ModalLayout className='no-scrollbar' onClose={onClose}>
      <h2 style={{ ...styles.title, marginTop: 0 }}>
        <RotateCcw size={24} /> Return & Exchange | Order {orderID}
      </h2>

      {/* RETURN ITEMS SECTION */}
      <div style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <CornerDownLeft size={16} /> Items to Return (Credit)
        </h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Item</th>
              <th style={thStyle}>Purchased Qty</th>
              <th style={thStyle}>Refundable Price(Per Unit)<br/><span style={{fontSize:'0.8em', fontWeight:'normal'}}>(Inc. Tax - Disc)</span></th>
              <th style={thStyle}>Qty to Return</th>
            </tr>
          </thead>
          <tbody>
            {exchangePayload.map(item => (
              <tr key={item.orderItemID}>
                <td style={tdStyle}>
                    <div style={{fontWeight:'500'}}>{item.name}</div>
                    <div style={{fontSize:'0.85em', color:'#666'}}>{item.size} | {item.color}</div>
                </td>
                <td style={tdStyle}>{item.originalQuantity}</td>
                {/* Displays the calculated effective price */}
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

      {/* NEW ITEMS SECTION */}
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

        {/* SEARCH RESULT CARD */}
        {searchedVariant && (
          <div style={variantResultStyle}>
            <div style={{ flexGrow: 1 , fontSize: '0.9rem'}}>
              <p style={{ fontWeight: '600' }}>{searchedVariant.name}</p>
              <p>Size: {searchedVariant.size} | Color: {searchedVariant.color}</p>
              <p>Price: {formatPrice(searchedVariant.price)} | Stock: {searchedVariant.stock}</p>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
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

        {/* NEW ITEMS TABLE */}
        {newExchangeItems.length > 0 && (
          <table style={{ ...tableStyle, marginTop: '1.2rem' }}>
            <thead>
              <tr>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Unit Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Tax</th>
                <th style={thStyle}>Total Unit Price</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {newExchangeItems.map(item => (
                <tr key={item.variantID}>
                  <td style={tdStyle}>{item.name}</td>
                  <td style={tdStyle}>{formatPrice(item.price)}</td>
                  <td style={tdStyle}>{item.stock}</td>
                  <td style={tdStyle}>{item.discount}%</td>
                  <td style={tdStyle}>{item.tax}%</td>
                  <td style={tdStyle}>{getTotalUnitPrice(item.price, item.discount,item.tax)}</td>
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
                      size={18}
                      className="text-red-500 hover:text-red-700"
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

      {/* NET BALANCE SUMMARY */}
      <div style={summaryStyle}>
        <p style={summaryTextStyle}>Net Balance Change:</p>
        <p style={netChangeStyle(netChange)}>
          {/* Logic: If Net is negative, we owe the customer money (Credit). If Positive, they pay us. */}
          {netChange < 0 ? "Refund to Customer: " : "Customer to Pay: "}
          {formatPrice(Math.abs(netChange))}
        </p>
      </div>

      {/* FOOTER BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={onClose} style={cancelButtonStyle}>Cancel</button>
        <button onClick={handleSubmit} style={submitButtonStyle} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Complete Exchange"}
        </button>
      </div>
    </ModalLayout>
    </div>

  );
};

export default OrderExchangeModal;