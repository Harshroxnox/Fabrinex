import React, { useState } from 'react';

const ProfileInformation = () => {
  // User data state
  const [userData, setUserData] = useState({
    firstName: 'Rahul',
    lastName: 'Chaudhary',
    gender: 'Male',
    email: 'chaudhary_Rahul309@yahoo.com',
    mobile: '+919315816854'
  });

  // Edit mode states for each section
  const [personalInfoEditMode, setPersonalInfoEditMode] = useState(false);
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [mobileEditMode, setMobileEditMode] = useState(false);

  // Temporary states for editing
  const [tempData, setTempData] = useState({...userData});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData({
      ...tempData,
      [name]: value
    });
  };

  // Handle gender selection
  const handleGenderChange = (gender) => {
    setTempData({
      ...tempData,
      gender
    });
  };

  // Save changes for personal info
  const savePersonalInfo = () => {
    setUserData({
      ...userData,
      firstName: tempData.firstName,
      lastName: tempData.lastName,
      gender: tempData.gender
    });
    setPersonalInfoEditMode(false);
  };

  // Save changes for email
  const saveEmail = () => {
    setUserData({
      ...userData,
      email: tempData.email
    });
    setEmailEditMode(false);
  };

  // Save changes for mobile
  const saveMobile = () => {
    setUserData({
      ...userData,
      mobile: tempData.mobile
    });
    setMobileEditMode(false);
  };

  // Cancel editing
  const cancelEdit = (section) => {
    setTempData({...userData});
    
    if (section === 'personal') {
      setPersonalInfoEditMode(false);
    } else if (section === 'email') {
      setEmailEditMode(false);
    } else if (section === 'mobile') {
      setMobileEditMode(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      {/* Personal Information Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          {!personalInfoEditMode ? (
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setPersonalInfoEditMode(true);
                setTempData({...userData});
              }}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                className="text-green-500 hover:text-green-700"
                onClick={savePersonalInfo}
              >
                Save
              </button>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => cancelEdit('personal')}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="firstName"
              value={personalInfoEditMode ? tempData.firstName : userData.firstName}
              onChange={handleInputChange}
              readOnly={!personalInfoEditMode}
              className={`w-full p-3 border ${personalInfoEditMode ? 'border-blue-300' : 'border-gray-300'} rounded-md text-gray-700 ${personalInfoEditMode ? 'bg-white' : 'bg-gray-50'}`}
            />
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              value={personalInfoEditMode ? tempData.lastName : userData.lastName}
              onChange={handleInputChange}
              readOnly={!personalInfoEditMode}
              className={`w-full p-3 border ${personalInfoEditMode ? 'border-blue-300' : 'border-gray-300'} rounded-md text-gray-700 ${personalInfoEditMode ? 'bg-white' : 'bg-gray-50'}`}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 font-medium">Your Gender</p>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                checked={personalInfoEditMode ? tempData.gender === 'Male' : userData.gender === 'Male'}
                onChange={() => personalInfoEditMode && handleGenderChange('Male')}
                disabled={!personalInfoEditMode}
                className="w-4 h-4 mr-2"
              />
              Male
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                checked={personalInfoEditMode ? tempData.gender === 'Female' : userData.gender === 'Female'}
                onChange={() => personalInfoEditMode && handleGenderChange('Female')}
                disabled={!personalInfoEditMode}
                className="w-4 h-4 mr-2"
              />
              Female
            </label>
          </div>
        </div>
      </div>

      {/* Email Address Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Email Address</h2>
          {!emailEditMode ? (
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setEmailEditMode(true);
                setTempData({...userData});
              }}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                className="text-green-500 hover:text-green-700"
                onClick={saveEmail}
              >
                Save
              </button>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => cancelEdit('email')}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            value={emailEditMode ? tempData.email : userData.email}
            onChange={handleInputChange}
            readOnly={!emailEditMode}
            className={`w-full p-3 border ${emailEditMode ? 'border-blue-300' : 'border-gray-300'} rounded-md text-gray-700 ${emailEditMode ? 'bg-white' : 'bg-gray-50'}`}
          />
        </div>
      </div>

      {/* Mobile Number Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mobile Number</h2>
          {!mobileEditMode ? (
            <button 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setMobileEditMode(true);
                setTempData({...userData});
              }}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                className="text-green-500 hover:text-green-700"
                onClick={saveMobile}
              >
                Save
              </button>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => cancelEdit('mobile')}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div>
          <input
            type="tel"
            name="mobile"
            value={mobileEditMode ? tempData.mobile : userData.mobile}
            onChange={handleInputChange}
            readOnly={!mobileEditMode}
            className={`w-full p-3 border ${mobileEditMode ? 'border-blue-300' : 'border-gray-300'} rounded-md text-gray-700 ${mobileEditMode ? 'bg-white' : 'bg-gray-50'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;