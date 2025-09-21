import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Send,
  Calendar,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Globe
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { OAuthConfigurationPanel } from '../components/social-media/OAuthConfigurationPanel';
import { ComplianceChecker } from '../components/social-media/ComplianceChecker';
import {
  SocialMediaPost,
  PostStatus,
  SupportedPlatform,
  PlatformConfig,
  MediaAttachment,
  ComplianceValidationResult
} from '../services/social-media/PostizProviderPattern';

interface DraftPost {
  content: string;
  platforms: SupportedPlatform[];
  scheduledAt?: Date;
  media: MediaAttachment[];
  compliance: {
    containsMedicalContent: boolean;
    quebecLaw25Reviewed: boolean;
    professionalOrderApproved: boolean;
    consentObtained: boolean;
  };
}

const SocialMediaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [draftPost, setDraftPost] = useState<DraftPost>({
    content: '',
    platforms: [],
    media: [],
    compliance: {
      containsMedicalContent: false,
      quebecLaw25Reviewed: false,
      professionalOrderApproved: false,
      consentObtained: false
    }
  });
  const [complianceResult, setComplianceResult] = useState<ComplianceValidationResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<SocialMediaPost[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<SocialMediaPost[]>([]);
  const [connections, setConnections] = useState<PlatformConfig[]>([]);

  useEffect(() => {
    loadConnections();
    loadScheduledPosts();
    loadPublishedPosts();
  }, []);

  const loadConnections = async () => {
    try {
      const result = await invoke<any>('get_connected_platforms');
      if (result.success) {
        setConnections(result.data || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const result = await invoke<any>('get_scheduled_posts');
      if (result.success) {
        setScheduledPosts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    }
  };

  const loadPublishedPosts = async () => {
    try {
      const result = await invoke<any>('get_published_posts', { limit: 20 });
      if (result.success) {
        setPublishedPosts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading published posts:', error);
    }
  };

  const handleComplianceChange = (result: ComplianceValidationResult) => {
    setComplianceResult(result);
  };

  const canPublish = () => {
    return (
      draftPost.content.length > 0 &&
      draftPost.platforms.length > 0 &&
      complianceResult?.compliant &&
      draftPost.compliance.quebecLaw25Reviewed &&
      draftPost.compliance.consentObtained
    );
  };

  const handlePublish = async () => {
    if (!canPublish()) return;

    setIsPublishing(true);

    try {
      const post: SocialMediaPost = {
        id: `post-${Date.now()}`,
        content: draftPost.content,
        media: draftPost.media,
        status: PostStatus.PUBLISHED,
        platforms: draftPost.platforms.map(platform => ({
          platform,
          accountId: 'default',
          settings: {},
          enabled: true
        })),
        compliance: {
          containsMedicalContent: draftPost.compliance.containsMedicalContent,
          containsPHI: false,
          quebecLaw25Compliant: true,
          professionalOrderApproved: draftPost.compliance.professionalOrderApproved,
          consentObtained: draftPost.compliance.consentObtained,
          reviewedBy: 'current_user',
          reviewedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await invoke<any>('publish_social_media_post', { post });

      if (result.success) {
        // Reset draft
        setDraftPost({
          content: '',
          platforms: [],
          media: [],
          compliance: {
            containsMedicalContent: false,
            quebecLaw25Reviewed: false,
            professionalOrderApproved: false,
            consentObtained: false
          }
        });
        setComplianceResult(null);

        // Reload posts
        loadPublishedPosts();

        alert('Post published successfully to selected platforms!');
      } else {
        alert(`Publication failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      alert(`Publication error: ${error}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!canPublish() || !draftPost.scheduledAt) return;

    try {
      const post: SocialMediaPost = {
        id: `scheduled-${Date.now()}`,
        content: draftPost.content,
        media: draftPost.media,
        scheduledAt: draftPost.scheduledAt,
        status: PostStatus.SCHEDULED,
        platforms: draftPost.platforms.map(platform => ({
          platform,
          accountId: 'default',
          settings: {},
          enabled: true
        })),
        compliance: {
          containsMedicalContent: draftPost.compliance.containsMedicalContent,
          containsPHI: false,
          quebecLaw25Compliant: true,
          professionalOrderApproved: draftPost.compliance.professionalOrderApproved,
          consentObtained: draftPost.compliance.consentObtained,
          reviewedBy: 'current_user',
          reviewedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await invoke<any>('schedule_social_media_post', { post });

      if (result.success) {
        // Reset draft
        setDraftPost({
          content: '',
          platforms: [],
          media: [],
          compliance: {
            containsMedicalContent: false,
            quebecLaw25Reviewed: false,
            professionalOrderApproved: false,
            consentObtained: false
          }
        });
        setComplianceResult(null);

        // Reload scheduled posts
        loadScheduledPosts();

        alert('Post scheduled successfully!');
      } else {
        alert(`Scheduling failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert(`Scheduling error: ${error}`);
    }
  };

  const getConnectedPlatforms = (): SupportedPlatform[] => {
    return connections
      .filter(conn => conn.enabled)
      .map(conn => conn.platform);
  };

  const formatPostDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED:
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Published
          </Badge>
        );
      case PostStatus.SCHEDULED:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case PostStatus.FAILED:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Social Media Management
          </h1>
          <p className="text-gray-600 mt-1">Quebec Law 25 compliant social media posting</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled ({scheduledPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Published ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Post Composition */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compose Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your social media post content here..."
                      value={draftPost.content}
                      onChange={(e) => setDraftPost(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {draftPost.content.length} characters
                    </div>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <Label className="text-base font-medium">Target Platforms</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {getConnectedPlatforms().map(platform => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={draftPost.platforms.includes(platform)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDraftPost(prev => ({
                                  ...prev,
                                  platforms: [...prev.platforms, platform]
                                }));
                              } else {
                                setDraftPost(prev => ({
                                  ...prev,
                                  platforms: prev.platforms.filter(p => p !== platform)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={platform} className="capitalize cursor-pointer">
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {getConnectedPlatforms().length === 0 && (
                      <div className="text-sm text-gray-500 mt-2">
                        No platforms connected. Go to Settings to connect social media accounts.
                      </div>
                    )}
                  </div>

                  {/* Scheduling */}
                  <div>
                    <Label htmlFor="schedule">Schedule for later (optional)</Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={draftPost.scheduledAt ?
                        new Date(draftPost.scheduledAt.getTime() - draftPost.scheduledAt.getTimezoneOffset() * 60000)
                          .toISOString().slice(0, 16) : ''
                      }
                      onChange={(e) => setDraftPost(prev => ({
                        ...prev,
                        scheduledAt: e.target.value ? new Date(e.target.value) : undefined
                      }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Compliance Checkboxes */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="text-sm font-medium">Quebec Law 25 Compliance</div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="medical-content"
                        checked={draftPost.compliance.containsMedicalContent}
                        onCheckedChange={(checked) => setDraftPost(prev => ({
                          ...prev,
                          compliance: { ...prev.compliance, containsMedicalContent: !!checked }
                        }))}
                      />
                      <Label htmlFor="medical-content" className="text-sm cursor-pointer">
                        This content contains medical or health-related information
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="law25-reviewed"
                        checked={draftPost.compliance.quebecLaw25Reviewed}
                        onCheckedChange={(checked) => setDraftPost(prev => ({
                          ...prev,
                          compliance: { ...prev.compliance, quebecLaw25Reviewed: !!checked }
                        }))}
                      />
                      <Label htmlFor="law25-reviewed" className="text-sm cursor-pointer">
                        Content has been reviewed for Quebec Law 25 compliance
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consent-obtained"
                        checked={draftPost.compliance.consentObtained}
                        onCheckedChange={(checked) => setDraftPost(prev => ({
                          ...prev,
                          compliance: { ...prev.compliance, consentObtained: !!checked }
                        }))}
                      />
                      <Label htmlFor="consent-obtained" className="text-sm cursor-pointer">
                        Necessary consents have been obtained for sharing this content
                      </Label>
                    </div>

                    {draftPost.compliance.containsMedicalContent && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="professional-approved"
                          checked={draftPost.compliance.professionalOrderApproved}
                          onCheckedChange={(checked) => setDraftPost(prev => ({
                            ...prev,
                            compliance: { ...prev.compliance, professionalOrderApproved: !!checked }
                          }))}
                        />
                        <Label htmlFor="professional-approved" className="text-sm cursor-pointer">
                          Content meets professional order guidelines (OPQ, OIIQ, CMQ)
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handlePublish}
                      disabled={!canPublish() || isPublishing}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isPublishing ? 'Publishing...' : 'Publish Now'}
                    </Button>

                    {draftPost.scheduledAt && (
                      <Button
                        variant="outline"
                        onClick={handleSchedule}
                        disabled={!canPublish()}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Schedule Post
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Checker */}
            <div>
              <ComplianceChecker
                post={{
                  content: draftPost.content,
                  media: draftPost.media,
                  scheduledAt: draftPost.scheduledAt,
                  platforms: draftPost.platforms.map(platform => ({
                    platform,
                    accountId: '',
                    settings: {},
                    enabled: true
                  })),
                  compliance: {
                    ...draftPost.compliance,
                    containsPHI: draftPost.compliance.containsMedicalContent,
                    quebecLaw25Compliant: draftPost.compliance.quebecLaw25Reviewed
                  }
                }}
                platforms={draftPost.platforms}
                onComplianceChange={handleComplianceChange}
              />
            </div>
          </div>
        </TabsContent>

        {/* Scheduled Posts Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-600">No scheduled posts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(post.status)}
                            <span className="text-sm text-gray-600">
                              Scheduled for {formatPostDate(post.scheduledAt!)}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform.platform} variant="outline">
                                {platform.platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Published Posts Tab */}
        <TabsContent value="published" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Published Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {publishedPosts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-600">No published posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(post.status)}
                            <span className="text-sm text-gray-600">
                              Published {formatPostDate(post.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform.platform} variant="outline">
                                {platform.platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <OAuthConfigurationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaPage;