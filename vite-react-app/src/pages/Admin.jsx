import React from 'react'
import "./Admin.css"

const Admin = () => {
  return (
    <div className="admin-container">
        <h1>Admin Panel</h1>
        <div className="admin-box">
            <div className="admin-sidebar">
                <button id='home-btn'>Home</button>
                <button>Orders</button>
                <button>Products</button>
                <button>Customers</button>
                <button>Messaging</button>
                <button>Promotions</button>
                <button>Web</button>
                <button>Analytics</button>
                <button>Settings</button>
            </div>
            <div className="admin-main">
                <p>This will be the barcode section for inventory management</p> 
                <p>This section will keep on changing depending upon what is selected from side panel</p> 
            </div>
        </div>
    </div>
  )
}

export default Admin