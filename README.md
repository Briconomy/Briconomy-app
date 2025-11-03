<div align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
  <img src="src/Icons/BriconomyReadMELogo.svg" alt="Briconomy Logo" width="1000" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));"/>
</div>

## Contributors

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/JMosselson">
        <img src="https://github.com/JMosselson.png" width="100px" alt="Jordan Mosselson"/><br/>
        <b>Jordan Mosselson</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/MatthewHubbard123">
        <img src="https://github.com/MatthewHubbard123.png" width="100px" alt="Matthew Hubbard"/><br/>
        <b>Matthew Hubbard</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Max0xDay">
        <img src="https://github.com/Max0xDay.png" width="100px" alt="Max Day"/><br/>
        <b>Max Day</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/SharDai">
        <img src="https://github.com/ShortJai.png" width="100px" alt="Jaiyesh Pillay"/><br/>
        <b>Jaiyesh Pillay</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Tashil10">
        <img src="https://github.com/Tashil10.png" width="100px" alt="Tashil Koseelan"/><br/>
        <b>Tashil Koseelan</b>
      </a>
    </td>
  </tr>
</table>

---



# Briconomy - Property Management & Tenant Portal

Full-stack property management application built with React, Deno, and MongoDB. Enables property managers, tenants, caretakers, and administrators to collaborate in managing rental properties, leases, payments, and maintenance.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Pages & Routes](#pages--routes)
- [API Endpoints](#api-endpoints)
- [Core Features](#core-features)
- [Authentication & Authorization](#authentication--authorization)
- [Data Models](#data-models)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites
- Deno runtime
- MongoDB instance
- Node.js 18+ (for build tools)

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Development
deno run -A dev-server.ts

# Server runs on http://localhost:3000
```

### Production

```bash
npm run build
deno run -A api-server.ts
```

---

## Architecture

Frontend: React 18, TypeScript, CSS3
State Management: React Context API (Auth, Language, Toast, ProspectiveTenant)
Backend: Deno, TypeScript
Database: MongoDB
Real-time: WebSocket

### Project Structure

```
src/
├── pages/          # 50 page components
├── components/     # 37 reusable UI components
├── contexts/       # 4 context providers
├── services/       # API client, notifications, chatbot
├── utils/          # Utility functions
├── styles/         # Global CSS
└── Icons/          # SVG assets

Root:
├── api-server.ts      # Deno HTTP server
├── api-services.ts    # MongoDB operations
└── db.ts              # Database connection
```

---

## User Roles

### Admin (System Administrator)
8 Pages: Dashboard, Users, Add User, Pending Users, Security, Operations, Reports, Access Logs
- Full system control and user management
- Access to all system data

### Manager (Property Manager)
12 Pages: Dashboard, Properties, Applications, Leases, Create Lease, Lease Details, Renewals, Payments, Maintenance, Documents, Reports, Access Logs
- Property and lease management
- Payment approvals and tenant oversight
- Access: Only their properties and tenants

### Tenant (Residential Unit Occupant)
13 Pages: Dashboard, Payments, Add/Manage/Edit Payment Methods, Maintenance Requests, Profile, Edit Profile, Documents, Activity, Access Logs
- Rent payment and lease viewing
- Maintenance request submission
- Document access
- Access: Only their own lease, payments, requests

### Caretaker (Property Maintenance)
8 Pages: Dashboard, Tasks, Schedule, History, Maintenance, Profile, Reports, Access Logs
- Maintenance task management
- Work schedule viewing
- Task completion tracking
- Access: Assigned properties and tasks only

### Public/Prospective Tenant
Landing, Login, Register, Forgot Password, Browse Properties, Property Details, Rental Application, Pending Approval
- Property browsing and rental applications

---

## Pages & Routes

### Admin Routes
```
/admin                    Dashboard
/admin/users              User management
/admin/add-user           Create user
/admin/pending-users      Approve registrations
/admin/security           Security settings
/admin/operations         System operations
/admin/reports            System reports
/admin/access-logs        Audit logs
/admin/api-test           API testing
```

### Manager Routes
```
/manager                  Dashboard
/manager/properties       Property management
/manager/applications     Rental applications
/manager/leases           Lease management
/manager/leases/new       Create lease
/manager/leases/:id       Lease details
/manager/renewals         Lease renewals
/manager/payments         Payment approvals
/manager/maintenance      Maintenance oversight
/manager/documents        Document storage
/manager/reports          Analytics
/manager/access-logs      Activity log
```

### Tenant Routes
```
/tenant                              Dashboard
/tenant/payments                     Payment history
/tenant/add-payment-method           Add payment method
/tenant/manage-payment-methods       Manage payment methods
/tenant/edit-payment-method/:id      Edit payment method
/tenant/requests                     Maintenance requests
/tenant/profile                      Profile view
/tenant/profile/edit                 Profile edit
/tenant/documents                    Documents
/tenant/activity                     Activity log
/tenant/access-logs                  Login history
/tenant/messages                     Communication
```

### Caretaker Routes
```
/caretaker                Dashboard
/caretaker/tasks          Task management
/caretaker/schedule       Work schedule
/caretaker/history        Completed tasks
/caretaker/maintenance    Maintenance details
/caretaker/profile        Profile
/caretaker/reports        Performance reports
/caretaker/access-logs    Activity log
```

### Public Routes
```
/                         Landing page
/login                    Login
/forgot-password          Password recovery
/register                 Registration
/pending-approval         Application status
/browse-properties        Property search
/property/:id             Property details
/apply/:id                Rental application
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/register-pending
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Properties & Units
```
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/units
POST   /api/units
GET    /api/units/:id
PUT    /api/units/:id
```

### Leases
```
GET    /api/leases
POST   /api/leases
GET    /api/leases/:id
PUT    /api/leases/:id
DELETE /api/leases/:id

GET    /api/renewals
POST   /api/renewals
GET    /api/renewals/:id
PATCH  /api/renewals/:id
```

### Payments & Invoices
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
POST   /api/payments/:id/approve
POST   /api/payments/:id/reject

GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
GET    /api/invoices/:id/pdf
GET    /api/invoices/:id/markdown
```

### Maintenance & Tasks
```
GET    /api/maintenance
POST   /api/maintenance
GET    /api/maintenance/:id
PUT    /api/maintenance/:id
DELETE /api/maintenance/:id

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Documents
```
GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
DELETE /api/documents/:id
```

### Notifications
```
GET    /api/notifications
POST   /api/notifications
POST   /api/push-subscribe
```

### Admin/Manager
```
GET    /api/manager/applications
POST   /api/manager/applications/:id/approve
POST   /api/manager/applications/:id/reject

GET    /admin/system-stats
GET    /admin/user-stats
GET    /admin/security-stats
GET    /admin/financial-stats
GET    /api/admin/users
```

### Communication
```
GET    /api/chat-messages
POST   /api/chat-messages
POST   /api/chat-escalations
```

### Announcements
```
GET    /api/announcements
POST   /api/announcements
POST   /api/announcements/:id/send
DELETE /api/announcements/:id
```

### Reports
```
GET    /api/reports
POST   /api/reports
```

### Real-time
```
WS     /ws                WebSocket connection
```

---

## Core Features

### 1. Payment Management
- Tenant payment submission with proof upload
- Manager payment approval/rejection workflow
- Payment method management
- Invoice generation (PDF, Markdown)
- Payment status tracking and notifications

### 2. Lease Management
- Create and manage lease agreements
- Automated renewal reminders
- Lease document storage
- Renewal applications and processing

### 3. Maintenance Requests
- Tenant-submitted maintenance requests
- Manager assignment to caretakers
- Priority levels and scheduling
- Real-time status updates
- Completion confirmation

### 4. Real-time Notifications
- WebSocket-based updates
- Push notifications
- Activity-based triggers
- Notification history

### 5. Document Management
- Upload and store property documents
- Lease document storage
- Document categorization
- Expiration tracking

### 6. AI-Powered Chat
- BricLLM AI chatbot integration
- Manager escalation
- Chat history

### 7. Multi-role User System
- Admin, Manager, Tenant, Caretaker roles
- Registration and approval workflow
- Role-based access control
- Activity logging and audit trails

### 8. Reporting & Analytics
- System-wide reports (Admin)
- Property and financial reports (Manager)
- Payment history reports (Tenant)
- Performance reports (Caretaker)
- Export to PDF/Excel

### 9. Multi-Language Support
- Language context for UI localization

### 10. Responsive Design
- Mobile-first approach
- Top/bottom navigation components
- Touch-friendly interface

---

## Authentication & Authorization

### Role-Based Access Control (RBAC)

Protected routes:
- `<AdminRoute>` - Admin only
- `<ManagerRoute>` - Manager only
- `<TenantRoute>` - Tenant only
- `<CaretakerRoute>` - Caretaker only

Data filtering by role context:
```typescript
// Manager only sees their properties
const properties = await api.getProperties({ managerId: user.id });

// Tenant only sees their lease/payments
const payments = await api.getPayments({ tenantId: user.id });

// Caretaker only sees assigned tasks
const tasks = await api.getTasks({ caretakerId: user.id });
```

Audit logging on all sensitive operations via `/admin/access-logs`

---

## Data Models

### User
```
_id, fullName, email, phone, userType (admin|manager|caretaker|tenant)
password (hashed), profile {avatar, joinDate, lastLogin, isActive}
createdAt, updatedAt
```

### Property
```
_id, managerId, name, address, city, state, zipCode
totalUnits, yearBuilt, propertyType, description, amenities, photos
createdAt, updatedAt
```

### Unit
```
_id, propertyId, unitNumber, squareFeet, bedrooms, bathrooms
furnished, petPolicy, rentAmount, currentTenantId
status (vacant|occupied|maintenance), createdAt, updatedAt
```

### Lease
```
_id, managerId, tenantId, unitId, propertyId
startDate, endDate, rentAmount, depositAmount, terms
documentUrl, status (active|expired|terminated)
createdAt, updatedAt
```

### Payment
```
_id, tenantId, managerId, leaseId, amount, dueDate
paidDate, paymentMethod, proofUrl
status (pending|submitted|approved|rejected), rejectionReason
createdAt, updatedAt
```

### Maintenance Request
```
_id, tenantId, managerId, propertyId, unitId
title, description, priority (low|medium|high|emergency)
status (open|assigned|in-progress|completed|closed)
assignedCaretakerId, attachments, completedDate, notes
createdAt, updatedAt
```

### Caretaker Task
```
_id, maintenanceId, caretakerId, propertyId
title, description, dueDate, priority (low|medium|high)
status (pending|in-progress|completed)
completedDate, notes, createdAt, updatedAt
```

### Document
```
_id, ownerId, ownerType (manager|tenant|property)
documentType (lease|invoice|receipt|other)
fileName, fileUrl, fileSize, uploadedDate
expirationDate, createdAt, updatedAt
```

### Notification
```
_id, userId, title, message
type (info|warning|error|success), read
action {url, label}, createdAt
```

### Audit Log
```
_id, userId, action, resourceType, resourceId
changes, timestamp
```

---

## Deployment

### Environment Variables

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/briconomy
MONGO_DB_NAME=briconomy
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
BRICLLM_API_KEY=your-api-key
VITE_API_URL=https://api.briconomy.com
```

### Build & Run

```bash
npm run build
deno run -A api-server.ts
```

### Docker

```dockerfile
FROM denoland/deno:latest
WORKDIR /app
COPY . .
RUN deno cache --reload api-server.ts
EXPOSE 3000
CMD ["deno", "run", "-A", "--unstable", "api-server.ts"]
```

```bash
docker build -t briconomy:latest .
docker run -p 3000:3000 --env-file .env briconomy:latest
```

---
