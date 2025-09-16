/**
 * Postiz Provider Pattern Implementation for PsyPsy CMS
 * Based on Postiz architecture: https://github.com/gitroomhq/postiz-app
 *
 * This implements the provider pattern used by Postiz for social media integrations
 * while adding Quebec Law 25 compliance and healthcare-specific safeguards.
 */

export interface SocialMediaPost {
  id?: string;
  content: string;
  media?: MediaAttachment[];
  scheduledAt?: Date;
  status: PostStatus;
  platforms: PlatformConfig[];
  compliance: PostComplianceData;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  altText?: string;
  compliance: {
    containsPHI: boolean;
    complianceChecked: boolean;
    approvedForSharing: boolean;
  };
}

export interface PlatformConfig {
  platform: SupportedPlatform;
  accountId: string;
  settings: PlatformSpecificSettings;
  enabled: boolean;
}

export interface PostComplianceData {
  containsMedicalContent: boolean;
  containsPHI: boolean;
  quebecLaw25Compliant: boolean;
  professionalOrderApproved: boolean;
  consentObtained: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  complianceNotes?: string;
}

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  UNDER_REVIEW = 'under_review'
}

export enum SupportedPlatform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  THREADS = 'threads',
  MASTODON = 'mastodon'
}

export interface PlatformSpecificSettings {
  [key: string]: any;
}

// Provider Interface - based on Postiz architecture
export interface SocialMediaProvider {
  platform: SupportedPlatform;
  name: string;
  description: string;

  // Authentication
  authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  disconnect(): Promise<void>;

  // Content Operations
  createPost(post: SocialMediaPost): Promise<PublishResult>;
  schedulePost(post: SocialMediaPost): Promise<ScheduleResult>;
  deletePost(postId: string): Promise<boolean>;

  // Media Operations
  uploadMedia(media: MediaAttachment): Promise<string>;
  validateMedia(media: MediaAttachment): Promise<ValidationResult>;

  // Account Operations
  getProfile(): Promise<ProfileInfo>;
  getAccountInfo(): Promise<AccountInfo>;

  // Compliance Operations (PsyPsy-specific)
  validateCompliance(post: SocialMediaPost): Promise<ComplianceValidationResult>;
  checkContentForPHI(content: string): Promise<PHIDetectionResult>;
}

// OAuth and Authentication Types
export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

// Publishing Types
export interface PublishResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  complianceWarnings?: string[];
}

export interface ScheduleResult {
  success: boolean;
  scheduleId?: string;
  scheduledAt?: Date;
  error?: string;
}

// Validation Types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

export interface ComplianceValidationResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  requiresReview: boolean;
}

export interface ComplianceViolation {
  type: 'PHI_DETECTED' | 'NO_CONSENT' | 'PROFESSIONAL_ORDER' | 'QUEBEC_LAW_25';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  field?: string;
}

export interface ComplianceWarning {
  type: 'MEDICAL_CONTENT' | 'SENSITIVE_TOPIC' | 'PROFESSIONAL_GUIDELINES';
  message: string;
  suggestion?: string;
}

export interface PHIDetectionResult {
  containsPHI: boolean;
  detectedElements: PHIElement[];
  confidence: number;
}

export interface PHIElement {
  type: 'NAME' | 'DATE' | 'PHONE' | 'EMAIL' | 'MEDICAL_ID' | 'ADDRESS';
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

// Profile and Account Types
export interface ProfileInfo {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  followerCount?: number;
  verified?: boolean;
}

export interface AccountInfo {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'professional';
  permissions: string[];
  limits: AccountLimits;
}

export interface AccountLimits {
  postsPerDay?: number;
  postsPerHour?: number;
  maxMediaSize?: number;
  maxVideoLength?: number;
}

// Abstract Base Provider - implements common Postiz patterns
export abstract class BaseProvider implements SocialMediaProvider {
  abstract platform: SupportedPlatform;
  abstract name: string;
  abstract description: string;

  protected credentials?: OAuthCredentials;
  protected accessToken?: string;
  protected refreshTokenValue?: string;

  // Abstract methods from interface
  abstract authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  abstract refreshToken(refreshToken: string): Promise<AuthResult>;
  abstract disconnect(): Promise<void>;
  abstract createPost(post: SocialMediaPost): Promise<PublishResult>;
  abstract schedulePost(post: SocialMediaPost): Promise<ScheduleResult>;
  abstract deletePost(postId: string): Promise<boolean>;
  abstract uploadMedia(media: MediaAttachment): Promise<string>;
  abstract validateMedia(media: MediaAttachment): Promise<ValidationResult>;
  abstract getProfile(): Promise<ProfileInfo>;
  abstract getAccountInfo(): Promise<AccountInfo>;
  abstract checkContentForPHI(content: string): Promise<PHIDetectionResult>;

  // Quebec Law 25 compliance checker
  protected async checkQuebecCompliance(post: SocialMediaPost): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Check for consent
    if (!post.compliance.consentObtained) {
      violations.push({
        type: 'NO_CONSENT',
        severity: 'HIGH',
        message: 'Quebec Law 25 requires explicit consent for sharing personal information'
      });
    }

    // Check for PHI
    if (post.compliance.containsPHI) {
      violations.push({
        type: 'PHI_DETECTED',
        severity: 'HIGH',
        message: 'Personal Health Information detected - cannot be shared on social media'
      });
    }

    // Check professional order approval for medical content
    if (post.compliance.containsMedicalContent && !post.compliance.professionalOrderApproved) {
      warnings.push({
        type: 'PROFESSIONAL_GUIDELINES',
        message: 'Medical content should be reviewed by professional order guidelines',
        suggestion: 'Consider reviewing with OPQ, OIIQ, or CMQ guidelines'
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      requiresReview: violations.length > 0 || warnings.length > 0
    };
  }

  // PHI detection using basic patterns (would integrate with DLP API in production)
  async checkContentForPHI(content: string): Promise<PHIDetectionResult> {
    const phiElements: PHIElement[] = [];

    // Basic PHI patterns (simplified for demo)
    const patterns = [
      { type: 'PHONE' as const, regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g },
      { type: 'EMAIL' as const, regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
      { type: 'MEDICAL_ID' as const, regex: /\b(RAMQ|Medicare|Health Card)[\s#:]*\d+/gi },
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        phiElements.push({
          type: pattern.type,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.8
        });
      }
    }

    return {
      containsPHI: phiElements.length > 0,
      detectedElements: phiElements,
      confidence: phiElements.length > 0 ? 0.8 : 0.1
    };
  }

  // Common OAuth implementation
  protected async handleOAuthFlow(authUrl: string): Promise<AuthResult> {
    // In a real implementation, this would open a browser window or webview
    // For now, return a mock result
    return {
      success: false,
      error: 'OAuth flow not implemented in demo'
    };
  }

  // Common media validation
  protected async validateMediaFile(media: MediaAttachment): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size (10MB limit)
    if (media.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
    if (!allowedTypes.includes(media.mimeType)) {
      errors.push(`File type ${media.mimeType} not supported`);
    }

    // Check for PHI in filename
    if (/patient|client|medical|diagnosis/i.test(media.filename)) {
      warnings.push('Filename may contain medical references');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Abstract methods that must be implemented by specific providers
  abstract authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  abstract refreshToken(refreshToken: string): Promise<AuthResult>;
  abstract disconnect(): Promise<void>;
  abstract createPost(post: SocialMediaPost): Promise<PublishResult>;
  abstract schedulePost(post: SocialMediaPost): Promise<ScheduleResult>;
  abstract deletePost(postId: string): Promise<boolean>;
  abstract uploadMedia(media: MediaAttachment): Promise<string>;
  abstract validateMedia(media: MediaAttachment): Promise<ValidationResult>;
  abstract getProfile(): Promise<ProfileInfo>;
  abstract getAccountInfo(): Promise<AccountInfo>;

  // Default compliance validation implementation
  async validateCompliance(post: SocialMediaPost): Promise<ComplianceValidationResult> {
    return this.checkQuebecCompliance(post);
  }
}

// Provider Factory - based on Postiz factory pattern
export class ProviderFactory {
  private static providers = new Map<SupportedPlatform, () => SocialMediaProvider>();

  static register(platform: SupportedPlatform, factory: () => SocialMediaProvider) {
    this.providers.set(platform, factory);
  }

  static create(platform: SupportedPlatform): SocialMediaProvider {
    const factory = this.providers.get(platform);
    if (!factory) {
      throw new Error(`Provider for platform ${platform} not registered`);
    }
    return factory();
  }

  static getSupportedPlatforms(): SupportedPlatform[] {
    return Array.from(this.providers.keys());
  }
}

// Provider Registry - manages all providers
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<SupportedPlatform, SocialMediaProvider> = new Map();

  static getInstance(): ProviderRegistry {
    if (!this.instance) {
      this.instance = new ProviderRegistry();
    }
    return this.instance;
  }

  registerProvider(provider: SocialMediaProvider): void {
    this.providers.set(provider.platform, provider);
  }

  getProvider(platform: SupportedPlatform): SocialMediaProvider | undefined {
    return this.providers.get(platform);
  }

  getAllProviders(): SocialMediaProvider[] {
    return Array.from(this.providers.values());
  }

  getConnectedProviders(): SocialMediaProvider[] {
    // In a real implementation, this would check authentication status
    return this.getAllProviders();
  }
}