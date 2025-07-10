CREATE DATABASE ecommerce;
USE ecommerce;

/* 
To Create a root user with all priveleges-------------------------------------------------------
CREATE USER 'root'@'localhost' IDENTIFIED BY 'mysql';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mysql';
FLUSH PRIVILEGES;

See all users with plugins----------------------------------------------------------------------
SELECT user, host, plugin FROM mysql.user;

To Clear the database---------------------------------------------------------------------------
drop database ecommerce;

To Clear Data from tables-----------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Users;
TRUNCATE TABLE table2;

SET FOREIGN_KEY_CHECKS = 1;


To Create Sample Order UserID 1, AddressID 1 and variantID 1 of OrderID 1-----------------------
INSERT INTO Orders (
    userID, addressID, payment_method, payment_status, order_location, order_status, barcode
) VALUES (
    1,               -- userID
    1,               -- addressID
    'Credit Card',   -- payment_method
    'Paid',          -- payment_status
    'Warehouse A',   -- order_location
    'Processing',    -- order_status
    '1234567890123'  -- barcode (unique EAN-13)
);

INSERT INTO OrderItems (
    orderID, productVariantID, quantity, price_at_purchase
) VALUES (
    1, 
    1, 
    2, 
    499.00
);
*/

CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    whatsapp_number VARCHAR(15) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_img VARCHAR(500),
    razorpay_customer_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE AdminUsers (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);

-- Roles are hardcoded into config/constants.js whereas what admin has what role is stored here
CREATE TABLE AdminRoles (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    adminID INT NOT NULL,
    role_name VARCHAR(40) NOT NULL,
    FOREIGN KEY (adminID) REFERENCES AdminUsers(adminID) ON DELETE CASCADE
);

CREATE TABLE Products (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description JSON,
    category VARCHAR(50) NOT NULL,
    cumulative_rating DECIMAL(10,2) DEFAULT 0.00,
    people_rated INT DEFAULT 0 CHECK (people_rated >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ProductVariants (
    variantID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    main_image VARCHAR(255) NOT NULL,
    cloudinary_id VARCHAR(255) NOT NULL,
    barcode CHAR(13) UNIQUE NOT NULL, -- EAN-13 format
    discount DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0 AND discount < 100),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    productID INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review VARCHAR(750) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE
);

CREATE TABLE Addresses (
    addressID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address_line TEXT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE Orders (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    addressID INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    order_location VARCHAR(255) NOT NULL,
    order_status VARCHAR(40) NOT NULL DEFAULT 'pending',
    promo_discount DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (promo_discount >= 0 AND promo_discount < 100),
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (addressID) REFERENCES Addresses(addressID)
);

CREATE TABLE OrderItems (
    orderItemID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT NOT NULL,
    variantID INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase > 0),
    FOREIGN KEY (orderID) REFERENCES Orders(orderID) ON DELETE CASCADE,
    FOREIGN KEY (variantID) REFERENCES ProductVariants(variantID) ON DELETE RESTRICT
);

CREATE TABLE Promotions (
    promotionID INT AUTO_INCREMENT PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE NOT NULL,
    discount INT NOT NULL CHECK (discount > 0 AND discount <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_per_user INT NOT NULL DEFAULT 1 CHECK (usage_per_user >= 1),
    min_order_price DECIMAL(10, 2) DEFAULT 0.00 CHECK (min_order_price >= 0),
    max_discount DECIMAL(10, 2) DEFAULT 0.00 CHECK (max_discount >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE PromotionUsage (
    userID INT NOT NULL,
    promotionID INT NOT NULL,
    times_used INT NOT NULL DEFAULT 1 CHECK (times_used >= 1),
    PRIMARY KEY (userID, promotionID),
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (promotionID) REFERENCES Promotions(promotionID)
);


CREATE TABLE Transactions (
    transactionID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT UNIQUE NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
);

CREATE TABLE Cards (
    cardID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    last4_card_no CHAR(4) NOT NULL,
    expiration CHAR(7) NOT NULL,  -- YYYY-MM format ex 2027-09
    payment_network VARCHAR(40) NOT NULL,
    razorpay_token VARCHAR(255) NOT NULL,  -- Store a secure token from payment gateway
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE CartItems (
    cartItemID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    variantID INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (variantID) REFERENCES ProductVariants(variantID) ON DELETE CASCADE
);

CREATE TABLE VariantImages (
    variantImageID INT AUTO_INCREMENT PRIMARY KEY,
    variantID INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    cloudinary_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (variantID) REFERENCES ProductVariants(variantID) ON DELETE CASCADE
);

CREATE TABLE MainBanners (
  bannerID INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  redirect_url VARCHAR(700),
  priority INT NOT NULL UNIQUE CHECK (priority >= 0),  
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE SideBanners (
  bannerID INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  redirect_url VARCHAR(700),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
