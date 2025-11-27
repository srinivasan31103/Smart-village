import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Resource from './models/Resource.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing users...');
    await User.deleteMany({});
    console.log('✅ Users cleared');

    // Create demo users (password will be auto-hashed by the User model)
    console.log('\nCreating demo users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        village: 'Smart Village',
        district: 'Tech District',
        state: 'Innovation State',
        pincode: '123456'
      },
      isActive: true
    });
    console.log('✅ Admin created:', admin.email);

    const officer = await User.create({
      name: 'Officer User',
      email: 'officer@example.com',
      password: 'password123',
      phone: '+1234567891',
      role: 'officer',
      address: {
        street: '456 Officer Road',
        village: 'Smart Village',
        district: 'Tech District',
        state: 'Innovation State',
        pincode: '123456'
      },
      isActive: true
    });
    console.log('✅ Officer created:', officer.email);

    const citizen = await User.create({
      name: 'Citizen User',
      email: 'citizen@example.com',
      password: 'password123',
      phone: '+1234567892',
      role: 'citizen',
      address: {
        street: '789 Citizen Lane',
        village: 'Smart Village',
        district: 'Tech District',
        state: 'Innovation State',
        pincode: '123456'
      },
      isActive: true
    });
    console.log('✅ Citizen created:', citizen.email);

    // Create sample resources
    console.log('\nCreating sample resources...');

    await Resource.create({
      type: 'water',
      name: 'Village Water Tank #1',
      description: 'Main water storage tank for north zone',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716], // Bangalore coordinates
        address: 'North Zone, Smart Village'
      },
      capacity: {
        value: 10000,
        unit: 'liters'
      },
      currentUsage: {
        value: 6500,
        unit: 'liters',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        waterQuality: 'Good',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      createdBy: admin._id
    });

    await Resource.create({
      type: 'electricity',
      name: 'Main Power Transformer',
      description: 'Primary electricity distribution point',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'Central Square, Smart Village'
      },
      capacity: {
        value: 5000,
        unit: 'kWh'
      },
      currentUsage: {
        value: 3200,
        unit: 'kWh',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        voltage: 440,
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      createdBy: admin._id
    });

    await Resource.create({
      type: 'waste',
      name: 'Community Waste Collection Center',
      description: 'Central waste management facility',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'South Zone, Smart Village'
      },
      capacity: {
        value: 2000,
        unit: 'kg'
      },
      currentUsage: {
        value: 1200,
        unit: 'kg',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        wasteType: ['organic', 'recyclable', 'non-recyclable'],
        collectionSchedule: 'Daily at 6 AM',
        lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      createdBy: admin._id
    });

    console.log('✅ Sample resources created');

    console.log('\n========================================');
    console.log('🎉 Database seeded successfully!');
    console.log('========================================');
    console.log('\nDemo Accounts Created:');
    console.log('─────────────────────────────────────');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: password123');
    console.log('\nOfficer:');
    console.log('  Email: officer@example.com');
    console.log('  Password: password123');
    console.log('\nCitizen:');
    console.log('  Email: citizen@example.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────');
    console.log('\n✅ You can now login with these credentials!');
    console.log('🌐 Go to: http://localhost:5173\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
