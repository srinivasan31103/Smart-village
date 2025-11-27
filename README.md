# Smart Village Resource & Waste Management System

A comprehensive full-stack web application for managing village resources, waste management, and citizen complaints with AI-powered insights and real-time analytics.

## Features

### Core Features
- **Multi-role Authentication**: Admin, Officer, and Citizen roles with JWT-based authentication
- **Resource Management**: Track and manage water, electricity, and waste resources
- **Complaint System**: Citizens can report issues with photo uploads and location tracking
- **Real-time Dashboard**: Analytics and visualizations using Chart.js
- **AI Integration**: Claude AI for auto-classifying complaints and generating optimization insights
- **Notifications**: Email (Nodemailer) and SMS (Twilio) notifications on complaint status updates
- **PDF Reports**: Generate monthly statistics and individual complaint reports
- **Map Integration**: Mapbox/Google Maps for location-based complaint reporting
- **Responsive Design**: Modern UI built with Tailwind CSS

### User Roles

#### Admin
- Full access to all features
- Manage users, resources, and complaints
- View comprehensive analytics and dashboards
- Generate reports
- Access AI insights

#### Officer
- Manage resources and complaints
- Update complaint status
- View analytics
- Access AI insights

#### Citizen
- Report complaints with photos and location
- Track complaint status
- View personal dashboard
- Receive notifications

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Claude AI SDK** - AI integration
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications
- **PDFKit** - PDF generation

### Frontend
- **React** (with Vite) - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** & **react-chartjs-2** - Data visualization
- **Mapbox GL** / **react-map-gl** - Maps
- **Axios** - API client
- **React Toastify** - Notifications

## Project Structure

```
smart-village-management/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & authorization
│   │   ├── errorHandler.js      # Global error handling
│   │   └── upload.js            # File upload configuration
│   ├── models/
│   │   ├── User.js              # User model (Admin, Officer, Citizen)
│   │   ├── Resource.js          # Resource model (Water, Electricity, Waste)
│   │   ├── Complaint.js         # Complaint model with geolocation
│   │   └── UsageLog.js          # Resource usage tracking
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── resources.js         # Resource CRUD routes
│   │   ├── complaints.js        # Complaint management routes
│   │   ├── dashboard.js         # Analytics & statistics routes
│   │   ├── ai.js                # AI classification routes
│   │   └── reports.js           # PDF report generation routes
│   ├── utils/
│   │   ├── claudeAI.js          # Claude AI integration
│   │   ├── emailService.js      # Email notification service
│   │   ├── smsService.js        # SMS notification service
│   │   └── pdfGenerator.js      # PDF report generator
│   ├── uploads/                 # Uploaded images storage
│   ├── reports/                 # Generated PDF reports
│   ├── .env.example             # Environment variables template
│   ├── server.js                # Express server entry point
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Main layout wrapper
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   ├── Sidebar.jsx      # Side navigation menu
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   ├── StatusBadge.jsx  # Complaint status badge
│   │   │   ├── PriorityBadge.jsx # Priority badge
│   │   │   └── LoadingSpinner.jsx # Loading indicator
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Dashboard.jsx    # Main dashboard with charts
│   │   │   ├── Complaints.jsx   # Complaints list page
│   │   │   ├── ComplaintDetails.jsx # Single complaint view
│   │   │   ├── CreateComplaint.jsx # Complaint creation form
│   │   │   ├── Resources.jsx    # Resources list page
│   │   │   ├── ResourceDetails.jsx # Single resource view
│   │   │   ├── CreateResource.jsx # Resource creation form
│   │   │   ├── Users.jsx        # User management (Admin)
│   │   │   ├── Profile.jsx      # User profile page
│   │   │   └── NotFound.jsx     # 404 page
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx              # Main App component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── .env.example             # Frontend environment variables
│   ├── index.html               # HTML template
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── package.json             # Frontend dependencies
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json
└── README.md                    # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Anthropic API Key (for Claude AI)
- Mapbox Access Token (for maps)
- Email account (for Nodemailer) - optional
- Twilio account (for SMS) - optional

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "Advanced Smart Village Project"
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### Step 3: Environment Configuration

#### Backend Environment (.env in backend folder)
Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-village

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Email (Nodemailer) - Gmail example
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=Smart Village <noreply@smartvillage.com>

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
```

#### Frontend Environment (.env in frontend folder)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

### Step 4: Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Step 5: Run the Application

#### Development Mode (Run both simultaneously)
```bash
npm run dev
```

#### Or run separately:

**Backend:**
```bash
npm run server
# or
cd backend && npm run dev
```

**Frontend:**
```bash
npm run client
# or
cd frontend && npm run dev
```

### Step 6: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Default Credentials

### Admin Account
```
Email: admin@example.com
Password: password123
```

### Officer Account
```
Email: officer@example.com
Password: password123
```

### Citizen Account
```
Email: citizen@example.com
Password: password123
```

**Note**: Create these accounts manually through registration or database seeding.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (Admin/Officer)
- `PUT /api/resources/:id` - Update resource (Admin/Officer)
- `DELETE /api/resources/:id` - Delete resource (Admin)
- `POST /api/resources/:id/usage` - Log resource usage
- `GET /api/resources/:id/usage-history` - Get usage history

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create complaint (with file upload)
- `PUT /api/complaints/:id` - Update complaint (Admin/Officer)
- `PUT /api/complaints/:id/resolve` - Resolve complaint (Admin/Officer)
- `POST /api/complaints/:id/comments` - Add comment
- `DELETE /api/complaints/:id` - Delete complaint (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/complaints-by-category` - Category breakdown
- `GET /api/dashboard/complaints-by-status` - Status breakdown
- `GET /api/dashboard/resource-usage` - Resource usage stats
- `GET /api/dashboard/recent-complaints` - Recent complaints
- `GET /api/dashboard/resource-status` - Resource status overview
- `GET /api/dashboard/monthly-trends` - Monthly trends

### AI Integration
- `POST /api/ai/classify-complaint` - Classify complaint using Claude AI
- `POST /api/ai/resource-insights` - Get resource optimization insights
- `GET /api/ai/monthly-summary` - Generate AI-powered monthly summary

### Reports
- `POST /api/reports/monthly` - Generate monthly PDF report
- `POST /api/reports/complaint/:id` - Generate complaint PDF report

## Features in Detail

### 1. Complaint Management
- Citizens can report issues with title, description, category, and priority
- Upload up to 5 photos per complaint
- Select location using interactive map or current GPS location
- Automatic AI classification using Claude AI
- Real-time status updates (Pending → In Progress → Resolved)
- Email and SMS notifications on status changes
- Comment system for discussions

### 2. Resource Management
- Track water, electricity, and waste resources
- Monitor capacity vs. current usage
- Geolocation for resource mapping
- Usage logging and history
- Status tracking (Active, Inactive, Maintenance, Critical)

### 3. Dashboard Analytics
- Role-specific dashboards
- Chart.js visualizations:
  - Pie charts for category distribution
  - Bar charts for status breakdown
  - Line charts for trends
- Key performance indicators (KPIs)
- Recent activity feed

### 4. AI-Powered Features
- **Complaint Classification**: Automatically categorize and prioritize complaints
- **Resource Insights**: Generate optimization recommendations
- **Monthly Summaries**: AI-generated performance reports
- Confidence scoring for AI predictions

### 5. Notification System
- Email notifications using Nodemailer
- SMS notifications using Twilio (optional)
- Automated triggers on complaint status changes
- Welcome emails for new users

### 6. PDF Report Generation
- Monthly statistics reports
- Individual complaint reports
- Professional formatting using PDFKit
- Downloadable from dashboard

## Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Protected API routes
- File upload validation
- Input sanitization
- CORS configuration

## Development

### Database Schema

**User Schema**
- name, email, password (hashed)
- phone, role (admin/officer/citizen)
- address (nested)
- isActive flag

**Resource Schema**
- type (water/electricity/waste)
- name, description
- location (GeoJSON Point)
- capacity, currentUsage
- status, metadata

**Complaint Schema**
- title, description
- category, subCategory, priority
- status, location (GeoJSON)
- photos array
- aiClassification
- statusHistory, resolution
- comments

**UsageLog Schema**
- resource reference
- usage value and unit
- timestamp, metadata

### Adding New Features

1. **Backend**: Create route → Add controller logic → Update model if needed
2. **Frontend**: Create page component → Add to routes → Create API service
3. **Test**: Manually test or add automated tests

## Testing

### E2E Testing with Cypress

The project includes comprehensive End-to-End testing using Cypress.

#### Quick Start

```bash
# Install Cypress dependencies
cd frontend
npm install

# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests (headless)
npm run cypress:run
```

#### Test Coverage

| Test Suite | Coverage |
|------------|----------|
| **Authentication** | Login, Register, Logout, Protected Routes |
| **Dashboard** | Statistics, Charts, Navigation |
| **Complaints** | CRUD operations, Filters, Comments, Access Control |
| **Resources** | CRUD operations, Filters, Statistics |
| **Users** | User Management (Admin only) |
| **Profile** | Profile Updates, Password Change |

**Total: 101 automated tests across 6 test suites**

#### Documentation

- **Quick Start**: [TESTING_QUICKSTART.md](TESTING_QUICKSTART.md)
- **Full Documentation**: [CYPRESS_TESTING.md](CYPRESS_TESTING.md)

#### Commands

```bash
# Open interactive test runner
npm run cypress:open

# Run all tests in headless mode
npm run cypress:run

# Run tests with browser visible
npm run test:e2e:headed

# Run specific test file
npx cypress run --spec "cypress/e2e/01-authentication.cy.js"
```

## Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Ensure MongoDB is accessible
3. Deploy from GitHub or CLI
4. Run build command: `npm install`
5. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)
1. Build frontend: `cd frontend && npm run build`
2. Deploy `frontend/dist` folder
3. Set environment variables
4. Configure redirects for SPA

### Database (MongoDB Atlas)
1. Create cluster
2. Add database user
3. Whitelist IP addresses
4. Update `MONGODB_URI` in backend .env

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`

**File Upload Fails**
- Check `uploads` folder exists
- Verify file size limit in `.env`

**Map Not Loading**
- Verify `VITE_MAPBOX_TOKEN` in frontend `.env`
- Check Mapbox account is active

**AI Features Not Working**
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota/limits

**Email Notifications Fail**
- For Gmail: Enable "Less secure app access" or use App Password
- Verify SMTP settings

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@smartvillage.com

## Acknowledgments

- Anthropic for Claude AI
- Mapbox for mapping services
- Chart.js for data visualization
- Tailwind CSS for UI components

---

**Built with ❤️ for Smart Villages**
