# Deployment Guide

## 🚀 Overview

This guide provides comprehensive instructions for deploying the Restaurant Management System to various environments, from development to production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn 1.22.x+)
- **PostgreSQL**: 14.x or higher
- **Git**: Latest version

### Required Accounts
- **Vercel** (recommended) or **Netlify** for frontend deployment
- **NeonDB** or **Supabase** for PostgreSQL database
- **Stripe** for payment processing
- **Google Cloud Console** for OAuth (optional)
- **Resend** or **SendGrid** for email services
- **UploadThing** for file uploads

---

## 🛠️ Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/restaurant-management-system.git
cd restaurant-management-system
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Application
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NEON_API_KEY=your-neon-api-key
TEST_DATABASE_URL="postgresql://username:password@host:port/test_database"

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Service
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourrestaurant.com

# File Upload
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Optional: Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

---

## 🗄️ Database Setup

### Option 1: NeonDB (Recommended)

1. **Create NeonDB Account**
   - Visit [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Connection String**
   ```bash
   # Example NeonDB connection string
   postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

3. **Configure Environment**
   ```env
   DATABASE_URL="your-neon-connection-string"
   NEON_API_KEY="your-neon-api-key"
   ```

### Option 2: Supabase

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Get database URL from Settings > Database

2. **Configure Environment**
   ```env
   DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
   ```

### Option 3: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE restaurant_db;
   CREATE USER restaurant_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;
   \q
   ```

3. **Configure Environment**
   ```env
   DATABASE_URL="postgresql://restaurant_user:your_password@localhost:5432/restaurant_db"
   ```

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
npm run db:seed
```

---

## 🔐 Authentication Setup

### NextAuth.js Configuration

1. **Generate Secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Google OAuth Setup** (Optional)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### JWT Configuration

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 💳 Payment Setup (Stripe)

### 1. Create Stripe Account
- Visit [stripe.com](https://stripe.com)
- Create account and verify business

### 2. Get API Keys
- Dashboard > Developers > API keys
- Copy Publishable key and Secret key

### 3. Configure Webhooks
- Dashboard > Developers > Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.dispute.created`

### 4. Test Configuration
```bash
# Test Stripe connection
npm run test:stripe
```

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended)

1. **Create Account**
   - Visit [resend.com](https://resend.com)
   - Sign up and verify domain

2. **Get API Key**
   - Dashboard > API Keys
   - Create new API key

3. **Configure DNS**
   ```
   # Add these DNS records to your domain
   TXT _resend.yourdomain.com "resend-verification=abc123"
   CNAME resend._domainkey.yourdomain.com resend._domainkey.resend.com
   ```

### Option 2: SendGrid

1. **Create Account**
   - Visit [sendgrid.com](https://sendgrid.com)
   - Create account and verify

2. **Configure Environment**
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 📁 File Upload Setup (UploadThing)

1. **Create Account**
   - Visit [uploadthing.com](https://uploadthing.com)
   - Create new app

2. **Get Credentials**
   ```env
   UPLOADTHING_SECRET=sk_live_your-secret
   UPLOADTHING_APP_ID=your-app-id
   ```

3. **Configure File Types**
   ```typescript
   // src/lib/uploadthing.ts
   export const ourFileRouter = {
     imageUploader: f({ image: { maxFileSize: "4MB" } })
       .middleware(async ({ req }) => {
         // Authentication logic
         return { userId: "user123" };
       })
       .onUploadComplete(async ({ metadata, file }) => {
         console.log("Upload complete for userId:", metadata.userId);
         console.log("file url", file.url);
       }),
   } satisfies FileRouter;
   ```

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login and Deploy
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 3. Configure Environment Variables
```bash
# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ... add all required variables
```

#### 4. Custom Domain Setup
```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME record: www.yourdomain.com -> cname.vercel-dns.com
# Add A record: yourdomain.com -> 76.76.19.61
```

#### 5. Vercel Configuration
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

#### 1. Build Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

#### 2. Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=restaurant_db
      - POSTGRES_USER=restaurant_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 🔧 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run database migrations
        run: npx prisma db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          NEXTAUTH_SECRET: test-secret
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          NEXTAUTH_SECRET: test-secret
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Secrets

Add these secrets to your GitHub repository:
- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`

---

## 📊 Monitoring & Analytics

### 1. Application Monitoring

#### Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Custom Error Tracking
```typescript
// lib/logger.ts
export class Logger {
  static error(message: string, error?: Error, context?: object) {
    const logEntry = {
      level: 'error',
      message,
      error: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };
    
    if (process.env.NODE_ENV === 'production') {
      // Send to external service (e.g., Sentry, LogRocket)
      console.error(JSON.stringify(logEntry));
    } else {
      console.error(logEntry);
    }
  }
}
```

### 2. Database Monitoring

#### NeonDB Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for high CPU/memory usage

#### Custom Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test external services
    const services = {
      database: await testDatabaseConnection(),
      stripe: await testStripeConnection(),
      email: await testEmailService()
    };
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
```

### 3. Performance Monitoring

#### Core Web Vitals
```typescript
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true
    });
  }
}
```

---

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**
  - [ ] All secrets stored in environment variables
  - [ ] No hardcoded credentials in code
  - [ ] Different secrets for different environments

- [ ] **Authentication**
  - [ ] Strong JWT secrets (64+ characters)
  - [ ] Secure session configuration
  - [ ] Password hashing with bcrypt
  - [ ] Rate limiting on auth endpoints

- [ ] **Database Security**
  - [ ] Database connection over SSL
  - [ ] Parameterized queries (Prisma handles this)
  - [ ] Database user with minimal permissions
  - [ ] Regular database backups

- [ ] **API Security**
  - [ ] Input validation on all endpoints
  - [ ] CORS properly configured
  - [ ] Rate limiting implemented
  - [ ] Error messages don't leak sensitive info

- [ ] **HTTPS Configuration**
  - [ ] SSL certificate installed
  - [ ] HTTP to HTTPS redirect
  - [ ] Secure headers configured
  - [ ] HSTS enabled

### Security Headers

Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check connection string format
echo $DATABASE_URL

# Verify SSL requirements
# NeonDB requires sslmode=require
```

#### 2. Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

#### 3. Environment Variable Issues
```bash
# Check if variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Verify .env.local is in .gitignore
cat .gitignore | grep .env
```

#### 4. Stripe Webhook Issues
```bash
# Test webhook endpoint
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded"}'

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

### Debug Mode

Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

### Performance Issues

1. **Database Query Optimization**
   ```typescript
   // Enable query logging
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

2. **Bundle Analysis**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

3. **Memory Leaks**
   ```bash
   # Monitor memory usage
   node --inspect app.js
   ```

---

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**
   - Read replicas for query distribution
   - Connection pooling (PgBouncer)
   - Database sharding for large datasets

2. **Application Scaling**
   - Serverless functions (auto-scaling)
   - Load balancing
   - CDN for static assets

3. **Caching Strategy**
   - Redis for session storage
   - API response caching
   - Database query caching

### Performance Optimization

1. **Frontend Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-domain.com'],
       formats: ['image/webp', 'image/avif'],
     },
     experimental: {
       optimizeCss: true,
       optimizeImages: true,
     },
   };
   ```

2. **API Optimization**
   ```typescript
   // Implement response caching
   export async function GET(request: Request) {
     const response = await getMenuItems();
     
     return new Response(JSON.stringify(response), {
       headers: {
         'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
       }
     });
   }
   ```

---

## 📚 Additional Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NeonDB Documentation](https://neon.tech/docs)

### Tools
- [Vercel CLI](https://vercel.com/cli)
- [Prisma Studio](https://www.prisma.io/studio)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### Monitoring Services
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Uptime Robot](https://uptimerobot.com) - Uptime monitoring

---

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test individual components

---

*Last Updated: December 2024*
*Guide Version: 1.0.0*
*Status: Production Ready*