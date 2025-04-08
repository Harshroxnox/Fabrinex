import { ChevronRight, IdCard, ListOrdered, Power, User, UserCircle2, WalletCards } from 'lucide-react'
import React, { useState } from 'react'
import ProfileInformation from '../sections/ProfileInformation';
import AddressManage from '../sections/AddressManage';
import SavedUpi from '../sections/SavedUpi';

function ProfileSection() {
    const [section, setSection] = useState('profileInformation');  

    const renderContent = () => {
        switch(section) {
            case 'profileInformation':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <ProfileInformation/>
                </div>;
            case 'manageAddresses':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <AddressManage/>
                </div>;
            case 'PANCardInformation':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">PAN Card Information</h2>
                    <p>Your PAN card details for tax purposes appear here.</p>
                </div>;
            case 'GiftCards':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">Gift Cards</h2>
                    <p>Your gift card balance: ₹0</p>
                </div>;
            case 'SavedUPI':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <SavedUpi/>
                </div>;
            case 'SavedCards':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">Saved Cards</h2>
                    <p>Your saved credit and debit cards appear here.</p>
                </div>;
            case 'MyCoupons':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">My Coupons</h2>
                    <p>Your available coupons and offers appear here.</p>
                </div>;
            case 'MyReviewsRatings':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">My Reviews & Ratings</h2>
                    <p>Your product reviews and ratings appear here.</p>
                </div>;
            case 'AllNotifications':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">All Notifications</h2>
                    <p>Your account notifications and updates appear here.</p>
                </div>;
            case 'MyWishlist':
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
                    <p>Your saved items and wishlist products appear here.</p>
                </div>;
            default:
                return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-400">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <p>Your profile details and account information appear here.</p>
                </div>;
        }
    };

  return (
    <div className='bg-gray-100 flex p-4' style={{minHeight: '100vh'}}>
      {/* Left Sidebar */}
      <div className="mr-6">
        {/* User Info Card */}
        <div className='border border-gray-400 flex m-2 items-center gap-2 p-2 rounded-lg w-64 bg-white' style={{fontFamily:'Author'}}>
            <div>
              <UserCircle2 size={30}/>
            </div>
            <div>
              <p className='text-[16px] font-light'>Hello</p>
              <h3 className='font-semibold text-[18px]'>Rahul Chaudhary</h3>
            </div>
        </div>

        {/* Navigation Menu */}
        <div className="w-64 bg-white shadow-sm rounded-md p-2 m-2 border border-gray-400" style={{fontFamily:'Author'}}>
          {/* My Orders Section */}
          <div className="py-2 border-b-2 border-gray-400">
            <div className="flex items-center justify-between text-blue-600 font-medium p-2 cursor-pointer">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2"><ListOrdered/></div>
                <span>MY ORDERS</span>
              </div>
              <div className="text-gray-500"><ChevronRight/></div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="py-1 border-b-2 border-gray-400">
            <div className="flex items-center text-gray-700 font-medium p-2">
              <div className="w-5 h-5 rounded-full mr-2 text-blue-700"><User/></div>
              <span className='text-[18px] mt-1'>ACCOUNT SETTINGS</span>
            </div>
            
            <div className="ml-7">
              <div 
                className={`py-2 cursor-pointer ${section === 'profileInformation' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('profileInformation')}
              >
                Profile Information
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'manageAddresses' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('manageAddresses')}
              >
                Manage Addresses
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'PANCardInformation' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('PANCardInformation')}
              >
                PAN Card Information
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div className="py-1 border-b-2 border-gray-400">
            <div className="flex items-center text-gray-700 font-medium p-2 justify-start gap-4">
              <div className="w-5 h-5 text-blue-600 mr-2"><WalletCards/></div>
              <span className='text-[16px]'>PAYMENTS</span>
            </div>
            
            <div className="ml-7">
              <div 
                className={`flex justify-between py-2 cursor-pointer ${section === 'GiftCards' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('GiftCards')}
              >
                <span>Gift Cards</span>
                <span className="text-green-600">₹0</span>
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'SavedUPI' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('SavedUPI')}
              >
                Saved UPI
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'SavedCards' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('SavedCards')}
              >
                Saved Cards
              </div>
            </div>
          </div>

          {/* My Stuff Section */}
          <div className="py-1 border-b-2 border-gray-400">
            <div className="flex items-center text-gray-700 font-medium p-2 justify-start gap-4">
              <div className="w-5 h-5 text-blue-600 mr-2"><IdCard/></div>
              <span>MY STUFF</span>
            </div>
            
            <div className="ml-7">
              <div 
                className={`py-2 cursor-pointer ${section === 'MyCoupons' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('MyCoupons')}
              >
                My Coupons
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'MyReviewsRatings' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('MyReviewsRatings')}
              >
                My Reviews & Ratings
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'AllNotifications' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('AllNotifications')}
              >
                All Notifications
              </div>
              <div 
                className={`py-2 cursor-pointer ${section === 'MyWishlist' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setSection('MyWishlist')}
              >
                My Wishlist
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-1">
            <div className="flex items-center text-gray-700 font-medium p-2 cursor-pointer">
              <div className="w-5 h-5 text-blue-600 mr-2 flex items-center justify-start"><Power/></div>
              <span className='text-[16px]'>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 mt-2">
        {renderContent()}
      </div>
    </div>
  )
}

export default ProfileSection