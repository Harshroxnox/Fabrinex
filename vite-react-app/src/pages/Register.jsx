import React, { useContext, useState } from 'react'
import { LoginContext } from '../contexts/LoginContext'

function Register() {

    const {register,error}= useContext(LoginContext);
    const [form,setForm]= useState({email:'',password:'',roles:["superadmin"]});
    const handleSubmit =(e)=>{
        e.preventDefault();
        register(form);
    }
  return (
  <form onSubmit={handleSubmit}>
      {/* <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} /> */}
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
      {error && <p>{error}</p>}
    </form>
  )
}

export default Register;
