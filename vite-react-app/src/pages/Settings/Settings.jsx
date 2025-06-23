import React from 'react'
import { useState } from 'react'
import "./Settings.css"
import UserRolesPage from '../UserRoles/UserRoles'
import IntegrationsPage from '../Integrations/Integrations'

const Settings = () => {
  const [activeBtn, setActiveBtn] = useState("User Roles");

  const renderMain = ()=>{
    if(activeBtn == "User Roles"){
      return (<UserRolesPage />);
    }else if(activeBtn == "Integrations"){
      return (<IntegrationsPage />);
    }
    else{
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
      {/* <h1 className='admin-title'>{`Admin Panel ${activeBtn}`}</h1> */}

      <div className="admin-box">
        <div className="admin-sidebar">
          <button
            onClick={()=>setActiveBtn("User Roles")} 
            className={`home-btn ${(activeBtn=="User Roles")?"active-btn":""}`}
          >
            User Roles
          </button>

          <button 
            onClick={()=>setActiveBtn("Integrations")} 
            className={(activeBtn=="Integrations")?"active-btn":""}
          >
            Integrations
          </button>

        </div>

        <div className="setting-main">
          {renderMain()}
        </div>
        
      </div>

    </div>
  )
}

export default Settings