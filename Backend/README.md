# Backend 
Ensure that mysql and redis is properly installed. <br>
Run this command inside the backend folder. This creates the database with all the required tables.<br>
```bash
sudo mysql -u root -p < ./commands.sql
```

To delete the database run this command inside `mysql`<br>
```sql
drop database ecommerce;
```

To install the dependencies of backend run this inside backend folder<br>
```bash
npm install
```

To start the server inside Backend run<br>
```bash
npm start
```

Controller function format of backend<br>
```js
export const controllerFunc = async (req, res) => {
  // ✅ Extract inputs
  const userID = req.userID; // Typically set by auth middleware
  const { name, category } = req.body;
  const { id } = req.params;

  // ✅ Validate inputs
  // check if category is valid
  if (!constants.PRODUCT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`,
    });
  }
  
  try {
    // ✅ Database logic
    const [users] = await db.execute("SELECT name, email, phone_number FROM Users");

    // ✅ Send successful response
    res.status(200).json({
      message: "All users fetched successfully",
      users: users 
    });
  } catch (error) {
    // ✅ Error logging & response
    console.error("Error fetching Users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

