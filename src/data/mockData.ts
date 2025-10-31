import { User, Project, Assignment } from '@/types'

export const mockUsers: User[] = [
  // Managers
  {
    uid: 'm1',
    email: 'sarah.johnson@company.com',
    displayName: 'Sarah Johnson',
    role: 'manager',
    department: 'Engineering',
    skills: ['Project Management', 'Agile', 'Leadership'],
    availability: 'available',
    photoURL: undefined,
    createdAt: new Date('2024-01-15')
  },
  {
    uid: 'm2',
    email: 'michael.chen@company.com',
    displayName: 'Michael Chen',
    role: 'manager',
    department: 'Product',
    skills: ['Product Strategy', 'Team Management', 'Scrum'],
    availability: 'available',
    photoURL: undefined,
    createdAt: new Date('2024-02-01')
  },
  // Employees
  {
    uid: 'e1',
    email: 'john.doe@company.com',
    displayName: 'John Doe',
    role: 'employee',
    department: 'Frontend',
    skills: ['React', 'TypeScript', 'CSS', 'TailwindCSS'],
    availability: 'partial',
    photoURL: undefined,
    createdAt: new Date('2024-03-10')
  },
  {
    uid: 'e2',
    email: 'jane.smith@company.com',
    displayName: 'Jane Smith',
    role: 'employee',
    department: 'Backend',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    availability: 'available',
    photoURL: undefined,
    createdAt: new Date('2024-03-15')
  },
  {
    uid: 'e3',
    email: 'alex.rivera@company.com',
    displayName: 'Alex Rivera',
    role: 'employee',
    department: 'Fullstack',
    skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
    availability: 'full',
    photoURL: undefined,
    createdAt: new Date('2024-04-01')
  },
  {
    uid: 'e4',
    email: 'emily.watson@company.com',
    displayName: 'Emily Watson',
    role: 'employee',
    department: 'Frontend',
    skills: ['React', 'JavaScript', 'UI/UX', 'Figma'],
    availability: 'partial',
    photoURL: undefined,
    createdAt: new Date('2024-04-10')
  },
  {
    uid: 'e5',
    email: 'david.kim@company.com',
    displayName: 'David Kim',
    role: 'employee',
    department: 'Backend',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
    availability: 'onLeave',
    photoURL: undefined,
    createdAt: new Date('2024-05-01')
  },
  {
    uid: 'e6',
    email: 'lisa.anderson@company.com',
    displayName: 'Lisa Anderson',
    role: 'employee',
    department: 'DevOps',
    skills: ['AWS', 'Terraform', 'CI/CD', 'Docker'],
    availability: 'available',
    photoURL: undefined,
    createdAt: new Date('2024-05-15')
  }
]

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of the customer-facing e-commerce platform with modern tech stack and improved UX',
    client: 'ABC Retail Corp',
    status: 'active',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-30'),
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    managerId: 'm1',
    createdAt: new Date('2025-01-10')
  },
  {
    id: 'p2',
    name: 'Mobile Banking App',
    description: 'Native mobile application for iOS and Android with secure banking features',
    client: 'XYZ Bank',
    status: 'active',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-08-31'),
    techStack: ['React Native', 'TypeScript', 'GraphQL', 'MongoDB'],
    managerId: 'm1',
    createdAt: new Date('2025-01-25')
  },
  {
    id: 'p3',
    name: 'Internal HR Portal',
    description: 'Employee management system with payroll, leave management, and performance tracking',
    client: 'Internal',
    status: 'planning',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    techStack: ['React', 'Node.js', 'MySQL', 'Docker'],
    managerId: 'm2',
    createdAt: new Date('2025-02-15')
  },
  {
    id: 'p4',
    name: 'Data Analytics Dashboard',
    description: 'Real-time analytics platform for business intelligence and reporting',
    client: 'Tech Solutions Inc',
    status: 'active',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-05-20'),
    techStack: ['React', 'Python', 'FastAPI', 'Redis', 'Elasticsearch'],
    managerId: 'm2',
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'p5',
    name: 'Customer Support Chatbot',
    description: 'AI-powered chatbot for automated customer support with NLP capabilities',
    client: 'Service Hub LLC',
    status: 'onHold',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-04-30'),
    techStack: ['Python', 'TensorFlow', 'Node.js', 'WebSocket'],
    managerId: 'm1',
    createdAt: new Date('2024-11-25')
  },
  {
    id: 'p6',
    name: 'Inventory Management System',
    description: 'Cloud-based inventory tracking and warehouse management solution',
    client: 'Logistics Pro',
    status: 'completed',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-12-31'),
    techStack: ['React', 'Java', 'Spring Boot', 'PostgreSQL'],
    managerId: 'm2',
    createdAt: new Date('2024-07-20')
  }
]

export const mockAssignments: Assignment[] = [
  // E-commerce Platform - John Doe (50%)
  {
    id: 'a1',
    projectId: 'p1',
    employeeId: 'e1',
    allocationPercentage: 50,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-30'),
    assignedBy: 'm1',
    createdAt: new Date('2025-01-12')
  },
  // E-commerce Platform - Emily Watson (30%)
  {
    id: 'a2',
    projectId: 'p1',
    employeeId: 'e4',
    allocationPercentage: 30,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-30'),
    assignedBy: 'm1',
    createdAt: new Date('2025-01-12')
  },
  // E-commerce Platform - Jane Smith (40%)
  {
    id: 'a3',
    projectId: 'p1',
    employeeId: 'e2',
    allocationPercentage: 40,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-30'),
    assignedBy: 'm1',
    createdAt: new Date('2025-01-12')
  },
  // Mobile Banking App - John Doe (30%)
  {
    id: 'a4',
    projectId: 'p2',
    employeeId: 'e1',
    allocationPercentage: 30,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-08-31'),
    assignedBy: 'm1',
    createdAt: new Date('2025-01-28')
  },
  // Mobile Banking App - Alex Rivera (80%)
  {
    id: 'a5',
    projectId: 'p2',
    employeeId: 'e3',
    allocationPercentage: 80,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-08-31'),
    assignedBy: 'm1',
    createdAt: new Date('2025-01-28')
  },
  // Data Analytics Dashboard - Emily Watson (50%)
  {
    id: 'a6',
    projectId: 'p4',
    employeeId: 'e4',
    allocationPercentage: 50,
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-05-20'),
    assignedBy: 'm2',
    createdAt: new Date('2025-01-18')
  },
  // Data Analytics Dashboard - Jane Smith (60%)
  {
    id: 'a7',
    projectId: 'p4',
    employeeId: 'e2',
    allocationPercentage: 60,
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-05-20'),
    assignedBy: 'm2',
    createdAt: new Date('2025-01-18')
  },
  // Internal HR Portal - Alex Rivera (20%)
  {
    id: 'a8',
    projectId: 'p3',
    employeeId: 'e3',
    allocationPercentage: 20,
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    assignedBy: 'm2',
    createdAt: new Date('2025-02-20')
  }
]

// Helper functions to get related data
export const getEmployeesByRole = (role: 'manager' | 'employee') =>
  mockUsers.filter(user => user.role === role)

export const getProjectsByStatus = (status: string) =>
  mockProjects.filter(project => project.status === status)

export const getAssignmentsByEmployee = (employeeId: string) =>
  mockAssignments.filter(assignment => assignment.employeeId === employeeId)

export const getAssignmentsByProject = (projectId: string) =>
  mockAssignments.filter(assignment => assignment.projectId === projectId)

export const getProjectById = (projectId: string) =>
  mockProjects.find(project => project.id === projectId)

export const getUserById = (userId: string) =>
  mockUsers.find(user => user.uid === userId)

export const getEmployeeUtilization = (employeeId: string) => {
  const assignments = getAssignmentsByEmployee(employeeId)
  return assignments.reduce((total, assignment) => total + assignment.allocationPercentage, 0)
}
