# Restaurant Management System

A comprehensive restaurant management system built with Next.js, TypeScript, and Tailwind CSS, connecting to a PostgreSQL database (NeonDB).

## 🚀 Features

- **Customer Facing**: Menu browsing, reservations, online ordering, and customer account management
- **Admin Dashboard**: Staff management, inventory, analytics, and reservation management
- **Secure Authentication**: Role-based access control with Stack Auth
- **Payment Processing**: Integrated with Stripe for secure payments
- **Email Notifications**: Automated email notifications for orders and reservations
- **Responsive Design**: Mobile-friendly interface for both customers and staff

## 📋 Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/             # API routes
│   ├── (client)/        # Client-facing routes
│   └── dashboard/       # Admin dashboard routes
├── components/          # React components
│   ├── admin/           # Admin-specific components
│   ├── shared/          # Shared components
│   └── providers/       # Context providers
├── lib/                 # Core utilities
│   ├── db.ts            # Database client
│   ├── api-handler.ts   # API route handler
│   ├── error-handler.ts # Error handling
│   ├── logger.ts        # Logging utility
│   └── env.ts           # Environment configuration
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── test/                # Test setup
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, MUI
- **Backend**: Next.js API routes, PostgreSQL (NeonDB)
- **Authentication**: Stack Auth (@stackframe/stack)
- **Database ORM**: Prisma
- **Testing**: Vitest, Testing Library
- **Payments**: Stripe
- **Email**: Resend
- **File Uploads**: Uploadthing

## 🧪 Testing

The project uses Vitest for testing. Run tests with:

```bash
# Run all tests
npm test

# Watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` and fill in the required variables:

```bash
cp .env.example .env.local
```

Required environment variables include:

- `DATABASE_URL`: NeonDB connection string
- Auth keys for Stack Auth
- Stripe API keys
- Email service configuration

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Initialize the database:
   ```bash
   npm run setup-db
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Lint code
- `npm run type-check`: Check TypeScript types
- `npm run format`: Format code with Prettier
- `npm run validate`: Run linting and type checking
- `npm test`: Run tests

## 📚 API Documentation

API routes follow a standardized pattern for consistency and reliability:

- All routes use the standardized API handler with validation, error handling, and authentication
- Authentication is handled through Stack Auth
- Responses follow a consistent format: `{ success: boolean, data?: any, error?: string }`

## 🔧 Development Guidelines

- Follow the established code structure
- Use the standardized error handling system
- Write tests for new features
- Use the database client for all database operations
- Validate all user inputs with Zod schemas
- Follow the established naming conventions

## Recent Updates

- Enhanced dashboard UI with better visual hierarchy and modern design
- Improved sidebar navigation with better mobile responsiveness
- Added detailed metrics with trend indicators
- Fixed image loading issues with proper placeholders
- Improved card layouts for orders and menu items
- Enhanced button styles and interactive elements

## Next Steps

1. **Complete Phase 4: Customer Interface**
   - Finalize QR code generation for tables
   - Complete the customer-facing ordering interface
   - Polish the order placement flow

2. **Begin Phase 5: Kitchen & Staff Systems**
   - Implement the kitchen display system
   - Develop the staff task management interface
   - Create real-time communication between kitchen and front-of-house

3. **Plan for Phase 6: Integration & Features**
   - Implement notification systems (WhatsApp via Twilio)
   - Enhance the email notification system
   - Finalize the QR code integration

## Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, PostgreSQL (NeonDB)
- **Authentication**: Custom auth with bcrypt
- **Email**: Resend service
- **Payments**: Stripe integration

## Features

- Dashboard with key metrics and visualizations
- Order management system
- Menu management with categories and items
- Table management with QR code generation
- Reservation system
- Staff management
- Customer ordering experience
- Responsive design for all devices

## Contributing

See the [contributing guide](CONTRIBUTING.md) for detailed instructions on how to contribute to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Email Sending Configuration

The system now uses Nodemailer for sending emails, which gives more flexibility and reliability compared to third-party services.

### Setup Instructions

1. Create a `.env.local` file in the project root with your email credentials:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Restaurant OS <your-email@gmail.com>
```

2. If using Gmail, you'll need to create an App Password instead of your regular password:
   - Go to your Google Account: https://myaccount.google.com
   - Select Security
   - Under "Signing in to Google," select 2-Step Verification (you must have this enabled)
   - At the bottom of the page, select App passwords
   - Create a new app password for "Mail" and "Other (Custom name)" -> "RestaurantOS"
   - Use the generated password in your .env.local file

### Testing the Email System

You can test the email functionality in two ways:

1. Using the command line:
   ```bash
   npm run test-email
   ```

2. Using the browser:
   - Start the development server: `npm run dev`
   - Go to `http://localhost:3000/admin/email-test`
   - Click the "Send Test Email" button

### Email Templates

The system includes two types of email templates:
- Simple text/HTML emails
- Order confirmation emails with formatted order details

You can customize these templates in the `src/lib/nodemailer.ts` file.
# snytra-new
