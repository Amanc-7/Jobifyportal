# Jobify - Job and Internship Portal

A modern, full-stack job portal built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Jobify connects job seekers with employers, providing a seamless platform for job discovery, application management, and recruitment.

![Jobify Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Jobify+-+Job+Portal)

## 🚀 Features

### For Job Seekers
- **Job Discovery**: Browse and search through thousands of job opportunities
- **Smart Filtering**: Filter jobs by location, category, experience level, salary, and more
- **Application Tracking**: Track the status of your applications in real-time
- **Profile Management**: Create and manage your professional profile
- **Resume Upload**: Upload and manage your resume
- **Job Alerts**: Get notified about new opportunities matching your criteria

### For Employers
- **Job Posting**: Post and manage job listings with detailed descriptions
- **Application Management**: Review and manage applications from candidates
- **Candidate Profiles**: View detailed candidate profiles and resumes
- **Analytics Dashboard**: Track job performance and application metrics
- **Company Branding**: Showcase your company and culture

### General Features
- **Responsive Design**: Fully responsive design that works on all devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Real-time Updates**: Live updates for applications and job status
- **Secure Authentication**: JWT-based authentication with role-based access
- **File Upload**: Secure file upload for resumes and profile pictures
- **Search & Filter**: Advanced search and filtering capabilities

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB Atlas** - Cloud database service

## 📁 Project Structure

```
jobify-mern-stack/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File uploads
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── main.jsx     # App entry point
│   └── package.json     # Frontend dependencies
└── README.md           # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobify-mern-stack.git
   cd jobify-mern-stack
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   npm run install-server
   
   # Install frontend dependencies
   npm run install-client
   ```

3. **Environment Setup**
   
   **Backend Environment:**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobify?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend Environment:**
   ```bash
   cd frontend
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 🌐 Deployment

### Backend Deployment Options

#### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy automatically

#### Option 2: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables
4. Deploy

#### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the backend directory
3. Set environment variables
4. Deploy

### Frontend Deployment

#### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables
4. Deploy automatically

#### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables
5. Deploy

### Database Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your environment variables

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout user

### Job Endpoints
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)
- `GET /api/jobs/my-jobs` - Get jobs posted by user
- `GET /api/jobs/stats` - Get job statistics

### Application Endpoints
- `POST /api/applications` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for a job
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/:id` - Get application by ID
- `DELETE /api/applications/:id` - Delete application

### User Endpoints
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/profile-picture` - Upload profile picture
- `POST /api/users/:id/resume` - Upload resume
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🎨 UI Components

The application includes a comprehensive set of reusable UI components:

- **Button** - Various button styles and sizes
- **Input** - Form input with validation
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection
- **Card** - Content containers
- **LoadingSpinner** - Loading indicators
- **ProtectedRoute** - Route protection

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- File upload validation
- Role-based access control

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎯 Performance Optimizations

- React Query for efficient data fetching
- Image optimization
- Lazy loading
- Code splitting
- Memoization
- Database indexing
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@jobify.com
- Check our [FAQ](https://jobify.com/faq)

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Video interviews integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered job matching
- [ ] Company reviews and ratings
- [ ] Salary insights
- [ ] Job recommendation engine
- [ ] Multi-language support
- [ ] Dark mode theme

---

**Made with ❤️ by the Jobify Team**
