export const constants = {
  PRODUCT_CATEGORIES: [
    'tshirt',
    'jeans',
    'shirts',
    'hoodies',
    'jackets',
    'shoes',
    'accessories',
  ],

  PAYMENT_METHODS: [
    'card', 
    'upi', 
    'netbanking', 
    'wallet',
    'cash-on-delivery'
  ],

  PAYMENT_NETWORKS: [
    "Visa",
    "MasterCard",
    "RuPay",
    "Amex",
    "Diners Club",
    "Discover",
    "JCB",
    "Maestro",
    "UnionPay"
  ],

  PAYMENT_STATUSES: ['pending', 'completed', 'failed', 'refunded'],

  ORDER_STATUSES: ['pending', 'shipped', 'delivered', 'cancelled'],

  ADMIN_ROLES: [
    'superadmin',
    'admin',
    'web-editor',
    'inventory-manager',
    'marketing'
  ],

  SHOP_LOCATION: "Noor Store, Jammu",

  MAX_LIMIT: 50
};