export const customerData = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@email.in',
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 67890',
    orders: 5,
    totalSpent: '₹18,500',
    customerId: 'CUST001',
    joinedDate: '2023-01-15',
    location: 'Delhi',
    orderHistory: [
      { id: '#A101', date: '2023-02-10', status: 'Completed', total: 5000 },
      { id: '#A102', date: '2023-03-18', status: 'Completed', total: 3200 },
      { id: '#A103', date: '2023-05-02', status: 'Shipped', total: 2700 },
      { id: '#A104', date: '2023-07-11', status: 'Cancelled', total: 3500 },
      { id: '#A105', date: '2023-09-25', status: 'Completed', total: 4100 }
    ],
    supportInteractions: [
      { date: '2023-04-01', subject: 'Late Delivery', status: 'Resolved' },
      { date: '2023-06-15', subject: 'Product Exchange', status: 'Closed' }
    ]
  },
  {
    name: 'Diya Patel',
    email: 'diya.patel@email.in',
    phone: '+91 87654 32109',
    whatsapp: '+91 87654 54321',
    orders: 2,
    totalSpent: '₹7,200',
    customerId: 'CUST002',
    joinedDate: '2023-02-20',
    location: 'Ahmedabad',
    orderHistory: [
      { id: '#D201', date: '2023-03-05', status: 'Completed', total: 3000 },
      { id: '#D202', date: '2023-04-20', status: 'Completed', total: 4200 }
    ],
    supportInteractions: [
      { date: '2023-04-22', subject: 'Size Issue', status: 'Resolved' }
    ]
  },
  {
    name: 'Vivaan Reddy',
    email: 'vivaan.reddy@email.in',
    phone: '+91 99887 66554',
    whatsapp: '+91 99887 55667',
    orders: 8,
    totalSpent: '₹32,000',
    customerId: 'CUST003',
    joinedDate: '2023-03-10',
    location: 'Hyderabad',
    orderHistory: [
      { id: '#V301', date: '2023-03-12', status: 'Completed', total: 4200 },
      { id: '#V302', date: '2023-04-05', status: 'Shipped', total: 5100 },
      { id: '#V303', date: '2023-05-22', status: 'Completed', total: 4000 },
      { id: '#V304', date: '2023-06-14', status: 'Completed', total: 4600 },
      { id: '#V305', date: '2023-07-03', status: 'Cancelled', total: 0 },
      { id: '#V306', date: '2023-08-09', status: 'Completed', total: 4900 },
      { id: '#V307', date: '2023-09-27', status: 'Completed', total: 4200 },
      { id: '#V308', date: '2023-10-10', status: 'Completed', total: 5000 }
    ],
    supportInteractions: [
      { date: '2023-06-01', subject: 'Return Request', status: 'Closed' },
      { date: '2023-08-15', subject: 'Wrong Product', status: 'Resolved' }
    ]
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@email.in',
    phone: '+91 91234 56789',
    whatsapp: '+91 92345 67890',
    orders: 3,
    totalSpent: '₹11,500',
    customerId: 'CUST004',
    joinedDate: '2023-04-05',
    location: 'Chennai',
    orderHistory: [
      { id: '#M401', date: '2023-05-01', status: 'Completed', total: 4000 },
      { id: '#M402', date: '2023-06-18', status: 'Completed', total: 3800 },
      { id: '#M403', date: '2023-07-29', status: 'Shipped', total: 3700 }
    ],
    supportInteractions: [
      { date: '2023-07-05', subject: 'Refund Delay', status: 'Open' }
    ]
  },
  {
    name: 'Krishna Das',
    email: 'krishna.das@email.in',
    phone: '+91 93456 78901',
    whatsapp: '+91 94567 89012',
    orders: 6,
    totalSpent: '₹22,000',
    customerId: 'CUST005',
    joinedDate: '2023-05-12',
    location: 'Kolkata',
    orderHistory: [
      { id: '#K501', date: '2023-06-01', status: 'Completed', total: 3500 },
      { id: '#K502', date: '2023-06-22', status: 'Completed', total: 4200 },
      { id: '#K503', date: '2023-07-15', status: 'Completed', total: 4100 },
      { id: '#K504', date: '2023-08-19', status: 'Completed', total: 3600 },
      { id: '#K505', date: '2023-09-10', status: 'Shipped', total: 3000 },
      { id: '#K506', date: '2023-10-02', status: 'Completed', total: 4600 }
    ],
    supportInteractions: [
      { date: '2023-08-21', subject: 'Order Cancellation', status: 'Closed' }
    ]
  },
 {
    name: 'Anaya Mehta',
    email: 'anaya.mehta@email.in',
    phone: '+91 94567 89012',
    whatsapp: '+91 95678 90123',
    orders: 1,
    totalSpent: '₹3,200',
    customerId: 'CUST006',
    joinedDate: '2023-06-08',
    location: 'Pune',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
    tags: ['New'],
    orderHistory: [
      { id: '#3001', date: '2023-06-10', status: 'Completed', total: 3200 },
    ],
    supportInteractions: [
      { date: '2023-06-12', subject: 'Shipping delay inquiry', status: 'Resolved' },
    ],
  },
  {
    name: 'Yuvraj Singh',
    email: 'yuvraj.singh@email.in',
    phone: '+91 95678 90123',
    whatsapp: '+91 96789 01234',
    orders: 4,
    totalSpent: '₹15,400',
    customerId: 'CUST007',
    joinedDate: '2023-07-22',
    location: 'Lucknow',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    tags: ['Frequent Buyer'],
    orderHistory: [
      { id: '#4001', date: '2023-07-23', status: 'Completed', total: 4200 },
      { id: '#4002', date: '2023-08-10', status: 'Completed', total: 3900 },
      { id: '#4003', date: '2023-09-01', status: 'Shipped', total: 4800 },
      { id: '#4004', date: '2023-10-15', status: 'Completed', total: 2500 },
    ],
    supportInteractions: [
      { date: '2023-08-12', subject: 'Order status query', status: 'Closed' },
    ],
  },
  {
    name: 'Ishita Nair',
    email: 'ishita.nair@email.in',
    phone: '+91 96789 01234',
    whatsapp: '+91 97890 12345',
    orders: 7,
    totalSpent: '₹27,800',
    customerId: 'CUST008',
    joinedDate: '2023-08-14',
    location: 'Bengaluru',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    tags: ['Loyal', 'High Value'],
    orderHistory: [
      { id: '#5001', date: '2023-08-15', status: 'Completed', total: 3500 },
      { id: '#5002', date: '2023-08-28', status: 'Completed', total: 4000 },
      { id: '#5003', date: '2023-09-10', status: 'Completed', total: 3800 },
      { id: '#5004', date: '2023-10-01', status: 'Completed', total: 4100 },
      { id: '#5005', date: '2023-10-18', status: 'Shipped', total: 3000 },
      { id: '#5006', date: '2023-11-02', status: 'Completed', total: 4400 },
      { id: '#5007', date: '2023-11-15', status: 'Completed', total: 4000 },
    ],
    supportInteractions: [
      { date: '2023-09-15', subject: 'Wrong product delivered', status: 'Resolved' },
      { date: '2023-11-03', subject: 'Bulk order inquiry', status: 'Open' },
    ],
  },
  {
    name: 'Kabir Joshi',
    email: 'kabir.joshi@email.in',
    phone: '+91 97890 12345',
    whatsapp: '+91 98901 23456',
    orders: 2,
    totalSpent: '₹8,000',
    customerId: 'CUST009',
    joinedDate: '2023-09-03',
    location: 'Jaipur',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    tags: ['Returning'],
    orderHistory: [
      { id: '#6001', date: '2023-09-05', status: 'Completed', total: 4000 },
      { id: '#6002', date: '2023-09-25', status: 'Completed', total: 4000 },
    ],
    supportInteractions: [
      { date: '2023-09-26', subject: 'Return request', status: 'Closed' },
    ],
  },
  {
    name: 'Tanya Verma',
    email: 'tanya.verma@email.in',
    phone: '+91 98901 23456',
    whatsapp: '+91 99012 34567',
    orders: 5,
    totalSpent: '₹19,750',
    customerId: 'CUST010',
    joinedDate: '2023-10-18',
    location: 'Bhopal',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    tags: ['VIP', 'Engaged'],
    orderHistory: [
      { id: '#7001', date: '2023-10-20', status: 'Completed', total: 5000 },
      { id: '#7002', date: '2023-10-30', status: 'Completed', total: 4000 },
      { id: '#7003', date: '2023-11-15', status: 'Completed', total: 4750 },
      { id: '#7004', date: '2023-11-28', status: 'Shipped', total: 3000 },
      { id: '#7005', date: '2023-12-05', status: 'Completed', total: 3000 },
    ],
    supportInteractions: [
      { date: '2023-11-01', subject: 'Gift wrap request', status: 'Resolved' },
    ],
  },
];