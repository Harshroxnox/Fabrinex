import React, { useState } from 'react';
import { Check, Edit, Plus, ChevronDown, ChevronUp, Trash, Shield } from 'lucide-react';

const CheckoutPage = () => {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  const [addresses, setAddresses] = useState([
    {
      id: 0,
      name: "Harvir Singh",
      phone: "9871958309",
      addressType: "HOME",
      address: "2, Gs school, baraula, sector 49, Gautam Buddha Nagar, Noida, Uttar Pradesh - 201301"
    },
    {
      id: 1,
      name: "Rahul Chaudhary",
      phone: "9315816854",
      address: "Happy sr secondary school, Palari, Sonipat District, Haryana - 131021"
    },
    {
      id: 2,
      name: "Akshat Trivedi",
      phone: "9755182578",
      address: "203B, Mangal Shree Apartment Tilak Nagar, Indore, Madhya Pradesh - 452001"
    }
  ]);

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 1200, quantity: 2, image: "/api/placeholder/60/60" },
    { id: 2, name: "Product 2", price: 899, quantity: 1, image: "/api/placeholder/60/60" },
    { id: 3, name: "Product 3", price: 2499, quantity: 2, image: "/api/placeholder/60/60" },
    { id: 4, name: "Product 4", price: 649, quantity: 1, image: "/api/placeholder/60/60" }
  ]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressType: "HOME",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAddressSelect = (id) => {
    setSelectedAddress(id);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    
    const fullAddress = `${newAddress.address}, ${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`;
    
    const newAddressObj = {
      id: addresses.length,
      name: newAddress.name,
      phone: newAddress.phone,
      addressType: newAddress.addressType,
      address: fullAddress
    };
    
    setAddresses([...addresses, newAddressObj]);
    setSelectedAddress(newAddressObj.id);
    setShowAddAddressForm(false);
    
    // Reset form
    setNewAddress({
      name: "",
      phone: "",
      addressType: "HOME",
      address: "",
      city: "",
      state: "",
      pincode: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  // Calculate savings (just for demo - assuming original price is 30% higher)
  const calculateSavings = () => {
    const total = calculateTotal();
    return Math.round(total * 0.3);
  };

  return (
    <div className="font-['Satoshi'] bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 px-4 lg:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - Checkout Steps */}
          <div className="w-full lg:w-2/3">
            {/* Step 1: Login */}
            <div className="bg-white rounded-md mb-4 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                  <span>1</span>
                </div>
                <h2 className="text-lg font-medium">LOGIN</h2>
                <Check className="ml-2 text-blue-600" size={20} />
              </div>
              <div className="ml-11 mt-2">
                <p className="font-medium">Harvir Singh</p>
                <p className="text-gray-600">+919315816854</p>
              </div>
              <div className="ml-11 mt-2">
                <button className="text-blue-600 font-medium hover:text-blue-700">CHANGE</button>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white rounded-md mb-4 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                  <span>2</span>
                </div>
                <h2 className="text-lg font-medium">DELIVERY ADDRESS</h2>
              </div>

              <div className="mt-4 space-y-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    className={`border rounded-md p-3 flex ${selectedAddress === addr.id ? 'border-black' : 'border-gray-200'}`}
                  >
                    <div className="mr-3 pt-1">
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddress === addr.id}
                        onChange={() => handleAddressSelect(addr.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{addr.name}</p>
                          <div className="flex items-center space-x-2 text-sm">
                            <span>{addr.phone}</span>
                            {addr.addressType && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{addr.addressType}</span>
                            )}
                          </div>
                        </div>
                        {selectedAddress === addr.id && (
                          <button className="text-blue-600 font-medium">EDIT</button>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">{addr.address}</p>
                      
                      {selectedAddress === addr.id && (
                        <div className="mt-3">
                          <button className="bg-gray-400 hover:bg-gray-600 text-white px-4 py-2 rounded-full">
                            DELIVER HERE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add new address button */}
                <div className="border border-dashed border-gray-300 rounded-md p-3">
                  <button 
                    className="flex items-center font-medium"
                    onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  >
                    <Plus size={18} className="mr-2" />
                    Add a new address
                  </button>

                  {showAddAddressForm && (
                    <form onSubmit={handleAddAddress} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newAddress.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                          name="address"
                          value={newAddress.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Pincode</label>
                          <input
                            type="text"
                            name="pincode"
                            value={newAddress.pincode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address Type</label>
                        <div className="flex space-x-4 mt-1">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="home"
                              name="addressType"
                              value="HOME"
                              checked={newAddress.addressType === "HOME"}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="home" className="ml-2 text-sm text-gray-700">Home</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="work"
                              name="addressType"
                              value="WORK"
                              checked={newAddress.addressType === "WORK"}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="work" className="ml-2 text-sm text-gray-700">Work</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Order Summary */}
            <div className="bg-white rounded-md mb-4 p-4 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                    <span>3</span>
                  </div>
                  <h2 className="text-lg font-medium">ORDER SUMMARY</h2>
                </div>
                {showOrderSummary ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {showOrderSummary && (
                <div className="mt-4 ml-11">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center py-4 border-b last:border-b-0">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <div className="flex border border-gray-300 rounded">
                            <button 
                              className="px-2 py-1 bg-gray-100"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="px-4 py-1">{item.quantity}</span>
                            <button 
                              className="px-2 py-1 bg-gray-100"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            type="button" 
                            className="text-red-600 hover:text-red-500 flex items-center"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash size={16} className="mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 4: Payment Options */}
            <div className="bg-white rounded-md mb-4 p-4 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowPaymentOptions(!showPaymentOptions)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                    <span>4</span>
                  </div>
                  <h2 className="text-lg font-medium">PAYMENT OPTIONS</h2>
                </div>
                {showPaymentOptions ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {showPaymentOptions && (
                <div className="mt-4 ml-11 space-y-3">
                  <div className="border rounded-md p-3">
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                      <span className="ml-2">UPI</span>
                    </label>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                      <span className="ml-2">Credit / Debit Card</span>
                    </label>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                      <span className="ml-2">Net Banking</span>
                    </label>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="h-4 w-4 text-blue-600" />
                      <span className="ml-2">Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Price Details */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-md p-4 shadow-sm sticky top-4">
              <h2 className="text-lg font-medium border-b pb-3 mb-4">PRICE DETAILS</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">FREE</span>
                </div>
                
                <div className="border-t border-b py-3 my-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Payable</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-green-600 font-medium">
                  Your Total Savings on this order ₹{calculateSavings().toLocaleString()}
                </div>
              </div>
              
              <div className="mt-6 flex items-start">
                <Shield className="flex-shrink-0 text-gray-500 mt-0.5" size={20} />
                <div className="ml-3">
                  <p className="text-gray-700">Safe and Secure Payments. Easy returns.</p>
                  <p className="text-gray-700">100% Authentic products.</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-6">
                <p>By continuing with the order, you confirm that you are above 18 years of age, and you agree to the Shop.Co <a href="#" className="text-blue-600">Terms of Use</a> and <a href="#" className="text-blue-600">Privacy Policy</a></p>
              </div>
              
              <div className="mt-6">
                <button 
                  className="w-full bg-gray-700 hover:bg-black text-white font-medium py-3 rounded-full shadow-sm"
                >
                  PLACE ORDER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;