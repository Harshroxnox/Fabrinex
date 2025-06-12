CREATE DATABASE ecommerce;
USE ecommerce;

/* To Clear Data from tables
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Users;
TRUNCATE TABLE table2;

SET FOREIGN_KEY_CHECKS = 1;
*/

CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    whatsapp_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_img VARCHAR(500),
    razorpay_customer_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);

CREATE TABLE AdminUsers (
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT
);

-- Roles are hardcoded into config/constants.js whereas what admin has what role is stored here
CREATE TABLE AdminRoles (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    adminID INT NOT NULL,
    role_name VARCHAR(15) NOT NULL,
    FOREIGN KEY (adminID) REFERENCES AdminUsers(adminID) ON DELETE CASCADE
);

CREATE TABLE Products (
    productID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description JSON,
    category VARCHAR(50) NOT NULL,
    cumulative_rating DECIMAL(10,2) DEFAULT 0.00,
    people_rated INT DEFAULT 0
);

CREATE TABLE ProductVariants (
    variantID INT AUTO_INCREMENT PRIMARY KEY,
    productID INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    main_image VARCHAR(255) NOT NULL,
    barcode CHAR(13) UNIQUE, -- EAN-13 format
    discount DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    productID INT NOT NULL,
    rating DECIMAL(3,2) NOT NULL,
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
    payment_status VARCHAR(20) NOT NULL, 
    order_location VARCHAR(255) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    barcode CHAR(13) UNIQUE, -- EAN-13 format
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (addressID) REFERENCES Addresses(addressID)
);

CREATE TABLE OrderItems (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT NOT NULL,
    productVariantID INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (orderID) REFERENCES Orders(orderID) ON DELETE CASCADE,
    FOREIGN KEY (productVariantID) REFERENCES ProductVariants(variantID) ON DELETE RESTRICT
);

CREATE TABLE Promotions (
    promotionID INT AUTO_INCREMENT PRIMARY KEY,
    promotion_code VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Transactions (
    transactionID INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT UNIQUE NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderID) REFERENCES Orders(orderID)
);

CREATE TABLE Payments (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    last4_card_no CHAR(4) NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    expiration CHAR(7) NOT NULL,  -- YYYY-MM format ex 2027-09
    payment_network VARCHAR(20) NOT NULL,
    razorpay_token VARCHAR(255) NOT NULL,  -- Store a secure token from payment gateway
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

CREATE TABLE Carts (
    cartID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    variantID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (variantID) REFERENCES ProductVariants(variantID) ON DELETE CASCADE
);

CREATE TABLE ProductImages (
    productImageID INT AUTO_INCREMENT PRIMARY KEY,
    variantID INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (variantID) REFERENCES ProductVariants(variantID) ON DELETE CASCADE
);

CREATE TABLE MessageTemplates (
    messageTemplateID INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL
);

