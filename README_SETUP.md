# Hospital Management System - Setup & Features Guide

## 📋 System Overview
A comprehensive hospital management system built with React (Frontend) and Express/Node.js (Backend) with MongoDB database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd new
```

2. **Setup Backend**
```bash
cd server
npm install
copy .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
# In a new terminal, from project root
npm install
npm run dev
```

4. **Setup Admin User**
```bash
cd server
npm run setup-admin-interactive
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (CHANGE THIS!)
- `SMTP_*` - Email configuration

#### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## 📦 Core Features

### ✅ Implemented Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, Doctor, Nurse, Receptionist, etc.)
   - Account locking after failed attempts
   - Password reset functionality

2. **Patient Management**
   - Patient registration and profiles
   - Medical history tracking
   - Search and filter capabilities

3. **Appointment System**
   - Schedule appointments
   - View doctor availability
   - Appointment reminders

4. **Visit Management**
   - Record patient visits
   - Vital signs tracking
   - Diagnosis recording
   - Prescription management

5. **Laboratory Management**
   - Order lab tests
   - Track test results
   - Lab report generation

6. **Dashboard & Analytics**
   - Real-time statistics
   - Activity monitoring
   - Performance metrics

7. **Security Features**
   - Rate limiting
   - XSS protection
   - SQL injection prevention
   - CORS configuration
   - Helmet.js security headers

## 🆕 New Features Added

### 1. **Notification System**
Real-time notifications for:
- Appointment reminders
- Lab results ready
- Prescription updates
- Emergency alerts

### 2. **Audit Logging**
Comprehensive tracking of:
- User actions
- Data modifications
- System access
- Compliance reporting

### 3. **Enhanced Security**
- Permission-based access control
- Account locking mechanism
- Improved password policies
- Input sanitization

### 4. **Improved Logging**
- Structured logging with Winston
- Log rotation
- Error tracking
- Performance monitoring

## 🚨 Known Issues & Fixes Applied

1. ✅ **Fixed**: Email credentials exposed in .env
2. ✅ **Fixed**: Missing permission methods in User model
3. ✅ **Fixed**: Logger directory creation issue
4. ✅ **Fixed**: Missing validation middleware
5. ✅ **Added**: Environment configuration files

## 🔜 Recommended Future Enhancements

### High Priority
1. **Billing & Payment System**
   - Invoice generation
   - Payment processing
   - Insurance claim management

2. **Telemedicine Integration**
   - Video consultation
   - Online prescriptions
   - Remote monitoring

3. **Inventory Management**
   - Medicine stock tracking
   - Equipment management
   - Auto-reorder system

### Medium Priority
4. **Report Generation**
   - Custom report builder
   - Export to PDF/Excel
   - Scheduled reports

5. **Mobile Application**
   - React Native app
   - Push notifications
   - Offline capabilities

6. **Advanced Analytics**
   - Predictive analytics
   - Patient flow optimization
   - Resource utilization

### Low Priority
7. **Integration APIs**
   - HL7/FHIR support
   - Third-party lab integration
   - Insurance provider APIs

8. **AI Features**
   - Symptom checker
   - Drug interaction warnings
   - Appointment scheduling optimization

## 🧪 Testing

### Run Backend Tests
```bash
cd server
npm test
```

### Test API Endpoints
```bash
cd server
npm run test-api
```

## 🔒 Security Best Practices

1. **Change default secrets** in .env file
2. **Enable HTTPS** in production
3. **Regular security audits** with `npm audit`
4. **Database backups** - implement regular backup strategy
5. **Monitor logs** for suspicious activity
6. **Update dependencies** regularly

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Patient Endpoints
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### Appointment Endpoints
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process-id> /F
```

### Module Not Found Errors
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in `server/logs/`
3. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License.

---

**Last Updated**: December 2024
**Version**: 1.0.0
