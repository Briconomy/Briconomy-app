// Reset auth configuration to use the correct collection
use briconomy

// Drop the old security_config collection if it exists
db.security_config.drop();

// Drop the auth_config collection to start fresh
db.auth_config.drop();

print("Auth configuration reset complete. The system will auto-initialize with defaults.");