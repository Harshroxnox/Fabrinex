import { ArrowDown, ChevronDown, SearchIcon, ShoppingCart, User } from 'lucide-react'
import React from 'react'

function Navbar() {
  return (
    <div>
            <nav className="flex items-center justify-between px-4 md:px-8 py-4">
      {/* Logo */}
      <div className="text-3xl font-bold">SHOP.CO</div>

      {/* Navigation Links - hidden on mobile, shown on md+ screens */}
      <div className="hidden md:flex items-center space-x-8 font-[500] text-[16px]">
        <a href="#" className="flex items-center hover:text-gray-600">
          Shop <ChevronDown className="ml-1 mt-1 h-4 w-4 font-semibold" />
        </a>
        <a href="#" className="hover:text-gray-600">On Sale</a>
        <a href="#" className="hover:text-gray-600">New Arrivals</a>
        <a href="#" className="hover:text-gray-600">Brands</a>
      </div>

      {/* Search and Icons */}
      <div className="flex items-center space-x-4 w-1/2">
      <div className="hidden md:flex items-center ml-2 font-[500] text-[16px] rounded-full px-4 py-2 w-[90%] focus-within:ring-1 focus-within:ring-gray-400 bg-gray-200">
      <SearchIcon className="h-4 w-4 text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Search for products..."
        className="w-full bg-transparent border-none focus:outline-none"
      />
    </div>
        <button className="p-1 hover:text-gray-600">
          <ShoppingCart className="h-6 w-6" />
        </button>
        <button className="p-1 hover:text-gray-600">
          <User className="h-6 w-6" />
        </button>
      </div>
    </nav>
    </div>
  )
}

export default Navbar
