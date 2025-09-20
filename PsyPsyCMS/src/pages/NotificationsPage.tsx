/**
 * NotificationsPage - Rich Push Notifications Management
 *
 * Features:
 * - Rich notification composer with templates
 * - Real-time preview with device simulation
 * - Bulk sending with audience targeting
 * - Analytics and delivery tracking
 * - PIPEDA and Quebec Law 25 compliance and audit logging
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  Send,
  Eye,
  Users,
  Calendar,
  AlertTriangle,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

import {
  messagingService,
  RichNotification,
  NOTIFICATION_TEMPLATES,
  type NotificationAction
} from '@/firebase/messaging-service'

// Notification preview devices
const PREVIEW_DEVICES = {
  mobile: { width: 375, height: 812, name: 'iPhone 13', icon: Smartphone },
  tablet: { width: 768, height: 1024, name: 'iPad', icon: Tablet },
  desktop: { width: 1440, height: 900, name: 'Desktop', icon: Monitor }
} as const

type DeviceType = keyof typeof PREVIEW_DEVICES

const NotificationsPage: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('compose')
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('mobile')
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Notification form state
  const [notification, setNotification] = useState<Partial<RichNotification>>({
    title: '',
    body: '',
    image: '',
    icon: '/icons/healthcare-icon-192.png',
    category: 'system',
    priority: 'normal',
    containsPersonalInfo: false,
    auditRequired: false,
    retentionDays: 90,
    actions: []
  })

  // Target audience state
  const [targetAudience, setTargetAudience] = useState({
    type: 'all' as 'all' | 'patients' | 'professionals' | 'custom',
    customTokens: '',
    estimatedReach: 0
  })

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0
  })

  // Initialize FCM on component mount
  useEffect(() => {
    console.log('[NotificationsPage] Component mounted - initializing FCM')
    initializeFCM()
  }, [])

  /**
   * Initialize Firebase Cloud Messaging
   */
  const initializeFCM = async () => {
    try {
      const token = await messagingService.requestPermission()
      if (token) {
        setFcmToken(token)
        setIsPermissionGranted(true)
        toast.success('Push notifications enabled successfully')
      } else {
        setIsPermissionGranted(false)
        toast.error('Failed to enable push notifications')
      }
    } catch (error) {
      console.error('FCM initialization error:', error)
      toast.error('Failed to initialize push notifications')
    }
  }

  /**
   * Apply notification template
   */
  const applyTemplate = (templateKey: keyof typeof NOTIFICATION_TEMPLATES) => {
    console.log('[NotificationsPage] Applying template:', templateKey)
    const template = NOTIFICATION_TEMPLATES[templateKey]

    // Create mutable copies of template data
    const mutableTemplate = {
      ...template,
      actions: template.actions ? [...template.actions] : [], // Create mutable copy of actions array
      title: template.title,
      body: '',
      id: `notification-${Date.now()}`
    }

    setNotification(prev => ({
      ...prev,
      ...mutableTemplate
    }))
    console.log('[NotificationsPage] Template applied successfully:', mutableTemplate)
    toast.success(`Applied ${templateKey.replace('_', ' ').toLowerCase()} template`)
  }

  /**
   * Update notification field
   */
  const updateNotification = (field: keyof RichNotification, value: any) => {
    setNotification(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Add notification action
   */
  const addAction = () => {
    const newAction: NotificationAction = {
      action: `action_${Date.now()}`,
      title: 'New Action',
      icon: '📱'
    }

    setNotification(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }))
  }

  /**
   * Remove notification action
   */
  const removeAction = (index: number) => {
    setNotification(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }))
  }

  /**
   * Update notification action
   */
  const updateAction = (index: number, field: keyof NotificationAction, value: string) => {
    setNotification(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ) || []
    }))
  }

  /**
   * Send test notification
   */
  const sendTestNotification = async () => {
    if (!fcmToken) {
      toast.error('FCM token not available. Please refresh and grant permissions.')
      return
    }

    if (!notification.title || !notification.body) {
      toast.error('Please provide both title and body for the notification')
      return
    }

    setIsSending(true)

    try {
      const richNotification: RichNotification = {
        id: `test-${Date.now()}`,
        title: notification.title!,
        body: notification.body!,
        image: notification.image,
        icon: notification.icon || '/icons/healthcare-icon-192.png',
        category: notification.category || 'system',
        priority: notification.priority || 'normal',
        containsPersonalInfo: notification.containsPersonalInfo || false,
        auditRequired: notification.auditRequired || false,
        retentionDays: notification.retentionDays || 90,
        actions: notification.actions || [],
        data: {
          testNotification: true,
          sentAt: new Date().toISOString()
        }
      }

      // Show local notification for immediate testing
      await messagingService.showLocalNotification(richNotification)

      toast.success('Test notification sent successfully!')

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        delivered: prev.delivered + 1
      }))

    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    } finally {
      setIsSending(false)
    }
  }

  /**
   * Send bulk notification
   */
  const sendBulkNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Please provide both title and body for the notification')
      return
    }

    setIsSending(true)

    try {
      // In a real app, this would get tokens based on audience selection
      const tokens = targetAudience.type === 'custom'
        ? targetAudience.customTokens.split(',').map(t => t.trim())
        : [fcmToken!] // For demo, just use current token

      const richNotification: RichNotification = {
        id: `bulk-${Date.now()}`,
        title: notification.title!,
        body: notification.body!,
        image: notification.image,
        icon: notification.icon || '/icons/healthcare-icon-192.png',
        category: notification.category || 'system',
        priority: notification.priority || 'normal',
        containsPersonalInfo: notification.containsPersonalInfo || false,
        auditRequired: notification.auditRequired || false,
        retentionDays: notification.retentionDays || 90,
        actions: notification.actions || [],
        data: {
          bulkNotification: true,
          audience: targetAudience.type,
          sentAt: new Date().toISOString()
        }
      }

      // Send to messaging service (would hit your backend)
      await messagingService.sendRichNotification(tokens, richNotification)

      toast.success(`Bulk notification sent to ${tokens.length} device(s)`)

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalSent: prev.totalSent + tokens.length,
        delivered: prev.delivered + tokens.length
      }))

    } catch (error) {
      console.error('Error sending bulk notification:', error)
      toast.error('Failed to send bulk notification')
    } finally {
      setIsSending(false)
    }
  }

  /**
   * Export notification template
   */
  const exportTemplate = () => {
    const template = {
      ...notification,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notification-template-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Template exported successfully')
  }

  /**
   * Import notification template
   */
  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string)
        setNotification(template)
        toast.success('Template imported successfully')
      } catch (error) {
        toast.error('Invalid template file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-psypsy-primary" />
            Rich Push Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Send engaging notifications with rich media and interactive actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isPermissionGranted ? "default" : "secondary"}>
            {isPermissionGranted ? "Enabled" : "Disabled"}
          </Badge>

          {!isPermissionGranted && (
            <Button onClick={initializeFCM} variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </div>

      {/* Permission Alert */}
      {!isPermissionGranted && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Push notifications are disabled. Click "Enable Notifications" to allow sending test notifications.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notification Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Templates</CardTitle>
                  <CardDescription>
                    Start with a healthcare-optimized template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate('APPOINTMENT_REMINDER')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Appointment Reminder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate('URGENT_ALERT')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Urgent Alert
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate('SYSTEM_UPDATE')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      System Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter notification title..."
                      value={notification.title || ''}
                      onChange={(e) => updateNotification('title', e.target.value)}
                      maxLength={65}
                    />
                    <p className="text-xs text-muted-foreground">
                      {notification.title?.length || 0}/65 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Message *</Label>
                    <Textarea
                      id="body"
                      placeholder="Enter notification message..."
                      value={notification.body || ''}
                      onChange={(e) => updateNotification('body', e.target.value)}
                      maxLength={240}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {notification.body?.length || 0}/240 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL (Optional)</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={notification.image || ''}
                      onChange={(e) => updateNotification('image', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Images should be under 1MB and in JPG/PNG format
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={notification.category}
                        onValueChange={(value) => updateNotification('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">📅 Appointment</SelectItem>
                          <SelectItem value="reminder">⏰ Reminder</SelectItem>
                          <SelectItem value="alert">⚠️ Alert</SelectItem>
                          <SelectItem value="system">⚙️ System</SelectItem>
                          <SelectItem value="emergency">🚨 Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={notification.priority}
                        onValueChange={(value) => updateNotification('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🔵 Low</SelectItem>
                          <SelectItem value="normal">🟡 Normal</SelectItem>
                          <SelectItem value="high">🟠 High</SelectItem>
                          <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Contains Personal Information</Label>
                        <p className="text-xs text-muted-foreground">
                          Mark if notification contains personal information (PIPEDA/Law 25)
                        </p>
                      </div>
                      <Switch
                        checked={notification.containsPersonalInfo}
                        onCheckedChange={(checked) => updateNotification('containsPersonalInfo', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Interaction</Label>
                        <p className="text-xs text-muted-foreground">
                          Notification stays visible until user interacts
                        </p>
                      </div>
                      <Switch
                        checked={notification.requireInteraction}
                        onCheckedChange={(checked) => updateNotification('requireInteraction', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Interactive Actions
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAction}
                      disabled={(notification.actions?.length || 0) >= 3}
                    >
                      Add Action
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Add up to 3 interactive buttons (mobile/desktop support)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notification.actions?.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No actions added. Click "Add Action" to create interactive buttons.
                    </p>
                  )}

                  <div className="space-y-3">
                    {notification.actions?.map((action, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Action ID"
                            value={action.action}
                            onChange={(e) => updateAction(index, 'action', e.target.value)}
                          />
                          <Input
                            placeholder="Button Text"
                            value={action.title}
                            onChange={(e) => updateAction(index, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Icon (emoji)"
                            value={action.icon || ''}
                            onChange={(e) => updateAction(index, 'icon', e.target.value)}
                            maxLength={2}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Send Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={sendTestNotification}
                    disabled={isSending || !isPermissionGranted}
                    className="w-full"
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Test
                  </Button>

                  <Button
                    onClick={sendBulkNotification}
                    disabled={isSending}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Send to Audience
                  </Button>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      onClick={exportTemplate}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>

                    <label className="flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTemplate}
                        className="hidden"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Personal Info:</span>
                    <Badge variant={notification.containsPersonalInfo ? "destructive" : "secondary"}>
                      {notification.containsPersonalInfo ? "Contains Personal Info" : "No Personal Info"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Audit Required:</span>
                    <Badge variant={notification.auditRequired ? "default" : "secondary"}>
                      {notification.auditRequired ? "Yes" : "No"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Retention:</span>
                    <span className="text-muted-foreground">
                      {notification.retentionDays} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Region:</span>
                    <span className="text-muted-foreground">🇨🇦 Montreal</span>
                  </div>
                </CardContent>
              </Card>

              {/* FCM Token Info */}
              {fcmToken && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Device Token</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {fcmToken.substring(0, 32)}...
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Current device FCM registration token
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Device</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(PREVIEW_DEVICES).map(([key, device]) => {
                  const Icon = device.icon
                  return (
                    <Button
                      key={key}
                      variant={selectedDevice === key ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedDevice(key as DeviceType)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {device.name}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Device Preview */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Notification Preview
                  </CardTitle>
                  <CardDescription>
                    Live preview on {PREVIEW_DEVICES[selectedDevice].name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 relative overflow-hidden shadow-lg"
                      style={{
                        width: Math.min(PREVIEW_DEVICES[selectedDevice].width * 0.8, 400),
                        height: Math.min(PREVIEW_DEVICES[selectedDevice].height * 0.6, 300)
                      }}
                    >
                      {/* Mock Notification */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border-l-4 border-psypsy-primary">
                        <div className="flex items-start gap-3">
                          {/* App Icon */}
                          <div className="w-8 h-8 bg-psypsy-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bell className="h-4 w-4 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm truncate">
                                {notification.title || 'Notification Title'}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                now
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.body || 'Your notification message will appear here...'}
                            </p>

                            {/* Image Preview */}
                            {notification.image && (
                              <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <div className="aspect-video flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              </div>
                            )}

                            {/* Actions Preview */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.slice(0, 2).map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                  >
                                    {action.icon} {action.title}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Device Frame Effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full border-8 border-gray-300 dark:border-gray-600 rounded-lg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Preview Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2">{notification.category || 'system'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="ml-2">{notification.priority || 'normal'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actions:</span>
                        <span className="ml-2">{notification.actions?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Has Image:</span>
                        <span className="ml-2">{notification.image ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Target Audience</CardTitle>
                <CardDescription>
                  Select who should receive this notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Audience Type</Label>
                  <Select
                    value={targetAudience.type}
                    onValueChange={(value: any) => setTargetAudience(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 All Users</SelectItem>
                      <SelectItem value="patients">👥 Patients Only</SelectItem>
                      <SelectItem value="professionals">👨‍⚕️ Healthcare Professionals</SelectItem>
                      <SelectItem value="custom">⚙️ Custom Token List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {targetAudience.type === 'custom' && (
                  <div className="space-y-2">
                    <Label>FCM Tokens</Label>
                    <Textarea
                      placeholder="Enter FCM tokens, one per line or comma-separated..."
                      value={targetAudience.customTokens}
                      onChange={(e) => setTargetAudience(prev => ({
                        ...prev,
                        customTokens: e.target.value
                      }))}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter Firebase Cloud Messaging tokens for specific devices
                    </p>
                  </div>
                )}

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated Reach:</span>
                    <Badge variant="secondary">
                      {targetAudience.type === 'custom'
                        ? targetAudience.customTokens.split(/[,\n]/).filter(t => t.trim()).length
                        : targetAudience.type === 'all' ? '1,234'
                        : targetAudience.type === 'patients' ? '892'
                        : '342'
                      } devices
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduling</CardTitle>
                <CardDescription>
                  Schedule notification delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Delivery Time</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">⚡ Send Immediately</SelectItem>
                      <SelectItem value="scheduled">📅 Schedule for Later</SelectItem>
                      <SelectItem value="optimal">🎯 Optimal Time (AI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Time Zone</Label>
                  <Select defaultValue="america/montreal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/montreal">🇨🇦 America/Montreal (EST)</SelectItem>
                      <SelectItem value="america/toronto">🇨🇦 America/Toronto (EST)</SelectItem>
                      <SelectItem value="america/vancouver">🇨🇦 America/Vancouver (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Quebec Law 25 Compliance
                      </p>
                      <p className="text-blue-600 dark:text-blue-300 mt-1">
                        All notifications comply with PIPEDA and Quebec Law 25, processed within Canadian data centers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</p>
                  </div>
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.delivered.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Opened</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.opened.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.failed.toLocaleString()}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>
                Delivery status and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock recent notifications */}
                {[
                  { id: 1, title: 'Appointment Reminder', sent: '2 min ago', status: 'delivered', opened: 12, clicked: 8 },
                  { id: 2, title: 'System Maintenance', sent: '1 hour ago', status: 'delivered', opened: 45, clicked: 2 },
                  { id: 3, title: 'New Feature Available', sent: '3 hours ago', status: 'failed', opened: 0, clicked: 0 },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === 'delivered' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.sent}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>👁️ {item.opened} opened</p>
                      <p>👆 {item.clicked} clicked</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationsPage