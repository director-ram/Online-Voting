# 🗳️ Online Voting System

A secure, modern web-based voting application built with React, Flask, and PostgreSQL. This system provides a transparent and efficient platform for conducting digital elections with stunning 3D animated backgrounds, daily voting periods, and comprehensive candidate management.

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Dependencies](#installation--dependencies)
- [Database Setup](#database-setup)
- [Build & Deployment](#build--deployment)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)

## ✨ Features

### 🎨 Modern UI/UX
- 🌌 **3D Animated Background** - Interactive particle system using Three.js (120 FPS)
- ✨ **Glowing Card Effects** - Hover animations with gradient borders
- 🎯 **Responsive Design** - Mobile-first, works on all devices
- 🌟 **Smooth Animations** - GSAP and Framer Motion for fluid transitions
- 🎨 **Custom Date Picker** - Professional dropdown-based date selection

### 👤 User Features
- 🔐 **Secure Authentication** - JWT-based login/registration with password toggle
- 📸 **Profile Pictures** - Upload and display profile images (JPEG/PNG)
- 🗳️ **Daily Voting** - Vote once per day with automatic reset at midnight
- ✅ **Vote Confirmation** - Real-time status tracking with notifications
- 🚫 **Vote Privacy** - Votes are anonymous and secure
- 👤 **Profile Management** - Update personal information and view voting history

### 🎯 Candidate Features
- 📝 **Apply for Candidacy** - Submit applications with profile picture, DOB, gender, party
- 🔄 **Reapply System** - Revoke and reapply for candidacy seamlessly
- ✓ **Status Tracking** - View application status (pending/active)
- � **Vote Display** - See vote counts on candidate cards (admin only)
- 🖼️ **Profile Display** - Candidate pictures shown on vote cards

### 🔧 Admin Features
- 👥 **Candidate Management** - Approve, reject, or remove candidates
- 📊 **Real-time Results** - Live vote counting with dynamic queries
- 📈 **Voting Statistics** - Analytics dashboard with insights
- 🔒 **Secure Access** - Admin-only routes with role verification
- � **Voting Period Control** - Automated daily voting windows

### 🔒 Security Features
- 🔑 **JWT Authentication** - Secure token-based system with expiration
- � **Password Hashing** - Werkzeug security for encrypted passwords
- 💉 **SQL Injection Prevention** - Parameterized queries throughout
- 🌐 **CORS Protection** - Configured for specific origins
- ✅ **One Vote Per Day** - Database constraints with date validation
- �️ **Role-Based Access** - Middleware protection for admin routes
- 🔄 **Session Management** - Token refresh and validation

## 🏗️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Core UI library for component-based architecture |
| **Vite** | 5.0.8 | Fast build tool and development server (HMR) |
| **React Router DOM** | 6.20.0 | Client-side routing and navigation |
| **Axios** | 1.6.2 | HTTP client for API communication |
| **Three.js** | 0.163.0 | 3D graphics library for animated backgrounds |
| **@react-three/fiber** | 8.15.19 | React renderer for Three.js (120 FPS support) |
| **@react-three/drei** | 9.105.4 | Useful helpers for React Three Fiber |
| **Framer Motion** | 12.23.24 | Animation library for smooth transitions |
| **GSAP** | 3.13.0 | Professional-grade animation platform |
| **JavaScript (ES6+)** | - | Modern JavaScript with async/await, modules |
| **CSS3** | - | Styling with gradients, animations, flexbox |

**Frontend Build Output**: ~1,059 KB (290 KB gzipped)

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.12+ | Core programming language |
| **Flask** | 3.1.2 | Lightweight WSGI web framework |
| **Flask-CORS** | 6.0.1 | Cross-Origin Resource Sharing support |
| **PyJWT** | 2.10.1 | JSON Web Token authentication |
| **Werkzeug** | 3.1.3 | Password hashing and security utilities |
| **python-dotenv** | 1.1.1 | Environment variable management |
| **Requests** | 2.32.5 | HTTP library for external API calls |

### Database Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 9.4+ | Primary relational database (production) |
| **psycopg2-binary** | 2.9.11 | PostgreSQL adapter for Python |
| **MySQL** | 8.0+ | Alternative database (development) |
| **mysql-connector-python** | 9.4.0 | MySQL driver for Python |

**Note**: System supports both PostgreSQL (production) and MySQL (development)

### Development Tools
- **Git** - Version control
- **npm** - Frontend package manager
- **pip** - Python package manager
- **venv** - Python virtual environment
- **PowerShell** - Windows terminal for scripts

## 📂 Project Structure

```
online-voting-system/
│
├── 📁 frontend/                           # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/                # Reusable React Components
│   │   │   ├── Navbar.jsx               # Navigation bar with auth state
│   │   │   ├── CandidateCard.jsx        # Candidate display card with voting
│   │   │   ├── Notification.jsx         # Toast notification component
│   │   │   ├── NotificationContainer.jsx # Notification manager
│   │   │   └── ThreeBackground.jsx      # 3D animated particle background
│   │   │
│   │   ├── 📁 pages/                     # Page Components (Routes)
│   │   │   ├── Home.jsx                 # Landing page with 3D effects
│   │   │   ├── Login.jsx                # User authentication page
│   │   │   ├── Register.jsx             # User registration page
│   │   │   ├── Profile.jsx              # User profile & candidate application
│   │   │   ├── Vote.jsx                 # Voting interface with live cards
│   │   │   └── Results.jsx              # Results page (admin only)
│   │   │
│   │   ├── 📁 assets/                    # Static Assets
│   │   │   └── styles.css               # Global styles and animations
│   │   │
│   │   ├── App.jsx                       # Main app component with routing
│   │   └── main.jsx                      # Application entry point
│   │
│   ├── 📁 public/                         # Public Static Files
│   ├── 📁 dist/                           # Production build output
│   ├── index.html                        # HTML template
│   ├── package.json                      # npm dependencies & scripts
│   ├── package-lock.json                 # Locked dependency versions
│   └── vite.config.js                    # Vite configuration
│
├── 📁 backend/                            # Flask Backend Application
│   ├── 📁 routes/                        # API Route Handlers (Blueprints)
│   │   ├── auth_routes.py               # Authentication endpoints (/api/auth/*)
│   │   ├── voter_routes.py              # Voter endpoints (/api/votes/*)
│   │   ├── candidate_routes.py          # Candidate endpoints (/api/candidates/*)
│   │   └── admin_routes.py              # Admin endpoints (/api/admin/*)
│   │
│   ├── 📁 models/                        # Database Models & Logic
│   │   ├── __init__.py                  # Database connection manager
│   │   ├── user_model.py                # User CRUD operations
│   │   ├── candidate_model.py           # Candidate management (apply/revoke)
│   │   └── vote_model.py                # Vote casting & validation
│   │
│   ├── 📁 uploads/                       # User-uploaded files
│   │   └── profile_pictures/            # Candidate profile images
│   │
│   ├── 📁 venv/                          # Python virtual environment
│   │
│   ├── app.py                            # Flask application entry point
│   ├── config.py                         # Configuration settings (DB, JWT)
│   ├── requirements.txt                  # Python dependencies
│   ├── .env                              # Environment variables (gitignored)
│   ├── .env.example                      # Environment template
│   │
│   └── 🔧 Utility Scripts
│       ├── init_db.py                   # Database initialization
│       ├── create_admin.py              # Create admin user
│       ├── add_daily_voting_migration.py # Daily voting migration
│       └── add_profile_pic_migration.py  # Profile picture migration
│
├── 📁 database/                           # Database Schema & Seeds
│   └── voting_system.sql                # SQL schema with sample data
│
├── 📁 Documentation Files               # Comprehensive Guides
│   ├── README.md                        # This file
│   ├── QUICK_START.md                   # Quick setup guide
│   ├── API_DOCUMENTATION.md             # Complete API reference
│   ├── DEPLOYMENT.md                    # Production deployment guide
│   ├── 3D_ANIMATION_FEATURE.md          # 3D background documentation
│   ├── DAILY_VOTING_FEATURE.md          # Daily voting system guide
│   ├── PROFILE_PICTURE_SUMMARY.md       # Profile picture feature
│   ├── REAPPLY_FORM_STYLING_FIX.md      # Form styling documentation
│   └── [50+ other documentation files]
│
├── 🚀 Quick Start Scripts
│   ├── setup.bat                        # Automated setup (Windows)
│   ├── start-both.bat                   # Start frontend + backend
│   ├── start-dev.bat                    # Development mode (Windows)
│   └── start-dev.ps1                    # Development mode (PowerShell)
│
└── plan-for-voting.md                   # Project planning document
```

### Key Directories Explained

- **`frontend/src/components/`** - Reusable UI components used across pages
- **`frontend/src/pages/`** - Full page components mapped to routes
- **`backend/routes/`** - API endpoints organized by feature
- **`backend/models/`** - Database interaction layer with business logic
- **`backend/uploads/`** - File storage for user-uploaded content
- **Documentation Files** - Over 50 markdown guides covering every feature

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Minimum Version | Purpose | Download Link |
|----------|----------------|---------|---------------|
| **Node.js** | v16.0+ | JavaScript runtime for frontend | [nodejs.org](https://nodejs.org/) |
| **npm** | v7.0+ | Node package manager (comes with Node.js) | Included with Node.js |
| **Python** | v3.8+ | Backend programming language | [python.org](https://www.python.org/) |
| **pip** | v21.0+ | Python package manager (comes with Python) | Included with Python |
| **PostgreSQL** | v9.4+ | Primary database (production) | [postgresql.org](https://www.postgresql.org/) |
| **MySQL** | v8.0+ | Alternative database (development) | [mysql.com](https://www.mysql.com/) |
| **Git** | v2.30+ | Version control system | [git-scm.com](https://git-scm.com/) |

### System Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 500 MB for project + dependencies
- **Display**: 1920x1080 recommended for development

### Verify Installations

```powershell
# Check Node.js and npm
node --version   # Should show v16.0.0 or higher
npm --version    # Should show v7.0.0 or higher

# Check Python and pip
python --version # Should show Python 3.8.0 or higher
pip --version    # Should show pip 21.0.0 or higher

# Check Git
git --version    # Should show git version 2.30.0 or higher

# Check PostgreSQL
psql --version   # Should show psql (PostgreSQL) 9.4 or higher
```

## 🚀 Installation & Dependencies

### Quick Start (Automated Setup)

For Windows users, use the automated setup script:

```powershell
# Run the setup script
.\setup.bat

# This will automatically:
# 1. Install frontend dependencies
# 2. Install backend dependencies
# 3. Create virtual environment
# 4. Set up environment variables
```

### Manual Installation

#### 1️⃣ Clone the Repository

```bash
# Clone from your repository
git clone <repository-url>
cd online-voting-system
```

#### 2️⃣ Frontend Dependencies Installation

```bash
# Navigate to frontend directory
cd frontend

# Install all npm packages
npm install
```

**Frontend Dependencies Installed** (from `package.json`):

**Production Dependencies:**
```json
{
  "@react-three/drei": "^9.105.4",      // Three.js helpers (3D components)
  "@react-three/fiber": "^8.15.19",     // React renderer for Three.js
  "axios": "^1.6.2",                     // HTTP client for API calls
  "framer-motion": "^12.23.24",          // Animation library
  "gsap": "^3.13.0",                     // Animation platform
  "react": "^18.2.0",                    // Core React library
  "react-dom": "^18.2.0",                // React DOM rendering
  "react-router-dom": "^6.20.0",         // Client-side routing
  "three": "^0.163.0"                    // 3D graphics library
}
```

**Development Dependencies:**
```json
{
  "@types/react": "^18.2.43",            // React TypeScript types
  "@types/react-dom": "^18.2.17",        // React DOM TypeScript types
  "@vitejs/plugin-react": "^4.2.1",      // Vite React plugin
  "vite": "^5.0.8"                       // Build tool & dev server
}
```

**Total Frontend Packages**: ~300+ dependencies (including sub-dependencies)

#### 3️⃣ Backend Dependencies Installation

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows Command Prompt:
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

**Backend Dependencies Installed** (from `requirements.txt`):

```
Flask==3.1.2                    # Web framework
flask-cors==6.0.1               # CORS support
PyJWT==2.10.1                   # JWT authentication
Werkzeug==3.1.3                 # Security utilities
python-dotenv==1.1.1            # Environment variables
psycopg2-binary==2.9.11         # PostgreSQL adapter
mysql-connector-python==9.4.0   # MySQL driver
requests==2.32.5                # HTTP library
```

**Supporting Packages:**
```
blinker==1.9.0                  # Signal support
certifi==2025.10.5              # SSL certificates
charset-normalizer==3.4.4       # Character encoding
click==8.3.0                    # CLI utilities
colorama==0.4.6                 # Colored terminal output
idna==3.11                      # Internationalized domain names
itsdangerous==2.2.0             # Security helpers
Jinja2==3.1.6                   # Template engine
MarkupSafe==3.0.3               # String escaping
urllib3==2.5.0                  # HTTP library
```

**Total Backend Packages**: ~18 core packages

#### 4️⃣ Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Navigate to backend directory
cd backend

# Copy example file
copy .env.example .env
```

**Edit `.env` with your configuration:**

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production

# PostgreSQL Configuration (Production)
DB_TYPE=postgresql
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=voting_system
DB_PORT=5432

# MySQL Configuration (Alternative for Development)
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=voting_system
# DB_PORT=3306

# Server Configuration
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_FOLDER=uploads/profile_pictures
MAX_FILE_SIZE=5242880  # 5 MB in bytes
```

### Dependency Management

#### Update Frontend Dependencies

```bash
cd frontend

# Check for outdated packages
npm outdated

# Update all packages to latest versions
npm update

# Update specific package
npm install <package-name>@latest
```

#### Update Backend Dependencies

```bash
cd backend

# Activate virtual environment first
.\venv\Scripts\Activate.ps1

# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade <package-name>

# Update all packages (careful!)
pip install --upgrade -r requirements.txt
```

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended for Production)

#### 1️⃣ Install and Start PostgreSQL

```powershell
# Start PostgreSQL service (Windows)
Start-Service -Name postgresql-x64-14

# Or use pgAdmin 4 GUI to start the service
```

#### 2️⃣ Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE voting_system;

# Create user (optional)
CREATE USER voting_admin WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE voting_system TO voting_admin;

# Exit
\q
```

#### 3️⃣ Run Database Schema

```bash
# Navigate to database directory
cd database

# Execute SQL schema
psql -U postgres -d voting_system -f voting_system.sql
```

#### 4️⃣ Verify Database Tables

```sql
# Connect to database
psql -U postgres -d voting_system

# List tables
\dt

# Expected tables:
# - users (id, name, email, password, role, profile_picture, dob, gender, created_at)
# - candidates (id, user_id, party, description, is_active, created_at)
# - votes (id, user_id, candidate_id, vote_date, created_at)

# Check table structure
\d users
\d candidates
\d votes

# Exit
\q
```

### Option 2: MySQL (Alternative for Development)

#### 1️⃣ Start MySQL Server

```powershell
# Start MySQL service (Windows)
Start-Service -Name MySQL80

# Or use MySQL Workbench GUI
```

#### 2️⃣ Create Database and Tables

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE voting_system;

# Use the database
USE voting_system;

# Run schema file
source database/voting_system.sql;

# Or execute directly:
mysql -u root -p < database/voting_system.sql
```

#### 3️⃣ Verify Tables

```sql
USE voting_system;
SHOW TABLES;

-- Expected output:
-- +---------------------------+
-- | Tables_in_voting_system   |
-- +---------------------------+
-- | candidates                |
-- | users                     |
-- | votes                     |
-- +---------------------------+

-- Check table structures
DESCRIBE users;
DESCRIBE candidates;
DESCRIBE votes;
```

### Database Schema Overview

#### `users` Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    profile_picture VARCHAR(255),
    dob DATE,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `candidates` Table
```sql
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    party VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

#### `votes` Table
```sql
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    vote_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vote_date)
);
```

### Initialize Database with Python

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run database initialization script
python init_db.py

# Create admin user
python create_admin.py
```

### Database Migrations

The system includes migration scripts for feature updates:

```bash
# Add daily voting functionality
python add_daily_voting_migration.py

# Add profile picture support
python add_profile_pic_migration.py
```

## 🔨 Build & Deployment

### Frontend Build Process

#### Development Build

```bash
cd frontend

# Start development server with hot reload
npm run dev

# Output:
# VITE v5.0.8  ready in 500 ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

**Development Features:**
- ⚡ Hot Module Replacement (HMR) - instant updates
- 🔍 Source maps for debugging
- 🚀 Fast refresh for React components
- 📊 Build performance metrics

#### Production Build

```bash
cd frontend

# Create optimized production build
npm run build

# Output:
# vite v5.0.8 building for production...
# ✓ 645 modules transformed.
# dist/index.html                     0.49 kB │ gzip:   0.32 kB
# dist/assets/index-[hash].css        1.05 kB │ gzip:   0.47 kB
# dist/assets/index-[hash].js     1,059.44 kB │ gzip: 290.58 kB
# ✓ built in 5.88s
```

**Build Output** (`frontend/dist/`):
```
dist/
├── index.html                    # Entry HTML (0.49 KB)
├── assets/
│   ├── index-[hash].css         # Compiled CSS (1.05 KB)
│   └── index-[hash].js          # Bundled JavaScript (1,059 KB)
└── [other static assets]
```

**Build Optimizations:**
- ✅ Code minification and uglification
- ✅ Tree shaking (removes unused code)
- ✅ Asset optimization (images, fonts)
- ✅ Gzip compression (290 KB final size)
- ✅ Cache busting with content hashes
- ✅ Code splitting for faster loads

#### Preview Production Build

```bash
cd frontend

# Preview the production build locally
npm run preview

# Output:
# ➜  Local:   http://localhost:4173/
# ➜  Network: use --host to expose
```

### Backend Deployment

#### Development Mode

```bash
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run Flask development server
python app.py

# Output:
# * Serving Flask app 'app'
# * Debug mode: on
# * Running on http://127.0.0.1:5000
# * Restarting with stat
```

**Development Features:**
- 🔄 Auto-reload on code changes
- 🐛 Debug mode with detailed errors
- 📝 Request logging
- 🔍 Interactive debugger

#### Production Mode

**1. Update Environment Variables:**

```env
# backend/.env
FLASK_ENV=production
DEBUG=False
```

**2. Use Production WSGI Server:**

```bash
# Install Gunicorn (production server)
pip install gunicorn

# Run with Gunicorn (Linux/macOS)
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Windows alternative: waitress
pip install waitress
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

**Gunicorn Configuration:**
```python
# gunicorn.conf.py
workers = 4                    # Number of worker processes
worker_class = 'sync'          # Worker type
bind = '0.0.0.0:5000'         # Bind address
timeout = 120                  # Request timeout
keepalive = 5                  # Keep-alive timeout
accesslog = 'logs/access.log'  # Access log file
errorlog = 'logs/error.log'    # Error log file
loglevel = 'info'              # Log level
```

### Docker Deployment (Optional)

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app:app"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=database
    depends_on:
      - database

  database:
    image: postgres:14
    environment:
      - POSTGRES_DB=voting_system
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy with Docker:**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Build Scripts

The project includes convenient batch scripts for Windows:

#### `setup.bat` - Initial Setup
```batch
@echo off
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo Setup complete!
```

#### `start-both.bat` - Start Everything
```batch
@echo off
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python app.py"
start "Frontend" cmd /k "cd frontend && npm run dev"
echo Servers starting...
```

#### `start-dev.ps1` - PowerShell Version
```powershell
# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python app.py"

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Development servers started!" -ForegroundColor Green
```

### Deployment Checklist

#### Pre-Deployment
- [ ] Update `.env` with production credentials
- [ ] Set `FLASK_ENV=production`
- [ ] Change default SECRET_KEY and JWT_SECRET_KEY
- [ ] Update CORS allowed origins
- [ ] Run security audit: `npm audit` (frontend)
- [ ] Test all API endpoints
- [ ] Build frontend: `npm run build`
- [ ] Test production build: `npm run preview`

#### Production Server
- [ ] Set up PostgreSQL database
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up process manager (PM2/systemd)
- [ ] Configure logging and monitoring
- [ ] Set up automated backups
- [ ] Configure CDN for static assets (optional)

#### Post-Deployment
- [ ] Verify all routes are accessible
- [ ] Test user registration and login
- [ ] Test voting functionality
- [ ] Test file uploads (profile pictures)
- [ ] Verify admin panel access
- [ ] Check database connections
- [ ] Monitor server logs
- [ ] Test mobile responsiveness

### Performance Optimization

#### Frontend Optimizations
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}
```

#### Backend Optimizations
- Enable gzip compression
- Use database connection pooling
- Implement caching (Redis)
- Optimize database queries with indexes
- Use CDN for static files

### Build Troubleshooting

#### Frontend Build Errors

**Issue**: "Module not found"
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Issue**: "Out of memory"
```bash
# Solution: Increase Node.js memory
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Backend Build Errors

**Issue**: "Module not found"
```bash
# Solution: Reinstall packages
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

**Issue**: "Database connection failed"
```bash
# Solution: Check database service
# PostgreSQL:
Get-Service postgresql-x64-14
# MySQL:
Get-Service MySQL80
```

## ▶️ Running the Application

### Quick Start (Recommended)

Use the automated start script:

```powershell
# Start both frontend and backend together
.\start-both.bat

# Or use PowerShell script
.\start-dev.ps1
```

This will open two terminal windows:
- **Backend**: Flask server on http://localhost:5000
- **Frontend**: Vite dev server on http://localhost:3000

### Manual Start

#### 1️⃣ Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Run Flask development server
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: xxx-xxx-xxx
```

**Backend Server**: http://localhost:5000

#### 2️⃣ Start Frontend Development Server

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Start Vite dev server
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

**Frontend Application**: http://localhost:3000

### Access the Application

Open your browser and navigate to:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://localhost:5000 | REST API endpoints |
| **API Docs** | http://localhost:5000/api | API documentation |

### Default Credentials

#### Admin Account
```
Email: admin@voting.com
Password: admin123
Role: Admin
```

**⚠️ Security Warning**: Change the default admin password after first login!

#### Test User Accounts

Create your own accounts using the registration page, or use sample data from the database seed.

### Application Workflow

```
1. 🏠 Home Page (http://localhost:3000)
   ↓
2. 📝 Register (http://localhost:3000/register)
   ↓
3. 🔐 Login (http://localhost:3000/login)
   ↓
4. 👤 Profile (http://localhost:3000/profile)
   ├─ Update personal information
   └─ Apply for candidacy
   ↓
5. 🗳️ Vote Page (http://localhost:3000/vote)
   ├─ View active candidates
   └─ Cast your vote (once per day)
   ↓
6. 📊 Results (http://localhost:3000/results) [Admin Only]
   └─ View voting statistics
```

### Development Mode Features

#### Frontend (Vite)
- ⚡ **Hot Module Replacement (HMR)** - Changes reflect instantly
- 🔍 **Source Maps** - Debug original TypeScript/JSX code
- 🚀 **Fast Refresh** - Preserves React state during edits
- 📊 **Performance Metrics** - Build time and bundle size tracking

#### Backend (Flask)
- � **Auto-Reload** - Server restarts on code changes
- 🐛 **Debug Mode** - Detailed error pages with stack traces
- 📝 **Request Logging** - All API calls logged to console
- 🔍 **Interactive Debugger** - Debug in browser with PIN

### Monitoring and Logs

#### View Backend Logs

```bash
# Backend terminal shows:
127.0.0.1 - - [19/Oct/2025 10:30:15] "GET /api/candidates HTTP/1.1" 200 -
127.0.0.1 - - [19/Oct/2025 10:30:16] "POST /api/votes HTTP/1.1" 201 -
127.0.0.1 - - [19/Oct/2025 10:30:17] "GET /api/votes/me HTTP/1.1" 200 -
```

#### View Frontend Logs

```bash
# Frontend terminal shows:
10:30:15 AM [vite] hmr update /src/pages/Vote.jsx
10:30:16 AM [vite] page reload src/App.jsx
```

#### Browser Console

Press **F12** to open Developer Tools and view:
- Network requests (fetch/axios calls)
- Console logs (console.log outputs)
- React component tree
- Performance metrics

### Stopping the Servers

#### Stop Backend
```bash
# In backend terminal, press:
Ctrl + C

# Then deactivate virtual environment:
deactivate
```

#### Stop Frontend
```bash
# In frontend terminal, press:
Ctrl + C
```

#### Stop Both (Using Scripts)
```bash
# If using start-both.bat, close both terminal windows
# Or press Ctrl+C in each window
```

## 🔄 Development Workflow

### Frontend Development Cycle

```bash
# 1. Start dev server
cd frontend
npm run dev

# 2. Make changes to components/pages
# - Files auto-reload with HMR
# - Check browser console for errors

# 3. Test in browser
# - http://localhost:3000

# 4. Build for production
npm run build
```

### Backend Development Cycle

```bash
# 1. Start Flask server
cd backend
.\venv\Scripts\Activate.ps1
python app.py

# 2. Make changes to routes/models
# - Server auto-reloads in debug mode

# 3. Test API endpoints
# - Use curl, Postman, or browser

# 4. Check logs in terminal
```

### Typical Development Tasks

#### Add New Frontend Component
```jsx
// 1. Create file: frontend/src/components/NewComponent.jsx
import React from 'react';

const NewComponent = () => {
  return <div>New Component</div>;
};

export default NewComponent;

// 2. Import in page: frontend/src/pages/SomePage.jsx
import NewComponent from '../components/NewComponent';

// 3. Use in JSX
<NewComponent />
```

#### Add New Backend Endpoint
```python
# 1. Create route: backend/routes/new_routes.py
from flask import Blueprint, jsonify

new_bp = Blueprint('new', __name__)

@new_bp.route('/api/new', methods=['GET'])
def new_endpoint():
    return jsonify({'message': 'Success'}), 200

# 2. Register in app.py
from routes.new_routes import new_bp
app.register_blueprint(new_bp)
```

#### Update Database Schema
```bash
# 1. Create migration file
# backend/migrations/add_field.py

# 2. Run migration
python backend/migrations/add_field.py

# 3. Update models as needed
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test

# 3. Commit changes
git add .
git commit -m "feat: Add new feature"

# 4. Push to remote
git push origin feature/new-feature

# 5. Create Pull Request
```

### Debugging Tips

**Frontend:**
- Open DevTools (F12)
- Check Console tab for errors
- Use Network tab for API calls
- Use React DevTools for component inspection

**Backend:**
- Check terminal output for errors
- Use `print()` statements for debugging
- Check database with SQL queries
- Use Flask debugger for detailed errors

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Voting Endpoints

#### Get Candidates
```http
GET /api/candidates
```

#### Cast Vote
```http
POST /api/votes
Authorization: Bearer <token>
Content-Type: application/json

{
  "candidateId": 1
}
```

#### Check Vote Status
```http
GET /api/votes/me
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Results (Admin Only)
```http
GET /api/results
Authorization: Bearer <token>
```

#### Add Candidate (Admin Only)
```http
POST /api/candidates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "party": "Independent Party",
  "position": "President"
}
```

## 🔑 Default Credentials

### Admin Account
- **Email**: admin@voting.com
- **Password**: admin123
- **Role**: Admin

**Note**: Change the default password after first login in production!

### Sample Candidates
The database includes 4 sample candidates:
1. John Smith - Democratic Party
2. Jane Doe - Republican Party
3. Michael Johnson - Independent
4. Sarah Williams - Green Party

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - Passwords encrypted using Werkzeug
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **CORS Protection** - Configured for specific origins
- ✅ **One Vote Per User** - Database constraints ensure uniqueness
- ✅ **Role-Based Access** - Admin-only routes protected
- ✅ **Session Management** - Token expiration and validation

## 🧪 Testing

### Test User Registration
1. Go to http://localhost:3000/register
2. Create a new account
3. Login with credentials
4. Cast your vote

### Test Admin Features
1. Login with admin credentials
2. Access Results page
3. View voting statistics

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
.\venv\Scripts\Activate.ps1
py app.py
```

### Build for Production

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
Set `FLASK_ENV=production` in `.env`

## 📝 Future Enhancements

- [ ] OTP-based two-factor authentication
- [ ] Email verification for registration
- [ ] Real-time vote updates using WebSockets
- [ ] Blockchain integration for vote tracking
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export results to PDF/Excel

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Project Lead**: [Your Name]
- **Frontend Developer**: [Name]
- **Backend Developer**: [Name]
- **Database Manager**: [Name]

## 🙏 Acknowledgments

- React team for the amazing framework
- Flask team for the lightweight backend
- MySQL for reliable database management
- All contributors and testers

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Email: support@votingsystem.com

---

**Made with ❤️ for secure and transparent voting**
