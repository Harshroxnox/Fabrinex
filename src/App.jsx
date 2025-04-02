import React from 'react'
import Dashboard from './components/Dashboard'
import ShopCoLandingPage from './components/Dashboard'
import NewArrivals from './components/NewArrival'
import './fonts.css';
import TopSelling from './components/TopSelling';
import DressStyleCategories from './components/generalCard';
// import Testimonials from './components/Testimonials';/
import TestimonialCarousel from './components/Testimonials';
import NewsletterBanner from './components/NewsLetter';
import Footer from './components/Footer';
import ProductDisplay from './components/ProductDisplay';
import Navbar from './components/Navbar';
import ProductPage from './components/ProductPage';
import CasualCategoryPage from './components/CasualCategoryPage';
import Filter from './components/filter';
import FilterDialog from './components/filter';
import FilteredCloths from './components/FilteredCloths';
function App() {
  return (
    <div>
      <Navbar/>
      <ShopCoLandingPage/>
      <NewArrivals/>
      <TopSelling/>
      <DressStyleCategories/>
      <TestimonialCarousel/>
      {/* <ProductDisplay/> */}
      {/* <ProductPage/> */}
      {/* <CasualCategoryPage/> */}
      {/* <FilteredCloths/> */}
      {/* <FilterDialog/> */}
      <NewsletterBanner/>
      <Footer/>
    </div>
  )
}

export default App
