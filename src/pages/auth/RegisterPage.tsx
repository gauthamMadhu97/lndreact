import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserRole } from '@/types'
import { Mail, Lock, User, Building2, Code2, UserPlus, Sparkles } from 'lucide-react'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, loading, user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    department: '',
    skills: ''
  })
  const [role, setRole] = useState<UserRole>('employee')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard')
    }
  }, [user, navigate])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsSubmitting(true)
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        role,
        formData.department,
        skillsArray
      )
      // Navigation will happen automatically via the useEffect above
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Registration failed. Please try again.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 relative animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg animate-in zoom-in duration-700">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-base">
            Join the IT Portal today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 animate-in slide-in-from-top-2 duration-300">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-semibold">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                  className="pl-10 h-11 border-2 focus:border-primary transition-all duration-200 focus:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="pl-10 h-11 border-2 focus:border-primary transition-all duration-200 focus:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="pl-10 h-11 border-2 focus:border-primary transition-all duration-200 focus:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="department"
                  placeholder="e.g., Engineering, Design"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  required
                  className="pl-10 h-11 border-2 focus:border-primary transition-all duration-200 focus:shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-semibold">Skills</Label>
              <div className="relative group">
                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="skills"
                  placeholder="React, TypeScript, Node.js"
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  required
                  className="pl-10 h-11 border-2 focus:border-primary transition-all duration-200 focus:shadow-md"
                />
              </div>
              <p className="text-xs text-muted-foreground">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Register As</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === 'employee' ? 'default' : 'outline'}
                  onClick={() => setRole('employee')}
                  className="w-full h-11 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <User className="mr-2 h-4 w-4" />
                  Employee
                </Button>
                <Button
                  type="button"
                  variant={role === 'manager' ? 'default' : 'outline'}
                  onClick={() => setRole('manager')}
                  className="w-full h-11 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Manager
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline transition-all hover:text-primary/80">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
