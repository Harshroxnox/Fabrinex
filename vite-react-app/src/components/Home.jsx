import React from 'react'
import { LineChart, PieChart, BarChart } from 'react-chartkick';
import 'chartkick/chart.js';
import ProductCard from './ProductCard';
import "./Home.css"

const Home = () => {
  return (
    <div className='home'>
      <div className="admin-graphs">
        <h1>Yearly Sales Line Chart</h1>
        <LineChart 
          colors={["#505050", "#222"]}
          curve={false}
          library={{
            elements: {
              point: {
                radius: 5 // 👈 optional: adjust point size
              }
            }
          }}
          download={{background: "#fff"}}
          data={{
            "Jan":12, 
            "Feb":4,
            "Mar":16,
            "Apr":28,
            "May":8,
            "Jun":10,
            "Jul":24,
            "Aug":16,
            "Sep":30,
            "Oct":36,
            "Nov":12,
            "Dec":14
          }}
          height="500px"
          width="1000px"
        />
      </div>
      <div className="admin-graphs">
        <h1>Monthly Sales Line Chart</h1>
        <LineChart 
          colors={["#505050", "#222"]}
          curve={false}
          library={{
            elements: {
              point: {
                radius: 5 // 👈 optional: adjust point size
              }
            }
          }}
          download={{background: "#fff"}}
          data={{
            "May 1": 5,
            "May 3": 3,          
            "May 5": 7,            
            "May 7": 6,            
            "May 9": 4,           
            "May 11": 7,          
            "May 13": 14,          
            "May 15": 13,           
            "May 17": 15,          
            "May 19": 12,           
            "May 21": 11,           
            "May 23": 9,           
            "May 25": 13,
            "May 27": 12,
            "May 29": 10,
            "May 31": 14
          }}
          height="500px"
          width="70vw"
        />
      </div>
      <div className="admin-graphs">
        <h1>Yearly Sales Bar Chart</h1>
        <BarChart 
          colors={["#FFD0C7",  "#E69DB8"]}
          download={{background: "#fff"}}
          data={[
            ["Jan",12], 
            ["Feb",4],
            ["Mar",16],
            ["Apr",28],
            ["May",8],
            ["Jun",10],
            ["Jul",24],
            ["Aug",16],
            ["Sep",30],
            ["Oct",36],
            ["Nov",12],
            ["Dec",14]
          ]}
          height="500px"
          width="1000px"
        />
      </div>
      <div className="admin-graphs">
        <h1>Monthly Sales Bar Chart</h1>
        <BarChart 
          colors={["#FFC1B4", "#F38C79"]}
          download={{background: "#fff"}}
          data={[
            ["May 1", 5],
            ["May 3", 3],          
            ["May 5", 7],            
            ["May 7", 6],            
            ["May 9", 4],           
            ["May 11", 7],          
            ["May 13", 14],          
            ["May 15", 13],           
            ["May 17", 15],          
            ["May 19", 12],           
            ["May 21", 11],           
            ["May 23", 9],           
            ["May 25", 13],
            ["May 27", 12],
            ["May 29", 10],
            ["May 31", 14]
          ]}
          height="500px"
          width="70vw"
        />
      </div>
      <div className="admin-graphs">
        <h1>Product Sales Category Wise</h1>
        <div className="piechart">
          <PieChart 
            donut={true}
            colors={["#ACD3A8","#99BC85", "#FFFECE", "#FFD0C7", "#F1E7E7",  "#E69DB8", "#210F37", "#4F1C51"]}
            download={{background: "#fff"}}
            data={[
              ['tshirt',12],
              ['jeans',7],
              ['shirts',18],
              ['hoodies',6],
              ['jackets',9],
              ['shoes',4]
            ]}
            height="60vh"
            width="35vw"
          />
          <PieChart 
            colors={["#ACD3A8","#99BC85", "#FFFECE", "#FFD0C7", "#F1E7E7",  "#E69DB8", "#210F37", "#4F1C51"]}
            download={{background: "#fff"}}
            data={[
              ['tshirt',12],
              ['jeans',7],
              ['shirts',18],
              ['hoodies',6],
              ['jackets',9],
              ['shoes',4]
            ]}
            height="60vh"
            width="35vw"
          />
        </div>
      </div>
      <div className="hot-products">
        <h1>Hot Selling Products</h1>
        <div className="products-list">
          <ProductCard 
            productID="ProductID"
            name="Name"
            price="Price"
            category="Category"
            rating="Rating"
            unitsSold="Units-Sold"
          />

          <ProductCard 
            productID="1"
            name="Low Hanging Jeans"
            price="999"
            category="Jeans"
            rating="4.8"
            unitsSold="3421"
          />

          <ProductCard 
            productID="2"
            name="Classic White Sneakers"
            price="1999"
            category="Footwear"
            rating="4.5"
            unitsSold="3100"
          />

          <ProductCard 
            productID="3"
            name="Oversized Hoodie"
            price="1499"
            category="Hoodies"
            rating="4.6"
            unitsSold="2200"
          />

          <ProductCard 
            productID="4"
            name="Graphic T-Shirt"
            price="699"
            category="T-Shirts"
            rating="4.3"
            unitsSold="1843"
          />

          <ProductCard 
            productID="5"
            name="Denim Jacket"
            price="2599"
            category="Jackets"
            rating="4.7"
            unitsSold="1258"
          />
        </div>
      </div>
    </div>
  )
}

export default Home