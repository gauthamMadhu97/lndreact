import { getAuth } from 'firebase/auth'
import { createProject, createAssignment, createUser, getUser } from '@/services/firebaseService'

/**
 * Seed data script that works when you're already logged in as a manager
 * This creates projects and employees, and assigns you as the manager
 */
export const seedAsManager = async () => {
  const auth = getAuth()
  const currentUser = auth.currentUser

  if (!currentUser) {
    console.error(' You must be logged in to seed data!')
    console.log(' Please register/login first, then run this script')
    return
  }

  console.log(' Logged in as:', currentUser.email)
  console.log(' Starting to seed data...')

  try {
    // Get current user's Firestore data to check if they're a manager
    const userData = await getUser(currentUser.uid)

    if (!userData) {
      console.error(' User profile not found in Firestore')
      return
    }

    if (userData.role !== 'manager') {
      console.error(' You must be logged in as a manager to seed data')
      console.log(' Current role:', userData.role)
      return
    }

    console.log(' Confirmed manager role')
    console.log('\n Creating sample projects...')

    // Create 2 projects with current user as manager
    const project1Id = await createProject({
      name: 'E-commerce Platform Redesign',
      description: 'Complete redesign of the customer-facing e-commerce platform',
      client: 'TechCorp',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      managerId: currentUser.uid
    })
    console.log(' Created project: E-commerce Platform Redesign')

    const project2Id = await createProject({
      name: 'Mobile Banking App',
      description: 'New mobile banking application for iOS and Android',
      client: 'FinanceHub',
      status: 'planning',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      techStack: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
      managerId: currentUser.uid
    })
    console.log(' Created project: Mobile Banking App')

    console.log('\n Creating sample employees...')

    // Create 4 sample employees (these are just Firestore docs, not auth accounts)
    const employees = [
      {
        uid: 'emp_' + Date.now() + '_1',
        email: 'john.doe@company.com',
        displayName: 'John Doe',
        role: 'employee' as const,
        department: 'Frontend',
        skills: ['React', 'TypeScript', 'CSS', 'TailwindCSS'],
        availability: 'available' as const
      },
      {
        uid: 'emp_' + Date.now() + '_2',
        email: 'jane.smith@company.com',
        displayName: 'Jane Smith',
        role: 'employee' as const,
        department: 'Backend',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        availability: 'available' as const
      },
      {
        uid: 'emp_' + Date.now() + '_3',
        email: 'alex.rivera@company.com',
        displayName: 'Alex Rivera',
        role: 'employee' as const,
        department: 'Fullstack',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        availability: 'partial' as const
      },
      {
        uid: 'emp_' + Date.now() + '_4',
        email: 'emily.watson@company.com',
        displayName: 'Emily Watson',
        role: 'employee' as const,
        department: 'Frontend',
        skills: ['React', 'JavaScript', 'UI/UX', 'Figma'],
        availability: 'available' as const
      }
    ]

    for (const emp of employees) {
      const { uid, ...empData } = emp
      await createUser(uid, empData)
      console.log(` Created employee: ${emp.displayName}`)
    }

    console.log('\n Creating sample assignments...')

    // Assign first 2 employees to project 1
    await createAssignment({
      employeeId: employees[0].uid,
      projectId: project1Id,
      allocationPercentage: 60,
      startDate: new Date('2024-01-15'),
      assignedBy: currentUser.uid
    })
    console.log(` Assigned ${employees[0].displayName} to E-commerce Platform (60%)`)

    await createAssignment({
      employeeId: employees[1].uid,
      projectId: project1Id,
      allocationPercentage: 50,
      startDate: new Date('2024-01-20'),
      assignedBy: currentUser.uid
    })
    console.log(` Assigned ${employees[1].displayName} to E-commerce Platform (50%)`)

    // Assign third employee to project 2
    await createAssignment({
      employeeId: employees[2].uid,
      projectId: project2Id,
      allocationPercentage: 40,
      startDate: new Date('2024-03-01'),
      assignedBy: currentUser.uid
    })
    console.log(` Assigned ${employees[2].displayName} to Mobile Banking App (40%)`)

    console.log('\n Data seeded successfully!')
    console.log('\n Summary:')
    console.log(`   - Manager: ${userData.displayName} (you)`)
    console.log(`   - Projects: 2`)
    console.log(`   - Employees: 4 (Firestore docs only, not auth accounts)`)
    console.log(`   - Assignments: 3`)
    console.log('\n Note: Employee records are Firestore documents only.')
    console.log('   To login as an employee, register via /register page.')

  } catch (error) {
    console.error('\n Error seeding data:', error)
    throw error
  }
}
