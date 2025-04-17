import React from 'react'
import "./ProductCard.css"

const ProductCard = ({productID, name, price, category, rating, unitsSold}) => {
  return (
    <div className='product-card'>
        <div className='product-attr'>{productID}</div>
        <div className='product-attr'>{name}</div>
        <div className='product-attr'>{price}</div>
        <div className='product-attr'>{category}</div>
        <div className='product-attr'>{rating}</div>
        <div className='product-attr'>{unitsSold}</div>
    </div>
  )
}

export default ProductCard