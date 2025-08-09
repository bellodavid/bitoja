# BitOja P2P Trading Platform

## Overview

BitOja is a peer-to-peer cryptocurrency trading platform that enables users to buy and sell Bitcoin (BTC) and USDT with various payment methods. The platform features a full-stack TypeScript application with React frontend, Express backend, and PostgreSQL database integration using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect (OIDC) integration
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Real-time Communication**: WebSocket support for chat functionality

## Key Components

### Frontend Architecture
- **React Router**: Using wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Comprehensive shadcn/ui component library
- **Styling**: Tailwind CSS with custom BitOja brand colors
- **Pages**: Landing, Home dashboard, Browse ads, My ads, History, and Swap functionality
- **Wallet Integration**: Real-time balance fetching with demo balance functionality

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Authentication Middleware**: Replit OIDC integration with session management
- **File Upload**: Multer configuration for image uploads (payment proofs)
- **WebSocket Server**: Real-time chat functionality for trade communications
- **Database Layer**: Drizzle ORM with type-safe queries
- **Custodial Wallet System**: Secure private key management with AES encryption

### Database Schema
The schema includes several key entities:
- **Users**: Profile information and crypto balances
- **Advertisements**: Buy/sell offers with pricing and payment methods
- **Trades**: Trade execution records linking buyers and sellers
- **Messages**: Chat messages within trades
- **Swaps**: Direct token exchange records
- **Sessions**: Session storage for authentication
- **Wallets**: Custodial wallet system storing encrypted private keys
- **Wallet Transactions**: Transaction records for wallet operations

### Authentication & Authorization
- **Replit Auth**: OpenID Connect integration for user authentication
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Middleware Protection**: Route-level authentication guards
- **User Management**: Automatic user creation and profile management

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC, creating/updating user records
2. **Wallet Initialization**: New users automatically get BTC and USDT wallets with encrypted private keys
3. **Balance Validation**: Advertisement creation validates user has sufficient wallet balance for SELL orders
4. **Advertisement Creation**: Authenticated users create buy/sell advertisements with specified terms
5. **Trade Initiation**: Users respond to advertisements, creating trade records
6. **Chat Communication**: Real-time messaging within trades using WebSocket connections
7. **Trade Completion**: Payment proof uploads and status updates finalize trades
8. **Token Management**: Custodial system manages private keys securely for all transactions
9. **Direct Swaps**: Users can exchange tokens directly through the swap interface with balance validation

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and context
- **Express**: Backend web framework
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support
- **TanStack Query**: Server state management and caching

### UI/UX Dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components (via shadcn/ui)
- **Lucide React**: Icon library
- **Wouter**: Lightweight React router

### Database & Authentication
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **connect-pg-simple**: PostgreSQL session store
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware

### Development & Build Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

### Build Process
- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Production Build**: `npm run build` creates optimized frontend bundle and server bundle
- **Database**: `npm run db:push` applies schema changes to PostgreSQL

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption secret
- **REPLIT_DOMAINS**: Allowed domains for OIDC
- **ISSUER_URL**: OpenID Connect issuer URL

### File Structure
- Client files served from `dist/public` in production
- Server bundle created in `dist/index.js`
- Static assets handling via Vite in development, Express static in production
- WebSocket server runs alongside HTTP server for real-time features

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance.