import React from 'react';
import ProductCard from '../productCard/productCard';

function Showcase({ features, title, toshow }) {
  return (
    <div className="px-4 py-8">
      <div className='justify-center text-center mx-auto'>

      <h2 className="text-[40px] font-semibold mb-6 justify-center">{title}</h2>
      </div>
      <div className="flex overflow-x-auto pb-4 gap-10 hide-scrollbar rounded-lg justify-center grid grid-cols-4 gap-y-4">
        {features.map((item, index) => (
          <div key={index} className="max-w-[295px] max-h-[290px] flex-shrink-0 mb-24 ">
            <ProductCard 
              title={item.title} 
              image={item.image} 
              rating={item.rating} 
              originalPrice={item.originalPrice} 
             currentPrice={item.currentPrice} 
              discount={item.discount} 
            />
          </div>
        ))}
      </div>
      {toshow && (
        <div className="text-center mt-8">
          <button className="text-black font-semibold border border-gray-400 rounded-full px-10 py-2 hover:bg-gray-100 transition-colors">
            View All
          </button>
        </div>
      )}
    </div>
  );
}

export default Showcase;