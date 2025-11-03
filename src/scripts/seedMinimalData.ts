import { createUser, createProject, createAssignment } from '@/services/firebaseService'

// Minimal seed data: 2 managers and 4 employees
const seedUsers = [
  // Managers
  {
    uid: 'm1',
    email: 'sarah.johnson@company.com',
    displayName: 'Sarah Johnson',
    role: 'manager' as const,
    department: 'Engineering',
    skills: ['Team Leadership', 'Project Management', 'Agile'],
    availability: 'available' as const
  },
  {
    uid: 'm2',
    email: 'michael.chen@company.com',
    displayName: 'Michael Chen',
    role: 'manager' as const,
    department: 'Product',
    skills: ['Product Strategy', 'User Research', 'Roadmapping'],
    availability: 'available' as const
  },
  // Employees
  {
    uid: 'e1',
    email: 'john.doe@company.com',
    displayName: 'John Doe',
    role: 'employee' as const,
    department: 'Frontend',
    skills: ['React', 'TypeScript', 'CSS', 'TailwindCSS'],
    availability: 'available' as const
  },
  {
    uid: 'e2',
    email: 'jane.smith@company.com',
    displayName: 'Jane Smith',
    role: 'employee' as const,
    department: 'Backend',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    availability: 'available' as const
  },
  {
    uid: 'e3',
    email: 'alex.rivera@company.com',
    displayName: 'Alex Rivera',
    role: 'employee' as const,
    department: 'Fullstack',
    skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
    availability: 'partial' as const
  },
  {
    uid: 'e4',
    email: 'emily.watson@company.com',
    displayName: 'Emily Watson',
    role: 'employee' as const,
    department: 'Frontend',
    skills: ['React', 'JavaScript', 'UI/UX', 'Figma'],
    availability: 'available' as const
  }
]

// Minimal projects (2 projects)
const seedProjects = [
  {
    name: 'E-commerce Platform Redesign',
    description: 'Complete redesign of the customer-facing e-commerce platform',
    client: 'TechCorp',
    status: 'active' as const,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    managerId: 'm1'
  },
  {
    name: 'Mobile Banking App',
    description: 'New mobile banking application for iOS and Android',
    client: 'FinanceHub',
    status: 'planning' as const,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-09-30'),
    techStack: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
    managerId: 'm2'
  }
]

// Minimal assignments (3 assignments)
const seedAssignments = [
  {
    employeeId: 'e1',
    projectId: '', // Will be set after project creation
    allocationPercentage: 60,
    startDate: new Date('2024-01-15'),
    assignedBy: 'm1'
  },
  {
    employeeId: 'e2',
    projectId: '', // Will be set after project creation
    allocationPercentage: 50,
    startDate: new Date('2024-01-20'),
    assignedBy: 'm1'
  },
  {
    employeeId: 'e3',
    projectId: '', // Will be set after project creation
    allocationPercentage: 40,
    startDate: new Date('2024-03-01'),
    assignedBy: 'm2'
  }
]

export const seedMinimalData = async () => {
  console.log('Starting to seed minimal Firebase data...')
  console.log('This will create 2 managers and 4 employees with minimal projects')

  try {
    // Seed Users
    console.log('\n📝 Seeding users...')
    for (const user of seedUsers) {
      const { uid, ...userData } = user
      await createUser(uid, userData)
      console.log(`✓ Created user: ${user.displayName} (${user.role})`)
    }

    // Seed Projects
    console.log('\n📁 Seeding projects...')
    const projectIds: string[] = []
    for (const project of seedProjects) {
      const projectId = await createProject(project)
      projectIds.push(projectId)
      console.log(`✓ Created project: ${project.name} (ID: ${projectId})`)
    }

    // Seed Assignments (only if projects were created)
    if (projectIds.length > 0) {
      console.log('\n👥 Seeding assignments...')
      // Assign first 2 employees to first project
      for (let i = 0; i < 2; i++) {
        const assignment = seedAssignments[i]
        assignment.projectId = projectIds[0]
        await createAssignment(assignment)
        console.log(`✓ Created assignment: ${seedUsers[i + 2].displayName} → ${seedProjects[0].name}`)
      }
      // Assign third employee to second project
      if (projectIds.length > 1) {
        const assignment = seedAssignments[2]
        assignment.projectId = projectIds[1]
        await createAssignment(assignment)
        console.log(`✓ Created assignment: ${seedUsers[4].displayName} → ${seedProjects[1].name}`)
      }
    }

    console.log('\n✅ Firebase data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - ${seedUsers.length} users (2 managers, 4 employees)`)
    console.log(`   - ${seedProjects.length} projects`)
    console.log(`   - ${seedAssignments.length} assignments`)
    console.log('\n💡 Note: New registered users will have no projects or assignments initially.')
  } catch (error) {
    console.error('\n❌ Error seeding Firebase data:', error)
    throw error
  }
}

// Instructions for running this seed script:
// ==========================================
//
// Option 1: Run from Browser Console (Recommended)
// -------------------------------------------------
// 1. Start your dev server: npm run dev
// 2. Open browser console (F12)
// 3. Import and run the function:
//
//    import { seedMinimalData } from './src/scripts/seedMinimalData'
//    seedMinimalData()
//
// Option 2: Create a temporary page
// ----------------------------------
// Create a temporary admin page that calls seedMinimalData() on button click
//
// Option 3: Run with Firebase Admin SDK
// --------------------------------------
// Use Node.js with Firebase Admin SDK (requires additional setup)
//
// IMPORTANT NOTES:
// ================
// - This will NOT create Firebase Auth accounts
// - These are just Firestore documents with user data
// - To actually login, users need to register via the /register page
// - Alternatively, manually create Firebase Auth accounts with matching UIDs
// - New users who register will have empty projects/assignments (which is fine)
