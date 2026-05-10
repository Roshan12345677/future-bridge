/**
 * Database Seeder
 * Run: node utils/seeder.js
 * To clear: node utils/seeder.js --clear
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const User = require('../models/User');
const Course = require('../models/Course');
const { Job, DSAProblem } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const seedUsers = async () => {
  const users = [
    { name: 'Admin User', email: 'admin@futurebridge.com', password: 'admin123', role: 'admin' },
    { name: 'Prof. Rajesh Kumar', email: 'teacher@futurebridge.com', password: 'teacher123', role: 'teacher', bio: 'Senior Professor with 10 years of experience in CS', skills: ['DSA', 'System Design', 'Java', 'Python'] },
    { name: 'Arjun Sharma', email: 'student@futurebridge.com', password: 'student123', role: 'student', bio: 'B.Tech CS student passionate about competitive programming', skills: ['C++', 'Python', 'React'] },
    { name: 'Priya Singh', email: 'priya@futurebridge.com', password: 'student123', role: 'student', bio: 'Full-stack developer in training', skills: ['JavaScript', 'Node.js', 'MongoDB'] },
    { name: 'Dr. Anita Patel', email: 'anita@futurebridge.com', password: 'teacher123', role: 'teacher', bio: 'PhD in Machine Learning. Teaching AI/ML courses', skills: ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning'] },
  ];
  await User.deleteMany();
  const created = await User.create(users);
  console.log(`✅ ${created.length} users seeded`);
  return created;
};

const seedCourses = async (users) => {
  const teacher = users.find(u => u.role === 'teacher');
  const courses = [
    {
      title: 'Data Structures & Algorithms - Complete Course',
      description: 'Master DSA from basics to advanced. Covers arrays, linked lists, trees, graphs, dynamic programming and more with 200+ problems.',
      category: 'competitive',
      level: 'intermediate',
      instructor: teacher._id,
      tags: ['DSA', 'Algorithms', 'Competitive Programming'],
      isPublished: true,
      duration: 40,
      rating: 4.8,
      lessons: [
        { title: 'Introduction to DSA', description: 'Overview of data structures', order: 1, duration: 30 },
        { title: 'Arrays and Strings', description: 'Complete arrays module', order: 2, duration: 60 },
        { title: 'Linked Lists', description: 'Singly and doubly linked lists', order: 3, duration: 45 },
      ],
    },
    {
      title: 'Full Stack Web Development - MERN',
      description: 'Build production-ready applications with MongoDB, Express, React and Node.js. Includes 5 real-world projects.',
      category: 'placement',
      level: 'beginner',
      instructor: teacher._id,
      tags: ['React', 'Node.js', 'MongoDB', 'Express', 'MERN'],
      isPublished: true,
      duration: 60,
      rating: 4.9,
      lessons: [
        { title: 'HTML & CSS Fundamentals', order: 1, duration: 90 },
        { title: 'JavaScript ES6+', order: 2, duration: 120 },
        { title: 'React.js Complete Guide', order: 3, duration: 180 },
        { title: 'Node.js & Express', order: 4, duration: 120 },
        { title: 'MongoDB & Mongoose', order: 5, duration: 90 },
      ],
    },
    {
      title: 'Competitive Programming Masterclass',
      description: 'Prepare for ICPC, CodeForces, and top coding contests. Learn advanced algorithms and problem-solving techniques.',
      category: 'competitive',
      level: 'advanced',
      instructor: teacher._id,
      tags: ['Competitive Programming', 'ICPC', 'CodeForces'],
      isPublished: true,
      duration: 35,
      rating: 4.7,
    },
    {
      title: 'System Design for Software Engineers',
      description: 'Learn to design scalable distributed systems. Covers load balancing, caching, databases, microservices and real system case studies.',
      category: 'placement',
      level: 'advanced',
      instructor: teacher._id,
      tags: ['System Design', 'Architecture', 'Scalability'],
      isPublished: true,
      duration: 25,
      rating: 4.9,
    },
    {
      title: 'Python for Data Science & ML',
      description: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-learn and build real ML projects from scratch.',
      category: 'academic',
      level: 'intermediate',
      instructor: teacher._id,
      tags: ['Python', 'Machine Learning', 'Data Science'],
      isPublished: true,
      duration: 50,
      rating: 4.6,
    },
  ];
  await Course.deleteMany();
  const created = await Course.create(courses);
  console.log(`✅ ${created.length} courses seeded`);
};

const seedJobs = async (users) => {
  const admin = users.find(u => u.role === 'admin');
  const jobs = [
    {
      title: 'Software Development Engineer I',
      company: 'Amazon',
      location: 'Bangalore, India',
      type: 'full-time',
      description: 'Join Amazon\'s world-class engineering team. Work on products used by millions worldwide. Strong DSA and system design skills required.',
      requirements: ['B.Tech/B.E in CS or related field', '0-2 years experience', 'Strong DSA skills', 'Proficiency in Java/Python/C++'],
      skills: ['Java', 'Python', 'DSA', 'System Design', 'AWS'],
      salary: '18-24 LPA',
      category: 'software',
      experienceLevel: 'entry',
      postedBy: admin._id,
      isActive: true,
    },
    {
      title: 'Frontend Developer Intern',
      company: 'Microsoft',
      location: 'Hyderabad, India (Hybrid)',
      type: 'internship',
      description: 'Work on Microsoft\'s flagship products. Learn from the best engineers in the industry. 6-month internship with PPO possibility.',
      requirements: ['B.Tech 3rd/4th year', 'Strong React.js knowledge', 'TypeScript experience preferred'],
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
      salary: '50,000/month stipend',
      category: 'software',
      experienceLevel: 'entry',
      postedBy: admin._id,
      isActive: true,
    },
    {
      title: 'Data Engineer',
      company: 'Google',
      location: 'Gurugram, India',
      type: 'full-time',
      description: 'Build data infrastructure at Google scale. Work with petabytes of data. Collaborate with world-class ML researchers.',
      requirements: ['B.Tech/M.Tech in CS', '1-3 years experience', 'Python/Spark proficiency', 'Big Data experience'],
      skills: ['Python', 'Apache Spark', 'BigQuery', 'SQL', 'TensorFlow'],
      salary: '25-35 LPA',
      category: 'data',
      experienceLevel: 'mid',
      postedBy: admin._id,
      isActive: true,
    },
    {
      title: 'Backend Developer',
      company: 'Flipkart',
      location: 'Bangalore, India',
      type: 'full-time',
      description: 'Build scalable backend services for India\'s largest e-commerce platform. Handle millions of transactions daily.',
      requirements: ['2+ years experience', 'Java/Go expertise', 'Microservices knowledge', 'Strong system design'],
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'MySQL'],
      salary: '20-28 LPA',
      category: 'software',
      experienceLevel: 'mid',
      postedBy: admin._id,
      isActive: true,
    },
    {
      title: 'ML Engineer Intern',
      company: 'Swiggy',
      location: 'Bangalore, India (Remote)',
      type: 'internship',
      description: 'Apply ML to solve real-world food delivery optimization problems. Work on recommendation systems and demand forecasting.',
      requirements: ['B.Tech/M.Tech pursuing', 'Python proficiency', 'ML fundamentals', 'PyTorch/TensorFlow knowledge'],
      skills: ['Python', 'PyTorch', 'Machine Learning', 'SQL', 'Statistics'],
      salary: '40,000/month stipend',
      category: 'data',
      experienceLevel: 'entry',
      postedBy: admin._id,
      isActive: true,
    },
  ];
  await Job.deleteMany();
  const created = await Job.create(jobs);
  console.log(`✅ ${created.length} jobs seeded`);
};

const seedDSAProblems = async () => {
  const problems = [
    // Arrays
    { title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', topic: 'array', companies: ['Amazon', 'Google', 'Facebook'], description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }], timeComplexity: 'O(n)', spaceComplexity: 'O(n)', order: 1, leetcodeUrl: 'https://leetcode.com/problems/two-sum' },
    { title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-sell-stock', difficulty: 'easy', topic: 'array', companies: ['Amazon', 'Goldman Sachs', 'Microsoft'], description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit.', examples: [{ input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 2, leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
    { title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'medium', topic: 'dynamic-programming', companies: ['Amazon', 'Microsoft', 'Apple'], description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum. (Kadane\'s Algorithm)', examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 3, leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray' },
    { title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'medium', topic: 'two-pointers', companies: ['Amazon', 'Goldman Sachs', 'Adobe'], description: 'Given n non-negative integers representing an elevation map, compute how much water can be trapped.', examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 4 },
    // Strings
    { title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'easy', topic: 'string', companies: ['Amazon', 'Facebook', 'Uber'], description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.', examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 5 },
    { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating', difficulty: 'medium', topic: 'sliding-window', companies: ['Amazon', 'Adobe', 'Google'], description: 'Given a string s, find the length of the longest substring without repeating characters.', examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3' }], timeComplexity: 'O(n)', spaceComplexity: 'O(min(m,n))', order: 6 },
    // Linked List
    { title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'easy', topic: 'linked-list', companies: ['Amazon', 'Microsoft', 'Apple'], description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 7 },
    { title: 'Detect Cycle in Linked List', slug: 'linked-list-cycle', difficulty: 'easy', topic: 'linked-list', companies: ['Amazon', 'Google', 'Microsoft'], description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.', examples: [{ input: 'head = [3,2,0,-4], pos = 1', output: 'true' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 8 },
    // Trees
    { title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-binary-tree', difficulty: 'easy', topic: 'tree', companies: ['Amazon', 'LinkedIn', 'Google'], description: 'Given the root of a binary tree, return its maximum depth.', examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3' }], timeComplexity: 'O(n)', spaceComplexity: 'O(h)', order: 9 },
    { title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order', difficulty: 'medium', topic: 'tree', companies: ['Amazon', 'Google', 'Facebook'], description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.', examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }], timeComplexity: 'O(n)', spaceComplexity: 'O(n)', order: 10 },
    // DP
    { title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'easy', topic: 'dynamic-programming', companies: ['Amazon', 'Apple', 'Adobe'], description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb?', examples: [{ input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }], timeComplexity: 'O(n)', spaceComplexity: 'O(1)', order: 11 },
    { title: 'Longest Common Subsequence', slug: 'longest-common-subsequence', difficulty: 'medium', topic: 'dynamic-programming', companies: ['Google', 'Microsoft', 'Amazon'], description: 'Given two strings text1 and text2, return the length of their longest common subsequence.', examples: [{ input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'LCS is "ace"' }], timeComplexity: 'O(m*n)', spaceComplexity: 'O(m*n)', order: 12 },
    // Graph
    { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'medium', topic: 'graph', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'], description: 'Given a 2D grid map of "1"s (land) and "0"s (water), count the number of islands.', examples: [{ input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: '2' }], timeComplexity: 'O(m*n)', spaceComplexity: 'O(m*n)', order: 13 },
    { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'medium', topic: 'graph', companies: ['Amazon', 'Google', 'Airbnb'], description: 'Detect cycle in directed graph - determine if you can finish all courses given prerequisites.', examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }], timeComplexity: 'O(V+E)', spaceComplexity: 'O(V+E)', order: 14 },
    // Binary Search
    { title: 'Binary Search', slug: 'binary-search', difficulty: 'easy', topic: 'binary-search', companies: ['Amazon', 'Google', 'Facebook'], description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, find the target.', examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }], timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', order: 15 },
    { title: 'Search in Rotated Sorted Array', slug: 'search-rotated-sorted-array', difficulty: 'medium', topic: 'binary-search', companies: ['Amazon', 'Microsoft', 'LinkedIn'], description: 'There is an integer array nums sorted in ascending order (with distinct values). Given the array after possible rotation, find target.', examples: [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' }], timeComplexity: 'O(log n)', spaceComplexity: 'O(1)', order: 16 },
  ];

  await DSAProblem.deleteMany();
  const created = await DSAProblem.create(problems);
  console.log(`✅ ${created.length} DSA problems seeded`);
};

const main = async () => {
  await connectDB();

  if (process.argv[2] === '--clear') {
    await User.deleteMany();
    await Course.deleteMany();
    await Job.deleteMany();
    await DSAProblem.deleteMany();
    console.log('✅ All data cleared');
    process.exit(0);
  }

  const users = await seedUsers();
  await seedCourses(users);
  await seedJobs(users);
  await seedDSAProblems();

  console.log('\n🎉 Seeding complete!');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@futurebridge.com / admin123');
  console.log('  Teacher: teacher@futurebridge.com / teacher123');
  console.log('  Student: student@futurebridge.com / student123');
  process.exit(0);
};

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
