# BitOja Backend Server

A robust Node.js/Express backend for the BitOja P2P Trading Platform with Supabase integration.

## Features

- 🔐 **Supabase Authentication** - Complete auth system with JWT tokens
- 🛡️ **Row Level Security** - Database-level security policies
- 📊 **Real-time Trading** - P2P advertisement and trade management
- 💰 **Wallet System** - Multi-asset wallet with transaction history
- 🔄 **Asset Swapping** - BTC/USDT exchange functionality
- 📁 **File Uploads** - Payment proof uploads with validation
- 🚦 **Rate Limiting** - API protection against abuse
- 📝 **Input Validation** - Comprehensive request validation
- 🔒 **Security Headers** - Helmet.js security middleware

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
# or
bun install
```

### 2. Setup Environment Variables

Copy the example environment file and configure your Supabase credentials:

```bash
cp env.example .env
```

Edit `.env` with your Supabase project details:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your_very_long_and_secure_jwt_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in `database/schema.sql` in your Supabase SQL editor
3. This will create all necessary tables, RLS policies, and functions

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev
# or
bun run dev

# Production mode
npm run build && npm start
# or
bun run build && bun start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/user` - Get current user profile
- `PUT /api/auth/user` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/update-password` - Update password

### Advertisements

- `GET /api/advertisements` - List all active advertisements (with filters)
- `GET /api/advertisements/my` - Get user's advertisements
- `GET /api/advertisements/:id` - Get single advertisement
- `POST /api/advertisements` - Create new advertisement
- `PUT /api/advertisements/:id` - Update advertisement
- `PATCH /api/advertisements/:id/status` - Update advertisement status
- `DELETE /api/advertisements/:id` - Delete advertisement

### Trades

- `GET /api/trades/my` - Get user's trades
- `GET /api/trades/:id` - Get single trade
- `POST /api/trades` - Create new trade
- `POST /api/trades/:id/payment-proof` - Upload payment proof
- `POST /api/trades/:id/release` - Release tokens (complete trade)
- `PATCH /api/trades/:id/status` - Update trade status
- `GET /api/trades/:id/messages` - Get trade messages
- `POST /api/trades/:id/messages` - Send trade message

### Wallets

- `GET /api/wallets` - Get user's wallets
- `GET /api/wallets/:asset` - Get wallet by asset type
- `GET /api/wallets/:asset/transactions` - Get wallet transactions
- `POST /api/wallets/demo-balance` - Add demo balance (dev only)
- `POST /api/wallets/swap` - Swap assets
- `GET /api/wallets/swaps` - Get swap history

### Utility

- `GET /health` - Health check endpoint

## Database Schema

The application uses the following main tables:

- **users** - User profiles (extends Supabase auth.users)
- **wallets** - User crypto wallets (BTC, USDT)
- **advertisements** - Trading advertisements
- **trades** - P2P trades between users
- **messages** - Trade chat messages
- **swaps** - Asset swap transactions
- **wallet_transactions** - Transaction history

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data or public data they're authorized to see.

### Authentication

- JWT tokens provided by Supabase Auth
- Middleware validates tokens on protected routes
- Session management handled by Supabase

### Input Validation

- Joi schemas validate all request bodies
- File upload validation for payment proofs
- Rate limiting to prevent abuse

### File Uploads

- Secure file handling with Multer
- File type validation (JPEG, PNG, GIF, PDF)
- Size limits enforced
- Files stored in isolated uploads directory

## Development

### Project Structure

```
server/
├── config/          # Configuration files
│   └── supabase.ts  # Supabase client setup
├── database/        # Database schema and migrations
│   └── schema.sql   # Complete database schema
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication middleware
│   └── validation.ts # Request validation
├── routes/          # API route handlers
│   ├── auth.ts      # Authentication routes
│   ├── advertisements.ts # Advertisement management
│   ├── trades.ts    # Trading functionality
│   └── wallets.ts   # Wallet operations
├── uploads/         # File upload directory
├── index.ts         # Main server entry point
├── package.json
└── tsconfig.json
```

### Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `ALLOWED_ORIGINS` - CORS allowed origins
- `FRONTEND_URL` - Frontend URL for redirects
- `MAX_FILE_SIZE` - Maximum file upload size
- `UPLOAD_PATH` - File upload directory
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Configure file upload limits
6. Set up monitoring and logging
7. Configure backup strategy for Supabase

### Recommended Hosting

- **Vercel** - Easy deployment with built-in features
- **Railway** - Simple deployment with database support
- **DigitalOcean App Platform** - Scalable hosting
- **AWS/GCP/Azure** - Enterprise-grade hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
