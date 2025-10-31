export type UserRole = 'manager' | 'employee'

export type ProjectStatus = 'planning' | 'active' | 'onHold' | 'completed'

export type AvailabilityStatus = 'available' | 'partial' | 'full' | 'onLeave'

export interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  department: string
  skills: string[]
  availability: AvailabilityStatus
  photoURL?: string
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  client: string
  status: ProjectStatus
  startDate: Date
  endDate: Date
  techStack: string[]
  managerId: string
  createdAt: Date
}

export interface Assignment {
  id: string
  projectId: string
  employeeId: string
  allocationPercentage: number
  startDate: Date
  endDate?: Date
  assignedBy: string
  createdAt: Date
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (email: string, password: string, displayName: string, role: UserRole, department: string, skills: string[]) => Promise<void>
  logout: () => void
  loading: boolean
}
