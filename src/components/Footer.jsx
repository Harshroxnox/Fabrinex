import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">SHOP.CO</h2>
            <p className="text-gray-600">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-bold text-lg mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-600">About</a></li>
              <li><a href="#" className="hover:text-gray-600">Features</a></li>
              <li><a href="#" className="hover:text-gray-600">Works</a></li>
              <li><a href="#" className="hover:text-gray-600">Career</a></li>
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="font-bold text-lg mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-600">Customer Support</a></li>
              <li><a href="#" className="hover:text-gray-600">Delivery Details</a></li>
              <li><a href="#" className="hover:text-gray-600">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-gray-600">Privacy Policy</a></li>
            </ul>
          </div>

          {/* FAQ links */}
          <div>
            <h3 className="font-bold text-lg mb-4">FAQ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-600">Account</a></li>
              <li><a href="#" className="hover:text-gray-600">Manage Deliveries</a></li>
              <li><a href="#" className="hover:text-gray-600">Orders</a></li>
              <li><a href="#" className="hover:text-gray-600">Payments</a></li>
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-bold text-lg mb-4">RESOURCES</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-600">Free eBooks</a></li>
              <li><a href="#" className="hover:text-gray-600">Development Tutorial</a></li>
              <li><a href="#" className="hover:text-gray-600">How to - Blog</a></li>
              <li><a href="#" className="hover:text-gray-600">Youtube Playlist</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <p className="text-gray-600 mb-4 md:mb-0">
              Shop.co @ 2000-2023. All Rights Reserved
            </p>

            {/* Payment methods */}
            <div className="flex space-x-4">
              <span className="font-bold">VISA</span>
              <span className="font-bold">Royal</span>
              <span className="font-bold">Play</span>
              <span className="font-bold">G Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;