# API Reference Documentation

## 📋 Overview

This document provides comprehensive documentation for all API endpoints in the Restaurant Management System. All APIs follow RESTful conventions and return JSON responses.

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": []
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 🔐 Authentication APIs

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "registrationType": "simple", // "simple" or "complex"
  "companyInfo": { // Required for complex registration
    "companyName": "Restaurant ABC",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-12-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Codes:**
- `EMAIL_EXISTS` - Email already registered
- `VALIDATION_ERROR` - Invalid input data
- `WEAK_PASSWORD` - Password doesn't meet requirements

### Login User
**POST** `/api/auth/login`

Authenticate user credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-12-20T10:30:00Z"
  },
  "message": "Login successful"
}
```

### Refresh Token
**POST** `/api/auth/refresh`

Refresh an expired JWT token.

**Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-12-20T10:30:00Z"
  }
}
```

---

## 🍽️ Menu APIs

### Get Menu Items
**GET** `/api/menu`

Retrieve all menu items with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category
- `available` (optional) - Filter by availability (true/false)
- `limit` (optional) - Limit number of results
- `offset` (optional) - Pagination offset

**Example Request:**
```
GET /api/menu?category=appetizers&available=true&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Caesar Salad",
        "description": "Fresh romaine lettuce with caesar dressing",
        "price": 12.99,
        "category": "appetizers",
        "image": "https://example.com/caesar-salad.jpg",
        "available": true,
        "allergens": ["dairy", "gluten"],
        "nutritionalInfo": {
          "calories": 280,
          "protein": 8,
          "carbs": 15,
          "fat": 22
        },
        "preparationTime": 10,
        "createdAt": "2024-12-19T10:30:00Z",
        "updatedAt": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Menu Item by ID
**GET** `/api/menu/{id}`

Retrieve a specific menu item.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Caesar Salad",
    "description": "Fresh romaine lettuce with caesar dressing",
    "price": 12.99,
    "category": "appetizers",
    "image": "https://example.com/caesar-salad.jpg",
    "available": true,
    "allergens": ["dairy", "gluten"],
    "nutritionalInfo": {
      "calories": 280,
      "protein": 8,
      "carbs": 15,
      "fat": 22
    },
    "preparationTime": 10,
    "variants": [
      {
        "id": 1,
        "name": "Large",
        "priceModifier": 3.00
      }
    ],
    "customizations": [
      {
        "id": 1,
        "name": "Extra Dressing",
        "price": 1.50
      }
    ]
  }
}
```

### Create Menu Item
**POST** `/api/menu`

🔒 **Requires Admin Authentication**

Create a new menu item.

**Request Body:**
```json
{
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon with herbs",
  "price": 24.99,
  "category": "main-course",
  "image": "https://example.com/salmon.jpg",
  "available": true,
  "allergens": ["fish"],
  "nutritionalInfo": {
    "calories": 350,
    "protein": 35,
    "carbs": 5,
    "fat": 20
  },
  "preparationTime": 25
}
```

### Update Menu Item
**PUT** `/api/menu/{id}`

🔒 **Requires Admin Authentication**

Update an existing menu item.

### Delete Menu Item
**DELETE** `/api/menu/{id}`

🔒 **Requires Admin Authentication**

Delete a menu item.

---

## 📦 Order APIs

### Create Order
**POST** `/api/orders`

Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "customizations": [
        {
          "id": 1,
          "name": "Extra Dressing"
        }
      ],
      "specialInstructions": "No croutons"
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "orderType": "dine-in", // "dine-in", "takeout", "delivery"
  "tableNumber": 5, // Required for dine-in
  "deliveryAddress": { // Required for delivery
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "card", // "card", "cash", "online"
  "specialRequests": "Please make it spicy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "orderNumber": "ORD-2024-001",
      "status": "pending",
      "items": [
        {
          "id": 1,
          "menuItem": {
            "id": 1,
            "name": "Caesar Salad",
            "price": 12.99
          },
          "quantity": 2,
          "unitPrice": 12.99,
          "totalPrice": 25.98,
          "customizations": [
            {
              "id": 1,
              "name": "Extra Dressing",
              "price": 1.50
            }
          ]
        }
      ],
      "subtotal": 25.98,
      "tax": 2.08,
      "tip": 5.00,
      "total": 33.06,
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "orderType": "dine-in",
      "tableNumber": 5,
      "estimatedTime": 25,
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    },
    "paymentIntent": {
      "id": "pi_123",
      "clientSecret": "pi_123_secret_abc",
      "status": "requires_payment_method"
    }
  },
  "message": "Order created successfully"
}
```

### Get Orders
**GET** `/api/orders`

🔒 **Requires Authentication**

Retrieve orders (user sees their orders, admin sees all).

**Query Parameters:**
- `status` (optional) - Filter by status
- `orderType` (optional) - Filter by order type
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `limit` (optional) - Limit results
- `offset` (optional) - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "orderNumber": "ORD-2024-001",
        "status": "preparing",
        "total": 33.06,
        "orderType": "dine-in",
        "tableNumber": 5,
        "estimatedTime": 15,
        "createdAt": "2024-12-19T10:30:00Z",
        "customer": {
          "name": "John Doe",
          "phone": "+1234567890"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Get Order by ID
**GET** `/api/orders/{id}`

🔒 **Requires Authentication**

Retrieve a specific order with full details.

### Update Order Status
**PATCH** `/api/orders/{id}/status`

🔒 **Requires Staff Authentication**

Update order status.

**Request Body:**
```json
{
  "status": "preparing", // "pending", "preparing", "ready", "served", "cancelled"
  "estimatedTime": 15, // Optional: updated estimated time
  "notes": "Started preparation" // Optional: status update notes
}
```

---

## 🍴 Kitchen APIs

### Get Kitchen Orders
**GET** `/api/kitchen/orders`

🔒 **Requires Kitchen Staff Authentication**

Retrieve orders for kitchen display.

**Query Parameters:**
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority
- `orderType` (optional) - Filter by order type

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "orderNumber": "ORD-2024-001",
        "status": "pending",
        "priority": "normal", // "low", "normal", "high", "urgent"
        "orderType": "dine-in",
        "tableNumber": 5,
        "items": [
          {
            "id": 1,
            "name": "Caesar Salad",
            "quantity": 2,
            "customizations": ["Extra Dressing"],
            "specialInstructions": "No croutons",
            "preparationTime": 10
          }
        ],
        "totalPreparationTime": 25,
        "orderTime": "2024-12-19T10:30:00Z",
        "customer": {
          "name": "John Doe"
        }
      }
    ]
  }
}
```

### Update Order Priority
**PATCH** `/api/kitchen/orders/{id}/priority`

🔒 **Requires Kitchen Staff Authentication**

Update order priority.

**Request Body:**
```json
{
  "priority": "high", // "low", "normal", "high", "urgent"
  "reason": "Customer request" // Optional
}
```

### Update Order Status (Kitchen)
**PATCH** `/api/kitchen/orders/{id}/status`

🔒 **Requires Kitchen Staff Authentication**

Update order status from kitchen.

**Request Body:**
```json
{
  "status": "preparing",
  "estimatedTime": 15,
  "notes": "Started cooking"
}
```

---

## 📅 Reservation APIs

### Create Reservation
**POST** `/api/reservations`

Create a new table reservation.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "partySize": 4,
  "reservationDate": "2024-12-20",
  "reservationTime": "19:00",
  "specialRequests": "Birthday celebration",
  "tablePreference": "window" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "res_123",
      "confirmationNumber": "RES-2024-001",
      "customerName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "partySize": 4,
      "reservationDate": "2024-12-20",
      "reservationTime": "19:00",
      "status": "confirmed",
      "tableNumber": 12,
      "specialRequests": "Birthday celebration",
      "createdAt": "2024-12-19T10:30:00Z"
    }
  },
  "message": "Reservation created successfully"
}
```

### Get Reservations
**GET** `/api/reservations`

🔒 **Requires Authentication**

Retrieve reservations.

**Query Parameters:**
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `status` (optional) - Filter by status
- `email` (optional) - Filter by customer email
- `phone` (optional) - Filter by customer phone

### Get Reservation by ID
**GET** `/api/reservations/{id}`

Retrieve a specific reservation.

### Update Reservation
**PUT** `/api/reservations/{id}`

🔒 **Requires Staff Authentication**

Update reservation details.

### Cancel Reservation
**DELETE** `/api/reservations/{id}`

Cancel a reservation.

---

## 🏪 Restaurant APIs

### Get Restaurant Info
**GET** `/api/restaurant`

Retrieve restaurant information.

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Bella Vista Restaurant",
      "description": "Authentic Italian cuisine in the heart of the city",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "contact": {
        "phone": "+1-555-0123",
        "email": "info@bellavista.com",
        "website": "https://bellavista.com"
      },
      "hours": {
        "monday": { "open": "11:00", "close": "22:00" },
        "tuesday": { "open": "11:00", "close": "22:00" },
        "wednesday": { "open": "11:00", "close": "22:00" },
        "thursday": { "open": "11:00", "close": "22:00" },
        "friday": { "open": "11:00", "close": "23:00" },
        "saturday": { "open": "10:00", "close": "23:00" },
        "sunday": { "open": "10:00", "close": "21:00" }
      },
      "cuisine": ["Italian", "Mediterranean"],
      "priceRange": "$$",
      "features": ["outdoor-seating", "wifi", "parking", "wheelchair-accessible"],
      "socialMedia": {
        "facebook": "https://facebook.com/bellavista",
        "instagram": "https://instagram.com/bellavista",
        "twitter": "https://twitter.com/bellavista"
      },
      "images": {
        "logo": "https://example.com/logo.png",
        "hero": "https://example.com/hero.jpg",
        "gallery": [
          "https://example.com/interior1.jpg",
          "https://example.com/interior2.jpg"
        ]
      }
    }
  }
}
```

### Update Restaurant Info
**PUT** `/api/restaurant`

🔒 **Requires Admin Authentication**

Update restaurant information.

---

## 💳 Payment APIs

### Create Payment Intent
**POST** `/api/payments/create-intent`

🔒 **Requires Authentication**

Create a Stripe payment intent.

**Request Body:**
```json
{
  "orderId": "order_123",
  "amount": 3306, // Amount in cents
  "currency": "usd",
  "paymentMethodTypes": ["card"],
  "metadata": {
    "orderId": "order_123",
    "customerEmail": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_123",
      "clientSecret": "pi_123_secret_abc",
      "status": "requires_payment_method",
      "amount": 3306,
      "currency": "usd"
    }
  }
}
```

### Confirm Payment
**POST** `/api/payments/confirm`

🔒 **Requires Authentication**

Confirm a payment intent.

### Process Refund
**POST** `/api/payments/refund`

🔒 **Requires Admin Authentication**

Process a refund for an order.

**Request Body:**
```json
{
  "orderId": "order_123",
  "amount": 3306, // Optional: partial refund amount
  "reason": "customer_request",
  "notes": "Customer was not satisfied"
}
```

---

## 👥 Staff APIs

### Get Staff Members
**GET** `/api/staff`

🔒 **Requires Admin Authentication**

Retrieve all staff members.

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "staff_123",
        "name": "Jane Smith",
        "email": "jane@restaurant.com",
        "role": "server", // "server", "kitchen", "manager", "admin"
        "phone": "+1234567890",
        "hireDate": "2024-01-15",
        "status": "active", // "active", "inactive", "on-leave"
        "schedule": {
          "monday": { "start": "09:00", "end": "17:00" },
          "tuesday": { "start": "09:00", "end": "17:00" }
        },
        "permissions": [
          "view_orders",
          "update_order_status",
          "manage_tables"
        ]
      }
    ]
  }
}
```

### Create Staff Member
**POST** `/api/staff`

🔒 **Requires Admin Authentication**

Add a new staff member.

### Update Staff Member
**PUT** `/api/staff/{id}`

🔒 **Requires Admin Authentication**

Update staff member information.

### Delete Staff Member
**DELETE** `/api/staff/{id}`

🔒 **Requires Admin Authentication**

Remove a staff member.

---

## 📊 Analytics APIs

### Get Dashboard Metrics
**GET** `/api/analytics/dashboard`

🔒 **Requires Admin Authentication**

Retrieve key dashboard metrics.

**Query Parameters:**
- `period` (optional) - Time period ("today", "week", "month", "year")
- `startDate` (optional) - Custom start date (YYYY-MM-DD)
- `endDate` (optional) - Custom end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "revenue": {
        "total": 15420.50,
        "change": 12.5, // Percentage change from previous period
        "trend": "up"
      },
      "orders": {
        "total": 245,
        "change": 8.2,
        "trend": "up",
        "breakdown": {
          "dine-in": 150,
          "takeout": 65,
          "delivery": 30
        }
      },
      "customers": {
        "total": 189,
        "new": 23,
        "returning": 166
      },
      "averageOrderValue": {
        "amount": 62.94,
        "change": 3.8,
        "trend": "up"
      },
      "popularItems": [
        {
          "id": 1,
          "name": "Caesar Salad",
          "orders": 45,
          "revenue": 584.55
        }
      ],
      "busyHours": [
        {
          "hour": 12,
          "orders": 25,
          "revenue": 1250.00
        }
      ]
    },
    "period": {
      "start": "2024-12-19T00:00:00Z",
      "end": "2024-12-19T23:59:59Z",
      "type": "today"
    }
  }
}
```

### Get Sales Report
**GET** `/api/analytics/sales`

🔒 **Requires Admin Authentication**

Retrieve detailed sales analytics.

### Get Menu Performance
**GET** `/api/analytics/menu`

🔒 **Requires Admin Authentication**

Retrieve menu item performance metrics.

---

## 🔧 System APIs

### Health Check
**GET** `/api/health`

Check system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-19T10:30:00Z",
    "version": "1.0.0",
    "services": {
      "database": {
        "status": "connected",
        "responseTime": 45
      },
      "stripe": {
        "status": "connected",
        "responseTime": 120
      },
      "email": {
        "status": "connected",
        "responseTime": 200
      }
    },
    "uptime": 86400
  }
}
```

### Get System Settings
**GET** `/api/settings`

🔒 **Requires Admin Authentication**

Retrieve system configuration settings.

### Update System Settings
**PUT** `/api/settings`

🔒 **Requires Admin Authentication**

Update system configuration.

### Maintenance Mode
**POST** `/api/maintenance`

🔒 **Requires Admin Authentication**

Toggle maintenance mode.

**Request Body:**
```json
{
  "enabled": true,
  "message": "System maintenance in progress. We'll be back shortly!",
  "estimatedDuration": 30 // minutes
}
```

---

## 📧 Notification APIs

### Send Email
**POST** `/api/notifications/email`

🔒 **Requires Admin Authentication**

Send email notification.

**Request Body:**
```json
{
  "to": "customer@example.com",
  "template": "order_confirmation",
  "data": {
    "orderNumber": "ORD-2024-001",
    "customerName": "John Doe",
    "total": 33.06
  }
}
```

### Get Notification Templates
**GET** `/api/notifications/templates`

🔒 **Requires Admin Authentication**

Retrieve available email templates.

---

## 📱 WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Kitchen Events
```javascript
// Join kitchen channel
socket.emit('join-kitchen');

// Listen for new orders
socket.on('new-order', (order) => {
  console.log('New order received:', order);
});

// Listen for order updates
socket.on('order-update', (update) => {
  console.log('Order updated:', update);
});
```

### Customer Events
```javascript
// Track specific order
socket.emit('track-order', 'order_123');

// Listen for order status updates
socket.on('order-status-update', (update) => {
  console.log('Order status:', update.status);
});
```

### Staff Events
```javascript
// Join staff channel
socket.emit('join-staff', 'staff_123');

// Listen for notifications
socket.on('staff-notification', (notification) => {
  console.log('New notification:', notification);
});
```

---

## 🚨 Error Codes

### Authentication Errors
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `ACCOUNT_DISABLED` - User account is disabled

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_REQUIRED_FIELD` - Required field is missing
- `INVALID_FORMAT` - Invalid data format
- `VALUE_OUT_OF_RANGE` - Value exceeds allowed range

### Business Logic Errors
- `ITEM_NOT_AVAILABLE` - Menu item is not available
- `INSUFFICIENT_STOCK` - Not enough inventory
- `TABLE_NOT_AVAILABLE` - Table is not available for reservation
- `ORDER_ALREADY_PROCESSED` - Order cannot be modified

### System Errors
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `DATABASE_ERROR` - Database operation failed
- `PAYMENT_ERROR` - Payment processing failed
- `EMAIL_DELIVERY_FAILED` - Email could not be sent

---

## 📝 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Order creation**: 10 requests per minute
- **General API**: 100 requests per minute
- **Admin endpoints**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 🔍 Testing

### API Testing with curl

**Create Order Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2
      }
    ],
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "orderType": "dine-in",
    "tableNumber": 5
  }'
```

**Get Menu Example:**
```bash
curl -X GET "http://localhost:3000/api/menu?category=appetizers&limit=5" \
  -H "Accept: application/json"
```

### Postman Collection
A Postman collection with all API endpoints is available at:
`/docs/postman/restaurant-api.json`

---

## 📚 Additional Resources

- [Main Documentation](./PROJECT_DOCUMENTATION.md)
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

*Last Updated: December 2024*
*API Version: 1.0.0*
*Status: Production Ready*