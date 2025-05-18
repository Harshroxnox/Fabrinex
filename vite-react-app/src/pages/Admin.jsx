import React from 'react'
import { useState } from 'react'
import Home from '../components/Home'
import Orders from '../components/Orders'
import "./Admin.css"

const Admin = () => {
  const [activeBtn, setActiveBtn] = useState("Dashboard");

  const renderMain = ()=>{
    if(activeBtn == "Dashboard"){
      return (<Home />);
    }else if(activeBtn == "Orders"){
      return (<Orders />);
    }else{
      return (
      <>
        <p>{`Currently you have selected ${activeBtn}`}</p> 
        <p>This section will keep on changing depending upon what is selected from side panel</p> 
      </>
      );
    }
  };

  return (
    <div className="admin-container">
      <h1 className='admin-title'>{`Admin Panel ${activeBtn}`}</h1>

      <div className="admin-box">
        <div className="admin-sidebar">
          <button
            onClick={()=>setActiveBtn("Dashboard")} 
            className={`home-btn ${(activeBtn=="Dashboard")?"active-btn":""}`}
          >
            Dashboard
          </button>

          <button 
            onClick={()=>setActiveBtn("Orders")} 
            className={(activeBtn=="Orders")?"active-btn":""}
          >
            Orders
          </button>

          <button 
            onClick={()=>setActiveBtn("Products")} 
            className={(activeBtn=="Products")?"active-btn":""}
          >
            Products
          </button>

          <button 
            onClick={()=>setActiveBtn("Customers")} 
            className={(activeBtn=="Customers")?"active-btn":""}
          >
            Customers
          </button>
          
          <button 
            onClick={()=>setActiveBtn("Messaging")} 
            className={(activeBtn=="Messaging")?"active-btn":""}
          >
            Messaging
          </button>

          <button 
            onClick={()=>setActiveBtn("Promotions")} 
            className={(activeBtn=="Promotions")?"active-btn":""}
          >
            Promotions
          </button>
          
          <button 
            onClick={()=>setActiveBtn("Web")} 
            className={(activeBtn=="Web")?"active-btn":""}
          >
            Web
          </button>

          <button 
            onClick={()=>setActiveBtn("Analytics")} 
            className={(activeBtn=="Analytics")?"active-btn":""}
          >
            Analytics
          </button>
       
          <button 
            onClick={()=>setActiveBtn("Settings")} 
            className={(activeBtn=="Settings")?"active-btn":""}
          >
            Settings
          </button>
        </div>

        <div className="admin-main">
          {renderMain()}
        </div>
        
      </div>

    </div>
  )
}

export default Admin