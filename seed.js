/**
 * Seed script — adds 15 dummy employees for testing pagination, sorting, and filtering.
 *
 * Usage:
 *   cd backend
 *   node seed.js
 *
 * Run this AFTER your server is connected to MongoDB at least once (so .env is correct).
 * Safe to run multiple times — it will just add duplicates with new emails if re-run,
 * unless you change EMAIL_SUFFIX below.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

dotenv.config();

const EMAIL_SUFFIX = '@example.com'; // change this if you re-run and want fresh emails

const dummyEmployees = [
  { fullName: 'Aarav Sharma', department: 'EIM', designation: 'Intern', mobileNumber: '9000000001', joiningDate: '2025-01-10' },
  { fullName: 'Priya Patel', department: 'HR', designation: 'Manager', mobileNumber: '9000000002', joiningDate: '2024-03-15' },
  { fullName: 'Rohan Mehta', department: 'IT', designation: 'Software Engineer', mobileNumber: '9000000003', joiningDate: '2023-07-22' },
  { fullName: 'Sneha Reddy', department: 'Sales', designation: 'Executive', mobileNumber: '9000000004', joiningDate: '2025-05-01' },
  { fullName: 'Vikram Singh', department: 'EIM', designation: 'Senior Engineer', mobileNumber: '9000000005', joiningDate: '2022-11-18' },
  { fullName: 'Ananya Iyer', department: 'IT', designation: 'QA Engineer', mobileNumber: '9000000006', joiningDate: '2024-08-09' },
  { fullName: 'Karan Joshi', department: 'Finance', designation: 'Analyst', mobileNumber: '9000000007', joiningDate: '2023-02-14' },
  { fullName: 'Divya Nair', department: 'HR', designation: 'Recruiter', mobileNumber: '9000000008', joiningDate: '2025-02-20' },
  { fullName: 'Arjun Kapoor', department: 'Sales', designation: 'Manager', mobileNumber: '9000000009', joiningDate: '2021-09-05' },
  { fullName: 'Ishita Gupta', department: 'IT', designation: 'Intern', mobileNumber: '9000000010', joiningDate: '2025-06-01' },
  { fullName: 'Manish Verma', department: 'EIM', designation: 'Technician', mobileNumber: '9000000011', joiningDate: '2024-12-12' },
  { fullName: 'Pooja Desai', department: 'Finance', designation: 'Senior Analyst', mobileNumber: '9000000012', joiningDate: '2022-04-30' },
  { fullName: 'Siddharth Rao', department: 'IT', designation: 'DevOps Engineer', mobileNumber: '9000000013', joiningDate: '2023-10-25' },
  { fullName: 'Neha Bhatt', department: 'Sales', designation: 'Intern', mobileNumber: '9000000014', joiningDate: '2025-04-17' },
  { fullName: 'Aditya Kulkarni', department: 'HR', designation: 'HR Business Partner', mobileNumber: '9000000015', joiningDate: '2021-06-08' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    const employeesToInsert = dummyEmployees.map((emp) => ({
      ...emp,
      email: `${emp.fullName.toLowerCase().replace(/\s+/g, '.')}${EMAIL_SUFFIX}`,
    }));

    const inserted = await Employee.insertMany(employeesToInsert, { ordered: false });
    console.log(`Successfully inserted ${inserted.length} dummy employees.`);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Some employees already exist (duplicate email). Skipped duplicates, inserted the rest.');
    } else {
      console.error('Seeding error:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

seedDatabase();