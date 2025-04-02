import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Star, Filter } from 'lucide-react';

const CasualCategoryPage = () => {
  // State for filters
  const [priceRange, setPriceRange] = useState([50, 300]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(['Large']);
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    colors: true,
    size: true,
    dressStyle: true
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sortBy, setSortBy] = useState('Most Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Product data
  const products = [
    {
      id: 1,
      name: 'Gradient Graphic T-shirt',
      category: 'T-shirts',
      price: 145,
      rating: 3.5,
      reviews: 354,
      image: '/api/placeholder/250/300',
      colors: ['white', 'pink'],
      sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    },
    {
      id: 2,
      name: 'Polo with Tipping Details',
      category: 'Shirts',
      price: 180,
      rating: 4.0,
      reviews: 405,
      image: '/api/placeholder/250/300',
      colors: ['red'],
      sizes: ['Small', 'Medium', 'Large'],
      discount: 40,
    },
    {
      id: 3,
      name: 'Black Striped T-shirt',
      category: 'T-shirts',
      price: 120,
      originalPrice: 150,
      rating: 3.0,
      reviews: 320,
      image: '/api/placeholder/250/300',
      colors: ['black', 'white'],
      sizes: ['Medium', 'Large', 'X-Large'],
      discount: 30,
    },
    {
      id: 4,
      name: 'Skinny Fit Jeans',
      category: 'Jeans',
      price: 240,
      originalPrice: 260,
      rating: 3.5,
      reviews: 342,
      image: '/api/placeholder/250/300',
      colors: ['blue'],
      sizes: ['30', '32', '34', '36'],
      discount: 35,
    },
    {
      id: 5,
      name: 'Checkered Shirt',
      category: 'Shirts',
      price: 180,
      rating: 4.5,
      reviews: 420,
      image: '/api/placeholder/250/300',
      colors: ['blue', 'red'],
      sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    },
    {
      id: 6,
      name: 'Sleeve Striped T-shirt',
      category: 'T-shirts',
      price: 130,
      originalPrice: 160,
      rating: 4.5,
      reviews: 445,
      image: '/api/placeholder/250/300',
      colors: ['orange', 'black'],
      sizes: ['Small', 'Medium', 'Large'],
      discount: 35,
    },
    {
      id: 7,
      name: 'Vertical Striped Shirt',
      category: 'Shirts',
      price: 212,
      originalPrice: 252,
      rating: 5.0,
      reviews: 305,
      image: '/api/placeholder/250/300',
      colors: ['green'],
      sizes: ['Medium', 'Large', 'X-Large'],
      discount: 20,
    },
    {
      id: 8,
      name: 'Courage Graphic T-shirt',
      category: 'T-shirts',
      price: 145,
      rating: 4.0,
      reviews: 405,
      image: '/api/placeholder/250/300',
      colors: ['orange'],
      sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    },
    {
      id: 9,
      name: 'Loose Fit Bermuda Shorts',
      category: 'Shorts',
      price: 80,
      rating: 3.0,
      reviews: 310,
      image: '/api/placeholder/250/300',
      colors: ['blue'],
      sizes: ['30', '32', '34', '36'],
    },
  ];

  // Filter categories
  const categories = [
    { id: 'tshirts', name: 'T-shirts' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'shirts', name: 'Shirts' },
    { id: 'hoodie', name: 'Hoodie' },
    { id: 'jeans', name: 'Jeans' },
  ];

  const dressStyles = [
    { id: 'casual', name: 'Casual' },
    { id: 'formal', name: 'Formal' },
    { id: 'party', name: 'Party' },
    { id: 'gym', name: 'Gym' },
  ];

  const colorOptions = [
    { name: 'green', hex: '#4CAF50' },
    { name: 'red', hex: '#F44336' },
    { name: 'yellow', hex: '#FFEB3B' },
    { name: 'orange', hex: '#FF9800' },
    { name: 'blue', hex: '#2196F3' },
    { name: 'deepblue', hex: '#3F51B5' },
    { name: 'purple', hex: '#9C27B0' },
    { name: 'pink', hex: '#E91E63' },
    { name: 'white', hex: '#FFFFFF' },
    { name: 'black', hex: '#000000' },
  ];

  const sizeOptions = [
    'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'
  ];

  // Toggle filter sections
  const toggleFilter = (filter) => {
    setExpandedFilters({
      ...expandedFilters,
      [filter]: !expandedFilters[filter]
    });
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // Handle price range change
  const handlePriceChange = (event) => {
    const value = parseInt(event.target.value);
    const isMinSlider = event.target.id === 'min-price';
    
    if (isMinSlider) {
      setPriceRange([value, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], value]);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...products];

    // Filter by price
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by colors if any selected
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors.some(color => selectedColors.includes(color))
      );
    }

    // Filter by sizes if any selected
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Sort products
    if (sortBy === 'Most Popular') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    } else if (sortBy === 'Price: Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  };

  // Initialize filtered products
  useEffect(() => {
    applyFilters();
  }, [priceRange, selectedColors, selectedSizes, sortBy]);

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          fill={i <= rating ? "#FFD700" : "none"} 
          color={i <= rating ? "#FFD700" : "#D1D5DB"} 
        />
      );
    }
    return stars;
  };

  // Generate pagination
  const totalPages = Math.ceil(filteredProducts.length / 9);
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button 
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === i ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="#" className="hover:text-gray-700">Home</a>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-700">Casual</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Filters</h3>
            <button className="p-1 text-gray-400">
              <Filter size={18} />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            {categories.map((category) => (
              <div key={category.id} className="py-2 border-b border-gray-100">
                <button 
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => toggleCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <button 
              className="flex items-center justify-between w-full text-left font-semibold mb-4"
              onClick={() => toggleFilter('price')}
            >
              <span>Price</span>
              <ChevronDown size={18} className={expandedFilters.price ? 'transform rotate-180' : ''} />
            </button>
            
            {expandedFilters.price && (
              <>
                <div className="mb-4 relative">
                  <div className="w-full h-1 bg-gray-200 rounded-full absolute top-4"></div>
                  <input 
                    type="range" 
                    id="min-price"
                    min="0" 
                    max="300" 
                    value={priceRange[0]} 
                    onChange={handlePriceChange}
                    className="absolute left-0 top-2 w-full appearance-none bg-transparent pointer-events-none"
                  />
                  <input 
                    type="range" 
                    id="max-price"
                    min="0" 
                    max="300" 
                    value={priceRange[1]} 
                    onChange={handlePriceChange}
                    className="absolute left-0 top-2 w-full appearance-none bg-transparent pointer-events-none"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </>
            )}
          </div>

          {/* Colors Filter */}
          <div className="mb-6">
            <button 
              className="flex items-center justify-between w-full text-left font-semibold mb-4"
              onClick={() => toggleFilter('colors')}
            >
              <span>Colors</span>
              <ChevronDown size={18} className={expandedFilters.colors ? 'transform rotate-180' : ''} />
            </button>
            
            {expandedFilters.colors && (
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      color.name === 'white' ? 'border border-gray-300' : ''
                    } ${
                      selectedColors.includes(color.name) ? 'ring-2 ring-black' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(color.name)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Size Filter */}
          <div className="mb-6">
            <button 
              className="flex items-center justify-between w-full text-left font-semibold mb-4"
              onClick={() => toggleFilter('size')}
            >
              <span>Size</span>
              <ChevronDown size={18} className={expandedFilters.size ? 'transform rotate-180' : ''} />
            </button>
            
            {expandedFilters.size && (
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedSizes.includes(size) 
                        ? 'bg-black text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dress Style */}
          <div className="mb-6">
            <button 
              className="flex items-center justify-between w-full text-left font-semibold mb-4"
              onClick={() => toggleFilter('dressStyle')}
            >
              <span>Dress Style</span>
              <ChevronDown size={18} className={expandedFilters.dressStyle ? 'transform rotate-180' : ''} />
            </button>
            
            {expandedFilters.dressStyle && (
              <div className="space-y-2">
                {dressStyles.map((style) => (
                  <div key={style.id} className="flex justify-between items-center">
                    <span>{style.name}</span>
                    <ChevronRight size={18} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply filter button */}
          <button 
            className="w-full bg-black text-white py-3 rounded-full font-medium"
            onClick={applyFilters}
          >
            Apply Filter
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Casual</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                Showing 1-10 of 120 Products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Sort by:</span>
                <select 
                  className="appearance-none bg-transparent font-medium pr-6 relative cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Most Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.slice(0, 9).map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-4 flex flex-col">
                <div className="relative mb-4 flex-grow">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-500 ml-1">{product.reviews}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-gray-400 line-through">${product.originalPrice}</span>
                        <span className="text-red-500 text-xs">-{product.discount}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <button 
              className="flex items-center gap-2 text-sm font-medium"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {renderPagination()}
              <span className="mx-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center">
                10
              </button>
            </div>

            <button 
              className="flex items-center gap-2 text-sm font-medium"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasualCategoryPage;