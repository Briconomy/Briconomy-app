const database = typeof db !== "undefined" ? db : null;

if (!database) {
	throw new Error("Mongo shell db context not available");
}

database.security_config.drop();
database.auth_config.drop();

print("Auth configuration reset complete. The system will auto-initialize with defaults.");