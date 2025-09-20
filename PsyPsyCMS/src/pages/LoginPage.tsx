import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 [LoginPage] Form submitted with:', {
      email: formData.email,
      hasPassword: !!formData.password,
      rememberMe: formData.rememberMe,
      isSubmitting
    })

    // Check if button should be disabled
    const shouldBeDisabled = isSubmitting || !formData.email || !formData.password
    console.log('🔐 [LoginPage] Button state check:', {
      isSubmitting,
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
      shouldBeDisabled
    })

    if (shouldBeDisabled) {
      console.warn('🔐 [LoginPage] Form submission blocked - button should be disabled')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      console.log('🔐 [LoginPage] Calling login function...')
      await login(formData.email, formData.password, formData.rememberMe)
      console.log('🔐 [LoginPage] Login completed successfully')
    } catch (err: any) {
      console.error('🔐 [LoginPage] Login failed:', err)
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('🔐 [LoginPage] Button clicked!', {
      buttonType: e.currentTarget.getAttribute('type'),
      disabled: e.currentTarget.hasAttribute('disabled'),
      formValid: !!formData.email && !!formData.password
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const fieldName = e.target.name

    console.log('🔐 [LoginPage] Input changed:', {
      field: fieldName,
      value: fieldName === 'password' ? '***' : value,
      type: e.target.type
    })

    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      }

      console.log('🔐 [LoginPage] Form data updated:', {
        email: newData.email,
        hasPassword: !!newData.password,
        rememberMe: newData.rememberMe
      })

      return newData
    })

    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PsyPsy CMS</h1>
          <p className="text-gray-600">HIPAA Compliant Healthcare Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember me on this device
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleButtonClick}
              disabled={isSubmitting || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Firebase Auth Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Firebase Auth Emulator</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Connected to local Firebase Auth emulator</p>
              <p>Create test users in Firebase Auth UI: <code className="bg-blue-100 px-1 rounded">http://127.0.0.1:8782</code></p>
              <p>Or use existing Firebase Auth accounts</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure • HIPAA Compliant • Professional Healthcare Management</p>
          <p className="mt-2">© 2025 PsyPsy Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage