# IT Organization Portal

A modern, scalable, and interactive React application that simulates an internal IT organization portal. The app allows managers to manage projects and resources, and employees to view their assignments and availability.

## Features

### For Managers
- View and manage all projects across the organization
- Create, edit, and delete projects
- Access all employees and resources for assignment
- View organization-wide metrics and utilization
- Assign employees to projects with allocation percentages
- Track team capacity and availability
- Interactive dashboard with charts and statistics

### For Employees
- View personal assignments and projects
- Track individual utilization and availability
- Update profile information
- View project details and timelines
- Manage personal availability status

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **date-fns** - Date manipulation

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase SDK** - Backend integration

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **SWC** - Fast JavaScript/TypeScript compiler

## Project Structure

```
it_portal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Shared components (StatCard, etc.)
│   │   ├── dialogs/         # Dialog components
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components (Sidebar, etc.)
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── employee/        # Employee-specific pages
│   │   └── manager/         # Manager-specific pages
│   ├── services/            # External services (Firebase, etc.)
│   ├── scripts/             # Utility scripts (seeding, etc.)
│   ├── types/               # TypeScript type definitions
│   └── lib/                 # Utility functions
├── public/                  # Static assets
└── firebase/                # Firebase configuration
```

## Database Schema

### Collections

#### Users
```typescript
{
  uid: string
  email: string
  displayName: string
  role: 'manager' | 'employee'
  department: string
  skills: string[]
  availability: 'available' | 'partial' | 'full' | 'onLeave'
  photoURL?: string
  createdAt: Date
}
```

#### Projects
```typescript
{
  id: string
  name: string
  description: string
  client: string
  status: 'planning' | 'active' | 'onHold' | 'completed'
  startDate: Date
  endDate: Date
  techStack: string[]
  managerId: string
  createdAt: Date
}
```

#### Assignments
```typescript
{
  id: string
  projectId: string
  employeeId: string
  allocationPercentage: number
  startDate: Date
  endDate?: Date
  assignedBy: string
  createdAt: Date
}
```

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd it_portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Cloud Firestore
   - Copy your Firebase configuration

4. Create Firebase configuration file:
   - Create `src/firebase.ts` with your Firebase config:
```typescript
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}

export const app = initializeApp(firebaseConfig)
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

### Seeding Data (Optional)

To populate your database with sample data:

```bash
# This will create 2 managers and 4 employees with sample projects
npm run seed
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The application uses Firebase Authentication with email/password. Users can:
- Register as either a Manager or Employee
- Login with email and password
- Logout from the application

## Features in Detail

### Manager Dashboard
- Total Projects count
- Active Projects count
- Team Members count
- Average Utilization percentage
- Project Status Distribution (Pie Chart)
- Team Utilization (Bar Chart)
- Recent Projects list with details

### Projects Management
- Grid and List view modes
- Search and filter by status
- Create new projects with tech stack
- Edit existing projects
- Delete projects (cascade deletes assignments)
- Expand to view assigned team members
- Manage assignments per project

### Resources Management
- View all employees
- Filter by availability status
- Search by name, email, or department
- View employee skills and utilization
- Assign employees to projects directly
- Visual utilization indicators

### Employee Dashboard
- Personal utilization metrics
- Current assignments overview
- Assigned projects list
- Availability status
- Skills showcase

## Architecture Decisions

### Organization-Wide Access Model
The application implements an organization-wide access model where:
- All managers can view and manage all projects and resources
- This enables collaborative management and shared resource pools
- Each project tracks which manager created it via `managerId`
- Suitable for small to medium-sized organizations

### State Management
- React Context API for authentication state
- Local component state for UI interactions
- Firebase real-time listeners for data synchronization

### Routing Strategy
- Role-based routing (manager vs employee routes)
- Protected routes requiring authentication
- Automatic redirects based on user role

## Security

- Firebase Authentication for user management
- Firestore security rules (configure in Firebase Console)
- Client-side route protection
- Input validation on forms
- Type-safe API calls with TypeScript

## Performance Optimizations

- Lazy loading of routes
- Memoization of computed values
- Efficient Firestore queries
- Optimized re-renders with React.memo
- Code splitting with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a demonstration project for learning purposes. Feel free to fork and modify for your own use.

## License

MIT License - feel free to use this project for learning and development purposes.

## Troubleshooting

### Common Issues

**Build errors with TypeScript**
- Ensure TypeScript version is compatible
- Run `npm install` to ensure all dependencies are installed

**Firebase authentication errors**
- Verify Firebase configuration is correct
- Ensure Email/Password authentication is enabled in Firebase Console

**Data not loading**
- Check browser console for errors
- Verify Firestore security rules allow read/write
- Ensure Firebase SDK is properly initialized

## Future Enhancements

Potential features for future development:
- Manager-specific project filtering
- Advanced reporting and analytics
- Email notifications
- Calendar integration
- Resource conflict detection
- Time tracking
- Project templates
- Export functionality
- Dark mode toggle
- Mobile responsive improvements
