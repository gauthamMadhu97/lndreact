import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore'
import { app } from '@/firebase'
import type { User, Project, Assignment } from '@/types'

const db = getFirestore(app)

// Collections
const USERS_COLLECTION = 'users'
const PROJECTS_COLLECTION = 'projects'
const ASSIGNMENTS_COLLECTION = 'assignments'

// User operations
export const createUser = async (userId: string, userData: Omit<User, 'uid' | 'createdAt'>) => {
  try {
    console.log('Creating user in Firestore:', userId, userData)
    const userRef = doc(db, USERS_COLLECTION, userId)

    // Remove undefined fields to comply with Firestore requirements
    const cleanedData = Object.entries(userData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, unknown>)

    const userDoc = {
      ...cleanedData,
      uid: userId,
      createdAt: Timestamp.now()
    }
    console.log('User document to be created:', userDoc)
    await setDoc(userRef, userDoc)
    console.log('User created successfully in Firestore')
  } catch (error) {
    console.error('Error creating user in Firestore:', error)
    throw error
  }
}

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const data = userSnap.data()
    return {
      ...data,
      uid: userSnap.id,
      createdAt: data.createdAt.toDate()
    } as User
  }
  return null
}

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, USERS_COLLECTION)
  const snapshot = await getDocs(usersRef)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      uid: doc.id,
      createdAt: data.createdAt.toDate()
    } as User
  })
}

export const getUsersByRole = async (role: 'manager' | 'employee'): Promise<User[]> => {
  const usersRef = collection(db, USERS_COLLECTION)
  const q = query(usersRef, where('role', '==', role))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      uid: doc.id,
      createdAt: data.createdAt.toDate()
    } as User
  })
}

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, USERS_COLLECTION, userId)
  await updateDoc(userRef, updates)
}

// Project operations
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
  const projectsRef = collection(db, PROJECTS_COLLECTION)
  const docRef = await addDoc(projectsRef, {
    ...projectData,
    startDate: Timestamp.fromDate(projectData.startDate),
    endDate: Timestamp.fromDate(projectData.endDate),
    createdAt: Timestamp.now()
  })
  return docRef.id
}

export const getProject = async (projectId: string): Promise<Project | null> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
  const projectSnap = await getDoc(projectRef)

  if (projectSnap.exists()) {
    const data = projectSnap.data()
    return {
      ...data,
      id: projectSnap.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate()
    } as Project
  }
  return null
}

export const getAllProjects = async (): Promise<Project[]> => {
  const projectsRef = collection(db, PROJECTS_COLLECTION)
  const q = query(projectsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate()
    } as Project
  })
}

export const getProjectsByStatus = async (status: string): Promise<Project[]> => {
  const projectsRef = collection(db, PROJECTS_COLLECTION)
  const q = query(projectsRef, where('status', '==', status))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate()
    } as Project
  })
}

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
  const updateData: Record<string, unknown> = { ...updates }

  if (updates.startDate) {
    updateData.startDate = Timestamp.fromDate(updates.startDate)
  }
  if (updates.endDate) {
    updateData.endDate = Timestamp.fromDate(updates.endDate)
  }

  await updateDoc(projectRef, updateData)
}

export const deleteProject = async (projectId: string) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId)
  await deleteDoc(projectRef)
}

// Assignment operations
export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'createdAt'>): Promise<string> => {
  const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION)
  const docRef = await addDoc(assignmentsRef, {
    ...assignmentData,
    startDate: Timestamp.fromDate(assignmentData.startDate),
    endDate: assignmentData.endDate ? Timestamp.fromDate(assignmentData.endDate) : null,
    createdAt: Timestamp.now()
  })
  return docRef.id
}

export const getAssignment = async (assignmentId: string): Promise<Assignment | null> => {
  const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId)
  const assignmentSnap = await getDoc(assignmentRef)

  if (assignmentSnap.exists()) {
    const data = assignmentSnap.data()
    return {
      ...data,
      id: assignmentSnap.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : undefined,
      createdAt: data.createdAt.toDate()
    } as Assignment
  }
  return null
}

export const getAssignmentsByEmployee = async (employeeId: string): Promise<Assignment[]> => {
  const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION)
  const q = query(assignmentsRef, where('employeeId', '==', employeeId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : undefined,
      createdAt: data.createdAt.toDate()
    } as Assignment
  })
}

export const getAssignmentsByProject = async (projectId: string): Promise<Assignment[]> => {
  const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION)
  const q = query(assignmentsRef, where('projectId', '==', projectId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : undefined,
      createdAt: data.createdAt.toDate()
    } as Assignment
  })
}

export const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
  const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId)
  const updateData: Record<string, unknown> = { ...updates }

  if (updates.startDate) {
    updateData.startDate = Timestamp.fromDate(updates.startDate)
  }
  if (updates.endDate) {
    updateData.endDate = Timestamp.fromDate(updates.endDate)
  }

  await updateDoc(assignmentRef, updateData)
}

export const deleteAssignment = async (assignmentId: string) => {
  const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId)
  await deleteDoc(assignmentRef)
}

// Helper function to calculate employee utilization
export const getEmployeeUtilization = async (employeeId: string): Promise<number> => {
  const assignments = await getAssignmentsByEmployee(employeeId)
  return assignments.reduce((total, assignment) => total + assignment.allocationPercentage, 0)
}
