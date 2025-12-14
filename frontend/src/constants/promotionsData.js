import summerSale from '../assets/summerSale.jpg';
import welcomeSale from '../assets/welcomeSale.jpg';
import holidaySale from '../assets/holidaySale.jpg';

const promotionsData=[
    {
      id: 1,
      code: 'SUMMER20',
      discount: 20,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      description: 'Summer season discount for all products',
      usageLimit: 1000,
      usedCount: 156,
      promotionImage: summerSale
    },
    {
      id: 2,
      code: 'WELCOME10',
      discount: 10,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      description: 'Welcome discount for new customers',
      usageLimit: 500,
      usedCount: 89,
    promotionImage: welcomeSale
    },
    {
      id: 3,
      code: 'HOLIDAY15',
      discount: 15,
      discountType: 'percentage',
      status: 'Inactive',
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      description: 'Holiday season special discount',
      usageLimit: 2000,
      usedCount: 0,
      promotionImage: holidaySale
    },
    {
      id: 4,
      code: 'BACKTOSCHOOL',
      discount: 25,
      discountType: 'percentage',
      status: 'Active',
      startDate: '2023-08-01',
      endDate: '2023-09-30',
      description: 'Back to school promotion',
      usageLimit: 750,
      usedCount: 234
    },
    {
      id: 5,
      code: 'SPRINGCLEAN',
      discount: 30,
      discountType: 'percentage',
      status: 'Inactive',
      startDate: '2023-03-01',
      endDate: '2023-04-30',
      description: 'Spring cleaning sale',
      usageLimit: 300,
      usedCount: 300
    }
  ];
  export default promotionsData;