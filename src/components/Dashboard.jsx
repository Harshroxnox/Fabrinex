import React from 'react';
import { ArrowDown, ArrowDownIcon, SearchIcon, ShoppingCart, User } from 'lucide-react';
import hero from '../assets/hero.png';
import versace from '../assets/versace.png';
import gucci from '../assets/gucci.png';
import prada from '../assets/prada.png';
import zara from '../assets/zara.png';
import calvin from '../assets/calvin.png';

const ShopCoLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Promo Banner */}
      <div className="bg-black text-white text-center py-2 text-[14px] font-[400] font-satoshi">
        Sign up and get 20% off to your first order.<span className='underline font-[500]'> Sign Up Now</span> 
      </div>


      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center px-4 md:px-8 py-8 md:py-16 bg-[#f2f0f1]">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-[36px] md:text-[64px] font-[700] mb-4 font-integralcf">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="font-[400] text-[16px] font-satoshi text-gray-600 mb-6 md:pr-12">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
          <button className="bg-black text-white px-12 py-3 rounded-full hover:bg-gray-800">
            Shop Now
          </button>

          <div className="mt-8 flex space-x-8">
            <div>
              <p className="text-[24px] md:text-[40px]  font-[700]">200+</p>
              <p className="text-gray-600 text-[14px] font-[400] md:text-[16px]">International Brands</p>
            </div>
            <div>
              <p className="text-[24px] md:text-[40px]  font-[700]">2,000+</p>
              <p className="text-gray-600 text-[14px] font-[400] md:text-[16px]">High-Quality Products</p>
            </div>
            <div>
              <p className="text-[24px] md:text-[40px]  font-[700]">30,000+</p>
              <p className="text-gray-600 text-[14px] font-[400] md:text-[16px]">Happy Customers</p>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-black/20 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-black/20 rounded-full"></div>
            <img 
              src={hero} 
              alt="Fashion Models" 
              className="w-full max-w-md object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Brand Logos */}
      <div className="grid grid-cols-3 md:grid-cols-5 justify-center items-center gap-8 py-6 bg-black">
        <img src={versace} alt="Versace" className="h-8 mx-auto" />
        <img src={zara} alt="Zara" className="h-8 mx-auto" />
        <img src={gucci} alt="Gucci" className="h-8 mx-auto" />
        <img src={prada} alt="Prada" className="h-8 mx-auto" />
        <img src={calvin} alt="Calvin Klein" className="h-8 mx-auto" />
        </div>

    </div>
  );
};

export default ShopCoLandingPage;