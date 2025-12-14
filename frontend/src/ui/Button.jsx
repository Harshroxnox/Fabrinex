// components/EditButton.jsx
import React from 'react';
import './ButtonStyles.css'; // Import the shared CSS file
import { EditIcon, Trash } from 'lucide-react';

export function EditButton({ onClick }) {
  return (
    <button className='edit-btn' onClick={onClick}>
      <EditIcon color="blue" size={20} />
    </button>
  );
}
export function DeleteButton({onClick}){
    return(
        <button className='delete-icon' onClick={onClick}>
          <Trash color="red" size={20}/>
        </button>
    )
}