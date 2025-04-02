import React from 'react';

const ProductCard = ({ title, image, rating, originalPrice, currentPrice, discount }) => {
  return (
    <div className=" rounded-lg overflow-hidden w-full">
      <div className="aspect-square rounded-b-lg">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover object-center rounded-b-lg "
        />
      </div>
      <div className="p-3">
        <h3 className="font-[700] text-[20px] mb-2 font-satoshi">{title}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-sm">★</span>
            ))}
          </div>
          <span className="text-gray-600 ml-2 text-xs">{rating || "4.5/5"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-bold text-lg">{currentPrice}</span>
          {originalPrice && discount && (
            <>
              <p className="text-gray-400 line-through ml-2 text-sm">{originalPrice}</p>
              <p className="text-red-500 ml-2 text-sm">-{discount}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;