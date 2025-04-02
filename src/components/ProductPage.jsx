import React, { useState } from 'react';

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [reviewSort, setReviewSort] = useState('latest');
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  // Product details data
  const productDetails = {
    name: "ONE LIFE GRAPHIC T-SHIRT",
    price: 260,
    originalPrice: 300,
    discount: 40,
    description: "This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
    features: [
      "100% organic cotton for breathability and comfort",
      "Ribbed crewneck for durability",
      "Regular fit - not too loose, not too tight",
      "Screen-printed graphic design",
      "Pre-shrunk to minimize shrinkage after washing"
    ],
    specifications: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Weight", value: "180 gsm" },
      { name: "Care Instructions", value: "Machine wash cold, tumble dry low" },
      { name: "Manufactured", value: "Ethically made in Portugal" },
      { name: "Sustainability", value: "Made with eco-friendly dyes and processes" }
    ],
    colors: [
      { name: 'olive', hex: '#5D5D3A' },
      { name: 'teal', hex: '#2F4F4F' },
      { name: 'navy', hex: '#1F2937' }
    ],
    sizes: ['Small', 'Medium', 'Large', 'X-Large']
  };

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: "Samantha D.",
      rating: 4.5,
      verified: true,
      review: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
      date: "August 14, 2023"
    },
    {
      id: 2,
      name: "Alex M.",
      rating: 4,
      verified: true,
      review: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
      date: "August 15, 2023"
    },
    {
      id: 3,
      name: "Ethan R.",
      rating: 3.5,
      verified: true,
      review: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
      date: "August 16, 2023"
    },
    {
      id: 4,
      name: "Olivia P.",
      rating: 5,
      verified: true,
      review: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
      date: "August 17, 2023"
    },
    {
      id: 5,
      name: "Liam K.",
      rating: 4,
      verified: true,
      review: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
      date: "August 18, 2023"
    },
    {
      id: 6,
      name: "Ava H.",
      rating: 4.5,
      verified: true,
      review: "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
      date: "August 19, 2023"
    }
  ];

  // FAQs data
  const faqs = [
    {
      id: 1,
      question: "How does the t-shirt fit?",
      answer: "The ONE LIFE GRAPHIC T-SHIRT has a regular fit that's neither too loose nor too tight. We recommend ordering your usual size for a comfortable fit. If you prefer a more relaxed look, you can size up."
    },
    {
      id: 2,
      question: "What's the material composition?",
      answer: "Our t-shirt is made from 100% organic cotton with a weight of 180 gsm. This ensures the perfect balance of durability and breathability for all-day comfort."
    },
    {
      id: 3,
      question: "How should I care for this t-shirt?",
      answer: "To maintain the quality and appearance of your t-shirt, we recommend machine washing in cold water with similar colors. Tumble dry on low heat or hang to dry. Avoid using bleach and high heat to preserve the colors and print."
    },
    {
      id: 4,
      question: "Is this t-shirt sustainable?",
      answer: "Yes, sustainability is at the core of our products. This t-shirt is made from 100% organic cotton, using eco-friendly dyes and processes. It's ethically manufactured in Portugal under fair working conditions."
    },
    {
      id: 5,
      question: "What's your return policy?",
      answer: "We offer a 30-day return policy for unworn items in their original packaging. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange it for another size or color."
    },
    {
      id: 6,
      question: "How long will shipping take?",
      answer: "Domestic orders typically arrive within 3-5 business days. International shipping usually takes 7-14 business days, depending on the destination and customs processing."
    }
  ];

  const toggleFaq = (id) => {
    if (expandedFaqs.includes(id)) {
      setExpandedFaqs(expandedFaqs.filter(faqId => faqId !== id));
    } else {
      setExpandedFaqs([...expandedFaqs, id]);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-yellow-400 opacity-30">★</span>);
      }
    }
    
    return stars;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Product Details
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'reviews' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Rating & Reviews
            </button>
            <button 
              onClick={() => setActiveTab('faqs')}
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'faqs' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              FAQs
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">About This Product</h2>
            <p className="text-gray-600 mb-6">{productDetails.description}</p>
            
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="list-disc pl-5 mb-8 space-y-2 text-gray-600">
              {productDetails.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Size & Fit</h3>
            <div className="mb-8">
              <p className="text-gray-600 mb-4">This t-shirt has a regular fit. Choose your normal size.</p>
              <div className="flex flex-wrap gap-4 mt-2">
                {productDetails.sizes.map((size) => (
                  <div key={size} className="border border-gray-300 rounded-md px-6 py-2 text-sm text-center">
                    {size}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Available Colors</h3>
            <div className="flex gap-4 mb-8">
              {productDetails.colors.map((color) => (
                <div key={color.name} className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <span className="mt-2 text-sm capitalize">{color.name}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
            <table className="w-full mb-8">
              <tbody>
                {productDetails.specifications.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 text-gray-600 font-medium">{spec.name}</td>
                    <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
              <p className="text-gray-600 mb-2">Free standard shipping on all orders over $100.</p>
              <p className="text-gray-600 mb-2">Express shipping available at checkout.</p>
              <p className="text-gray-600">30-day return policy for unworn items.</p>
            </div>
          </div>
        </div>
      )}

      {/* Ratings & Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-xl font-semibold">All Reviews <span className="text-gray-500 text-sm">({reviews.length})</span></h2>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <div className="relative">
                <select 
                  className="appearance-none bg-gray-100 px-4 py-2 pr-8 rounded-full text-sm"
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
                Write a Review
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between mb-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">{review.name}</span>
                  {review.verified && (
                    <span className="flex items-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">"{review.review}"</p>
                <p className="text-sm text-gray-500">Posted on {review.date}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button className="border border-gray-300 text-gray-600 px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50">
              Load More Reviews
            </button>
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-6 text-left font-medium"
                  onClick={() => toggleFaq(faq.id)}
                >
                  {faq.question}
                  <svg
                    className={`w-6 h-6 transform ${expandedFaqs.includes(faq.id) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {expandedFaqs.includes(faq.id) && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium mb-4">Still have questions?</h3>
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium">
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;