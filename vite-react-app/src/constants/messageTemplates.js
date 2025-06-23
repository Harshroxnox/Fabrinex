  const templates = [
    {
      id: 1,
      name: "Welcome New Customers",
      type: "Email",
      category: "Welcome",
      status: "Active",
      lastUpdated: "2023-08-15",
      subject: "Welcome to Our Store!",
      content: "Hello {{customerName}}, welcome to our amazing store...",
      sentCount: 1250,
    },
    {
      id: 2,
      name: "Order Confirmation",
      type: "SMS",
      category: "Order Updates",
      status: "Active",
      lastUpdated: "2023-08-10",
      subject: "",
      content:
        "Your order {{orderId}} has been confirmed. Total: ${{orderTotal}}",
      sentCount: 3420,
    },
    {
      id: 3,
      name: "Promotional Offer",
      type: "Email",
      category: "Promotions",
      status: "Draft",
      lastUpdated: "2023-08-05",
      subject: "50% Off Everything!",
      content: "Hey {{customerName}}, get 50% off on all items...",
      sentCount: 0,
    },
    {
      id: 4,
      name: "Abandoned Cart Reminder",
      type: "Email",
      category: "Abandoned Cart",
      status: "Active",
      lastUpdated: "2023-07-28",
      subject: "Don't forget your items!",
      content:
        "Hi {{customerName}}, you left items worth ${{cartTotal}} in your cart...",
      sentCount: 890,
    },
    {
      id: 5,
      name: "New Product Launch",
      type: "Email",
      category: "Promotions",
      status: "Draft",
      lastUpdated: "2023-07-20",
      subject: "Exciting New Product Launch!",
      content:
        "Dear {{customerName}}, we're excited to announce our new product...",
      sentCount: 0,
    },
  ];

  export default templates;