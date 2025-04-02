import React from 'react';

const TestimonialCard = ({ name, rating, verified = true, review }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 w-[100px] ">
      {/* Star Rating */}
      <div className="flex mb-4">
        {[...Array(rating)].map((_, index) => (
          <svg 
            key={index} 
            className="w-6 h-6 text-yellow-400 mr-1" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Name with Verified Badge */}
      <div className="flex items-center mb-4">
        <h3 className="text-2xl font-bold mr-2">{name}</h3>
        {verified && (
          <div className="bg-green-500 rounded-full p-1">
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        )}
      </div>

      {/* Review Text */}
      <p className="text-gray-600 text-lg leading-relaxed">
        "{review}"
      </p>
    </div>
  );
};

export default TestimonialCard;

// Example usage:
