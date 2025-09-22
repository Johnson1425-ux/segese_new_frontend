# Hospital Management System - Admin Setup

## Prerequisites

1. **MongoDB** must be running on your system
2. **Node.js** and **npm** must be installed
3. **Environment variables** must be configured in `.env` file

## Quick Setup

### 1. Create Environment File

Create a `.env` file in the `server` directory with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hospital_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Set Up Admin User

You have two options for creating the admin user:

#### Option A: Quick Setup (Default Admin)
```bash
npm run setup-admin
```

This creates an admin user with default credentials:
- **Email**: admin@hospital.com
- **Password**: Admin123!
- **Name**: Admin User

#### Option B: Interactive Setup (Custom Admin)
```bash
npm run setup-admin-interactive
```

This allows you to customize:
- First Name
- Last Name
- Email
- Password
- Phone Number
- Department
- Gender
- Date of Birth

### 4. Start the Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## Admin User Details

The admin user will have full permissions including:
- ✅ User management (create, read, update, delete)
- ✅ Patient management
- ✅ Doctor management
- ✅ Appointment management
- ✅ Dashboard access
- ✅ Reports access
- ✅ Settings access
- ✅ Visit management

## Login Information

After setup, you can login using:
- **URL**: http://localhost:5000/api/auth/login
- **Method**: POST
- **Body**:
```json
{
  "email": "admin@hospital.com",
  "password": "Admin123!"
}
```

## Security Notes

⚠️ **Important Security Reminders**:

1. **Change the default password** after first login
2. **Update JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Regular password updates** are recommended
5. **Monitor login attempts** for security

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check if the connection string in `.env` is correct
- Verify MongoDB is accessible on the specified port

### Admin Already Exists
If you get an error saying admin already exists, you can:
1. Check existing admin details in the database
2. Delete the existing admin user if needed
3. Use a different email address

### Permission Issues
- Ensure the scripts directory has proper permissions
- Check if Node.js has write access to the database

## API Endpoints

Once the server is running, you can access:

- **Health Check**: `GET /api/health`
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register` (Admin only)
- **Users**: `GET /api/users` (Admin only)
- **Patients**: `GET /api/patients`
- **Doctors**: `GET /api/doctors`
- **Appointments**: `GET /api/appointments`
- **Dashboard**: `GET /api/dashboard/overview`

## Next Steps

After setting up the admin user:

1. **Test the login** using the API
2. **Create additional users** (doctors, nurses, receptionists)
3. **Add patients** to the system
4. **Set up appointments**
5. **Configure email settings** for notifications
6. **Set up the frontend** application
