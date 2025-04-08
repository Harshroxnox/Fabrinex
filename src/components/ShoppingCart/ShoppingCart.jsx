import React, { useState, useEffect } from 'react';
import c5 from '../../assets/c5.png';
import c6 from '../../assets/c6.png';
import c7 from '../../assets/c7.png';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = () => {
  const navigate = useNavigate();
  // Initial cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Gradient Graphic T-shirt',
      size: 'Large',
      color: 'White',
      price: 145,
      quantity: 1,
      image: c5
    },
    {
      id: 2,
      name: 'Checkered Shirt',
      size: 'Medium',
      color: 'Red',
      price: 180,
      quantity: 1,
      image: c6
    },
    {
      id: 3,
      name: 'Skinny Fit Jeans',
      size: 'Large',
      color: 'Blue',
      price: 240,
      quantity: 1,
      image: c7
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    discountPercentage: 20, // 20% discount
    deliveryFee: 15,
    total: 0
  });

  // Calculate order summary whenever cart items change
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * (orderSummary.discountPercentage / 100);
    const total = subtotal - discount + orderSummary.deliveryFee;
    
    setOrderSummary({
      ...orderSummary,
      subtotal,
      discount,
      total
    });
  }, [cartItems]);

  // Update item quantity
  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change); // Prevent going below 1
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Handle promo code application
  const handleApplyPromo = () => {
    // This would typically validate the promo code with a backend
    console.log('Applying promo code:', promoCode);
    // For demonstration purposes, we'll just log it
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-500 text-sm mb-3 md:mb-6">
        <span>Home</span>
        <span className="mx-2">〉</span>
        <span>Cart</span>
      </div>
      
      {/* Cart Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8" style={{fontFamily:'Author'}}>YOUR CART</h1>
      
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        {/* Cart Items - Desktop style only visible on md and above */}
        <div className="hidden md:block w-full lg:w-2/3 border border-gray-200 rounded-[20px] shadow-md p-4">
          {cartItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center border-gray-200 py-6 ${index + 1 < cartItems.length ? 'border-b' : ''}`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-[15px] overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[15px]" />
              </div>
              
              <div className="flex-grow ml-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Color: {item.color}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center ml-6">
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="ml-6 text-lg font-bold">
                ${item.price}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Items - Mobile style only visible on smaller screens */}
        <div className="md:hidden w-full">
          {cartItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg shadow mb-4 p-4"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-[15px] overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-[15px]" />
                </div>
                
                <div className="flex-grow ml-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">Size: {item.size}</p>
                      <p className="text-xs text-gray-600">Color: {item.color}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="text-base font-bold">
                  ${item.price}
                </div>
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4" style={{fontFamily:'Author'}}>Order Summary</h2>
            
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${orderSummary.subtotal}</span>
              </div>
              
              <div className="flex justify-between text-red-500">
                <span>Discount (-{orderSummary.discountPercentage}%)</span>
                <span>-${orderSummary.discount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">${orderSummary.deliveryFee}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 md:pt-4 mt-3 md:mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-800 font-semibold">Total</span>
                  <span className="text-lg md:text-xl font-bold">${orderSummary.total}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-6">
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      className="bg-gray-100 text-gray-700 border-0 rounded-l-full pl-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-black" 
                      placeholder="Add promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-black text-white font-medium px-6 py-3 rounded-r-full hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
              
              <button className="w-full bg-black text-white font-medium py-3 md:py-4 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors mt-4" onClick={()=> navigate('/checkout')}>
                Go to Checkout
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;