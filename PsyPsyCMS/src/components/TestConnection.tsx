/**
 * Test Connection Component - Firebase Emulator Testing
 *
 * Component to test connection to your Firebase emulator setup
 * and validate all services are working correctly.
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Wifi } from 'lucide-react'
import { firebaseApi, authService, TEST_ACCOUNTS } from '@/services/firebase-api'
import { toast } from 'sonner'

interface TestResult {
  service: string
  status: 'pending' | 'success' | 'error'
  message: string
  timestamp?: string
  data?: any
}

export const TestConnection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const updateResult = (service: string, status: TestResult['status'], message: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.service === service)
      const newResult: TestResult = {
        service,
        status,
        message,
        timestamp: new Date().toLocaleTimeString(),
        data
      }

      if (existing) {
        return prev.map(r => r.service === service ? newResult : r)
      }
      return [...prev, newResult]
    })
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setResults([])

    try {
      // Test 1: Hello World Endpoint
      updateResult('Hello World', 'pending', 'Testing connection...')

      try {
        const helloResponse = await firebaseApi.testConnection()
        if (helloResponse.success) {
          updateResult('Hello World', 'success', `Connected! ${helloResponse.data?.message}`, helloResponse)
          toast.success('Firebase Functions connected successfully!')
        } else {
          updateResult('Hello World', 'error', helloResponse.error || 'Connection failed')
          toast.error('Failed to connect to Firebase Functions')
        }
      } catch (error: any) {
        updateResult('Hello World', 'error', error.message)
        toast.error(`Connection error: ${error.message}`)
      }

      // Test 2: Authentication
      updateResult('Authentication', 'pending', 'Testing auth service...')

      try {
        const authResult = await authService.signIn(TEST_ACCOUNTS.ADMIN.email, TEST_ACCOUNTS.ADMIN.password)
        if (authResult.success) {
          updateResult('Authentication', 'success', `Signed in as ${authResult.user?.email}`, authResult)
          toast.success('Authentication successful!')

          // Test sign out
          await authService.signOut()
        } else {
          updateResult('Authentication', 'error', authResult.error || 'Auth failed')
          toast.error('Authentication failed')
        }
      } catch (error: any) {
        updateResult('Authentication', 'error', error.message)
        toast.error(`Auth error: ${error.message}`)
      }

      // Test 3: User Profile Creation
      updateResult('User Profile', 'pending', 'Testing profile creation...')

      try {
        // First sign in as admin to test profile creation
        await authService.signIn(TEST_ACCOUNTS.ADMIN.email, TEST_ACCOUNTS.ADMIN.password)

        const profileData = {
          displayName: 'Test Admin User',
          email: TEST_ACCOUNTS.ADMIN.email,
          userType: 0, // Admin
          isVerified: true
        }

        const profileResponse = await firebaseApi.createUserProfile(profileData)
        if (profileResponse.success) {
          updateResult('User Profile', 'success', 'Profile created successfully', profileResponse)
          toast.success('User profile test passed!')
        } else {
          updateResult('User Profile', 'error', profileResponse.error || 'Profile creation failed')
        }
      } catch (error: any) {
        updateResult('User Profile', 'error', error.message)
      }

      // Test 4: Data Fetching (Users)
      updateResult('Data Fetching', 'pending', 'Testing data queries...')

      try {
        const usersResponse = await firebaseApi.getUsers()
        if (usersResponse.success) {
          updateResult('Data Fetching', 'success', `Fetched ${usersResponse.data?.length || 0} users`, usersResponse)
          toast.success('Data fetching test passed!')
        } else {
          updateResult('Data Fetching', 'error', usersResponse.error || 'Data fetch failed')
        }
      } catch (error: any) {
        updateResult('Data Fetching', 'error', error.message)
      }

    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      success: 'default',
      error: 'destructive'
    } as const

    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      success: 'bg-green-500/10 text-green-600 border-green-200',
      error: 'bg-red-500/10 text-red-600 border-red-200'
    } as const

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wifi className="h-6 w-6" />
          Firebase Emulator Connection Test
        </h2>
        <p className="text-muted-foreground">
          Test connection to your local Firebase emulator setup
        </p>
      </div>

      {/* Emulator Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Emulator Endpoints:</strong>
          <br />
          • Auth: http://localhost:9880
          <br />
          • Firestore: http://localhost:9881
          <br />
          • Functions: localhost:5001
          <br />
          • Emulator UI: http://localhost:8782
        </AlertDescription>
      </Alert>

      {/* Test Button */}
      <Button
        onClick={runAllTests}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Tests...
          </>
        ) : (
          'Run Connection Tests'
        )}
      </Button>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          {results.map((result) => (
            <Card key={result.service} className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    {result.service}
                  </span>
                  {getStatusBadge(result.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {result.timestamp}
                  </p>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Accounts Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Accounts Available</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
              <div key={key} className="p-3 bg-muted rounded-md">
                <div className="font-medium">{account.name || account.role}</div>
                <div className="text-sm text-muted-foreground">{account.email}</div>
                <Badge variant="outline" className="mt-1">
                  {account.role}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Password for all accounts: testpassword123
          </p>
        </CardContent>
      </Card>

      {/* Quebec Compliance Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          🇨🇦 <strong>Quebec Law 25 & PIPEDA Compliance:</strong> All test operations are being audited and logged according to Canadian privacy laws. Data residency is maintained in Quebec, Canada (emulated).
        </AlertDescription>
      </Alert>
    </div>
  )
}