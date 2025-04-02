import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Check, ChevronRight } from 'lucide-react';

const FilterDialog = () => {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    colors: true,
    size: true,
    dressStyle: true
  });

  // State for selected values
  const [priceRange, setPriceRange] = useState([50, 200]);
  const [selectedColors, setSelectedColors] = useState(['green']);
  const [selectedSize, setSelectedSize] = useState(['Large']);
  
  // Available options
  const clothingTypes = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
  const colors = [
    { name: 'green', color: 'bg-green-500' },
    { name: 'red', color: 'bg-red-500' },
    { name: 'yellow', color: 'bg-yellow-400' },
    { name: 'orange', color: 'bg-orange-500' },
    { name: 'blue', color: 'bg-blue-400' },
    { name: 'blue-dark', color: 'bg-blue-700' },
    { name: 'purple', color: 'bg-purple-600' },
    { name: 'pink', color: 'bg-pink-500' },
    { name: 'white', color: 'bg-white border border-gray-300' },
    { name: 'black', color: 'bg-black' }
  ];
  const sizes = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
  const dressStyles = ['Casual', 'Formal', 'Party', 'Gym'];

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Handle color selection
  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter(c => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  // Handle size selection
  const toggleSize = (size) => {
    setSelectedSize([size]);
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    setPriceRange([50, parseInt(e.target.value)]);
  };

  // Apply filters
  const applyFilters = () => {
    console.log('Applied Filters:', {
      priceRange,
      selectedColors,
      selectedSize
    });
    // This would typically interact with your data filtering logic
  };

  return (
    <div className="w-78 bg-white rounded-lg p-4 shadow-md border border-gray-300 h-full">
      {/* Filters Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Filters</h2>
        <button className="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="12" y1="18" x2="12" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Clothing Types */}
      <div className="mb-6">
        {clothingTypes.map((type) => (
          <div key={type} className="flex justify-between items-center py-2 border-b border-gray-100 font-roboto font-[400] text-[16px]">
            <span className="text-gray-600">{type}</span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* Price Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-3 cursor-pointer" 
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-medium">Price</h3>
          {expandedSections.price ? 
            <ChevronUp size={18} className="text-gray-400" /> : 
            <ChevronDown size={18} className="text-gray-400" />
          }
        </div>
        
        {expandedSections.price && (
          <div className="px-1">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">${priceRange[0]}</span>
              <span className="text-gray-600">${priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={priceRange[1]}
              onChange={handlePriceChange}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => toggleSection('colors')}
        >
          <h3 className="font-medium">Colors</h3>
          {expandedSections.colors ? 
            <ChevronUp size={18} className="text-gray-400" /> : 
            <ChevronDown size={18} className="text-gray-400" />
          }
        </div>
        
        {expandedSections.colors && (
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <div 
                key={color.name}
                className={`${color.color} w-8 h-8 rounded-full cursor-pointer flex items-center justify-center`}
                onClick={() => toggleColor(color.name)}
              >
                {selectedColors.includes(color.name) && (
                  <Check size={16} className={color.name === 'white' ? 'text-black' : 'text-white'} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => toggleSection('size')}
        >
          <h3 className="font-medium">Size</h3>
          {expandedSections.size ? 
            <ChevronUp size={18} className="text-gray-400" /> : 
            <ChevronDown size={18} className="text-gray-400" />
          }
        </div>
        
        {expandedSections.size && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedSize.includes(size) 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => toggleSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dress Style Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => toggleSection('dressStyle')}
        >
          <h3 className="font-medium">Dress Style</h3>
          {expandedSections.dressStyle ? 
            <ChevronUp size={18} className="text-gray-400" /> : 
            <ChevronDown size={18} className="text-gray-400" />
          }
        </div>
        
        {expandedSections.dressStyle && (
          <div>
            {dressStyles.map((style) => (
              <div key={style} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{style}</span>
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filter Button */}
      <button 
        className="w-full bg-black text-white py-3 rounded-full text-center font-medium"
        onClick={applyFilters}
      >
        Apply Filter
      </button>
    </div>
  );
};

export default FilterDialog;