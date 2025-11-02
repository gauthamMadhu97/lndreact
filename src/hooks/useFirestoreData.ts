import { useState, useEffect } from 'react'
import {
  getAllProjects,
  getAllUsers,
  getAssignmentsByEmployee,
  getAssignmentsByProject,
  getEmployeeUtilization as getUtilization
} from '@/services/firebaseService'
import type { User, Project, Assignment } from '@/types'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await getAllProjects()
        setProjects(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error, refetch: () => getAllProjects().then(setProjects) }
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getAllUsers()
        setUsers(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, loading, error, refetch: () => getAllUsers().then(setUsers) }
}

export const useEmployeeAssignments = (employeeId: string | undefined) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!employeeId) {
      setLoading(false)
      return
    }

    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const data = await getAssignmentsByEmployee(employeeId)
        setAssignments(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [employeeId])

  return { assignments, loading, error }
}

export const useProjectAssignments = (projectId: string | undefined) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const data = await getAssignmentsByProject(projectId)
        setAssignments(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [projectId])

  return { assignments, loading, error }
}

export const useEmployeeUtilization = (employeeId: string | undefined) => {
  const [utilization, setUtilization] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!employeeId) {
      setLoading(false)
      return
    }

    const fetchUtilization = async () => {
      try {
        setLoading(true)
        const data = await getUtilization(employeeId)
        setUtilization(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUtilization()
  }, [employeeId])

  return { utilization, loading, error }
}
