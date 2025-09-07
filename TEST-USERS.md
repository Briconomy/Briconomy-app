# Bricomony Test Users Documentation

## Overview
This document contains all test users created for the Bricomomy application development. All passwords are encrypted using SHA-256 hashing algorithm as implemented in the application.

## User Roles

### 1. Administrator (1 user)
**Full Name:** Sarah Johnson  
**Email:** admin@briconomy.com  
**Phone:** +27821234567  
**Password:** admin123  
**Employee ID:** ADMIN001  
**Department:** System Administration  
**Join Date:** 2023-01-15  

### 2. Property Managers (2 users)

#### Michael Chen
**Email:** manager1@briconomy.com  
**Phone:** +27823456789  
**Password:** manager123  
**Employee ID:** MGR001  
**Department:** Property Management  
**Join Date:** 2023-02-20  

#### Patricia Williams
**Email:** manager2@briconomy.com  
**Phone:** +27825678901  
**Password:** manager123  
**Employee ID:** MGR002  
**Department:** Property Management  
**Join Date:** 2023-03-10  

### 3. Caretakers (2 users)

#### David Mokoena
**Email:** caretaker1@briconomy.com  
**Phone:** +27827890123  
**Password:** caretaker123  
**Employee ID:** CARE001  
**Department:** Maintenance  
**Skills:** Plumbing, Electrical, General  
**Join Date:** 2023-04-05  

#### Thabo Ndlovu
**Email:** caretaker2@briconomy.com  
**Phone:** +27829012345  
**Password:** caretaker123  
**Employee ID:** CARE002  
**Department:** Maintenance  
**Skills:** Carpentry, Painting, Landscaping  
**Join Date:** 2023-05-12  

### 4. Tenants (5 users)

#### Emma Thompson
**Email:** tenant1@briconomy.com  
**Phone:** +27821234568  
**Password:** tenant123  
**Occupation:** Software Developer  
**Emergency Contact:** +27821234569  
**Move-in Date:** 2023-06-01  

#### James Smith
**Email:** tenant2@briconomy.com  
**Phone:** +27823456790  
**Password:** tenant123  
**Occupation:** Teacher  
**Emergency Contact:** +27823456791  
**Move-in Date:** 2023-07-15  

#### Lisa Anderson
**Email:** tenant3@briconomy.com  
**Phone:** +27825678902  
**Password:** tenant123  
**Occupation:** Nurse  
**Emergency Contact:** +27825678903  
**Move-in Date:** 2023-08-20  

#### Robert Brown
**Email:** tenant4@briconomy.com  
**Phone:** +27827890124  
**Password:** tenant123  
**Occupation:** Engineer  
**Emergency Contact:** +27827890125  
**Move-in Date:** 2023-09-10  

#### Maria Garcia
**Email:** tenant5@briconomy.com  
**Phone:** +27829012346  
**Password:** tenant123  
**Occupation:** Designer  
**Emergency Contact:** +27829012347  
**Move-in Date:** 2023-10-05  

## Password Encryption

All passwords are encrypted using SHA-256 hashing algorithm. The application uses the following encryption method:

```javascript
const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

## Database Initialization

To initialize the database with these test users, run:

```bash
deno task init-db
```

This will execute the MongoDB script located at `scripts/init-db.js` which creates all users with properly encrypted passwords.

## Usage Notes

- All users are marked as active (`isActive: true`)
- All users have profile information relevant to their roles
- Passwords are simple for development purposes (use same password within roles)
- In production, implement stronger password requirements
- Phone numbers use South African format (+27)
- All dates are in ISO format

## Security Considerations

- These test users are for development purposes only
- Passwords are simple and should be changed in production
- The encryption method matches the application's authentication system
- No sensitive personal information is used in test data