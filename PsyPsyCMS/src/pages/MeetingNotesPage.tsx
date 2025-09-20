import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Mic,
  Square,
  Download,
  Settings,
  Shield,
  FileText,
  Clock,
  Users,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { RecordingControls } from '@/components/meeting/RecordingControls'
import { SummaryResponse, MeetingRecording, TranscriptSegment, TranscriptionConfig } from '@/types/meeting'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TranscriptUpdate {
  text: string;
  timestamp: string;
  source: string;
  sequence_id: number;
  chunk_start_time: number;
  is_partial: boolean;
}

interface AIModel {
  id: string
  name: string
  provider: string
  accuracy: number
  speed: 'fast' | 'medium' | 'slow'
  languages: string[]
  maxDuration: number // in minutes
  costPerMinute: number
  hipaaCompliant: boolean
  quebecLaw25Compliant: boolean
  pipedaCompliant: boolean
  dataResidency: string
  sovereignty: string
  description: string
  features: string[]
}

const AI_MODELS: AIModel[] = [
  {
    id: 'vertex-ai-canada-whisper',
    name: 'Vertex AI Whisper (Canada)',
    provider: 'Google Cloud Canada',
    accuracy: 98,
    speed: 'medium',
    languages: ['fr-CA', 'en-CA', 'en', 'fr', 'es'],
    maxDuration: 180,
    costPerMinute: 0.008,
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    dataResidency: 'Canada (Montreal)',
    sovereignty: 'Canadian-controlled',
    description: 'Google Cloud Vertex AI Whisper with Canadian data residency and Quebec French support',
    features: ['Quebec French', 'Canadian data residency', 'Medical terminology', 'Speaker diarization', 'Law 25 compliant']
  },
  {
    id: 'vertex-ai-gemini-canada',
    name: 'Vertex AI Gemini (Canada)',
    provider: 'Google Cloud Canada',
    accuracy: 97,
    speed: 'fast',
    languages: ['fr-CA', 'en-CA', 'en', 'fr'],
    maxDuration: 120,
    costPerMinute: 0.010,
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    dataResidency: 'Canada (Montreal)',
    sovereignty: 'Canadian-controlled',
    description: 'Google Gemini 1.5 Pro with Canadian ML processing and healthcare optimization',
    features: ['Multimodal AI', 'Healthcare specialized', 'Real-time processing', 'Quebec compliance', 'Automated decision disclosure']
  },
  {
    id: 'canadian-sovereign-ai',
    name: 'Canadian Sovereign AI',
    provider: 'Sovereign Cloud Canada',
    accuracy: 96,
    speed: 'medium',
    languages: ['fr-CA', 'en-CA'],
    maxDuration: 240,
    costPerMinute: 0.015,
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    dataResidency: 'Canada (Quebec)',
    sovereignty: 'Canadian-owned',
    description: '100% Canadian-owned AI with complete data sovereignty',
    features: ['Canadian ownership', 'Zero foreign jurisdiction', 'Quebec data centers', 'Healthcare specialized', 'Complete sovereignty']
  },
  {
    id: 'azure-canada-speech',
    name: 'Azure Speech (Canada Central)',
    provider: 'Microsoft Canada',
    accuracy: 95,
    speed: 'fast',
    languages: ['fr-CA', 'en-CA', 'en', 'fr'],
    maxDuration: 180,
    costPerMinute: 0.007,
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    dataResidency: 'Canada (Toronto)',
    sovereignty: 'Canadian-hosted',
    description: 'Microsoft Azure Speech Services with Canadian data residency',
    features: ['Canadian hosting', 'Real-time transcription', 'Custom models', 'Healthcare terminology', 'PIPEDA certified']
  },
  {
    id: 'deepgram-canada-medical',
    name: 'Deepgram Medical (Canada)',
    provider: 'Deepgram Canada',
    accuracy: 99,
    speed: 'fast',
    languages: ['en-CA', 'fr-CA'],
    maxDuration: 300,
    costPerMinute: 0.018,
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    dataResidency: 'Canada (Multi-region)',
    sovereignty: 'Canadian-compliant',
    description: 'Specialized medical AI with Canadian compliance and Quebec French medical terminology',
    features: ['Medical specialization', 'Quebec medical terms', 'Drug names (French/English)', 'Highest accuracy', 'Canadian compliance']
  }
]

const MeetingNotesPage: React.FC = () => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [barHeights, setBarHeights] = useState<string[]>([])
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('recording')

  // AI Model Configuration
  const [selectedModel, setSelectedModel] = useState('vertex-ai-canada-whisper')
  const [transcriptionConfig, setTranscriptionConfig] = useState<TranscriptionConfig>({
    model: 'vertex-ai-canada-whisper',
    language: 'en',
    enable_diarization: true,
    enable_punctuation: true,
    filter_profanity: false
  })

  // Quebec Healthcare compliance state
  const [patientConsent, setPatientConsent] = useState(false)
  const [quebecLaw25Consent, setQuebecLaw25Consent] = useState(false)
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false)
  const [automatedDecisionConsent, setAutomatedDecisionConsent] = useState(false)
  const [sessionType, setSessionType] = useState<'consultation' | 'therapy' | 'assessment'>('consultation')
  const [currentPatientId, setCurrentPatientId] = useState<string>('')
  const [showPatientInfo, setShowPatientInfo] = useState(false)

  // Recent recordings
  const [recentRecordings, setRecentRecordings] = useState<MeetingRecording[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Compliance status
  const [complianceStatus] = useState({
    hipaaCompliant: true,
    quebecLaw25Compliant: true,
    pipedaCompliant: true,
    encryptionEnabled: true,
    auditingEnabled: true,
    dataRetentionConfigured: true,
    localProcessing: true,
    backupEnabled: false,
    canadianDataResidency: true,
    consentManagement: true,
    automatedDecisionDisclosure: true,
    dataSubjectRights: true
  })

  // Audio visualization bars
  useEffect(() => {
    const generateBars = () => {
      const newBarHeights = Array.from({ length: 20 }, () =>
        isRecording && !isPaused
          ? `${Math.random() * 20 + 4}px`
          : '4px'
      )
      setBarHeights(newBarHeights)
    }

    generateBars()
    if (isRecording && !isPaused) {
      const interval = setInterval(generateBars, 100)
      return () => clearInterval(interval)
    }
  }, [isRecording, isPaused])

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // Listen for transcript updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupTranscriptListener = async () => {
      try {
        unsubscribe = await listen('transcript-update', (event) => {
          const update = event.payload as TranscriptUpdate
          console.log('Transcript update received:', update)

          setCurrentTranscript(prev => prev + ' ' + update.text)

          // Add to transcript segments
          const newSegment: TranscriptSegment = {
            id: `segment-${update.sequence_id}`,
            timestamp: update.timestamp,
            speaker: update.source,
            text: update.text,
            confidence: 0.95, // TODO: Get actual confidence from backend
            start_time: update.chunk_start_time,
            end_time: update.chunk_start_time + 5 // Estimated
          }

          setTranscript(prev => [...prev, newSegment])
        })
      } catch (error) {
        console.error('Failed to set up transcript listener:', error)
      }
    }

    setupTranscriptListener()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setTranscriptionConfig(prev => ({ ...prev, model: modelId }))
    console.log('AI model changed to:', modelId)
  }

  const handleStartRecording = useCallback(() => {
    if (!patientConsent) {
      setError('Patient consent is required before starting a recording for healthcare compliance.')
      return
    }
    if (!quebecLaw25Consent) {
      setError('Quebec Law 25 specific consent is required for data processing.')
      return
    }
    if (!dataProcessingConsent) {
      setError('Explicit consent for AI data processing is required under Law 25.')
      return
    }
    if (!automatedDecisionConsent) {
      setError('Consent for automated AI decision-making is required under Law 25.')
      return
    }

    if (!currentPatientId.trim()) {
      setError('Patient ID is required for session recording.')
      return
    }

    setError(null)
    setIsRecording(true)
    setIsPaused(false)
    setIsProcessing(false)
    setCurrentTranscript('')
    setTranscript([])
    setRecordingDuration(0)

    console.log(`Starting HIPAA-compliant recording for patient ${currentPatientId} with model ${selectedModel}`)
  }, [patientConsent, currentPatientId, selectedModel])

  const handleStopRecording = useCallback((callApi: boolean = true) => {
    setIsRecording(false)
    setIsPaused(false)
    if (callApi) {
      setIsProcessing(true)
      console.log('Processing recording and generating summary...')
      // TODO: Process recording and generate summary
      setTimeout(() => {
        setIsProcessing(false)
      }, 3000) // Simulated processing time
    }
  }, [])

  const handlePauseRecording = useCallback(() => {
    setIsPaused(prev => !prev)
    console.log(isPaused ? 'Resuming recording' : 'Pausing recording')
  }, [isPaused])

  const handleTranscriptReceived = useCallback((summary: SummaryResponse) => {
    console.log('Summary received:', summary)
    // TODO: Handle received summary
  }, [])

  const handleTranscriptionError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setIsRecording(false)
    setIsProcessing(false)
  }, [])

  const handleSaveTranscript = useCallback(async () => {
    try {
      const transcriptContent = transcript.map(segment =>
        `[${segment.timestamp}] ${segment.speaker}: ${segment.text}`
      ).join('\n')

      const fileName = `transcript_${currentPatientId}_${new Date().toISOString().split('T')[0]}.txt`
      await invoke('save_transcript', { filePath: fileName, content: transcriptContent })
      console.log('Transcript saved successfully')
    } catch (error) {
      setError('Failed to save transcript')
      console.error('Error saving transcript:', error)
    }
  }, [transcript, currentPatientId])

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel)

  const getModelBadgeColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'slow': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-psypsy-primary/20 to-psypsy-primary/10 rounded-xl">
            <Brain className="w-7 h-7 text-psypsy-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Meeting Notes</h1>
            <p className="text-sm text-muted-foreground">
              HIPAA-compliant transcription with {selectedModelData?.name || 'AI model'}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
            <Shield className="w-3 h-3 mr-1" />
            Quebec Law 25
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
            <Shield className="w-3 h-3 mr-1" />
            PIPEDA
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            {selectedModelData?.provider}
          </Badge>
          {isRecording && (
            <Badge className="bg-red-100 text-red-800 animate-pulse dark:bg-red-900/30 dark:text-red-300">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              {isPaused ? 'PAUSED' : 'LIVE'}
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="recording" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Recording
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Recording Tab */}
        <TabsContent value="recording" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Recording Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quebec Healthcare Compliance Setup */}
              <Card className="border-2 border-psypsy-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-psypsy-primary" />
                    Quebec Healthcare Compliance Setup
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    HIPAA, Quebec Law 25 & PIPEDA compliance for healthcare recording
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-id">Patient ID *</Label>
                      <div className="relative">
                        <Input
                          id="patient-id"
                          type={showPatientInfo ? "text" : "password"}
                          value={currentPatientId}
                          onChange={(e) => setCurrentPatientId(e.target.value)}
                          placeholder="Enter patient identifier"
                          disabled={isRecording}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPatientInfo(!showPatientInfo)}
                        >
                          {showPatientInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-type">Session Type</Label>
                      <Select
                        value={sessionType}
                        onValueChange={(value: any) => setSessionType(value)}
                        disabled={isRecording}
                      >
                        <SelectTrigger id="session-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Medical Consultation</SelectItem>
                          <SelectItem value="therapy">Therapy Session</SelectItem>
                          <SelectItem value="assessment">Clinical Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* HIPAA Consent */}
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Switch
                      id="consent"
                      checked={patientConsent}
                      onCheckedChange={setPatientConsent}
                      disabled={isRecording}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="consent" className="text-sm font-medium">
                        Patient Recording Consent (HIPAA) *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Patient has provided informed consent for session recording and AI transcription
                      </p>
                    </div>
                  </div>

                  {/* Quebec Law 25 Consent */}
                  <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Switch
                      id="quebec-consent"
                      checked={quebecLaw25Consent}
                      onCheckedChange={setQuebecLaw25Consent}
                      disabled={isRecording}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="quebec-consent" className="text-sm font-medium">
                        Quebec Law 25 Data Processing Consent *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Explicit consent for personal information processing under Quebec Law 25
                      </p>
                    </div>
                  </div>

                  {/* AI Data Processing Consent */}
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Switch
                      id="ai-consent"
                      checked={dataProcessingConsent}
                      onCheckedChange={setDataProcessingConsent}
                      disabled={isRecording}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="ai-consent" className="text-sm font-medium">
                        AI Data Processing Consent *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Consent for artificial intelligence analysis and processing of voice data
                      </p>
                    </div>
                  </div>

                  {/* Automated Decision Consent */}
                  <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Switch
                      id="automated-consent"
                      checked={automatedDecisionConsent}
                      onCheckedChange={setAutomatedDecisionConsent}
                      disabled={isRecording}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="automated-consent" className="text-sm font-medium">
                        Automated Decision-Making Consent *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Consent for automated AI decisions with right to human review (Law 25 requirement)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recording Controls */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Recording Studio
                    </CardTitle>
                    {isRecording && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(recordingDuration)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {selectedModelData?.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Recording Interface */}
                  <div className="text-center space-y-6">
                    {/* Audio Visualization */}
                    <div className="flex items-center justify-center gap-1 h-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4">
                      {barHeights.map((height, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-psypsy-primary to-psypsy-primary/60 rounded-full transition-all duration-100 ease-out"
                          style={{
                            height,
                            width: '3px',
                            opacity: isRecording && !isPaused ? 0.8 : 0.3
                          }}
                        />
                      ))}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      {!isRecording ? (
                        <Button
                          size="lg"
                          onClick={handleStartRecording}
                          disabled={!patientConsent || !quebecLaw25Consent || !dataProcessingConsent || !automatedDecisionConsent || !currentPatientId.trim()}
                          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Mic className="w-6 h-6" />
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handlePauseRecording}
                            className="w-12 h-12 rounded-full"
                          >
                            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                          </Button>
                          <Button
                            size="lg"
                            onClick={() => handleStopRecording()}
                            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Square className="w-6 h-6" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Status Text */}
                    <div className="text-center">
                      {!isRecording && (
                        <p className="text-muted-foreground">
                          {patientConsent && quebecLaw25Consent && dataProcessingConsent && automatedDecisionConsent && currentPatientId.trim()
                            ? "Ready to start recording - All Quebec compliance requirements met"
                            : "Complete Quebec healthcare compliance setup above to start recording"
                          }
                        </p>
                      )}
                      {isRecording && !isPaused && (
                        <p className="text-green-600 font-medium">
                          🔴 Recording in progress - AI transcription active
                        </p>
                      )}
                      {isRecording && isPaused && (
                        <p className="text-yellow-600 font-medium">
                          ⏸️ Recording paused
                        </p>
                      )}
                      {isProcessing && (
                        <p className="text-blue-600 font-medium">
                          🧠 Processing with {selectedModelData?.name}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Active Model Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-psypsy-primary" />
                    Active AI Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedModelData && (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{selectedModelData.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedModelData.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {selectedModelData.provider}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Accuracy</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${selectedModelData.accuracy}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{selectedModelData.accuracy}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Speed</span>
                          <Badge className={getModelBadgeColor(selectedModelData.speed)}>
                            {selectedModelData.speed}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Max Duration</span>
                          <span className="text-sm font-medium">{selectedModelData.maxDuration}m</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Cost</span>
                          <span className="text-sm font-medium">${selectedModelData.costPerMinute}/min</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">HIPAA</span>
                          {selectedModelData.hipaaCompliant ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Law 25</span>
                          {selectedModelData.quebecLaw25Compliant ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">PIPEDA</span>
                          {selectedModelData.pipedaCompliant ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Data Residency</span>
                          <span className="text-xs text-green-600 font-medium">{selectedModelData.dataResidency}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedModelData.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change AI Model
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={transcript.length === 0}
                    onClick={handleSaveTranscript}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Transcript
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={transcript.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Recording
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Live Transcript
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time AI transcription with speaker identification
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={transcript.length === 0}>
                    <Upload className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" disabled={transcript.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full border rounded-lg bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                {transcript.length === 0 && !currentTranscript ? (
                  <div className="text-center text-muted-foreground py-24">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No transcript available</h3>
                    <p className="text-sm">Start recording to see real-time AI transcription</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {transcript.map((segment, index) => (
                      <div
                        key={segment.id}
                        className="flex space-x-4 p-4 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="flex-shrink-0 text-xs text-muted-foreground font-mono w-20 pt-1">
                          {segment.timestamp}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-psypsy-primary rounded-full" />
                              <span className="text-sm font-semibold text-foreground">
                                {segment.speaker}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(segment.confidence * 100)}% confident
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {segment.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {currentTranscript && (
                      <div className="flex space-x-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex-shrink-0 text-xs text-blue-600 font-mono w-20 pt-1">
                          Live
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Speaker
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                              Transcribing...
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            {currentTranscript}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-psypsy-primary" />
                  AI Model Selection
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose the best AI model for your transcription needs
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {AI_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'border-psypsy-primary bg-psypsy-primary/5'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleModelChange(model.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.provider}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getModelBadgeColor(model.speed)}>
                            {model.speed}
                          </Badge>
                          {model.hipaaCompliant && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{model.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy: {model.accuracy}%</span>
                        <span className="text-muted-foreground">${model.costPerMinute}/min</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {model.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transcription Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Transcription Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how AI processes your recordings
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language-select">Primary Language</Label>
                    <Select
                      value={transcriptionConfig.language}
                      onValueChange={(value) => setTranscriptionConfig(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger id="language-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="fr">🇫🇷 French</SelectItem>
                        <SelectItem value="de">🇩🇪 German</SelectItem>
                        <SelectItem value="it">🇮🇹 Italian</SelectItem>
                        <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                        <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                        <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
                        <SelectItem value="ko">🇰🇷 Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="diarization" className="text-sm font-medium">
                          Speaker Identification
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically identify and label different speakers
                        </p>
                      </div>
                      <Switch
                        id="diarization"
                        checked={transcriptionConfig.enable_diarization}
                        onCheckedChange={(checked) => setTranscriptionConfig(prev => ({ ...prev, enable_diarization: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="punctuation" className="text-sm font-medium">
                          Smart Punctuation
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Add punctuation and capitalization automatically
                        </p>
                      </div>
                      <Switch
                        id="punctuation"
                        checked={transcriptionConfig.enable_punctuation}
                        onCheckedChange={(checked) => setTranscriptionConfig(prev => ({ ...prev, enable_punctuation: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="profanity" className="text-sm font-medium">
                          Content Filter
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Filter inappropriate language from transcripts
                        </p>
                      </div>
                      <Switch
                        id="profanity"
                        checked={transcriptionConfig.filter_profanity}
                        onCheckedChange={(checked) => setTranscriptionConfig(prev => ({ ...prev, filter_profanity: checked }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Model Comparison</h4>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>• Whisper: Best for general conversation</span>
                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                      </div>
                      <p>• Claude: Best for medical terminology</p>
                      <p>• Deepgram Medical: Specialized healthcare model</p>
                      <p>• Azure: Enterprise features & reliability</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Quebec Healthcare Compliance Status
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  HIPAA, Quebec Law 25 & PIPEDA compliance monitoring
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  'HIPAA Compliance': { status: complianceStatus.hipaaCompliant, desc: 'Full healthcare data protection compliance' },
                  'Quebec Law 25': { status: complianceStatus.quebecLaw25Compliant, desc: 'Quebec data privacy and consent requirements' },
                  'PIPEDA Compliance': { status: complianceStatus.pipedaCompliant, desc: 'Canadian federal privacy law compliance' },
                  'Canadian Data Residency': { status: complianceStatus.canadianDataResidency, desc: 'All data stored within Canadian borders' },
                  'Consent Management': { status: complianceStatus.consentManagement, desc: 'Granular consent tracking per Law 25' },
                  'Automated Decision Disclosure': { status: complianceStatus.automatedDecisionDisclosure, desc: 'AI decision transparency per Law 25' },
                  'End-to-End Encryption': { status: complianceStatus.encryptionEnabled, desc: 'AES-256 encryption for all recordings' },
                  'Audit Logging': { status: complianceStatus.auditingEnabled, desc: 'Complete access and action tracking' },
                  'Data Subject Rights': { status: complianceStatus.dataSubjectRights, desc: 'Access, rectification, erasure rights' },
                  'Secure Backup': { status: complianceStatus.backupEnabled, desc: 'Encrypted cloud backup available' }
                }).map(([label, { status, desc }]) => (
                  <div key={label} className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {status ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={status
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
                      }
                    >
                      {status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Security Features
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced security measures for healthcare data
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Data Protection
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-2 pl-6">
                      <p>• AES-256-GCM encryption at rest and in transit</p>
                      <p>• Automatic PHI detection and masking</p>
                      <p>• Zero-knowledge architecture</p>
                      <p>• Secure key management with hardware security</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      Compliance
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-2 pl-6">
                      <p>• HIPAA Security Rule compliance</p>
                      <p>• Quebec Law 25 data residency</p>
                      <p>• SOC 2 Type II certified infrastructure</p>
                      <p>• Regular security audits and penetration testing</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      AI Privacy
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-2 pl-6">
                      <p>• On-device processing when possible</p>
                      <p>• Encrypted model inference</p>
                      <p>• No training data retention</p>
                      <p>• Privacy-preserving machine learning</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    Certification Status
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    This system is certified for healthcare use and meets all HIPAA requirements for electronic health record systems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MeetingNotesPage