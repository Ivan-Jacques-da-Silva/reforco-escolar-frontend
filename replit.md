# Reforço Escolar - Sistema de Gerenciamento

## Overview

This is a full-stack tutoring school management system with a React frontend and Express backend. The application manages students, tutoring sessions, educational materials, and payment tracking. It features role-based access control (admin and teacher roles) with JWT authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with Vite as the build tool
- Tailwind CSS for styling with custom design tokens
- Framer Motion for animations
- React Router DOM for client-side routing
- Axios for API communication

**Component Structure:**
- Follows a component-driven architecture with reusable UI primitives located in `src/components/ui/*`
- UI components are lightweight implementations inspired by shadcn design patterns (Button, Card, Badge, Input, Label, Table)
- Path aliasing configured (`@/*` maps to `src/*`) for cleaner imports

**State Management:**
- Local state management with React hooks
- API service layer abstracts backend communication with dedicated service files for each resource type (students, tutorings, materials, payments)
- Token-based authentication stored in localStorage

**API Integration:**
- Centralized axios instance with request/response interceptors
- Automatic token injection for authenticated requests
- Automatic redirect to login on 401 responses
- Environment-aware API base URL configuration (localhost vs production)

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework (CommonJS module system)
- Prisma ORM for database operations
- PostgreSQL as the primary database
- JWT for authentication with session management
- bcryptjs for password hashing

**API Design:**
- RESTful API structure with resource-based routes
- Modular route organization (`/api/auth`, `/api/students`, `/api/tutorings`, `/api/materials`, `/api/payments`)
- Middleware-based authentication and authorization
- Role-based access control (ADMIN can see all data, TEACHER sees only their students)

**Security Measures:**
- Helmet.js for security headers
- CORS configured for cross-origin requests
- Rate limiting (100 requests per 15-minute window per IP)
- Request size limits (10mb JSON payload)
- Trust proxy configuration for deployment environments

**Database Design (Prisma/PostgreSQL):**
- User model with role-based access (ADMIN, TEACHER)
- Student model with teacher association
- Tutoring sessions tracking
- Material inventory management
- Payment tracking with status management
- Session-based token storage for authentication

**Authentication Flow:**
- JWT tokens stored in database sessions table
- Token expiration validation on each request
- Graceful session cleanup on expiration
- Admin-only user creation (registration requires admin authentication)

### Deployment Configuration

**Frontend:**
- Vite dev server configured for host `0.0.0.0:5000`
- Build process generates optimized static assets
- Allowed hosts enabled for deployment flexibility

**Backend:**
- Port configurable via environment variables (default: 3001)
- Database connection logging in development mode
- Graceful shutdown handlers (SIGINT, SIGTERM)
- Health check endpoint at `/api/health`
- Database seeding utility for initial setup

## External Dependencies

### Core Dependencies

**Frontend:**
- `react` & `react-dom` (v18.2.0) - UI framework
- `react-router-dom` (v7.9.4) - Client-side routing
- `axios` (v1.12.2) - HTTP client
- `lucide-react` (v0.462.0) - Icon library
- `framer-motion` (v11.2.6) - Animation library
- `tailwindcss` (v3.4.9) - CSS framework
- `vite` (v5.4.0) - Build tool and dev server

**Backend:**
- `express` (v4.21.1) - Web framework
- `@prisma/client` (v5.22.0) - Database ORM
- `jsonwebtoken` (v9.0.2) - JWT authentication
- `bcryptjs` (v2.4.3) - Password hashing
- `cors` (v2.8.5) - Cross-origin resource sharing
- `helmet` (v8.0.0) - Security middleware
- `express-rate-limit` (v7.4.1) - Rate limiting
- `dotenv` (v16.4.7) - Environment variable management

### Database

**PostgreSQL:**
- Managed through Prisma ORM
- Connection configured via environment variables
- Schema migrations managed with Prisma CLI
- Supports development logging and query inspection

### Development Tools

- `nodemon` (v3.1.7) - Auto-restart development server
- `autoprefixer` & `postcss` - CSS processing
- `@vitejs/plugin-react` - React support for Vite
- Prisma Studio for database inspection

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Backend server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `NODE_ENV` - Environment mode (development/production)