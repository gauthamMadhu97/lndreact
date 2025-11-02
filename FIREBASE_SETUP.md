# Firebase Backend Setup Guide

This guide will help you set up Firebase as the backend for the IT Portal application.

## Step 1: Firebase Project Configuration

Your Firebase project is already configured in `.env` and `src/firebase.ts`.

**Project Details:**
- Project ID: `lndreat`
- Already initialized with Firebase SDK v12.5.0

## Step 2: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `lndreat`
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** authentication
5. (Optional) Enable **Google** sign-in for SSO

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location (e.g., `us-central1`)
5. Click **Enable**

## Step 4: Set Firestore Security Rules

In **Firestore Database** > **Rules**, paste the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Helper function to check if user is a manager
    function isManager() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }

    // Helper function to check if user is accessing their own data
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isSignedIn();

      // Users can update their own profile, managers can update anyone
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isManager();
      allow delete: if isManager();
    }

    // Projects collection
    match /projects/{projectId} {
      // Anyone authenticated can read projects
      allow read: if isSignedIn();

      // Only managers can create, update, or delete projects
      allow create, update, delete: if isManager();
    }

    // Assignments collection
    match /assignments/{assignmentId} {
      // Anyone authenticated can read assignments
      allow read: if isSignedIn();

      // Only managers can create, update, or delete assignments
      allow create, update, delete: if isManager();
    }
  }
}
```

Click **Publish** to save the rules.

## Step 5: Create Your First User

### Option A: Via Register Page (Recommended)

1. Start the application: `npm run dev`
2. Navigate to the Register page
3. Fill in the form:
   - **Email**: manager@company.com
   - **Password**: password123 (min 6 characters)
   - **Display Name**: John Manager
   - **Role**: Select "Manager"
   - **Department**: Engineering
   - **Skills**: React, TypeScript, Firebase
4. Click **Create Account**

### Option B: Via Firebase Console

1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Enter email and password
4. After creating, go to **Firestore Database**
5. Create a document in the `users` collection with the user's UID
6. Add fields matching the User type

## Step 6: Verify Setup

1. Try logging in with your created account
2. Check Firestore Database to see the user document created
3. Try creating a project (if you're a manager)
4. Verify the project appears in Firestore

## Data Structure

### Users Collection (`users/{userId}`)
```typescript
{
  uid: string                // Document ID (matches Auth UID)
  email: string
  displayName: string
  role: 'manager' | 'employee'
  department: string
  skills: string[]
  availability: 'available' | 'partial' | 'full' | 'onLeave'
  photoURL?: string
  createdAt: Timestamp
}
```

### Projects Collection (`projects/{projectId}`)
```typescript
{
  id: string                 // Auto-generated
  name: string
  description: string
  client: string
  status: 'planning' | 'active' | 'onHold' | 'completed'
  startDate: Timestamp
  endDate: Timestamp
  techStack: string[]
  managerId: string          // References users/{userId}
  createdAt: Timestamp
}
```

### Assignments Collection (`assignments/{assignmentId}`)
```typescript
{
  id: string                 // Auto-generated
  projectId: string          // References projects/{projectId}
  employeeId: string         // References users/{userId}
  allocationPercentage: number
  startDate: Timestamp
  endDate?: Timestamp
  assignedBy: string         // References users/{userId}
  createdAt: Timestamp
}
```

## Testing

### Create Test Accounts

**Manager Account:**
- Email: manager@company.com
- Role: Manager
- Can create projects and assign employees

**Employee Account:**
- Email: employee@company.com
- Role: Employee
- Can view projects and update availability

### Test Workflows

1. **Login/Register Flow**
   - Register new users
   - Login with existing credentials
   - Verify role-based redirects

2. **Manager Workflow**
   - Create a new project
   - View all employees
   - Assign employees to projects

3. **Employee Workflow**
   - View assigned projects
   - Update availability status
   - Check current workload

## Troubleshooting

### "Permission denied" errors
- Check Firestore Security Rules are published
- Verify user has correct role in Firestore
- Ensure user is authenticated

### "User data not found"
- User exists in Auth but not in Firestore
- Create user document manually in Firestore

### Authentication errors
- Check Firebase Auth is enabled
- Verify email/password provider is enabled
- Check .env file has correct credentials

## Production Considerations

1. **Enable App Check** for additional security
2. **Set up Firebase Hosting** for deployment
3. **Configure backup schedules** for Firestore
4. **Monitor usage** in Firebase Console
5. **Set up alerts** for quota limits

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser console for error messages
3. Verify .env configuration
4. Check Firestore Security Rules

## Next Steps

- Add more sample data via the UI
- Customize security rules as needed
- Set up Firebase Functions for advanced features
- Configure Firebase Storage for file uploads
