import React from 'react'
import { LineChart, PieChart, BarChart } from 'react-chartkick';
import 'chartkick/chart.js';
import ProductCard from '../ProductCard';
import "./Home.css"

const Home = () => {
  const piechartColors = ["#ACD3A8","#99BC85", "#FFFECE", "#FFD0C7", "#F1E7E7",  "#E69DB8"];
  const piechartData = [
    ['tshirt', "654"],
    ['jeans', "789"],
    ['shirts', "582"],
    ['sarees', "682"],
    ['jackets', "267"],
    ['suits', "453"]
  ];

  return (
    <div className='home'>

      {/* ------------------------------------1st row------------------------------------------------- */}
      <div className="row-graphs">
        <div className="text-card">
          <h1>Total Revenue</h1>
          <h2>₹1,08,321.89</h2>
          <h3>+18.2% from last year</h3>
        </div>
        <div className="text-card">
          <h1>Sales</h1>
          <h2>+12,234</h2>
          <h3>+19% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Transactions</h1>
          <h2>5,234</h2>
          <h3>+38% from last month</h3>
        </div>
        <div className="text-card">
          <h1>Customers</h1>
          <h2>65,345</h2>
          <h3>+109.3% from last month</h3>
        </div>
      </div>

      {/* ------------------------------------2nd row------------------------------------------------- */}
      <div className="row-graphs">
        <div className="admin-graphs">
          <h1>Yearly Sales</h1>
          <h2>21,349</h2>
          <h3>+20.1% from last year</h3>
          <LineChart 
            colors={[ "#373F4C"]}
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
            height="23vh"
            width="25vw"
          />
        </div>
        <div className="admin-graphs">
          <h1>Monthly Sales</h1>
          <h2>4,512</h2>
          <h3>+8.1% from last month</h3>
          <LineChart 
            colors={["#373F4C"]}
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
            height="23vh"
            width="45vw"
          />
        </div>
      </div>
      
      {/* ------------------------------------3rd row------------------------------------------------- */}
      <div className="row-graphs">
        <div className="admin-graphs">
          <h1>Yearly Sales - Type: Bar Chart</h1>
          <h2>7,328</h2>
          <h3>+18.1% from last month</h3>
          <BarChart 
            colors={["#547792",  "#94B4C1"]}
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
            height="25vh"
            width="30vw"
          />
        </div>
        <div className="admin-graphs">
          <h1>Monthly Sales - Type: Bar Chart</h1>
          <h2>2,342</h2>
          <h3>+18.1% from last month</h3>
          <BarChart 
            colors={["#6ba1a9", "#547792"]}
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
            height="25vh"
            width="40vw"
          />
        </div>
      </div>
      {/* -------------------------------------4th-row------------------------------------------------------ */}
      <div className="admin-graphs">
        <h1>Product Sales Category Wise</h1>
        <h3 className='piechart-title'>Graph Type: Donut Chart</h3>
        <div className="piechart">
          <PieChart 
            donut={true}
            colors={piechartColors}
            download={{background: "#fff"}}
            data={piechartData}
            height="55vh"
            width="35vw"
          />
          <div className="piechart-text">
            {
              piechartData.map(([label, value], index)=>{
                return (           
                  <div className="piechart-row">
                    <div className="piechart-color" style={{backgroundColor: piechartColors[index]}}></div>
                    <div className="piechart-label">{`${label}:`}</div>
                    <div className="piechart-value">{value}</div>
                  </div>
                );
              })
            }
          </div>

        </div>
      </div>

      {/* ---------------------------------------------5th-row----------------------------------------- */}
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
                <td>89</td>
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

export default Home