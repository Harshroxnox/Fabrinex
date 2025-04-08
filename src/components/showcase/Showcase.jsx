import React from 'react';
import ProductCard from '../productCard/productCard';

function Showcase({ features, title, toshow }) {
  return (
    <div className=" py-8">
      <div className='justify-center text-center mx-auto'>

      <h2 className="text-[48px] font-bold mb-6 justify-center " style={{fontFamily:'Author'}}>{title}</h2>
      </div>
      <div className="flex overflow-x-auto pb-4 gap-x-6 hide-scrollbar rounded-lg justify-around pl-3 ">
        {features.map((item, index) => (
          <div key={index}>
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
        <div className="text-center">
          <button className="text-black font-semibold border border-gray-400 rounded-full px-10 py-2 hover:bg-gray-100 transition-colors">
            View All
          </button>
        </div>
      )}
    </div>
  );
}

export default Showcase;