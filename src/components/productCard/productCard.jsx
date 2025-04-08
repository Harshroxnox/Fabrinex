import React from 'react';
import { useNavigate } from 'react-router-dom';
const ProductCard = ({ title, image, rating, originalPrice, currentPrice, discount }) => {
  const navigate=useNavigate();
  return (
    <div className="w-[298px] rounded-lg">
      <div className="rounded-b-lg">
        <img
          src={image}
          alt={title}
          className="w-[298px] h-[298px] object-center rounded-[20px] cursor-pointer "
          onClick={()=> navigate('/cloths')}
        />
      </div>
      <div className="p-2">
        <h3 className="font-[700] text-[20px] font-satoshi">{title}</h3>
        <div className="flex items-center">
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
              {discount && <p className="text-red-500 bg-red-200 rounded-[16px] p-1 ml-2 text-sm">{discount}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;