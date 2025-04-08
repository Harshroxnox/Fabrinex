import React, { useState, useRef, useEffect } from 'react';

const TestimonialCarousel = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      rating: 5,
      verified: true,
      review: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."
    },
    {
      name: "Alex K.",
      rating: 5,
      verified: true,
      review: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
    },
    {
      name: "James L.",
      rating: 5,
      verified: true,
      review: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."
    },
    {
      name: "Maria P.",
      rating: 5,
      verified: true,
      review: "The customer service at Shop.co is exceptional. They went above and beyond to help me find the perfect outfit for a special occasion, and I couldn't be happier with my purchase."
    },  {
      name: "Pnakja.",
      rating: 5,
      verified: true,
      review: "The customer service at Shop.co is exceptional. They went above and beyond to help me find the perfect outfit for a special occasion, and I couldn't be happier with my purchase."
    },  {
      name: "rahul",
      rating: 5,
      verified: true,
      review: "The customer service at Shop.co is exceptional. They went above and beyond to help me find the perfect outfit for a special occasion, and I couldn't be happier with my purchase."
    },  {
      name: "akshat",
      rating: 5,
      verified: true,
      review: "The customer service at Shop.co is exceptional. They went above and beyond to help me find the perfect outfit for a special occasion, and I couldn't be happier with my purchase."
    },
    {
      name: "harsh",
      rating: 5,
      verified: true,
      review: "I appreciate the attention to detail in every garment from Shop.co. The stitching, fabric quality, and overall finish are superior to many other brands I've tried in the past."
    }
  ];

  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const scrollRight = () => {
    if (currentIndex < testimonials.length - 3) {
      setCurrentIndex(currentIndex + 1);
      sliderRef.current.scrollBy({ left: 310, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      sliderRef.current.scrollBy({ left: -310, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">OUR HAPPY CUSTOMERS</h2>
        {!isMobile && (
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
              disabled={currentIndex === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
              disabled={currentIndex >= testimonials.length - 3}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div 
        ref={sliderRef}
        className={`flex ${isMobile ? 'overflow-x-auto' : 'overflow-x-hidden'} relative`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className={`flex-shrink-0 w-[300px] md:w-[400px] mx-[5px] p-6 bg-white rounded-xl border border-gray-100 transition-all duration-300 ${
              !isMobile ? (
                index === currentIndex - 1 || index === currentIndex + 3 ? 
                'opacity-30 scale-95' : 
                (index >= currentIndex && index < currentIndex + 3) ? 
                'opacity-100 scale-100' : 
                'opacity-0 scale-90'
              ) : ''
            }`}
          >
            {/* Stars */}
            <div className="flex mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <svg 
                  key={i} 
                  className="w-5 h-5 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            {/* Name with Verified Badge */}
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium mr-2">{testimonial.name}</h3>
              {testimonial.verified && (
                <div className="bg-green-500 rounded-full p-1">
                  <svg 
                    className="w-3 h-3 text-white" 
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
            <p className="text-gray-600 text-sm leading-relaxed">
              "{testimonial.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;