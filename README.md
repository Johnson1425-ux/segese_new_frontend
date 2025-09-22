# Hospital Management System

A modern, full-stack hospital management system built with React, featuring a beautiful UI and comprehensive functionality for managing patients, doctors, and appointments.

## 🏥 Features

### Dashboard
- **Statistics Overview**: View total patients, doctors, appointments, and today's appointments
- **Interactive Charts**: Pie chart for appointment status and bar chart for appointment types
- **Recent Appointments**: Quick view of the latest appointments

### Patient Management
- **Patient Records**: Complete patient information including personal details, medical history, and insurance
- **Search & Filter**: Find patients by name, email, or phone number
- **Add/Edit Patients**: Comprehensive forms with validation
- **Patient Details Modal**: Quick view of all patient information

### Doctor Management
- **Doctor Profiles**: Complete doctor information including specialization, experience, and education
- **Schedule Management**: Set working hours for each day of the week
- **Search & Filter**: Find doctors by name, specialization, or department
- **Status Tracking**: Active, Inactive, or On Leave status

### Appointment System
- **Appointment Booking**: Schedule appointments with patients and doctors
- **Multiple Types**: Consultation, Check-up, Emergency, Follow-up, Surgery, etc.
- **Status Management**: Scheduled, In Progress, Completed, Cancelled, No Show
- **Time Slots**: Predefined time slots for easy scheduling
- **Notes & Duration**: Add appointment notes and set duration

## 🛠️ Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Persistence**: Local Storage

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   └── Sidebar.js          # Navigation sidebar
├── context/
│   └── DataContext.js      # Global state management
├── pages/
│   ├── Dashboard.js        # Main dashboard with charts
│   ├── Patients.js         # Patient list and management
│   ├── PatientForm.js      # Add/edit patient forms
│   ├── Doctors.js          # Doctor list and management
│   ├── DoctorForm.js       # Add/edit doctor forms
│   ├── Appointments.js     # Appointment list and management
│   └── AppointmentForm.js  # Add/edit appointment forms
├── App.js                  # Main app component with routing
├── index.js               # React entry point
└── index.css              # Global styles and Tailwind imports
```

## 🎨 UI Components

### Design System
- **Color Palette**: Primary blue (#3b82f6) and secondary green (#22c55e)
- **Typography**: Inter font family for modern readability
- **Components**: Cards, buttons, forms, tables with consistent styling
- **Responsive**: Mobile-first design that works on all screen sizes

### Key Components
- **Stat Cards**: Display key metrics with icons and trends
- **Data Tables**: Sortable tables with search and pagination
- **Forms**: Comprehensive forms with validation and error handling
- **Modals**: Detailed view modals for quick information access
- **Charts**: Interactive charts for data visualization

## 📊 Data Management

### Local Storage
- All data is persisted in browser's local storage
- Automatic data loading on app startup
- Real-time data updates across all components

### Sample Data
The system comes with sample data including:
- 2 patients with complete medical records
- 2 doctors with schedules and specializations
- 2 sample appointments

## 🔧 Customization

### Adding New Features
1. **New Entity**: Add to DataContext state and reducer
2. **New Page**: Create component in pages directory
3. **New Route**: Add to App.js routing configuration
4. **New Navigation**: Update Sidebar component

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Use Tailwind utility classes for component styling

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Mobile-first design with touch-friendly interactions

## 🔒 Data Validation

### Form Validation
- Required field validation
- Email format validation
- Date range validation
- Real-time error feedback

### Business Logic
- Appointment scheduling validation
- Doctor availability checking
- Patient-doctor relationship management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect GitHub repository for automatic deployment
- **Firebase**: Use Firebase Hosting
- **AWS S3**: Static website hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Backend Integration**: Connect to a real database
- **Authentication**: User login and role-based access
- **Notifications**: Email/SMS appointment reminders
- **Calendar View**: Monthly/weekly appointment calendar
- **Reports**: Generate detailed reports and analytics
- **Billing**: Patient billing and insurance management
- **Inventory**: Medical supplies and equipment tracking

---

**Built with ❤️ for modern healthcare management**
