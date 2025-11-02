import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { app } from '@/firebase'
import type { User, AuthContextType, UserRole } from '@/types'
import { createUser, getUser } from '@/services/firebaseService'

const auth = getAuth(app)

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await getUser(firebaseUser.uid)
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    department: string,
    skills: string[]
  ) => {
    setLoading(true)
    try {
      console.log('Starting registration process...')
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      console.log('Firebase Auth user created:', firebaseUser.uid)

      // Create user document in Firestore
      const userData: Omit<User, 'uid' | 'createdAt'> = {
        email,
        displayName,
        role,
        department,
        skills,
        availability: 'available'
      }

      console.log('Creating user document in Firestore...')
      await createUser(firebaseUser.uid, userData)
      console.log('User document created successfully')

      // Fetch and set user data
      console.log('Fetching user data...')
      const newUser = await getUser(firebaseUser.uid)
      console.log('User data fetched:', newUser)
      setUser(newUser)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Fetch user data from Firestore
      const userData = await getUser(firebaseUser.uid)
      if (!userData) {
        throw new Error('User data not found')
      }
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
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
