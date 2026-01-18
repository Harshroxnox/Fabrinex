import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, CornerDownLeft, PlusCircle, RotateCcw, Search } from 'lucide-react';
import { getOrder, settleRefund, updateOrderForExchange, updateOrderPayments } from '../../contexts/api/orders'; 
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
  const [paymentMode, setPaymentMode] = useState('cash'); // cash | online | split
  const [cashAmount, setCashAmount] = useState('');
  const [onlineMethod, setOnlineMethod] = useState('upi');


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
        price: parseFloat(variant.price), // base price
        discount: parseFloat(variant.discount || 0),
        tax: parseFloat(variant.tax || 0),
        stock: parseFloat(variant.stock),

        finalPrice:
          parseFloat(variant.price) -
          (parseFloat(variant.price) * (variant.discount || 0)) / 100 +
          (
            (parseFloat(variant.price) -
              (parseFloat(variant.price) * (variant.discount || 0)) / 100) *
            (variant.tax || 0)
          ) / 100
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
      net += item.finalPrice * item.quantity;
    });


    return net;
  };

  const netChange = calculateNetChange();
  const isRefundDue = netChange < 0;

const handleSubmit = async () => {
  const itemsToSubmit = [];

  // 1️⃣ Build exchange payload
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
    toast.error("Please add return or exchange items");
    return;
  }

  // 2️⃣ Confirm if money involved
  if (netChange !== 0) {
    const ok = window.confirm(
      netChange > 0
        ? `Customer needs to pay ₹${netChange}. Continue?`
        : `Refund ₹${Math.abs(netChange)} to customer. Continue?`
    );
    if (!ok) return;
  }

  setIsSubmitting(true);

  try {
    // 3️⃣ Update order (exchange / return)
    const result = await updateOrderForExchange(orderID, itemsToSubmit);
    toast.success("Exchange processed");
    if (result.balanceInfo) toast.success(result.balanceInfo);

    // 4️⃣ Build payments / refunds based on mode
    let transactions = [];
    const absAmount = Math.abs(netChange);

    if (netChange !== 0) {
      if (paymentMode === 'cash') {
        transactions = [{ type: 'cash', amount: absAmount }];
      }

      if (paymentMode === 'online') {
        transactions = [
          { type: 'online', method: onlineMethod, amount: absAmount }
        ];
      }

      if (paymentMode === 'split') {
        const cash = Number(cashAmount || 0);

        if (cash <= 0 || cash >= absAmount) {
          throw new Error("Invalid cash split amount");
        }

        transactions = [
          { type: 'cash', amount: cash },
          {
            type: 'online',
            method: onlineMethod,
            amount: absAmount - cash
          }
        ];
      }
    }

    // 5️⃣ Persist money movement
    if (netChange > 0) {
      // additional payment
      await updateOrderPayments(orderID, {
        payments: transactions,
        expectedAmount: netChange
      });

      toast.success("Payment recorded");
    }

    if (netChange < 0) {
      // refund
      for (const t of transactions) {
       await settleRefund(orderID, {
          type: t.type,
          method: t.type === 'online' ? t.method : null,
          amount: t.amount
        });
      }
      toast.success("Refund settled");
    }

    // 6️⃣ Close & refresh
    onSuccessfulUpdate();
    fetchOrders();

  } catch (err) {
    toast.error(err.message || err.toString());
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
  const paymentCardStyle = (active = false) => ({
    marginTop: '1rem',
    padding: '14px',
    borderRadius: '10px',
    background: '#FAFAFA',
    border: active ? '1.5px solid #8c9198ff' : '1px solid #ddd'
  });

 
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
    {netChange < 0 ? "Refund to Customer: " : "Customer to Pay: "}
    {formatPrice(Math.abs(netChange))}
  </p>
</div>

{/* PAYMENT / REFUND METHOD */}
{netChange !== 0 && (
  <div style={{ marginTop: '1.5rem' }}>
    <h4 style={{ marginBottom: '0.5rem' }}>
      {netChange > 0 ? 'Payment Method' : 'Refund Method'}
    </h4>

    <div style={{ display: 'flex', gap: '12px' }}>
      {['cash', 'online', 'split'].map(m => (
        <div
          key={m}
          onClick={() => setPaymentMode(m)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: paymentMode === m ? '2px solid #4D96FF' : '1px solid #ccc',
            background: paymentMode === m ? '#EEF5FF' : '#fff',
            fontWeight: 500,
            minWidth: '90px',
            textAlign: 'center'
          }}
        >
          {m.toUpperCase()}
        </div>
      ))}
    </div>
  </div>
)}

{paymentMode === 'cash' && (
  <div style={paymentCardStyle(true)}>
    <label style={{ fontWeight: 500 }}>Cash Amount</label>
    <input
      type="number"
      value={Math.abs(netChange)}
      disabled
      style={{
        width: '100%',
        marginTop: '6px',
        padding: '12px',
        fontSize: '1rem',
        borderRadius: '6px',
        background: '#F0F0F0'
      }}
    />
  </div>
)}


{paymentMode === 'online' && (
  <div style={paymentCardStyle(true)}>
    <label style={{ fontWeight: 500 }}>Online Method</label>
    <select
      value={onlineMethod}
      onChange={e => setOnlineMethod(e.target.value)}
      style={{
        width: '100%',
        marginTop: '6px',
        padding: '12px',
        fontSize: '1rem',
        borderRadius: '6px'
      }}
    >
      <option value="upi">UPI</option>
      <option value="card">Card</option>
      <option value="wallet">Wallet</option>
    </select>

    <label style={{ marginTop: '12px', fontWeight: 500 }}>Amount</label>
    <input
      type="number"
      value={Math.abs(netChange)}
      disabled
      style={{
        width: '100%',
        marginTop: '6px',
        padding: '12px',
        fontSize: '1rem',
        borderRadius: '6px',
        background: '#F0F0F0'
      }}
    />
  </div>
)}



{paymentMode === 'split' && (
  <div style={paymentCardStyle(true)}>
    <div style={{ display: 'flex', gap: '12px' }}>
      {/* CASH */}
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>Cash</label>
        <input
          type="number"
          min="0"
          max={Math.abs(netChange)}
          value={cashAmount}
          onChange={e => setCashAmount(e.target.value)}
          style={{
            width: '100%',
            marginTop: '6px',
            padding: '12px',
            fontSize: '1rem',
            borderRadius: '6px'
          }}
        />
      </div>

      {/* ONLINE */}
      <div style={{ flex: 1 }}>
        <label style={{ fontWeight: 500 }}>Online</label>
        <select
          value={onlineMethod}
          onChange={e => setOnlineMethod(e.target.value)}
          style={{
            width: '100%',
            marginTop: '6px',
            padding: '12px',
            fontSize: '1rem',
            borderRadius: '6px'
          }}
        >
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>

        <div style={{ marginTop: '6px', fontSize: '0.95rem', color: '#444' }}>
          ₹{Math.max(0, Math.abs(netChange) - Number(cashAmount || 0))} online
        </div>
      </div>
    </div>

    <div style={{ marginTop: '10px', fontSize: '0.95rem', color: '#666' }}>
      Total: ₹{Math.abs(netChange)}
    </div>
  </div>
)}



{/* (cash input OR online method OR split UI based on paymentMode) */}


      {/* FOOTER BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={onClose} style={cancelButtonStyle}>Cancel</button>
        <button onClick={handleSubmit} style={submitButtonStyle} disabled={isSubmitting} >
          {isSubmitting ? "Processing..." : "Complete Exchange"}
        </button>
      </div>
    </ModalLayout>
    </div>

  );
};

export default OrderExchangeModal;