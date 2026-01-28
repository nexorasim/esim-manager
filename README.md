# NexoraSIM eSIM Management Suite

Production-ready multi-tier enterprise eSIM management platform with Windows Desktop Application (.NET 8 WPF), Backend API (Node.js/TypeScript), and Web Dashboard (Next.js/React).

![Build Status](https://github.com/nexorasim/esim-manager/workflows/Build%20and%20Release/badge.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933)
![Next.js](https://img.shields.io/badge/Next.js-14-000000)

## Overview

NexoraSIM is a unified platform for GSMA SGP.22 compliant eSIM profile management across Desktop, Web, and API interfaces. It provides enterprise-grade security with role-based access control, comprehensive audit logging, and encrypted data storage.

## Features

### Desktop Application (Windows)
- Device discovery via WLAN and Bluetooth
- Direct eSIM profile management (provision, activate, remove)
- Offline operation queueing
- DPAPI encrypted storage
- Serilog structured logging

### Web Dashboard
- Modern dark-themed enterprise UI
- Real-time profile and device management
- QR code generation for mobile activation
- Profile templates
- Comprehensive audit logging
- User management with RBAC

### Backend API
- RESTful API with JWT authentication
- Role-based access control (Admin, Operator, Viewer)
- MongoDB persistence with in-memory fallback
- Rate limiting and security headers
- Comprehensive audit trail

## Quick Start

### Desktop Application
```powershell
# Download from releases
# Extract ESimManager-win-x64.zip
# Run ESimManager.exe
```

### Web Dashboard
```bash
# Clone repository
git clone https://github.com/nexorasim/esim-manager.git
cd esim-manager

# Start API
cd api
npm install
npm run dev

# Start Web (new terminal)
cd web
npm install
npm run dev

# Open http://localhost:3000
```

## System Requirements

### Desktop Application
- Windows 10 Pro (1809+) or Windows 11 Pro
- .NET 8 Runtime
- WLAN adapter or Bluetooth 4.0+

### Web/API
- Node.js 20.x
- MongoDB 6.0+ (optional, uses in-memory storage as fallback)

## Architecture

```
esim-manager/
├── ESimManager/           # .NET 8 WPF Desktop Application
│   ├── Models/            # Domain models
│   ├── ViewModels/        # MVVM view models
│   ├── Views/             # XAML views
│   └── Services/          # Business logic
├── api/                   # Node.js/TypeScript Backend API
│   └── src/
│       ├── routes/        # API endpoints
│       ├── services/      # Business logic
│       ├── models/        # MongoDB schemas
│       └── middleware/    # Auth, validation, error handling
├── web/                   # Next.js/React Web Dashboard
│   └── src/
│       ├── pages/         # Route pages
│       ├── components/    # React components
│       ├── services/      # API clients
│       └── contexts/      # React contexts
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD pipelines
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Desktop | .NET 8 WPF + SQLite | Local device management |
| API | Node.js + Express + TypeScript | RESTful backend |
| Web | Next.js 14 + React + TailwindCSS | Enterprise dashboard |
| Database | MongoDB / SQLite | Data persistence |
| Auth | JWT + bcrypt | Secure authentication |
| Testing | xUnit + FsCheck | Property-based testing |
| CI/CD | GitHub Actions | Automated builds |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - List user profiles
- `POST /api/profiles/provision` - Provision new profile
- `POST /api/profiles/:iccid/activate` - Activate profile
- `POST /api/profiles/:iccid/deactivate` - Deactivate profile
- `DELETE /api/profiles/:iccid` - Remove profile

### Devices
- `GET /api/devices` - List user devices
- `POST /api/devices` - Add new device
- `POST /api/devices/:eid/status` - Update device status
- `DELETE /api/devices/:eid` - Remove device

### Admin (Admin role required)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/audit` - Get audit logs

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Administrator | Full system access, user management, audit logs |
| Operator | Profile and device management, templates |
| Viewer | Read-only access to profiles and devices |

## Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy
```

### Environment Variables

**API (.env)**
```
PORT=3001
JWT_SECRET=your-secret-key
MONGO_URL=mongodb://localhost:27017
DB_NAME=nexorasim
```

**Web (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Documentation

- [Installation Guide](docs/installation.md)
- [System Requirements](docs/system-requirements.md)
- [Quick Start Guide](docs/quick-start.md)
- [Developer Guide](docs/developer-guide.md)
- [Troubleshooting](docs/troubleshooting.md)

## Live Demo

- **Web Dashboard**: [nexora-sim.web.app](https://nexora-sim.web.app)
- **Documentation**: [nexorasim.github.io/esim-manager](https://nexorasim.github.io/esim-manager)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://nexorasim.github.io/esim-manager)
- [Issue Tracker](https://github.com/nexorasim/esim-manager/issues)
- [Discussions](https://github.com/nexorasim/esim-manager/discussions)

---

**NexoraSIM** - Enterprise eSIM Management Solutions
