db = db.getSiblingDB('briconomy');

// Clear existing users
db.users.drop();

// Create users with hashed passwords (SHA-256)
const users = db.users.insertMany([
  {
    fullName: 'Sarah Johnson',
    email: 'admin@briconomy.com',
    phone: '+27821234567',
    userType: 'admin',
    password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    profile: {
      department: 'System Administration',
      employeeId: 'ADMIN001',
      joinDate: new Date('2023-01-15')
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Michael Chen',
    email: 'manager1@briconomy.com',
    phone: '+27823456789',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5', // manager123
    profile: {
      department: 'Property Management',
      employeeId: 'MGR001',
      joinDate: new Date('2023-02-20'),
      managedProperties: []
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Patricia Williams',
    email: 'manager2@briconomy.com',
    phone: '+27825678901',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5', // manager123
    profile: {
      department: 'Property Management',
      employeeId: 'MGR002',
      joinDate: new Date('2023-03-10'),
      managedProperties: []
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'David Mokoena',
    email: 'caretaker1@briconomy.com',
    phone: '+27827890123',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa', // caretaker123
    profile: {
      department: 'Maintenance',
      employeeId: 'CARE001',
      joinDate: new Date('2023-04-05'),
      skills: ['plumbing', 'electrical', 'general'],
      assignedProperty: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Thabo Ndlovu',
    email: 'caretaker2@briconomy.com',
    phone: '+27829012345',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa', // caretaker123
    profile: {
      department: 'Maintenance',
      employeeId: 'CARE002',
      joinDate: new Date('2023-05-12'),
      skills: ['carpentry', 'painting', 'landscaping'],
      assignedProperty: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Emma Thompson',
    email: 'tenant1@briconomy.com',
    phone: '+27821234568',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33', // tenant123
    profile: {
      emergencyContact: '+27821234569',
      occupation: 'Software Developer',
      moveInDate: new Date('2023-06-01'),
      leaseId: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'James Smith',
    email: 'tenant2@briconomy.com',
    phone: '+27823456790',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33', // tenant123
    profile: {
      emergencyContact: '+27823456791',
      occupation: 'Teacher',
      moveInDate: new Date('2023-07-15'),
      leaseId: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Lisa Anderson',
    email: 'tenant3@briconomy.com',
    phone: '+27825678902',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33', // tenant123
    profile: {
      emergencyContact: '+27825678903',
      occupation: 'Nurse',
      moveInDate: new Date('2023-08-20'),
      leaseId: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Robert Brown',
    email: 'tenant4@briconomy.com',
    phone: '+27827890124',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33', // tenant123
    profile: {
      emergencyContact: '+27827890125',
      occupation: 'Engineer',
      moveInDate: new Date('2023-09-10'),
      leaseId: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Maria Garcia',
    email: 'tenant5@briconomy.com',
    phone: '+27829012346',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33', // tenant123
    profile: {
      emergencyContact: '+27829012347',
      occupation: 'Designer',
      moveInDate: new Date('2023-10-05'),
      leaseId: null
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Users initialization completed successfully!');
print('Created ' + users.insertedCount + ' users:');
print('   - 1 Admin: Sarah Johnson');
print('   - 2 Managers: Michael Chen, Patricia Williams');
print('   - 2 Caretakers: David Mokoena, Thabo Ndlovu');
print('   - 5 Tenants: Emma Thompson, James Smith, Lisa Anderson, Robert Brown, Maria Garcia');
print('');
print('Login credentials:');
print('   Admin: admin@briconomy.com / admin123');
print('   Managers: manager1@briconomy.com, manager2@briconomy.com / manager123');
print('   Caretakers: caretaker1@briconomy.com, caretaker2@briconomy.com / caretaker123');
print('   Tenants: tenant1@briconomy.com through tenant5@briconomy.com / tenant123');
