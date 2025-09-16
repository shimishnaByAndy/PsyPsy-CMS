/**
 * Facebook Provider Implementation for PsyPsy CMS
 * Based on Postiz Facebook provider with Quebec Law 25 compliance
 */

import {
  BaseProvider,
  SupportedPlatform,
  OAuthCredentials,
  AuthResult,
  SocialMediaPost,
  PublishResult,
  ScheduleResult,
  MediaAttachment,
  ValidationResult,
  ProfileInfo,
  AccountInfo,
  ComplianceValidationResult
} from '../PostizProviderPattern';

export class FacebookProvider extends BaseProvider {
  platform = SupportedPlatform.FACEBOOK;
  name = 'Facebook';
  description = 'Share posts and media to Facebook pages and profiles with Quebec Law 25 compliance';

  private readonly API_BASE = 'https://graph.facebook.com/v18.0';
  private pageAccessToken?: string;
  private pageId?: string;

  async authenticate(credentials: OAuthCredentials): Promise<AuthResult> {
    try {
      // Step 1: Get user access token using OAuth
      const userTokenResponse = await this.getUserAccessToken(credentials);
      if (!userTokenResponse.success) {
        return userTokenResponse;
      }

      // Step 2: Get page access token for publishing
      const pageTokenResponse = await this.getPageAccessToken(userTokenResponse.accessToken!);
      if (!pageTokenResponse.success) {
        return pageTokenResponse;
      }

      this.accessToken = userTokenResponse.accessToken;
      this.pageAccessToken = pageTokenResponse.accessToken;
      this.refreshTokenValue = userTokenResponse.refreshToken;

      return {
        success: true,
        accessToken: userTokenResponse.accessToken,
        refreshToken: userTokenResponse.refreshToken,
        expiresAt: userTokenResponse.expiresAt
      };
    } catch (error) {
      return {
        success: false,
        error: `Facebook authentication failed: ${error}`
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_BASE}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.FACEBOOK_CLIENT_ID || '',
          client_secret: process.env.FACEBOOK_CLIENT_SECRET || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Token refresh failed'
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + (data.expires_in * 1000))
      };
    } catch (error) {
      return {
        success: false,
        error: `Token refresh failed: ${error}`
      };
    }
  }

  async disconnect(): Promise<void> {
    // Revoke access token
    if (this.accessToken) {
      try {
        await fetch(`${this.API_BASE}/me/permissions`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error revoking Facebook token:', error);
      }
    }

    this.accessToken = undefined;
    this.pageAccessToken = undefined;
    this.refreshTokenValue = undefined;
    this.pageId = undefined;
  }

  async createPost(post: SocialMediaPost): Promise<PublishResult> {
    // Quebec Law 25 compliance check
    const complianceResult = await this.validateCompliance(post);
    if (!complianceResult.compliant) {
      return {
        success: false,
        error: 'Post failed Quebec Law 25 compliance check',
        complianceWarnings: complianceResult.violations.map(v => v.message)
      };
    }

    try {
      if (!this.pageAccessToken || !this.pageId) {
        return {
          success: false,
          error: 'Facebook page not connected'
        };
      }

      const postData: any = {
        message: post.content,
        access_token: this.pageAccessToken
      };

      // Add media if present
      if (post.media && post.media.length > 0) {
        const mediaIds = await this.uploadMultipleMedia(post.media);
        if (mediaIds.length > 0) {
          postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
        }
      }

      const response = await fetch(`${this.API_BASE}/${this.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to create Facebook post'
        };
      }

      return {
        success: true,
        postId: data.id,
        url: `https://facebook.com/${data.id}`,
        complianceWarnings: complianceResult.warnings.map(w => w.message)
      };
    } catch (error) {
      return {
        success: false,
        error: `Facebook post creation failed: ${error}`
      };
    }
  }

  async schedulePost(post: SocialMediaPost): Promise<ScheduleResult> {
    if (!post.scheduledAt) {
      return {
        success: false,
        error: 'Scheduled time not provided'
      };
    }

    // Quebec Law 25 compliance check
    const complianceResult = await this.validateCompliance(post);
    if (!complianceResult.compliant) {
      return {
        success: false,
        error: 'Post failed Quebec Law 25 compliance check'
      };
    }

    try {
      if (!this.pageAccessToken || !this.pageId) {
        return {
          success: false,
          error: 'Facebook page not connected'
        };
      }

      const scheduledTime = Math.floor(post.scheduledAt.getTime() / 1000);

      const postData: any = {
        message: post.content,
        scheduled_publish_time: scheduledTime,
        published: false,
        access_token: this.pageAccessToken
      };

      // Add media if present
      if (post.media && post.media.length > 0) {
        const mediaIds = await this.uploadMultipleMedia(post.media);
        if (mediaIds.length > 0) {
          postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
        }
      }

      const response = await fetch(`${this.API_BASE}/${this.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to schedule Facebook post'
        };
      }

      return {
        success: true,
        scheduleId: data.id,
        scheduledAt: post.scheduledAt
      };
    } catch (error) {
      return {
        success: false,
        error: `Facebook post scheduling failed: ${error}`
      };
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      if (!this.pageAccessToken) {
        return false;
      }

      const response = await fetch(`${this.API_BASE}/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.pageAccessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting Facebook post:', error);
      return false;
    }
  }

  async uploadMedia(media: MediaAttachment): Promise<string> {
    try {
      if (!this.pageAccessToken || !this.pageId) {
        throw new Error('Facebook page not connected');
      }

      // Validate media for compliance
      const validation = await this.validateMedia(media);
      if (!validation.valid) {
        throw new Error(`Media validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for PHI in media metadata
      if (media.compliance.containsPHI) {
        throw new Error('Media contains PHI and cannot be uploaded to social media');
      }

      const formData = new FormData();
      formData.append('source', await this.fetchMediaBlob(media.url));
      formData.append('access_token', this.pageAccessToken);

      if (media.altText) {
        formData.append('alt_text', media.altText);
      }

      const response = await fetch(`${this.API_BASE}/${this.pageId}/photos`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Media upload failed');
      }

      return data.id;
    } catch (error) {
      throw new Error(`Facebook media upload failed: ${error}`);
    }
  }

  async validateMedia(media: MediaAttachment): Promise<ValidationResult> {
    const baseValidation = await this.validateMediaFile(media);

    // Facebook-specific validation
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Facebook file size limits
    if (media.type === 'image' && media.size > 4 * 1024 * 1024) {
      errors.push('Facebook images must be under 4MB');
    }

    if (media.type === 'video' && media.size > 100 * 1024 * 1024) {
      errors.push('Facebook videos must be under 100MB');
    }

    // Facebook file type restrictions
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];

    if (media.type === 'image' && !allowedImageTypes.includes(media.mimeType)) {
      errors.push(`Facebook doesn't support ${media.mimeType} images`);
    }

    if (media.type === 'video' && !allowedVideoTypes.includes(media.mimeType)) {
      errors.push(`Facebook doesn't support ${media.mimeType} videos`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async getProfile(): Promise<ProfileInfo> {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.API_BASE}/me?fields=id,name,picture`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get profile');
      }

      return {
        id: data.id,
        username: data.id,
        displayName: data.name,
        profilePicture: data.picture?.data?.url
      };
    } catch (error) {
      throw new Error(`Failed to get Facebook profile: ${error}`);
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    try {
      if (!this.pageAccessToken || !this.pageId) {
        throw new Error('Page not connected');
      }

      const response = await fetch(`${this.API_BASE}/${this.pageId}?fields=id,name,category,fan_count`, {
        headers: {
          'Authorization': `Bearer ${this.pageAccessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get account info');
      }

      return {
        id: data.id,
        name: data.name,
        type: 'business',
        permissions: ['publish_posts', 'manage_pages'],
        limits: {
          postsPerDay: 100,
          maxMediaSize: 100 * 1024 * 1024,
          maxVideoLength: 240 * 60 // 4 hours in seconds
        }
      };
    } catch (error) {
      throw new Error(`Failed to get Facebook account info: ${error}`);
    }
  }

  // Quebec Law 25 enhanced compliance validation
  async validateCompliance(post: SocialMediaPost): Promise<ComplianceValidationResult> {
    const baseCompliance = await super.validateCompliance(post);

    // Facebook-specific compliance checks
    const violations = [...baseCompliance.violations];
    const warnings = [...baseCompliance.warnings];

    // Check for medical advertising compliance (Facebook has strict health advertising policies)
    if (post.compliance.containsMedicalContent) {
      warnings.push({
        type: 'PROFESSIONAL_GUIDELINES',
        message: 'Facebook has strict policies for medical content',
        suggestion: 'Ensure content complies with Facebook health advertising policies'
      });
    }

    // Check content for Quebec French requirements
    if (!/[àâäéèêëïîôöùûüÿç]/i.test(post.content) && post.content.length > 50) {
      warnings.push({
        type: 'PROFESSIONAL_GUIDELINES',
        message: 'Consider including French content for Quebec audience',
        suggestion: 'Quebec Law 25 encourages French language content'
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      requiresReview: violations.length > 0 || warnings.length > 0
    };
  }

  // Private helper methods
  private async getUserAccessToken(credentials: OAuthCredentials): Promise<AuthResult> {
    // In a real implementation, this would handle the OAuth flow
    // For demo purposes, return mock success
    return {
      success: false,
      error: 'OAuth flow not implemented in demo - would open Facebook OAuth'
    };
  }

  private async getPageAccessToken(userToken: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_BASE}/me/accounts`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to get page token'
        };
      }

      // Use the first page (in real implementation, let user choose)
      if (data.data && data.data.length > 0) {
        const page = data.data[0];
        this.pageId = page.id;
        return {
          success: true,
          accessToken: page.access_token
        };
      }

      return {
        success: false,
        error: 'No Facebook pages found'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get page token: ${error}`
      };
    }
  }

  private async uploadMultipleMedia(mediaList: MediaAttachment[]): Promise<string[]> {
    const mediaIds: string[] = [];

    for (const media of mediaList) {
      try {
        const mediaId = await this.uploadMedia(media);
        mediaIds.push(mediaId);
      } catch (error) {
        console.error('Error uploading media to Facebook:', error);
      }
    }

    return mediaIds;
  }

  private async fetchMediaBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }
    return response.blob();
  }
}