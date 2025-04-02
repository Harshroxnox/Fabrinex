import React, { useState } from 'react';

const NewsletterBanner = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your newsletter subscription logic here
    console.log('Subscribing email:', email);
    // Reset the field after submission
    setEmail('');
  };

  return (
    <div className="bg-black py-8 px-6 mx-3 rounded-3xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">
            STAY UPTO DATE ABOUT<br />
            OUR LATEST OFFERS
          </h2>
        </div>
        
        <div className="w-full md:w-auto">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-full md:w-[320px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-3 py-3 bg-white text-gray-700 rounded-full focus:outline-none"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Subscribe to Newsletter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBanner;