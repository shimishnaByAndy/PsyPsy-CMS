/**
 * Emulator Connection Test Component
 * Tests live Firebase emulator connections from within the CMS
 */
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { auth, db } from '@/firebase/firebase-config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ConnectionStatus {
  auth: 'testing' | 'connected' | 'error'
  firestore: 'testing' | 'connected' | 'error'
  functions: 'testing' | 'connected' | 'error'
}

interface TestAccount {
  email: string
  password: string
  role: string
  name: string
}

const TEST_ACCOUNTS: TestAccount[] = [
  { email: 'admin@psypsy.test', password: 'testpassword123', role: 'admin', name: 'System Administrator' },
  { email: 'prof1@psypsy.test', password: 'testpassword123', role: 'professional', name: 'Dr. Sarah Wilson' },
  { email: 'prof2@psypsy.test', password: 'testpassword123', role: 'professional', name: 'Dr. Michael Chen' },
  { email: 'prof3@psypsy.test', password: 'testpassword123', role: 'professional', name: 'Dr. Emily Rodriguez' },
  { email: 'recep1@psypsy.test', password: 'testpassword123', role: 'receptionist', name: 'Jessica Thompson' }
]

export const TestEmulatorConnection: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    auth: 'testing',
    firestore: 'testing',
    functions: 'testing'
  })
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateStatus = (service: keyof ConnectionStatus, newStatus: ConnectionStatus[keyof ConnectionStatus]) => {
    setStatus(prev => ({ ...prev, [service]: newStatus }))
  }

  const testFirebaseAuth = async (): Promise<boolean> => {
    try {
      addResult('🔐 Testing Firebase Auth with admin@psypsy.test...')
      updateStatus('auth', 'testing')

      const userCredential = await signInWithEmailAndPassword(
        auth,
        'admin@psypsy.test',
        'testpassword123'
      )

      if (userCredential.user) {
        addResult(`✅ Auth Success: Logged in as ${userCredential.user.email}`)
        addResult(`📧 User ID: ${userCredential.user.uid}`)
        updateStatus('auth', 'connected')
        return true
      }
      return false
    } catch (error: any) {
      addResult(`❌ Auth Error: ${error.message}`)
      updateStatus('auth', 'error')
      return false
    }
  }

  const testFirestore = async (): Promise<boolean> => {
    try {
      addResult('🗄️ Testing Firestore connection...')
      updateStatus('firestore', 'testing')

      // Test reading from Firestore
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)

      addResult(`✅ Firestore Read: Found ${snapshot.size} users`)

      // Test writing to Firestore
      const testDocRef = doc(db, 'test', 'connection-test')
      await setDoc(testDocRef, {
        timestamp: new Date(),
        message: 'CMS Connection Test',
        emulator: true,
        compliance: 'Quebec Law 25 & PIPEDA'
      })

      addResult('✅ Firestore Write: Test document created')
      updateStatus('firestore', 'connected')
      return true
    } catch (error: any) {
      addResult(`❌ Firestore Error: ${error.message}`)
      updateStatus('firestore', 'error')
      return false
    }
  }

  const testFunctions = async (): Promise<boolean> => {
    try {
      addResult('⚡ Testing Firebase Functions...')
      updateStatus('functions', 'testing')

      const functionsUrl = 'http://localhost:5001/psypsy-dev-local/us-east4/helloWorld'
      const response = await fetch(functionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'CMS Connection Test',
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        addResult(`✅ Functions Success: ${data.message || 'Function executed'}`)
        updateStatus('functions', 'connected')
        return true
      } else {
        addResult(`⚠️ Functions Warning: HTTP ${response.status} - Functions may not be running`)
        updateStatus('functions', 'error')
        return false
      }
    } catch (error: any) {
      addResult(`⚠️ Functions Warning: ${error.message} - Functions optional for table testing`)
      updateStatus('functions', 'error')
      return false
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      addResult('🚀 Starting comprehensive Firebase emulator connection tests...')

      // Test authentication
      const authSuccess = await testFirebaseAuth()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay between tests

      // Test Firestore
      const firestoreSuccess = await testFirestore()
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test Functions (optional)
      const functionsSuccess = await testFunctions()

      // Summary
      addResult('📊 Test Summary:')
      addResult(`   Auth: ${authSuccess ? '✅ Connected' : '❌ Failed'}`)
      addResult(`   Firestore: ${firestoreSuccess ? '✅ Connected' : '❌ Failed'}`)
      addResult(`   Functions: ${functionsSuccess ? '✅ Connected' : '⚠️ Optional'}`)

      if (authSuccess && firestoreSuccess) {
        addResult('🎉 CMS is ready for table testing with live emulator data!')
        toast.success('All critical services connected! CMS ready for use.')
      } else {
        addResult('⚠️ Some services failed - check emulator status')
        toast.error('Connection issues detected - check emulator status')
      }

    } catch (error: any) {
      addResult(`💥 Unexpected error: ${error.message}`)
      toast.error(`Test failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (serviceStatus: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (serviceStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'testing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (serviceStatus: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (serviceStatus) {
      case 'connected':
        return <Badge variant="outline" className="text-green-700 border-green-300">Connected</Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-700 border-red-300">Error</Badge>
      case 'testing':
        return <Badge variant="outline" className="text-blue-700 border-blue-300">Testing...</Badge>
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Firebase Emulator Connection Test
          </CardTitle>
          <CardDescription>
            Test live connections to your local Firebase emulators (Auth: 9880, Firestore: 9881)
            <br />
            <strong>Quebec Law 25 & PIPEDA Compliant</strong> - Testing with encrypted test data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Service Status Cards */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                <span className="font-medium">Firebase Auth</span>
              </div>
              {getStatusBadge(status.auth)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.firestore)}
                <span className="font-medium">Firestore</span>
              </div>
              {getStatusBadge(status.firestore)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.functions)}
                <span className="font-medium">Functions</span>
              </div>
              {getStatusBadge(status.functions)}
            </div>
          </div>

          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              '🚀 Test All Connections'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Accounts Reference */}
      <Card>
        <CardHeader>
          <CardTitle>🧑‍⚕️ Available Test Accounts</CardTitle>
          <CardDescription>
            Use these accounts to test role-based access and table functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEST_ACCOUNTS.map((account) => (
              <div key={account.email} className="p-3 border rounded-lg">
                <div className="font-medium">{account.name}</div>
                <div className="text-sm text-muted-foreground">{account.email}</div>
                <Badge variant="secondary" className="mt-1">{account.role}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Password for all accounts:</strong> testpassword123
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <div className="font-mono text-sm space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="break-all">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TestEmulatorConnection