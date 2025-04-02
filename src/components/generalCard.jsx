import React from 'react';
import gym from '../assets/gym.png';
import casual from '../assets/casual.png';
import formal from '../assets/formal.png';
import party from '../assets/party.png';
const DressStyleCategories = () => {
  const categories = [
    {
      name: "Casual",
      image: {casual},
    },
    {
      name: "Formal",
      image: "/images/formal-style.jpg",
    },
    {
      name: "Party",
      image: "/images/party-style.jpg",
      isWide: true
    },
    {
      name: "Gym",
      image: "/images/gym-style.jpg",
    }
  ];

  return (
    <div className="bg-gray-200 rounded-3xl p-8 w-full max-w-6xl mx-auto mb-4">
      <h2 className="text-4xl font-black text-center mb-8">BROWSE BY DRESS STYLE</h2>
      <div>
        <div className='flex '>
            <img src={casual} alt="Formal Style" className=' bg-gray-400 w-[30%] rounded-[14px] h-[280px]' />
            <img src={formal} alt="Casual Style" className=' ml-3 bg-gray-400 w-[70%] rounded-[14px] h-[280px]'/>
        </div>
        <div className='flex mt-3 '>
            <img src={party} alt="Casual Style" className=' bg-gray-400 w-[70%] rounded-[14px] h-[280px]'/>
            <img src={gym} alt="Formal Style" className='ml-3 bg-gray-400 w-[30%] rounded-[14px] h-[280px]' />
        </div>
      </div>
    </div>
  );
};

export default DressStyleCategories;