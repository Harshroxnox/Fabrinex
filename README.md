# E-Commerce
## NodeJS Backend
We have developed many CRUD (Create, read, update, delete) routes for `Product`, `Product-Variants`, `Users`, `Admin-Users`, `Orders`, `Promotions` etc.
The features of this `Nodejs` `Express` backend application are listed below:-
- Custom validation functions in `utils/validators.utils.js` for name, product name, email, password and checking categorical values with `config/constants.js`.
- `JWT Authentication` with `token blacklisting` where we set accessToken and refreshToken cookies and refreshToken cannot be accessed through javascript.
- Using `Winston` logger for logging with different logging levels and export to file with log rotation. Also implemented request logger middleware which makes the use of winston.
- `Centralized Error handling` with error middleware which logs the errors according to the status code. Also implemented custom `AppError` by extending the error class.
- Implemented `MySQL` `Transactions` where there are multiple consecutive write operations with commit and rollback features to maintain database consistency.
- Implemented `Role Based Authentication` system for Admin routes/users using Role authentication middleware. This is for admin routes only.
- Using `Cloudinary` for handling images. Usage of UploadCloudinary and DeleteCloudinary helper functions.
- Using `Razorpay` for handling the payment system with it user can pay through Net Banking, Credit/Debit card, UPI, EMI, Pay later etc. Usage of webhooks in razorpay.

## Admin Panel
To start run the following commands:
```bash
git clone https://github.com/Harshroxnox/E-Commerce.git
```
```bash
cd E-Commerce/vite-react-app
```
```bash
npm install
```
```bash
npm run dev
```


## Built using: 
- `Nodejs v20.15.1`
- `Vite`
- `React`
