import "./Navbar.css"
import IconWhite from "../assets/icon-white.png"
import IconUser from "../assets/user-white.png"
import IconSearch from "../assets/search-white.png"
import IconCart from "../assets/cart-white.png"
import IconClose from "../assets/close-btn.png"

const Navbar = () => {
  return (
    <div className="navbar-container">
        {/*-------------------------- Top-Notification for Sign Up 20% Off -------------------------------------------------------------- */}
        <div className="notification-top">
            <div className="notification-text">Sign up and get 20% off to your first order. <span>Sign Up Now</span></div>
            <img src={IconClose} alt="Close" />
        </div>
        
        {/*-------------------------- Navigation Bar -------------------------------------------------------------- */}
        <div className='navbar'>
            <div className="left-nav">
                <div className="home">Home</div>
                <div className="new-arr">New Arrivals</div>
                <div className="shop">Shop By Category</div>
                <div className="products">All Products</div>
            </div>
            <div className="logo">
                <img src={IconWhite} alt="Logo" />
                <span className="sans">Sans</span>
                <span className="kari">kari</span>
            </div>
            <div className="right-nav">
                <div className="login">
                    <img src={IconUser} alt="User" />
                    <span>Login</span>
                </div>
                <div className="search">
                    <img src={IconSearch} alt="Search" />
                </div>
                <div className="cart">
                    <span>Rs.</span>
                    <span className="amt">0.00</span>
                    <img src={IconCart} alt="Cart" />
                    <span>0</span>
                </div>
            </div>
        </div>

    </div>
  )
}

export default Navbar