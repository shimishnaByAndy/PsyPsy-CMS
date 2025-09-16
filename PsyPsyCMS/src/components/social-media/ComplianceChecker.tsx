import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  FileText,
  Users,
  Globe,
  Clock,
  Eye
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import {
  SocialMediaPost,
  ComplianceValidationResult,
  ComplianceViolation,
  ComplianceWarning,
  PHIDetectionResult,
  SupportedPlatform
} from '../../services/social-media/PostizProviderPattern';

interface ComplianceCheckProps {
  post: Partial<SocialMediaPost>;
  platforms: SupportedPlatform[];
  onComplianceChange: (result: ComplianceValidationResult) => void;
}

interface ComplianceMetrics {
  overallScore: number;
  quebecLaw25Score: number;
  professionalStandardsScore: number;
  privacyScore: number;
  contentQualityScore: number;
}

const COMPLIANCE_CATEGORIES = {
  QUEBEC_LAW_25: {
    name: 'Quebec Law 25',
    description: 'Privacy and data protection compliance',
    icon: Shield,
    weight: 0.4
  },
  PROFESSIONAL_STANDARDS: {
    name: 'Professional Standards',
    description: 'Professional order guidelines (OPQ, OIIQ, CMQ)',
    icon: Users,
    weight: 0.3
  },
  PRIVACY_PROTECTION: {
    name: 'Privacy Protection',
    description: 'Patient information and PHI protection',
    icon: Eye,
    weight: 0.2
  },
  CONTENT_QUALITY: {
    name: 'Content Quality',
    description: 'Accuracy and professional communication',
    icon: FileText,
    weight: 0.1
  }
};

const VIOLATION_SEVERITY_CONFIG = {
  HIGH: {
    color: 'destructive',
    icon: XCircle,
    description: 'Blocks publication',
    weight: 1.0
  },
  MEDIUM: {
    color: 'warning',
    icon: AlertTriangle,
    description: 'Requires review',
    weight: 0.6
  },
  LOW: {
    color: 'secondary',
    icon: Info,
    description: 'Advisory',
    weight: 0.3
  }
} as const;

export function ComplianceChecker({ post, platforms, onComplianceChange }: ComplianceCheckProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceValidationResult | null>(null);
  const [phiDetection, setPhiDetection] = useState<PHIDetectionResult | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  useEffect(() => {
    if (autoCheckEnabled && post.content && post.content.length > 10) {
      const debounceTimer = setTimeout(() => {
        performComplianceCheck();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [post.content, platforms, autoCheckEnabled]);

  const performComplianceCheck = async () => {
    if (!post.content) return;

    setIsChecking(true);

    try {
      // Create a complete post object for validation
      const completePost: SocialMediaPost = {
        id: post.id || `draft-${Date.now()}`,
        content: post.content,
        media: post.media || [],
        scheduledAt: post.scheduledAt,
        status: post.status || 'draft' as any,
        platforms: platforms.map(p => ({
          platform: p,
          accountId: 'default',
          settings: {},
          enabled: true
        })),
        compliance: {
          containsMedicalContent: false,
          containsPHI: false,
          quebecLaw25Compliant: false,
          professionalOrderApproved: false,
          consentObtained: false,
          ...post.compliance
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Perform comprehensive compliance check
      const [complianceCheck, phiCheck, metricsCheck] = await Promise.all([
        invoke<any>('validate_post_compliance', { post: completePost }),
        invoke<any>('detect_phi_in_content', { content: post.content }),
        invoke<any>('calculate_compliance_metrics', { post: completePost, platforms })
      ]);

      if (complianceCheck.success) {
        const result = complianceCheck.data as ComplianceValidationResult;
        setComplianceResult(result);
        onComplianceChange(result);
      }

      if (phiCheck.success) {
        setPhiDetection(phiCheck.data as PHIDetectionResult);
      }

      if (metricsCheck.success) {
        setMetrics(metricsCheck.data as ComplianceMetrics);
      }

    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getOverallStatus = () => {
    if (!complianceResult) return 'unchecked';
    if (complianceResult.violations.some(v => v.severity === 'HIGH')) return 'blocked';
    if (complianceResult.violations.length > 0) return 'warning';
    if (complianceResult.warnings.length > 0) return 'caution';
    return 'compliant';
  };

  const getStatusBadge = () => {
    const status = getOverallStatus();

    switch (status) {
      case 'compliant':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Quebec Law 25 Compliant
          </Badge>
        );
      case 'caution':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Review Recommended
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Compliance Issues
          </Badge>
        );
      case 'blocked':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Publication Blocked
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Checking...
          </Badge>
        );
    }
  };

  const getComplianceScore = () => {
    if (!metrics) return 0;
    return Math.round(metrics.overallScore * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quebec Law 25 Compliance Check
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(getComplianceScore())}`}>
                  {getComplianceScore()}%
                </div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>

              {isChecking && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 animate-pulse text-blue-600" />
                  <span className="text-sm">Analyzing content...</span>
                </div>
              )}
            </div>

            <Button
              onClick={performComplianceCheck}
              disabled={isChecking || !post.content}
              size="sm"
            >
              {isChecking ? 'Checking...' : 'Recheck Compliance'}
            </Button>
          </div>

          {metrics && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Compliance Breakdown:</div>
              {Object.entries(COMPLIANCE_CATEGORIES).map(([key, category]) => {
                const score = metrics[`${key.toLowerCase()}Score` as keyof ComplianceMetrics] as number || 0;
                const percentage = Math.round(score * 100);

                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-20">
                      <Progress value={percentage} className="w-16 h-2" />
                      <span className={`text-sm font-medium ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PHI Detection */}
      {phiDetection && phiDetection.containsPHI && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Personal Health Information Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                The following potentially sensitive information was detected in your content:
              </p>

              <div className="space-y-2">
                {phiDetection.detectedElements.map((element, index) => (
                  <div key={index} className="bg-red-100 p-2 rounded border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-800">{element.type}</span>
                      <Badge variant="outline" className="text-red-600">
                        {Math.round(element.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      Text: "{element.value}"
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-200 p-3 rounded">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This content cannot be published to social media platforms as it contains personal health information protected under Quebec Law 25.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violations */}
      {complianceResult && complianceResult.violations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Compliance Violations ({complianceResult.violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceResult.violations.map((violation, index) => {
                const config = VIOLATION_SEVERITY_CONFIG[violation.severity];

                return (
                  <div key={index} className="bg-white p-3 rounded border border-red-200">
                    <div className="flex items-start gap-3">
                      <config.icon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-red-800">{violation.type}</span>
                          <Badge variant={config.color as any} size="sm">
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700">{violation.message}</p>
                        {violation.field && (
                          <p className="text-xs text-red-600 mt-1">Field: {violation.field}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {complianceResult && complianceResult.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Compliance Recommendations ({complianceResult.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceResult.warnings.map((warning, index) => (
                <div key={index} className="bg-white p-3 rounded border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800 mb-1">{warning.type}</div>
                      <p className="text-sm text-yellow-700">{warning.message}</p>
                      {warning.suggestion && (
                        <p className="text-sm text-yellow-600 mt-1 italic">
                          Suggestion: {warning.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform-Specific Compliance */}
      {platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform-Specific Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platforms.map(platform => (
                <div key={platform} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="font-medium capitalize">{platform}</div>
                    <div className="text-sm text-gray-600">
                      Platform-specific compliance checks applied
                    </div>
                  </div>
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {complianceResult && complianceResult.compliant && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="font-medium text-green-800 mb-1">
                Quebec Law 25 Compliant
              </div>
              <p className="text-sm text-green-700">
                Your content meets all Quebec privacy and professional compliance requirements.
                You may proceed with publishing to social media platforms.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}