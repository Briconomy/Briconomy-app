import { connectToMongoDB, getCollection, User } from "./db.ts";

const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerUser(userData: {
  fullName: string;
  email: string;
  phone: string;
  userType: 'admin' | 'manager' | 'caretaker' | 'tenant';
  password: string;
}): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    await connectToMongoDB();
    const users = getCollection<User>("users");
    
    const existingUser = await users.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, message: "User already exists with this email" };
    }
    
    const hashedPassword = await hashPassword(userData.password);
    
    const newUser: User = {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      userType: userData.userType,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await users.insertOne(newUser);
    
    return { 
      success: true, 
      message: "User registered successfully", 
      userId: result.toString()
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed" };
  }
}

export async function loginUser(email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  user?: { 
    id: string; 
    fullName: string; 
    email: string; 
    userType: string; 
  } 
}> {
  try {
    await connectToMongoDB();
    const users = getCollection<User>("users");
    
    const hashedPassword = await hashPassword(password);
    
    const user = await users.findOne({ 
      email: email, 
      password: hashedPassword 
    });
    
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    
    return {
      success: true,
      message: "Login successful",
      user: {
        id: user._id?.toString() || '',
        fullName: user.fullName,
        email: user.email,
        userType: user.userType
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed" };
  }
}