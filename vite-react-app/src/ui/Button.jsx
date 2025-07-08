// components/EditButton.jsx
import React from 'react';
import './ButtonStyles.css'; // Import the shared CSS file

export function EditButton({ onClick }) {
  return (
    <button className="edit-button" onClick={onClick}>
      Edit
    </button>
  );
}
export function DeleteButton({onClick}){
    return(
        <button className='delete-button' onClick={onClick}>Delete</button>
    )
}