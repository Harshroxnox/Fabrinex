import { db } from '../index.js';

const percentChange = (curr, prev) => {
  // Sanitize inputs: Ensure they are valid numbers, defaulting to 0 if not.
  const current = Number(curr);
  const previous = Number(prev);

  // Check for non-numeric or invalid inputs after conversion
  if (isNaN(current) || isNaN(previous)) {
    return 0;
  }

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  const change = ((current - previous) / previous) * 100;

  // Final check to prevent returning Infinity or NaN
  return isFinite(change) ? change : 0;
};
export const getMetricss = async (req, res, next) => {
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

export const getMetrics = async (req, res, next) => {
  try {
    const result = {};

    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

    const prevMonthDate = new Date(year, month - 1, 1);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevYear = year - 1;

    const [currentMonthMetricsArr] = await db.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COUNT(*) AS salesCount,
        COALESCE(SUM(profit), 0) AS totalProfit,
        COALESCE(SUM(tax), 0) AS totalTax
      FROM Orders
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND is_deleted = 0
    `, [year, month]);
    const currentMonthMetrics = currentMonthMetricsArr[0];

    const [prevMonthMetricsArr] = await db.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COUNT(*) AS salesCount,
        COALESCE(SUM(profit), 0) AS totalProfit,
        COALESCE(SUM(tax), 0) AS totalTax
      FROM Orders
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND is_deleted =  0
    `, [prevMonthYear, prevMonth]);
    const prevMonthMetrics = prevMonthMetricsArr[0];

    const [currentYearMetricsArr] = await db.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COUNT(*) AS salesCount
      FROM Orders
      WHERE YEAR(created_at) = ? AND is_deleted = 0
    `, [year]);
    const currentYearMetrics = currentYearMetricsArr[0];

    const [prevYearMetricsArr] = await db.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalRevenue,
        COUNT(*) AS salesCount
      FROM Orders
      WHERE YEAR(created_at) = ? AND is_deleted = 0
    `, [prevYear]);
    const prevYearMetrics = prevYearMetricsArr[0];

    const [monthSalesChart] = await db.execute(`
      SELECT 
        DAY(created_at) AS day,
        COUNT(*) AS sales_count,
        COALESCE(SUM(amount), 0) AS total_earnings
      FROM Orders
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ? AND is_deleted = 0
      GROUP BY DAY(created_at)
      ORDER BY day;
    `, [year, month]);

    const [yearSalesChart] = await db.execute(`
      SELECT 
        MONTH(created_at) AS month_num,
        MONTHNAME(created_at) AS month_name,
        COUNT(*) AS sales_count,
        COALESCE(SUM(amount), 0) AS total_earnings
      FROM Orders
      WHERE YEAR(created_at) = ? AND is_deleted = 0
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY month_num;
    `, [year]);

    const firstDayOfSelectedMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const [noUsers] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS now,
        (SELECT COUNT(*) FROM Users WHERE created_at < ?) AS before_period
    `, [firstDayOfSelectedMonth]);

    const [productSalesCategory] = await db.execute(`
      SELECT 
        oi.category,
        SUM(oi.quantity) AS total_units_sold,
        SUM(oi.quantity * oi.price_at_purchase) AS total_sales
      FROM OrderItems oi
      JOIN Orders o ON oi.orderID = o.orderID
      WHERE o.order_status NOT IN ('cancelled', 'failed') AND o.is_deleted = 0
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
      WHERE o.order_status NOT IN ('cancelled', 'failed') AND o.is_deleted = 0
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

    const [monthlyPayments] = await db.execute(`
      SELECT
        op.type,
        COALESCE(SUM(op.amount), 0) AS total_amount
      FROM OrderPayments op
      JOIN Orders o ON op.orderID = o.orderID
      WHERE YEAR(o.created_at) = ?
        AND MONTH(o.created_at) = ? AND o.is_deleted = 0
      GROUP BY op.type
    `, [year, month]);

    const paymentSummary = {
      cash: 0,
      online: 0
    };

    monthlyPayments.forEach(p => {
      paymentSummary[p.type] = parseFloat(p.total_amount);
    });


    result.monthlySummary = {
      revenue: parseFloat(currentMonthMetrics.totalRevenue),
      revenueChange: percentChange(currentMonthMetrics.totalRevenue, prevMonthMetrics.totalRevenue),
      salesCount: parseInt(currentMonthMetrics.salesCount, 10),
      salesCountChange: percentChange(currentMonthMetrics.salesCount, prevMonthMetrics.salesCount),
      profit: parseFloat(currentMonthMetrics.totalProfit),
      profitChange: percentChange(currentMonthMetrics.totalProfit, prevMonthMetrics.totalProfit),
      tax: parseFloat(currentMonthMetrics.totalTax),
      taxChange: percentChange(currentMonthMetrics.totalTax, prevMonthMetrics.totalTax),
      paymentBreakdown: paymentSummary,
      chartData: monthSalesChart,

    };

    const [paymentMetrics] = await db.execute(`
      SELECT
        op.type,
        SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE() THEN op.amount ELSE 0 END) AS today_amount,
        SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE() - INTERVAL 1 DAY THEN op.amount ELSE 0 END) AS yesterday_amount
      FROM OrderPayments op
      JOIN Orders o ON op.orderID = o.orderID
      WHERE DATE(o.created_at) >= CURRENT_DATE() - INTERVAL 1 DAY AND o.is_deleted = 0
      GROUP BY op.type
    `);

    const todayPaymentSummary = {
      cash: { today: 0, yesterday: 0 },
      online: { today: 0, yesterday: 0 }
    };

    paymentMetrics.forEach(p => {
      todayPaymentSummary[p.type] = {
        today: parseFloat(p.today_amount),
        yesterday: parseFloat(p.yesterday_amount)
      };
    });

    result.paymentSummary = todayPaymentSummary;

    result.yearlySummary = {
      revenue: parseFloat(currentYearMetrics.totalRevenue),
      revenueChange: percentChange(currentYearMetrics.totalRevenue, prevYearMetrics.totalRevenue),
      salesCount: parseInt(currentYearMetrics.salesCount, 10),
      salesCountChange: percentChange(currentYearMetrics.salesCount, prevYearMetrics.salesCount),
      chartData: yearSalesChart,
    };

    result.userSummary = {
      totalUsers: parseInt(noUsers[0].now, 10),
      periodGrowth: percentChange(noUsers[0].now, noUsers[0].before_period),
    };
    
    result.productSummary = {
      salesByCategory: productSalesCategory,
      hotSelling: hotSellingProducts,
      lowStock: lowStockVariants,
    };

    return res.status(200).json({
      message: "Metrics calculated successfully",
      result
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get metrics for the current day compared to the previous day.
 */
export const getTodaysMetrics = async (req, res, next) => {
  try {
    const [[metrics]] = await db.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE() THEN amount ELSE 0 END), 0) AS todaysRevenue,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE() THEN orderID END) AS todaysSales,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE() - INTERVAL 1 DAY THEN amount ELSE 0 END), 0) AS yesterdaysRevenue,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE() - INTERVAL 1 DAY THEN orderID END) AS yesterdaysSales
      FROM Orders
      WHERE DATE(created_at) >= CURRENT_DATE() - INTERVAL 1 DAY AND is_deleted = 0
    `);

    const result = {
      todaysRevenue: parseFloat(metrics.todaysRevenue),
      todaysSales: parseInt(metrics.todaysSales, 10),
      revenueChange: percentChange(metrics.todaysRevenue, metrics.yesterdaysRevenue),
      salesChange: percentChange(metrics.todaysSales, metrics.yesterdaysSales),
    };

    return res.status(200).json({
      message: "Today's metrics calculated successfully",
      result
    });

  } catch (error) {
    next(error);
  }
};
export const getBestSellingPricePerVariant = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.variantID, 
       p.name, 
       v.size, 
       v.color, 
       t.price_at_purchase, 
       t.total_sold
      FROM (
          SELECT 
              variantID,
              price_at_purchase,
              SUM(quantity) AS total_sold,
              ROW_NUMBER() OVER (PARTITION BY variantID ORDER BY SUM(quantity) DESC) AS rn
          FROM OrderItems
          GROUP BY variantID, price_at_purchase
      ) t
      JOIN ProductVariants v ON v.variantID = t.variantID
      JOIN Products p ON p.productID = v.productID
      WHERE t.rn = 1;
    `);
    res.status(200).json({
      message: "Best selling price per variant fetched successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}