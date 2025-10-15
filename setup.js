const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Jobify MERN Stack...\n');

// Check if .env files exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

// Create backend .env if it doesn't exist
if (!fs.existsSync(backendEnvPath)) {
  const backendEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobify
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_${Date.now()}
JWT_EXPIRE=7d

# Email configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173`;

  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');
} else {
  console.log('ℹ️  backend/.env already exists');
}

// Create frontend .env if it doesn't exist
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api`;

  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env file');
} else {
  console.log('ℹ️  frontend/.env already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm run install-all');
console.log('2. Start MongoDB (if using local): mongod');
console.log('3. Start the application: npm run dev');
console.log('\n🔗 URLs:');
console.log('- Frontend: http://localhost:5173');
console.log('- Backend: http://localhost:5000');
console.log('- Health Check: http://localhost:5000/api/health');
console.log('\n💡 For production, update the MONGODB_URI in backend/.env to use MongoDB Atlas');
console.log('\n🎉 Setup complete!');
