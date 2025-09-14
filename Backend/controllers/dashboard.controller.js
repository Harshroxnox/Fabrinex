import { db } from '../index.js';

const percentChange = (curr, prev) => {
  let percentChange;
  if (prev === 0){
    percentChange = curr > 0 ? 100 : 0;
  } else {
    percentChange = ((curr - prev) / prev) * 100;
  }

  return percentChange;
}

export const getMetrics = async (req, res, next) => {
  try {
    let result = {};

    const [monthRev] = await db.execute(`
      SELECT COALESCE(SUM(amount), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    const [prevMonthRev] = await db.execute(`
      SELECT COALESCE(SUM(amount), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);

    const monthRevChange = percentChange(parseFloat(monthRev[0].amt), parseFloat(prevMonthRev[0].amt));

    const [monthSales] = await db.execute(`
      SELECT COUNT(*) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    const [prevMonthSales] = await db.execute(`
      SELECT COUNT(*) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);

    const monthSalesChange = percentChange(parseFloat(monthSales[0].amt), parseFloat(prevMonthSales[0].amt));

    const [monthSalesChart] = await db.execute(`
      SELECT 
        DAY(created_at) AS day,
        COUNT(*) AS sales
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
      GROUP BY DAY(created_at)
      ORDER BY day;
    `);

    const [yearSales] = await db.execute(`
      SELECT COUNT(*) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    const [prevYearSales] = await db.execute(`
      SELECT COUNT(*) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);

    const yearSalesChange = percentChange(parseFloat(yearSales[0].amt), parseFloat(prevYearSales[0].amt));    

    const [yearSalesChart] = await db.execute(`
      SELECT 
        MONTH(created_at) AS month_num,
        MONTHNAME(created_at) AS month_name,
        COUNT(*) AS sales_count
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY month_num;
    `);

    const [monthProfit] = await db.execute(`
      SELECT COALESCE(SUM(profit), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    const [prevMonthProfit] = await db.execute(`
      SELECT COALESCE(SUM(profit), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);

    const monthProfitChange = percentChange(parseFloat(monthProfit[0].amt), parseFloat(prevMonthProfit[0].amt)); 

    const [monthTax] = await db.execute(`
      SELECT COALESCE(SUM(tax), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    const [prevMonthTax] = await db.execute(`
      SELECT COALESCE(SUM(tax), 0) AS amt
      FROM Orders
      WHERE YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `);

    const monthTaxChange = percentChange(parseFloat(monthTax[0].amt), parseFloat(prevMonthTax[0].amt)); 

    const [noUsers] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS now,
        (SELECT COUNT(*) FROM Users 
        WHERE created_at < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')) AS last_month
    `);

    const userMonthGrowth = percentChange(parseInt(noUsers[0].now, 10), parseInt(noUsers[0].last_month, 10));
    
    const [productSalesCategory] = await db.execute(`
      SELECT 
        oi.category,
        SUM(oi.quantity) AS total_units_sold,
        SUM(oi.quantity * oi.price_at_purchase) AS total_sales
      FROM OrderItems oi
      JOIN Orders o ON oi.orderID = o.orderID
      WHERE o.order_status NOT IN ('cancelled', 'failed') -- exclude invalid orders
      GROUP BY oi.category
      ORDER BY total_sales DESC
    `);

    const [hotSellingProducts] = await db.execute(`
      SELECT 
        oi.name AS product_name,
        SUM(oi.quantity) AS total_units_sold,
        SUM(oi.quantity * oi.price_at_purchase) AS total_sales
      FROM OrderItems oi
      JOIN Orders o ON oi.orderID = o.orderID
      WHERE o.order_status NOT IN ('cancelled', 'failed')
      GROUP BY oi.name
      ORDER BY total_units_sold DESC
      LIMIT 8;
    `);

    const [lowStockVariants] = await db.execute(`
      SELECT 
        pv.variantID,
        p.name AS product_name,
        pv.color,
        pv.size,
        pv.stock
      FROM ProductVariants pv
      JOIN Products p ON pv.productID = p.productID
      WHERE pv.is_active = TRUE
      ORDER BY pv.stock ASC
      LIMIT 10;
    `);

    result.monthRev = parseFloat(monthRev[0].amt);
    result.monthRevChange = monthRevChange;
    result.monthSales = parseFloat(monthSales[0].amt);
    result.monthSalesChange = monthSalesChange;
    result.monthSalesChart = monthSalesChart;
    result.yearSales = parseFloat(yearSales[0].amt);
    result.yearSalesChange = yearSalesChange;
    result.yearSalesChart = yearSalesChart;
    result.monthProfit = parseFloat(monthProfit[0].amt);
    result.monthProfitChange = monthProfitChange;
    result.monthTax = parseFloat(monthTax[0].amt);
    result.monthTaxChange = monthTaxChange;
    result.noUsers = parseInt(noUsers[0].now, 10);
    result.userMonthGrowth = userMonthGrowth;
    result.productSalesCategory = productSalesCategory;
    result.hotSellingProducts = hotSellingProducts;
    result.lowStockVariants = lowStockVariants;

    return res.status(200).json({ 
      message: "Metrics calculated successfully", 
      result 
    });    

  } catch (error) {
    next(error);
  }
};