import React, { useState } from 'react';

const AddressManage = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      tag: 'HOME',
      name: 'Harvir Singh',
      phone: '9871958309',
      address: '2, Gs school , baraula, sector 49 , Gautam Buddha Nagar, Noida, Uttar Pradesh',
      pincode: '201301'
    },
    {
      id: 2,
      name: 'Rahul Chaudhary',
      phone: '9315816854',
      address: 'Happy sr secondary school, Palari, Sonipat District, Haryana',
      pincode: '131021'
    },
    {
      id: 3,
      name: 'Akshat Trivedi',
      phone: '9755182578',
      address: '203B, Mangal Shree Apartment Tilak Nagar, Indore, Madhya Pradesh',
      pincode: '452001'
    }
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    phone: '',
    address: '',
    pincode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddClick = () => {
    setIsAddingAddress(true);
    setEditingAddressId(null);
    setFormData({
      tag: '',
      name: '',
      phone: '',
      address: '',
      pincode: ''
    });
  };

  const handleEditClick = (address) => {
    setIsAddingAddress(false);
    setEditingAddressId(address.id);
    setFormData({
      tag: address.tag || '',
      name: address.name,
      phone: address.phone,
      address: address.address,
      pincode: address.pincode
    });
  };

  const handleDeleteClick = (id) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAddressId) {
      // Update existing address
      setAddresses(addresses.map(address => 
        address.id === editingAddressId ? { ...address, ...formData } : address
      ));
    } else {
      // Add new address
      const newAddress = {
        id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1,
        ...formData
      };
      setAddresses([...addresses, newAddress]);
    }
    
    // Reset form
    setFormData({
      tag: '',
      name: '',
      phone: '',
      address: '',
      pincode: ''
    });
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  const handleCancel = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setFormData({
      tag: '',
      name: '',
      phone: '',
      address: '',
      pincode: ''
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Addresses</h1>
      
      {!isAddingAddress && editingAddressId === null && (
        <div className="border rounded-md p-4 mb-6 flex items-center hover:bg-gray-50 cursor-pointer" onClick={handleAddClick}>
          <div className="text-blue-600 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-blue-600 font-medium">ADD A NEW ADDRESS</span>
        </div>
      )}
      
      {(isAddingAddress || editingAddressId !== null) && (
        <div className="border rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag (Optional)</label>
                <input
                  type="text"
                  name="tag"
                  placeholder="e.g. HOME, WORK"
                  className="w-full p-2 border rounded-md"
                  value={formData.tag}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9]{10}"
                  className="w-full p-2 border rounded-md"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address*</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  className="w-full p-2 border rounded-md"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {addresses.map((address) => (
        <div key={address.id} className="border rounded-md mb-4 overflow-hidden">
          <div className="flex justify-between items-start p-4">
            <div>
              {address.tag && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-semibold rounded mb-2">
                  {address.tag}
                </span>
              )}
              <div className="flex items-center">
                <h3 className="font-semibold text-lg">{address.name}</h3>
                <span className="ml-4 text-gray-700">{address.phone}</span>
              </div>
              <p className="mt-1 text-gray-600">
                {address.address} - {address.pincode}
              </p>
            </div>
            <div className="relative">
              <button 
                className="text-gray-500 p-1 hover:bg-gray-100 rounded"
                onClick={() => {
                  const dropdown = document.getElementById(`dropdown-${address.id}`);
                  dropdown.classList.toggle('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <div 
                id={`dropdown-${address.id}`} 
                className="absolute right-0 mt-2 py-1 w-48 bg-white rounded-md shadow-lg z-10 border hidden"
              >
                <button 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => handleEditClick(address)}
                >
                  Edit
                </button>
                <button 
                  className="px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left"
                  onClick={() => handleDeleteClick(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressManage;