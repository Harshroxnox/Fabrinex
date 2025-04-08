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
import ProfileSection from './components/ProfileSection/ProfileSection';
import { BrowserRouter, Routes,Route } from 'react-router-dom';
import ShoppingCart from './components/ShoppingCart/ShoppingCart';
import CheckoutPage from './components/CheckoutPage/CheckoutPage';
function App() {
  return (
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path='/' element={<ShopCoLandingPage/>}/>
      <Route path='/profile' element={<ProfileSection/>}/>
      <Route path='/cloths' element={<ProductDisplay/>}/>
      <Route path='/filter' element={<FilterDialog/>}/>
      <Route path='/cart' element={<ShoppingCart/>}/>
      <Route path='/checkout' element={<CheckoutPage/>}/>
      <Route path='/newArrivals' element={<NewArrivals/>}/>
    </Routes>
    <NewsletterBanner/>
    <Footer/>
    </BrowserRouter>
  )
}

export default App
