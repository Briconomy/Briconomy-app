# MongoDB Setup Checklist for Briconomy App

## Current Issue
- `mongod` command not recognized
- MongoDB service not properly installed
- Application cannot start due to missing database dependency

## Setup Steps

### 1. Check MongoDB Installation Status
- [ ] Verify if MongoDB is installed on the system
- [ ] Check MongoDB version if installed
- [ ] Verify MongoDB bin directory is in PATH

### 2. Install MongoDB (if not installed)
- [ ] Download MongoDB Community Server from official website
- [ ] Run MongoDB installer with default settings
- [ ] Verify installation completed successfully

### 3. Configure MongoDB Service
- [ ] Create MongoDB data directory (`./data` in project folder)
- [ ] Install MongoDB as Windows service
- [ ] Configure MongoDB to start automatically

### 4. Test MongoDB Connection
- [ ] Start MongoDB service manually
- [ ] Test connection using mongosh
- [ ] Verify database can be accessed

### 5. Update Application Configuration
- [ ] Review start.bat MongoDB startup logic
- [ ] Add error handling for MongoDB connection issues
- [ ] Consider using MongoDB Atlas (cloud) as alternative

### 6. Final Verification
- [ ] Run start.bat script
- [ ] Verify both frontend (port 5173) and API (port 8000) start
- [ ] Test application functionality

## Alternative Solutions
- Use MongoDB Atlas (cloud database) instead of local MongoDB
- Use Docker to run MongoDB in a container
- Use a different database that's easier to install (like SQLite for development)
