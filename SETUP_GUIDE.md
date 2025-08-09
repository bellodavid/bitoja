# 🚀 BitOja P2P Trading Platform - Complete Setup Guide

This guide will walk you through setting up the complete BitOja P2P Trading Platform with both frontend and backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Bun** (recommended) or npm/yarn - [Install Bun](https://bun.sh/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🏗️ Architecture Overview

The application consists of:

- **Frontend**: React + Vite + TailwindCSS (Port 5173)
- **Backend**: Node.js + Express + Supabase (Port 3001)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Local file system (can be extended to Supabase Storage)

## 📁 Project Structure

```
TokenTrade/
├── client/                 # Frontend React application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Backend Express API
│   ├── config/
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   └── package.json
├── package.json           # Root package.json with scripts
└── README.md
```

## 🔧 Setup Instructions

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd TokenTrade

# Install root dependencies
bun install

# Install server dependencies
cd server
bun install
cd ..
```

### Step 2: Setup Supabase Project

1. **Create a new Supabase project**:

   - Go to [supabase.com](https://supabase.com/)
   - Click "New Project"
   - Choose your organization
   - Fill in project details
   - Wait for the project to be ready

2. **Get your Supabase credentials**:

   - Go to Settings → API
   - Copy your Project URL
   - Copy your anon/public key
   - Copy your service_role/secret key

3. **Setup the database schema**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `server/database/schema.sql`
   - Run the query to create all tables, policies, and functions
   - Copy and paste the contents of `server/database/functions.sql`
   - Run the query to create additional functions

### Step 3: Configure Environment Variables

Create environment files with your Supabase credentials:

```bash
# Create server environment file
cp server/env.example server/.env
```

Edit `server/.env` with your actual Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your_very_long_and_secure_jwt_secret_at_least_32_characters

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Start the Development Servers

You have several options to run the application:

#### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
bun run dev:both
```

#### Option 2: Run Frontend and Backend Separately

```bash
# Terminal 1 - Frontend
bun run dev

# Terminal 2 - Backend
bun run dev:server
```

#### Option 3: Run Only Frontend (Client-side mode)

```bash
bun run dev
```

#### Option 4: Run Only Backend

```bash
bun run dev:server
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔐 Authentication Setup

The application uses Supabase Auth for user management:

### User Registration

- Email/password signup
- Email verification (optional)
- Automatic user profile and wallet creation

### User Login

- Email/password signin
- JWT token management
- Session persistence

### Password Management

- Password reset via email
- Password update functionality

## 📊 Database Schema

The application includes the following main tables:

- **users** - User profiles (extends Supabase auth.users)
- **wallets** - User crypto wallets (BTC, USDT)
- **advertisements** - Trading advertisements
- **trades** - P2P trades between users
- **messages** - Trade chat messages
- **swaps** - Asset swap transactions
- **wallet_transactions** - Transaction history

All tables have Row Level Security (RLS) enabled for data protection.

## 🧪 Testing the Application

### 1. User Registration

1. Go to http://localhost:5173
2. Click "Get Started" (this creates a demo user in client-only mode)
3. For full backend testing, implement signup/signin forms

### 2. Wallet Management

- View wallet balances
- Add demo balance (development only)
- Swap between BTC and USDT
- View transaction history

### 3. Advertisement Management

- Create new advertisements
- Browse advertisements
- Filter by asset, currency, payment method
- Update advertisement status

### 4. Trading Flow

- Initiate trades from advertisements
- Upload payment proof
- Chat with trading partners
- Complete trades (release tokens)
- View trade history

## 🔧 API Endpoints

The backend provides the following API endpoints:

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/user` - Get current user profile
- `POST /api/auth/signout` - Logout user

### Advertisements

- `GET /api/advertisements` - List advertisements
- `POST /api/advertisements` - Create advertisement
- `PUT /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement

### Trades

- `GET /api/trades/my` - Get user's trades
- `POST /api/trades` - Create new trade
- `POST /api/trades/:id/payment-proof` - Upload payment proof
- `POST /api/trades/:id/release` - Release tokens
- `GET /api/trades/:id/messages` - Get trade messages
- `POST /api/trades/:id/messages` - Send message

### Wallets

- `GET /api/wallets` - Get user's wallets
- `POST /api/wallets/demo-balance` - Add demo balance
- `POST /api/wallets/swap` - Swap assets
- `GET /api/wallets/swaps` - Get swap history

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build frontend
bun run build

# Deploy the 'dist' folder
```

### Backend Deployment (Railway/Render/DigitalOcean)

```bash
# Build backend
bun run build:server

# Deploy the 'server' folder
```

### Environment Variables for Production

Make sure to set these in your production environment:

- `NODE_ENV=production`
- All Supabase credentials
- Strong JWT secret
- Proper CORS origins
- SSL/TLS configuration

## 🔒 Security Considerations

### Database Security

- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only access their own data
- Service role key used only for server operations

### API Security

- JWT token authentication
- Rate limiting on all API routes
- Input validation with Joi schemas
- File upload restrictions
- CORS configuration

### Best Practices

- Use strong JWT secrets in production
- Enable SSL/TLS in production
- Regularly update dependencies
- Monitor API usage and errors
- Implement proper logging

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Supabase connection errors**:

   - Check your environment variables
   - Verify Supabase project is active
   - Check network connectivity

3. **Database schema errors**:

   - Ensure you've run the complete schema.sql
   - Check for any syntax errors in SQL
   - Verify RLS policies are enabled

4. **Build errors**:
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all imports are correct

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Error Logs**: Check browser console and server logs
3. **Database Queries**: Use Supabase dashboard to debug queries
4. **API Testing**: Use tools like Postman or curl to test endpoints

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Support

If you encounter any issues:

1. Check this setup guide
2. Review the error logs
3. Check the GitHub issues
4. Consult the API documentation
5. Create a new issue with detailed information

---

**Happy Trading! 🎉**

The BitOja P2P Trading Platform is now ready for development and testing. The application provides a complete cryptocurrency trading experience with real-time features, secure authentication, and a modern user interface.
