import React, { useState, useEffect } from 'react'
import { MedicalNotesEditor } from '../components/medical-notes/MedicalNotesEditor'
import { SyncStatusCard } from '../components/medical-notes/SyncStatusCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Shield, Database } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

interface MedicalNote {
  id?: string;
  patient_id: string;
  content: string;
  template_type: string;
  created_at?: Date;
  consent_obtained: boolean;
  encrypted: boolean;
  deidentified: boolean;
  sync_status: 'pending' | 'synced' | 'conflict';
}

const NotesPage: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false)
  const [storageInitialized, setStorageInitialized] = useState(false)
  const [recentNotes, setRecentNotes] = useState<MedicalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkStorageStatus()
  }, [])

  const checkStorageStatus = async () => {
    try {
      const result = await invoke<any>('storage_status')
      if (result.success) {
        setStorageInitialized(result.data)
        if (result.data) {
          // Load recent notes if storage is initialized
          loadRecentNotes()
        }
      }
    } catch (error) {
      console.error('Error checking storage status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentNotes = async () => {
    try {
      // TODO: Get actual patient ID and user ID from context
      const result = await invoke<any>('list_patient_notes', {
        patient_id: 'sample_patient_123',
        user_id: 'current_user_id',
        limit: 5,
        offset: 0
      })

      if (result.success) {
        setRecentNotes(result.data || [])
      }
    } catch (error) {
      console.error('Error loading recent notes:', error)
    }
  }

  const initializeStorage = async () => {
    try {
      const passphrase = prompt('Enter your passphrase for encrypted storage:')
      if (!passphrase) return

      const result = await invoke<any>('initialize_encrypted_storage', {
        passphrase
      })

      if (result.success) {
        setStorageInitialized(true)
        console.log('Storage initialized successfully')
      } else {
        console.error('Failed to initialize storage:', result.error)
      }
    } catch (error) {
      console.error('Error initializing storage:', error)
    }
  }

  const handleNoteSaved = (note: MedicalNote) => {
    console.log('Note saved:', note)
    setShowEditor(false)
    loadRecentNotes() // Refresh the list
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading medical notes system...</p>
        </div>
      </div>
    )
  }

  if (!storageInitialized) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Encrypted Medical Notes Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6">
              <Database className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-xl font-semibold mb-2">Initialize Encrypted Storage</h2>
              <p className="text-gray-600 mb-6">
                Set up your encrypted local storage for Quebec Law 25 compliant medical notes.
                Your notes will be encrypted with AES-256-GCM and stored securely on your device.
              </p>
              <div className="space-y-2 mb-6">
                <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                  <Shield className="h-3 w-3" />
                  AES-256-GCM Encryption
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 w-fit mx-auto">
                  <FileText className="h-3 w-3" />
                  Quebec Law 25 Compliant
                </Badge>
              </div>
              <Button onClick={initializeStorage} size="lg">
                Initialize Encrypted Storage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showEditor) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button variant="outline" onClick={() => setShowEditor(false)}>
            ← Back to Notes
          </Button>
        </div>
        <MedicalNotesEditor
          patientId="sample_patient_123" // TODO: Get from context
          onSave={handleNoteSaved}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Medical Notes
          </h1>
          <p className="text-gray-600 mt-1">Quebec Law 25 compliant encrypted medical notes</p>
        </div>
        <Button onClick={() => setShowEditor(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Sync Status */}
        <SyncStatusCard onConflictResolution={() => console.log('Open conflict resolution')} />

        {/* Storage Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Local Storage Status</span>
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Encrypted & Compliant
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">AES-256-GCM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">Law 25 Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm">Local Storage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{recentNotes.length}</div>
                <div className="text-sm">Notes Stored</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-600">No medical notes yet</p>
                <Button onClick={() => setShowEditor(true)} className="mt-4">
                  Create Your First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {note.template_type || 'Medical Note'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Patient: {note.patient_id}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={note.consent_obtained ? "default" : "destructive"}>
                          {note.consent_obtained ? "Consent ✓" : "No Consent"}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Today'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NotesPage
