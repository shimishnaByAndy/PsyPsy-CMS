import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Lock,
  Users,
  FileText
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import {
  SupportedPlatform,
  OAuthCredentials,
  AuthResult,
  ProfileInfo,
  AccountInfo
} from '../../services/social-media/PostizProviderPattern';

interface PlatformConnection {
  platform: SupportedPlatform;
  connected: boolean;
  profile?: ProfileInfo;
  account?: AccountInfo;
  lastConnected?: Date;
  consentStatus: ConsentStatus;
}

interface ConsentStatus {
  quebecLaw25Consent: boolean;
  dataProcessingConsent: boolean;
  socialMediaSharingConsent: boolean;
  consentDate?: Date;
  consentVersion: string;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

const PLATFORM_CONFIGS: Record<SupportedPlatform, {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  defaultScopes: string[];
  complianceNotes: string[];
}> = {
  [SupportedPlatform.FACEBOOK]: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    description: 'Share to Facebook pages and profiles',
    defaultScopes: ['pages_manage_posts', 'pages_read_engagement', 'public_profile'],
    complianceNotes: [
      'Facebook has strict health advertising policies',
      'Medical content requires pre-approval in some regions',
      'Patient information must never be shared'
    ]
  },
  [SupportedPlatform.INSTAGRAM]: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-600',
    description: 'Share to Instagram business accounts',
    defaultScopes: ['instagram_basic', 'instagram_content_publish'],
    complianceNotes: [
      'Visual content must comply with health advertising standards',
      'Stories and posts are subject to different compliance rules',
      'Hashtags related to medical services require careful review'
    ]
  },
  [SupportedPlatform.TWITTER]: {
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-slate-800',
    description: 'Share to Twitter/X accounts',
    defaultScopes: ['tweet.read', 'tweet.write', 'users.read'],
    complianceNotes: [
      'Character limits require concise compliance messaging',
      'Medical misinformation policies are strictly enforced',
      'Professional credentials should be clearly stated'
    ]
  },
  [SupportedPlatform.LINKEDIN]: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    description: 'Share to LinkedIn professional profiles',
    defaultScopes: ['w_member_social', 'r_liteprofile'],
    complianceNotes: [
      'Professional content standards apply',
      'Medical expertise claims require verification',
      'Educational content preferred over promotional'
    ]
  }
};

export function OAuthConfigurationPanel() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatform>(SupportedPlatform.FACEBOOK);
  const [oauthConfig, setOauthConfig] = useState<Record<SupportedPlatform, OAuthConfig>>({} as any);
  const [isConnecting, setIsConnecting] = useState<Record<SupportedPlatform, boolean>>({} as any);
  const [quebecConsentGiven, setQuebecConsentGiven] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  useEffect(() => {
    loadConnections();
    loadOAuthConfigs();
  }, []);

  const loadConnections = async () => {
    try {
      const result = await invoke<any>('get_social_media_connections');
      if (result.success) {
        setConnections(result.data || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadOAuthConfigs = async () => {
    try {
      const result = await invoke<any>('get_oauth_configs');
      if (result.success) {
        setOauthConfig(result.data || {});
      }
    } catch (error) {
      console.error('Error loading OAuth configs:', error);
    }
  };

  const handleConnect = async (platform: SupportedPlatform) => {
    if (!quebecConsentGiven) {
      alert('Quebec Law 25 consent is required before connecting social media accounts');
      return;
    }

    setIsConnecting(prev => ({ ...prev, [platform]: true }));

    try {
      const config = oauthConfig[platform];
      if (!config || !config.clientId) {
        alert('Please configure OAuth credentials for this platform first');
        return;
      }

      // Record consent
      await invoke('record_social_media_consent', {
        platform,
        consentData: {
          quebecLaw25Consent: true,
          dataProcessingConsent: true,
          socialMediaSharingConsent: true,
          consentDate: new Date().toISOString(),
          consentVersion: '2025.1'
        }
      });

      // Initiate OAuth flow
      const result = await invoke<any>('initiate_oauth_flow', {
        platform,
        credentials: {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
          scopes: config.scopes
        }
      });

      if (result.success) {
        // In a real implementation, this would open the OAuth URL
        console.log('OAuth URL:', result.authUrl);
        alert(`OAuth flow initiated. In production, this would open: ${result.authUrl}`);

        // For demo purposes, simulate successful connection
        setTimeout(() => {
          loadConnections();
        }, 2000);
      } else {
        alert(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error connecting to platform:', error);
      alert(`Connection error: ${error}`);
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform: SupportedPlatform) => {
    try {
      const result = await invoke<any>('disconnect_platform', { platform });
      if (result.success) {
        loadConnections();
      } else {
        alert(`Disconnect failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const saveOAuthConfig = async (platform: SupportedPlatform, config: OAuthConfig) => {
    try {
      const result = await invoke<any>('save_oauth_config', {
        platform,
        config
      });

      if (result.success) {
        setOauthConfig(prev => ({ ...prev, [platform]: config }));
        alert('OAuth configuration saved successfully');
      } else {
        alert(`Save failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const getPlatformConnection = (platform: SupportedPlatform): PlatformConnection | undefined => {
    return connections.find(c => c.platform === platform);
  };

  const getConnectionStatus = (platform: SupportedPlatform) => {
    const connection = getPlatformConnection(platform);
    if (!connection) return 'not_configured';
    if (!connection.connected) return 'disconnected';
    if (!connection.consentStatus.quebecLaw25Consent) return 'consent_missing';
    return 'connected';
  };

  const getStatusBadge = (platform: SupportedPlatform) => {
    const status = getConnectionStatus(platform);
    const connection = getPlatformConnection(platform);

    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'consent_missing':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Consent Required
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Configured
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Not Configured
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Quebec Law 25 Consent */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Quebec Law 25 Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              Before connecting social media accounts, you must provide explicit consent for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Processing of your social media account information</li>
              <li>Sharing of professional content to social media platforms</li>
              <li>Storage of connection credentials in encrypted format</li>
              <li>Compliance monitoring of shared content</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="quebec-consent"
              checked={quebecConsentGiven}
              onCheckedChange={setQuebecConsentGiven}
            />
            <Label htmlFor="quebec-consent" className="text-sm font-medium">
              I provide explicit consent under Quebec Law 25 for social media integration
            </Label>
          </div>

          {quebecConsentGiven && (
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
              ✓ Consent recorded. You may now connect social media accounts.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Media Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
              const platformEnum = platform as SupportedPlatform;
              const connection = getPlatformConnection(platformEnum);
              const isConnecting = isConnecting[platformEnum];

              return (
                <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${config.color} text-white`}>
                      <config.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-gray-600">{config.description}</div>
                      {connection?.profile && (
                        <div className="text-sm text-gray-500">
                          Connected as: {connection.profile.displayName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(platformEnum)}

                    {connection?.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platformEnum)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platformEnum)}
                        disabled={!quebecConsentGiven || isConnecting}
                      >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* OAuth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              OAuth Configuration
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as SupportedPlatform)}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => (
                <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
              const platformEnum = platform as SupportedPlatform;
              const currentConfig = oauthConfig[platformEnum] || {
                clientId: '',
                clientSecret: '',
                redirectUri: `${window.location.origin}/oauth/callback`,
                scopes: config.defaultScopes
              };

              return (
                <TabsContent key={platform} value={platform} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${platform}-client-id`}>Client ID</Label>
                      <Input
                        id={`${platform}-client-id`}
                        value={currentConfig.clientId}
                        onChange={(e) => setOauthConfig(prev => ({
                          ...prev,
                          [platform]: { ...currentConfig, clientId: e.target.value }
                        }))}
                        placeholder={`Enter ${config.name} Client ID`}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${platform}-client-secret`}>Client Secret</Label>
                      <Input
                        id={`${platform}-client-secret`}
                        type="password"
                        value={currentConfig.clientSecret}
                        onChange={(e) => setOauthConfig(prev => ({
                          ...prev,
                          [platform]: { ...currentConfig, clientSecret: e.target.value }
                        }))}
                        placeholder={`Enter ${config.name} Client Secret`}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${platform}-redirect`}>Redirect URI</Label>
                      <Input
                        id={`${platform}-redirect`}
                        value={currentConfig.redirectUri}
                        onChange={(e) => setOauthConfig(prev => ({
                          ...prev,
                          [platform]: { ...currentConfig, redirectUri: e.target.value }
                        }))}
                        placeholder="OAuth redirect URI"
                      />
                    </div>

                    {showAdvancedSettings && (
                      <div>
                        <Label htmlFor={`${platform}-scopes`}>OAuth Scopes</Label>
                        <Textarea
                          id={`${platform}-scopes`}
                          value={currentConfig.scopes.join(', ')}
                          onChange={(e) => setOauthConfig(prev => ({
                            ...prev,
                            [platform]: {
                              ...currentConfig,
                              scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          }))}
                          placeholder="Comma-separated OAuth scopes"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Compliance Notes */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Quebec Compliance Notes for {config.name}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {config.complianceNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveOAuthConfig(platformEnum, currentConfig)}
                        disabled={!currentConfig.clientId || !currentConfig.clientSecret}
                      >
                        Save Configuration
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => window.open(`https://developers.${platform}.com`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Developer Docs
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}