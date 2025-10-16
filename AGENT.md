# Agent guidelines

## Project Overview
**Briconomy** - Progressive Web Application built with React.js and Deno, Typically a mobile app that also can run on web browser. 

## System Environment
- **Runtime**: Deno
- **OS**: Cross-platform (Linux, Windows, macOS)
- **Database**: MongoDB (user managed)
- **Target Platform**: Progressive Web App (Android focus)

## Tech Stack
- **Frontend**: React.js 18.2.0
- **Routing**: React Router DOM 6.8.1
- **Charts**: Chart.js 4.2.1 with react-chartjs-2 5.2.0
- **Database**: MongoDB
- **Runtime**: Deno
- **Platform**: Progressive Web App

## Development Commands

### Main Development Tasks
```bash
# Start development server (frontend only)
deno task dev

# Start development server with API
deno task dev-full

# Build for production
deno task build

# Preview production build
deno task preview

# Start API server only
deno task api

# Initialize database with sample data
deno task init-db
```

### Windows Commands
```cmd
# On Windows Command Prompt
deno task dev
deno task dev-full
deno task build
deno task preview
deno task api
deno task init-db

# On Windows PowerShell
deno task dev
deno task dev-full
deno task build
deno task preview
deno task api
deno task init-db
```

### Database Setup
- **Database**: MongoDB (local instance required)
- **Database Name**: `briconomy`
- **Port**: 27017
- **Initialization**: Run `deno task init-db` to set up collections and sample data

```bash
# Initialize database
deno task init-db
```

### Cross-platform Development Notes

#### Shell Scripts
- **Linux/macOS**: Use `start.sh` for development
- **Windows**: Use `start.bat` for development
- Both scripts are provided in the project root

#### Port Configuration
- **Development server**: Port 5173 (configurable)
- **API server**: Port 8816 (configurable)
- **MongoDB**: Port 27017 (default)
- Ensure ports are available on both platforms

## General Page Layout
Pages will all have a logout button at the top right of the page 
Pages will have specific navigation bar elements based on what page they are on and what user is logged in. These will be specified and separated with commas in square brackets 
Note that all buttons encapsulated in [] are bottom nav bar buttons.
Keep colors consistent across each pages.
When creating documents or files create all the related files associated with each.

## User-Facing Routes and Page Layouts

This section reflects the current user-visible routes and layouts based on `src/App.tsx`.

### Scope
- **Included**: Public/Prospective Tenant, Admin, Tenant, Caretaker, Manager routes
- **Conventions**: Top-right Logout button on all authenticated pages. Bottom nav buttons per role as noted below.

### Public / Prospective Tenant Routes
- Landing: `/` — Entry point and marketing/overview
- Login: `/login` — Authentication entry
- Forgot Password: `/forgot-password` — Password recovery page
- Property list: `/properties` — Property catalog
- Browse properties: `/browse-properties` — Prospective view of properties
- Property details: `/property/:id` — Public details page
- Apply for a property: `/apply/:id` — Application form for a specific property

**Bottom nav**: None (public). **Top-right**: Logout not shown until authenticated.

### Admin Routes
- Dashboard: `/admin`
- Users: `/admin/users`
- Add User: `/admin/add-user`
- Security: `/admin/security`
- Reports: `/admin/reports`
- Operations: `/admin/operations`
- API Test: `/admin/api-test`

**Bottom nav (admin)**: [Dashboard, Users, Security, Reports]. **Top-right**: Logout, Language Switcher.

### Tenant Routes
- Dashboard: `/tenant`
- Payments: `/tenant/payments`
- Manage payment methods: `/tenant/manage-payment-methods`
- Add payment method: `/tenant/add-payment-method`
- Edit payment method: `/tenant/edit-payment-method/:id`
- Maintenance requests: `/tenant/requests`
- Messages to manager: `/tenant/messages`
- Profile hub: `/tenant/profile` — Main profile page (UserProfilePage)
  - Edit profile: `/tenant/profile/edit` — Dedicated edit page (TenantProfileEditPage)
  - Payment methods: `/tenant/profile/payment-methods` — Routes to UserProfilePage
  - Documents: `/tenant/profile/documents` — Routes to UserProfilePage
  - Help: `/tenant/profile/help` — Routes to UserProfilePage
  - Activity: `/tenant/profile/activity` — Routes to UserProfilePage
- Documents (standalone): `/tenant/documents` — Dedicated documents page (TenantDocumentsPage)
- Activity (standalone): `/tenant/activity` — Dedicated activity page (TenantActivityPage)

**Bottom nav (tenant)**: [Home, Payments, Requests, Profile]. **Top-right**: Logout, Language Switcher.

### Caretaker Routes
- Dashboard/Tasks: `/caretaker` and `/caretaker/tasks`
- Schedule: `/caretaker/schedule`
- History: `/caretaker/history`
- Profile: `/caretaker/profile`
- Maintenance: `/caretaker/maintenance`
- Reports: `/caretaker/reports`

**Bottom nav (caretaker)**: [Tasks, Schedule, History, Profile]. **Top-right**: Logout, Language Switcher.

### Manager Routes
- Dashboard: `/manager`
- Properties list: `/manager/properties`
- Leases hub: `/manager/leases`
  - Create lease: `/manager/leases/new`
  - Renewals: `/manager/renewals`
  - Terminations: `/manager/terminations`
    - Initiate: `/manager/terminations/initiate`
    - Settlement: `/manager/terminations/settlement`
    - Documents: `/manager/terminations/documents`
    - Report: `/manager/terminations/report`
- Payments: `/manager/payments`
- Maintenance: `/manager/maintenance`
- Documents: `/manager/documents`
- Reports: `/manager/reports`

**Bottom nav (manager)**: [Dashboard, Properties, Leases, Payments]. **Top-right**: Logout, Language Switcher.

### Property Management Routes (Manager)
- New property: `/property/new`
- Edit property: `/property/:id/edit`
- Units: `/property/:id/units`
- Tenants: `/property/:id/tenants`
- Maintenance: `/property/:id/maintenance`

These are manager-protected routes and typically accessed from Properties/Leases pages.

## Code Quality
- NO code comments in production files
- NO emojis in codebase
- Clean, readable structure
- Consistent naming conventions

## Prohibited in ALL Code
- Emojis in code or UI elements
- Code comments (except assumption tagging)

## Required Assumption Tagging Format

When writing code, ALWAYS add tagged comments for ANY assumption:

```typescript
// #COMPLETION_DRIVE: [what you're assuming]
// #SUGGEST_VERIFY: [how to fix/validate it]
```

**Example:**

```typescript
// #COMPLETION_DRIVE: Assuming state update completes before navigation
// #SUGGEST_VERIFY: Use callback or await state update confirmation
setUserData(newData);
navigateToProfile(userData.id);
```
