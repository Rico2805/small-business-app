export const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    type: 'customer',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '0987654321',
    type: 'business',
  },
];

export const businesses = [
  {
    id: '1',
    name: 'Bakery Delight',
    description: 'Fresh bakery products',
    email: 'bakery@example.com',
  },
];

export const products = [
  {
    id: '1',
    businessId: '1',
    name: 'Bread',
    price: 2.5,
    available: true,
  },
];

export const orders = [
  {
    id: '1',
    userId: '1',
    productId: '1',
    quantity: 3,
    status: 'pending',
  },
];
