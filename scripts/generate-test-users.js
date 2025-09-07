const testUsers = [
  {
    fullName: 'Sarah Johnson',
    email: 'admin@briconomy.com',
    phone: '+27821234567',
    userType: 'admin',
    password: 'admin123',
    profile: {
      department: 'System Administration',
      employeeId: 'ADMIN001',
      joinDate: new Date('2023-01-15')
    }
  },
  {
    fullName: 'Michael Chen',
    email: 'manager1@briconomy.com',
    phone: '+27823456789',
    userType: 'manager',
    password: 'manager123',
    profile: {
      department: 'Property Management',
      employeeId: 'MGR001',
      joinDate: new Date('2023-02-20'),
      managedProperties: []
    }
  },
  {
    fullName: 'Patricia Williams',
    email: 'manager2@briconomy.com',
    phone: '+27825678901',
    userType: 'manager',
    password: 'manager123',
    profile: {
      department: 'Property Management',
      employeeId: 'MGR002',
      joinDate: new Date('2023-03-10'),
      managedProperties: []
    }
  },
  {
    fullName: 'David Mokoena',
    email: 'caretaker1@briconomy.com',
    phone: '+27827890123',
    userType: 'caretaker',
    password: 'caretaker123',
    profile: {
      department: 'Maintenance',
      employeeId: 'CARE001',
      joinDate: new Date('2023-04-05'),
      skills: ['plumbing', 'electrical', 'general'],
      assignedProperty: null
    }
  },
  {
    fullName: 'Thabo Ndlovu',
    email: 'caretaker2@briconomy.com',
    phone: '+27829012345',
    userType: 'caretaker',
    password: 'caretaker123',
    profile: {
      department: 'Maintenance',
      employeeId: 'CARE002',
      joinDate: new Date('2023-05-12'),
      skills: ['carpentry', 'painting', 'landscaping'],
      assignedProperty: null
    }
  },
  {
    fullName: 'Emma Thompson',
    email: 'tenant1@briconomy.com',
    phone: '+27821234568',
    userType: 'tenant',
    password: 'tenant123',
    profile: {
      emergencyContact: '+27821234569',
      occupation: 'Software Developer',
      moveInDate: new Date('2023-06-01'),
      leaseId: null
    }
  },
  {
    fullName: 'James Smith',
    email: 'tenant2@briconomy.com',
    phone: '+27823456790',
    userType: 'tenant',
    password: 'tenant123',
    profile: {
      emergencyContact: '+27823456791',
      occupation: 'Teacher',
      moveInDate: new Date('2023-07-15'),
      leaseId: null
    }
  },
  {
    fullName: 'Lisa Anderson',
    email: 'tenant3@briconomy.com',
    phone: '+27825678902',
    userType: 'tenant',
    password: 'tenant123',
    profile: {
      emergencyContact: '+27825678903',
      occupation: 'Nurse',
      moveInDate: new Date('2023-08-20'),
      leaseId: null
    }
  },
  {
    fullName: 'Robert Brown',
    email: 'tenant4@briconomy.com',
    phone: '+27827890124',
    userType: 'tenant',
    password: 'tenant123',
    profile: {
      emergencyContact: '+27827890125',
      occupation: 'Engineer',
      moveInDate: new Date('2023-09-10'),
      leaseId: null
    }
  },
  {
    fullName: 'Maria Garcia',
    email: 'tenant5@briconomy.com',
    phone: '+27829012346',
    userType: 'tenant',
    password: 'tenant123',
    profile: {
      emergencyContact: '+27829012347',
      occupation: 'Designer',
      moveInDate: new Date('2023-10-05'),
      leaseId: null
    }
  }
];

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function generateTestUsers() {
  console.log('Generating test users with encrypted passwords...\n');
  
  const usersWithHashedPasswords = [];
  
  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    usersWithHashedPasswords.push({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      password: hashedPassword,
      profile: user.profile,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  console.log('Test Users Generated:');
  console.log('====================');
  
  usersWithHashedPasswords.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.fullName}`);
    console.log(`   Role: ${user.userType}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Password: ${testUsers[index].password}`);
    console.log(`   Hashed Password: ${user.password}`);
    console.log(`   Profile: ${JSON.stringify(user.profile, null, 2)}`);
  });
  
  console.log('\n\nMongoDB Insert Script:');
  console.log('====================');
  console.log('db.users.insertMany([');
  
  usersWithHashedPasswords.forEach((user, index) => {
    const comma = index < usersWithHashedPasswords.length - 1 ? ',' : '';
    console.log(`  {`);
    console.log(`    fullName: '${user.fullName}',`);
    console.log(`    email: '${user.email}',`);
    console.log(`    phone: '${user.phone}',`);
    console.log(`    userType: '${user.userType}',`);
    console.log(`    password: '${user.password}',`);
    console.log(`    profile: ${JSON.stringify(user.profile)},`);
    console.log(`    isActive: true,`);
    console.log(`    createdAt: new Date(),`);
    console.log(`    updatedAt: new Date()`);
    console.log(`  }${comma}`);
  });
  
  console.log(']);');
  
  return usersWithHashedPasswords;
}

if (typeof window === 'undefined') {
  generateTestUsers().then(() => {
    console.log('\nTest users generation completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Error generating test users:', error);
    process.exit(1);
  });
}

export { generateTestUsers, testUsers };