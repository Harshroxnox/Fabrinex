import React, { useState } from 'react';
// import tshirt from '../assets/tshirt.png';
import tshirtback from '../assets/tshirtback.png';
import personwithtshirt from '../assets/personwithtshirt.png';
import ProductPage from './ProductPage';
import Showcase from './showcase/showcase';
import { features } from './features/topselling';
import NewsletterBanner from './NewsLetter';
import Footer from './Footer';
import a1 from '../assets/a1.png';
import a2 from '../assets/a2.png';
import a3 from '../assets/a3.png';
const ProductDisplay = ({tshirt}) => {
  const [selectedColor, setSelectedColor] = useState('olive');
  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);
  
  const colors = [
    { name: 'olive', hex: '#5D5D3A' },
    { name: 'teal', hex: '#2F4F4F' },
    { name: 'navy', hex: '#1F2937' }
  ];
  
  const sizes = ['Small', 'Medium', 'Large', 'X-Large'];
  const images=[a1,a2,a3];
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    alert(`Added ${quantity} ${selectedSize} ${selectedColor} ONE LIFE GRAPHIC T-SHIRT to cart`);
  };

  return (
    <div className='mt-10'>

    <div className=" md:ml-14 p-4 font-sans">
      <div className="flex flex-col md:flex-row gap-8">
        {/* big screens */}
        <div className='grid grid-cols-2 gap-4 hidden md:block md:flex'>
 
        {/* Left side - Thumbnails */}
        <div className="flex flex-row md:flex-col gap-2 md:w-40  ">
          {images.map((item) => (
            <div 
              key={item} 
              className="border rounded-2xl p-1 cursor-pointer hover:border-gray-400"
            >
              <img 
                src={item}
                alt={`Thumbnail ${item}`} 
                className="w-full object-cover fit-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
        
        {/* Middle - Main Image */}
        <div className="bg-gray-100 rounded-2xl items-center justify-center md:flex-1 md:h-[65vh] md:w-[30vw]">
          <img 
            src={personwithtshirt}
            alt="ONE LIFE Graphic T-Shirt" 
            className=" h-auto w-full h-full object-center p-4 "
          />
        </div>
        </div>
        {/* small screen */}
        <div className='block md:hidden'>
                   {/* Middle - Main Image */}
        <div className="bg-gray-100 rounded-2xl flex items-center justify-center md:flex-1 h-[400px]">
          <img 
            src={personwithtshirt}
            alt="ONE LIFE Graphic T-Shirt" 
            className="max-w-full h-auto max-h-96 object-contain p-4 "
          />
        </div>
              {/* Left side - Thumbnails */}
        <div className="flex flex-row md:flex-col gap-2 md:w-24 ">
          {images.map((item) => (
            <div 
              key={item} 
              className="border rounded-2xl p-1 cursor-pointer hover:border-gray-400"
            >
              <img 
                src={item}
                alt={`Thumbnail ${item}`} 
                className="w-full h-20 object-cover fit-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
        
 
        </div>
        
        {/* Right side - Product Info */}
        <div className="space-y-6 " style={{fontFamily:'Author'}}>
          <div>
            <h1 className="text-[44px] font-[700]" >ONE LIFE GRAPHIC T-SHIRT</h1>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-xl">
                  {star <= 4 ? "★" : "☆"}
                </span>
              ))}
              <span className="ml-1 text-sm text-gray-500">4.5/5</span>
            </div>
            
            <div className="flex items-center mt-4">
              <span className="text-2xl font-bold">$260</span>
              <span className="ml-2 text-2xl text-gray-400 line-through">$300</span>
              <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded-[20px]">-40%</span>
            </div>
            
            <p className="mt-4 text-gray-600">
              This graphic t-shirt which is perfect for any occasion. Crafted from a soft and
              breathable fabric, it offers superior comfort and style.
            </p>
          </div>
          
          {/* Color Selection */}
          <div>
            <h2 className="font-medium mb-2">Select Colors</h2>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full ${selectedColor === color.name ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name} color`}
                >
                  {selectedColor === color.name && (
                    <span className="flex items-center justify-center text-white">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Size Selection */}
          <div>
            <h2 className="font-medium mb-2">Choose Size</h2>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full ${
                    selectedSize === size 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity and Add to Cart */}
          <div className="flex gap-4">
            <div className="flex items-center">
              <button 
                onClick={handleDecreaseQuantity}
                className="w-10 h-10 border border-gray-300 rounded-l-full flex items-center justify-center hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setQuantity(val);
                  }
                }}
                className="w-12 h-10 border-t border-b border-gray-300 text-center"
              />
              <button 
                onClick={handleIncreaseQuantity}
                className="w-10 h-10 border border-gray-300 rounded-r-full flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
    <ProductPage/>
    <Showcase features={features} title="YOU MAY ALSO LIKE" toshow={false} />
    {/* <NewsletterBanner/> */}
    {/* <Footer/> */}
    </div>
  );
};

export default ProductDisplay;