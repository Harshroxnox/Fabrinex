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

  PRODUCT_SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

  PAYMENT_METHODS: [
    'card',
    'upi',
    'net-banking',
    'cash-on-delivery',
  ],

  PAYMENT_NETWORKS: [
    'visa',
    'mastercard',
    'rupay'
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
};