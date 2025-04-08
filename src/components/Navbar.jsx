import { ChevronDown, CircleUserRound, SearchIcon, ShoppingCart, Menu } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Shop categories with subcategories - expanded with more options
  const shopCategories = [
    {
      name: "Men",
      subcategories: [
        { name: "T-shirts", link: "/men/t-shirts" },
        { name: "Shirts", link: "/men/shirts" },
        { name: "Pants", link: "/men/pants" },
        { name: "Jeans", link: "/men/jeans" },
        { name: "Jackets", link: "/men/jackets" },
        { name: "Sweaters", link: "/men/sweaters" },
        { name: "Activewear", link: "/men/activewear" },
        { name: "Accessories", link: "/men/accessories" }
      ]
    },
    {
      name: "Women",
      subcategories: [
        { name: "Dresses", link: "/women/dresses" },
        { name: "Tops", link: "/women/tops" },
        { name: "Skirts", link: "/women/skirts" },
        { name: "Pants", link: "/women/pants" },
        { name: "Jeans", link: "/women/jeans" },
        { name: "Jackets", link: "/women/jackets" },
        { name: "Activewear", link: "/women/activewear" },
        { name: "Accessories", link: "/women/accessories" }
      ]
    },
    {
      name: "Boys",
      subcategories: [
        { name: "T-shirts", link: "/boys/t-shirts" },
        { name: "Shirts", link: "/boys/shirts" },
        { name: "Pants", link: "/boys/pants" },
        { name: "Jeans", link: "/boys/jeans" },
        { name: "Jackets", link: "/boys/jackets" },
        { name: "Sweaters", link: "/boys/sweaters" },
        { name: "School Uniforms", link: "/boys/uniforms" }
      ]
    },
    {
      name: "Girls",
      subcategories: [
        { name: "Dresses", link: "/girls/dresses" },
        { name: "Tops", link: "/girls/tops" },
        { name: "Skirts", link: "/girls/skirts" },
        { name: "Pants", link: "/girls/pants" },
        { name: "Jackets", link: "/girls/jackets" },
        { name: "Sweaters", link: "/girls/sweaters" },
        { name: "School Uniforms", link: "/girls/uniforms" }
      ]
    },
    {
      name: "Kids",
      subcategories: [
        { name: "Toddlers", link: "/kids/toddlers" },
        { name: "Infants", link: "/kids/infants" },
        { name: "Shoes", link: "/kids/shoes" },
        { name: "Accessories", link: "/kids/accessories" },
        { name: "Toys", link: "/kids/toys" }
      ]
    },
    {
      name: "Home",
      subcategories: [
        { name: "Bedding", link: "/home/bedding" },
        { name: "Bath", link: "/home/bath" },
        { name: "Decor", link: "/home/decor" },
        { name: "Kitchen", link: "/home/kitchen" },
        { name: "Furniture", link: "/home/furniture" },
        { name: "Lighting", link: "/home/lighting" },
        { name: "Storage", link: "/home/storage" }
      ]
    },
    {
      name: "Beauty",
      subcategories: [
        { name: "Makeup", link: "/beauty/makeup" },
        { name: "Skincare", link: "/beauty/skincare" },
        { name: "Haircare", link: "/beauty/haircare" },
        { name: "Fragrance", link: "/beauty/fragrance" },
        { name: "Bath & Body", link: "/beauty/bath-body" }
      ]
    },
    {
      name: "Electronics",
      subcategories: [
        { name: "Smartphones", link: "/electronics/smartphones" },
        { name: "Laptops", link: "/electronics/laptops" },
        { name: "Audio", link: "/electronics/audio" },
        { name: "Smart Home", link: "/electronics/smart-home" },
        { name: "Accessories", link: "/electronics/accessories" }
      ]
    },
    {
      name: "Sports",
      subcategories: [
        { name: "Equipment", link: "/sports/equipment" },
        { name: "Clothing", link: "/sports/clothing" },
        { name: "Footwear", link: "/sports/footwear" },
        { name: "Fitness", link: "/sports/fitness" },
        { name: "Outdoor", link: "/sports/outdoor" }
      ]
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShopDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle mobile shop submenu
  const toggleMobileShop = () => {
    setMobileShopOpen(!mobileShopOpen);
  };

  return (
    <div>
      {/* Top Promo Banner */}
      <div className="bg-black text-white text-center py-2 text-[12px] md:text-[14px] font-[400] font-satoshi">
        Sign up and get 20% off your first order. <span className="underline font-[500] cursor-pointer">Sign Up Now</span>
      </div>

      <nav className="flex items-center justify-between px-4 md:px-8 py-2 border-b border-gray-200 relative">

          {/* Mobile Menu Toggle */}
          <button 
          className="md:hidden p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* Logo */}
        <div
          className="text-3xl font-bold cursor-pointer"
          style={{ fontFamily: 'Author' }}
          onClick={() => navigate('/')}
        >
          SHOP.CO
        </div>

      

        {/* Navigation Links - hidden on mobile, shown on md+ screens */}
        <div className="md:ml-10 hidden md:flex items-center space-x-8 font-[500] text-[16px]">
          {/* Shop dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsShopDropdownOpen(true)}
            onMouseLeave={() => setIsShopDropdownOpen(false)}
            ref={dropdownRef}
          >
            <button className="flex items-center hover:text-gray-600">
              Shop <ChevronDown className="ml-1 mt-1 h-4 w-4 font-semibold" />
            </button>
            
            {/* Mega Menu Dropdown */}
            {isShopDropdownOpen && (
              <div className="absolute top-full left-0 z-50 w-screen max-w-6xl bg-white shadow-lg rounded-lg mt-1 border border-gray-200 py-6 px-4 lg:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                {shopCategories.map((category, index) => (
                  <div key={index} className="flex flex-col">
                    <h3 className="font-bold text-black mb-2 lg:mb-3">{category.name}</h3>
                    <ul className="space-y-1 lg:space-y-2">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <li key={subIndex}>
                          <Link 
                            to={subcategory.link} 
                            className="text-gray-600 hover:text-black hover:underline text-xs sm:text-sm"
                            onClick={() => setIsShopDropdownOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Link to="#" className="hover:text-gray-600">On Sale</Link>
          <Link to='/newArrivals' className="hover:text-gray-600">New Arrivals</Link>
          <Link to="#" className="hover:text-gray-600">Brands</Link>
        </div>

        {/* Search and Icons */}
        <div className="flex items-center w-full max-w-xs sm:max-w-md ml-auto mr-2 md:mr-0 space-x-2 sm:space-x-4">
          {/* Search Bar */}
          <div className="flex items-center font-medium text-sm sm:text-base rounded-full px-3 sm:px-5 py-2 w-full focus-within:ring-1 focus-within:ring-gray-400 bg-gray-200">
            <SearchIcon className="text-gray-500 mr-1 sm:mr-3" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent border-none focus:outline-none text-sm sm:text-base placeholder-gray-500 px-1 sm:px-2"
            />
          </div>

          {/* Icons */}
          <button className="p-2 hover:text-gray-600">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" onClick={() => navigate('/cart')} />
          </button>
          <button className="p-2 hover:text-gray-600">
            <CircleUserRound className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer" onClick={() => navigate('/profile')} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-b border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Shop Dropdown */}
            <div>
              <button 
                onClick={toggleMobileShop}
                className="flex items-center justify-between w-full py-2 font-medium"
              >
                Shop
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileShopOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {mobileShopOpen && (
                <div className="pl-4 py-2 space-y-4">
                  {shopCategories.map((category, index) => (
                    <div key={index} className="mb-3">
                      <h3 className="font-bold text-sm mb-1">{category.name}</h3>
                      <ul className="pl-2 space-y-1">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <li key={subIndex}>
                            <Link 
                              to={subcategory.link} 
                              className="text-gray-600 text-sm block py-1"
                              onClick={() => {
                                setMobileShopOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Link to="#" className="block py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              On Sale
            </Link>
            <Link to="/newArrivals" className="block py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              New Arrivals
            </Link>
            <Link to="#" className="block py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Brands
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;