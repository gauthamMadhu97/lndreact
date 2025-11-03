import { mockUsers, mockProjects, mockAssignments } from '@/data/mockData'
import { createUser, createProject, createAssignment } from '@/services/firebaseService'

export const seedFirebaseData = async () => {
  console.log('Starting to seed Firebase data...')

  try {
    // Seed Users (without creating auth accounts)
    console.log('Seeding users...')
    for (const user of mockUsers) {
      const { uid, createdAt, ...userData } = user
      await createUser(uid, userData)
      console.log(`Created user: ${user.displayName}`)
    }

    // Seed Projects
    console.log('Seeding projects...')
    for (const project of mockProjects) {
      const { id, createdAt, ...projectData } = project
      // Note: createProject generates a new ID, so we'll use setDoc instead
      await createProject(projectData)
      console.log(`Created project: ${project.name}`)
    }

    // Seed Assignments
    console.log('Seeding assignments...')
    for (const assignment of mockAssignments) {
      const { id, createdAt, ...assignmentData } = assignment
      await createAssignment(assignmentData)
      console.log(`Created assignment: ${assignment.id}`)
    }

    console.log('Firebase data seeded successfully!')
  } catch (error) {
    console.error('Error seeding Firebase data:', error)
    throw error
  }
}
