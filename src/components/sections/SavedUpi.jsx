import React, { useState } from 'react';

const SavedUpi = () => {
  const [upiEntries, setUpiEntries] = useState([
    {
      id: 1,
      name: 'Phonepe UPI',
      upiId: '9315816854@ibl',
      provider: 'phonepe' // Used to determine the icon
    }
  ]);

  const [isAddingUpi, setIsAddingUpi] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    provider: 'phonepe'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddClick = () => {
    setIsAddingUpi(true);
    setFormData({
      name: '',
      upiId: '',
      provider: 'phonepe'
    });
  };

  const handleDeleteClick = (id) => {
    setUpiEntries(upiEntries.filter(entry => entry.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add new UPI entry
    const newUpiEntry = {
      id: upiEntries.length > 0 ? Math.max(...upiEntries.map(a => a.id)) + 1 : 1,
      ...formData
    };
    setUpiEntries([...upiEntries, newUpiEntry]);
    
    // Reset form
    setFormData({
      name: '',
      upiId: '',
      provider: 'phonepe'
    });
    setIsAddingUpi(false);
  };

  const handleCancel = () => {
    setIsAddingUpi(false);
    setFormData({
      name: '',
      upiId: '',
      provider: 'phonepe'
    });
  };

  // Provider icon mapping
  const getProviderIcon = (provider) => {
    switch(provider) {
      case 'phonepe':
        return (
          <div className="bg-purple-600 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <span className="text-white font-bold">₹</span>
          </div>
        );
      case 'googlepay':
        return (
          <div className="bg-green-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
        );
      case 'paytm':
        return (
          <div className="bg-blue-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <span className="text-white font-bold">₹</span>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Saved UPI</h1>
      
      {!isAddingUpi && (
        <div className="border rounded-md p-4 mb-6 flex items-center hover:bg-gray-50 cursor-pointer" onClick={handleAddClick}>
          <div className="text-blue-600 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-blue-600 font-medium">ADD A NEW UPI ID</span>
        </div>
      )}
      
      {isAddingUpi && (
        <div className="border rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New UPI ID</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI Name*</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. PhonePe UPI"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID*</label>
                <input
                  type="text"
                  name="upiId"
                  placeholder="e.g. 9876543210@upi"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.upiId}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI Provider*</label>
                <select
                  name="provider"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.provider}
                  onChange={handleInputChange}
                >
                  <option value="phonepe">PhonePe</option>
                  <option value="googlepay">Google Pay</option>
                  <option value="paytm">Paytm</option>
                  <option value="other">Other</option>
                </select>
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
                Save UPI ID
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* List of saved UPI IDs */}
      {upiEntries.map((entry) => (
        <div key={entry.id} className="border rounded-md mb-4 overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              {getProviderIcon(entry.provider)}
              <div className="ml-4">
                <h3 className="font-semibold">{entry.name}</h3>
                <p className="text-gray-600">{entry.upiId}</p>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => handleDeleteClick(entry.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedUpi;