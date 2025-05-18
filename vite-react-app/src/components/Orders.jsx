import React from 'react'
import "./Home.css"
import "./Orders.css"

const Orders = () => {
  return (
    <div className='home'>
      <div className="hot-products card">
        <h1>Hot Selling Products</h1>
        <h2>A list of your most selling products.</h2>
        <div className="products-list">
          <table className='admin-table'>
            <thead>
              <tr className='first-row'>
                <th className='name-col'>Name</th>
                <th className='category-col'>Category</th>
                <th className='sales-col'>Sales</th>
                <th className='rating-col'>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Women's Embroidered Suit</td>
                <td>Suit</td>
                <td>42</td>
                <td>4.5</td>
              </tr>
              <tr>
                <td>Floral Print Maxi Dress</td>
                <td>Dress</td>
                <td>67</td>
                <td>4.7</td>
              </tr>
              <tr>
                <td>High-Waisted Jeggings</td>
                <td>Jeans</td>
                <td>82</td>
                <td>4.4</td>
              </tr>
              <tr>
                <td>Chiffon Anarkali Kurti</td>
                <td>Kurti</td>
                <td>38</td>
                <td>4.6</td>
              </tr>
              <tr>
                <td>Pastel Cotton Saree</td>
                <td>Saree</td>
                <td>51</td>
                <td>4.8</td>
              </tr>
              <tr>
                <td>Lace Blouse Top</td>
                <td>Top</td>
                <td>73</td>
                <td>4.3</td>
              </tr>
              <tr>
                <td>Woolen Winter Jacket</td>
                <td>Jacket</td>
                <td>22</td>
                <td>4.2</td>
              </tr>
              <tr className='last-row'>
                <td>Georgette Palazzo Set</td>
                <td>Palazzo</td>
                <td>34</td>
                <td>4.6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      

    </div>
  )
}

export default Orders