export const ordersData = [
    {
      id: '#1001',
      customer: 'Dr Tayyab Khan',
      customerId: 'CID-001',
      date: '2023-01-15',
      status: 'Shipped',
      total: 150,
      location: 'New York',
      paymentInfo: 'UPI ID: user123',
      paymentMethod: 'UPI',
      paymentStatus: 'Success',
      tracking: [
        { location: 'Warehouse A', date: '2023-01-15', status: 'Processed' },
        { location: 'Shipping Center', date: '2023-01-16', status: 'In Transit' },
        { location: 'New York Hub', date: '2023-01-17', status: 'Out for Delivery' }
      ],
      items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
      ],
      billedBy: 'salesperson'
    },
    {
      id: '#1002',
      customer: 'Akshat Patel',
      customerId: 'CID-002',
      date: '2023-01-16',
      status: 'Delivered',
      total: 200,
      location: 'kolkata',
      paymentInfo: 'UPI Method: App X',
      paymentMethod: 'UPI',
      paymentStatus: 'Success',
      tracking: [
        { location: 'Warehouse B', date: '2023-01-16', status: 'Processed' },
        { location: 'Shipping Center', date: '2023-01-17', status: 'In Transit' },
        { location: 'Los Angeles Hub', date: '2023-01-18', status: 'Delivered' }
      ],
      items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
        ],
      billedBy: 'salesperson'

    },
    {
      id: '#1003',
      customer: 'Dhruv kumar',
      customerId: 'CID-003',
      date: '2023-01-17',
      status: 'Pending',
      total: 100,
      location:'NOIDA',
      paymentInfo: 'COD',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      tracking: [
        { location: 'Warehouse A', date: '2023-01-17', status: 'Processing' }
      ],
      items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
      ],
      billedBy: 'salesperson'

    },
    ,
    {
      id: '#1004',
      customer: 'Virat Kohli',
      customerId: 'CID-003',
      date: '2023-01-17',
      status: 'Pending',
      total: 100,
      location: 'Chinnaswamy Stadium',
      paymentInfo: 'COD',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      tracking: [
        { location: 'Warehouse A', date: '2023-01-17', status: 'Processing' }
      ],
      items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
      ],
      billedBy: 'salesperson'

    },
    {
      id: '#1005',
      customer: 'Rohit Sharma',
      customerId: 'CID-003',
      date: '2023-01-17',
      status: 'Pending',
      total: 100,
      location: 'Panvel',
      paymentInfo: 'COD',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      tracking: [
        { location: 'Warehouse A', date: '2023-01-17', status: 'Processing' }
      ],
      items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
      ],
      billedBy: 'salesperson'

    },
    {
        id: "12345",
        date: "2023-10-01",
        customer: "John Doe",
        customerEmail: "    ",
        customerAddress: "123 Main St, Anytown, USA",
        items: [
          { name: "Product 1", qty: 2, price: 500 },
          { name: "Product 2", qty: 1, price: 300 }
        ],
        total: 1300,
        location: 'Bulandshahr',
        paymentMethod: "Credit Card",
        paymentStatus: "Success",
        tracking: [
        { location: 'Warehouse A', date: '2023-01-17', status: 'Processing' }
        ],
        items: [
          { name: "Product 1",description: "Product 1 description", qty: 2, price: 500 },
          { name: "Product 2",description: "Product 2 description", qty: 1, price: 300 }
      ],
      billedBy: 'salesperson'

    }
    // ... (other orders with similar structure)
  ];