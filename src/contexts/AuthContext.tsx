import React, { createContext, useContext, useState, ReactNode } from 'react'
import { User, AuthContextType, UserRole } from '@/types'
import { mockUsers } from '@/data/mockData'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock login - find user by email and role
    const foundUser = mockUsers.find(
      u => u.email === email && u.role === role
    )

    if (foundUser) {
      setUser(foundUser)
    } else {
      throw new Error('Invalid credentials')
    }

    setLoading(false)
  }

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    department: string,
    skills: string[]
  ) => {
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock registration - create new user
    const newUser: User = {
      uid: `${role[0]}${Date.now()}`,
      email,
      displayName,
      role,
      department,
      skills,
      availability: 'available',
      photoURL: undefined,
      createdAt: new Date()
    }

    setUser(newUser)
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
