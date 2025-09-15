/**
 * Quebec Law 25 Consent Management Component
 * Provides granular consent management interface for healthcare data
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Eye,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

import {
  DataType,
  ConsentRecord,
  law25Compliance,
  Law25ComplianceManager
} from '@/compliance/quebec-law25';

interface ConsentManagerProps {
  userId: string;
  existingConsents?: ConsentRecord[];
  onConsentUpdate?: (consents: ConsentRecord[]) => void;
  mode?: 'initial' | 'management' | 'withdrawal';
  className?: string;
}

interface DataTypeConfig {
  type: DataType;
  title: string;
  description: string;
  required: boolean;
  sensitive: boolean;
  purposes: string[];
  icon: React.ReactNode;
  quebecSpecific?: boolean;
}

const dataTypeConfigs: DataTypeConfig[] = [
  {
    type: DataType.PERSONAL_IDENTIFIERS,
    title: "Informations personnelles",
    description: "Nom, adresse, date de naissance, numéro de téléphone",
    required: true,
    sensitive: false,
    purposes: ["Identification du patient", "Communication", "Facturation"],
    icon: <Eye className="h-4 w-4" />,
  },
  {
    type: DataType.RAMQ_INFORMATION,
    title: "Informations RAMQ",
    description: "Numéro d'assurance maladie du Québec",
    required: false,
    sensitive: true,
    purposes: ["Facturation RAMQ", "Vérification d'assurance"],
    icon: <Shield className="h-4 w-4" />,
    quebecSpecific: true,
  },
  {
    type: DataType.MEDICAL_INFORMATION,
    title: "Informations médicales",
    description: "Historique médical, diagnostics, traitements",
    required: true,
    sensitive: true,
    purposes: ["Soins de santé", "Suivi médical", "Urgences médicales"],
    icon: <Lock className="h-4 w-4" />,
  },
  {
    type: DataType.SESSION_NOTES,
    title: "Notes de session",
    description: "Notes cliniques, observations, plans de traitement",
    required: true,
    sensitive: true,
    purposes: ["Documentation clinique", "Continuité des soins", "Supervision"],
    icon: <Lock className="h-4 w-4" />,
  },
  {
    type: DataType.APPOINTMENT_DATA,
    title: "Données de rendez-vous",
    description: "Horaires, fréquence, historique des rendez-vous",
    required: true,
    sensitive: false,
    purposes: ["Planification", "Rappels", "Statistiques"],
    icon: <Clock className="h-4 w-4" />,
  },
  {
    type: DataType.CONTACT_INFORMATION,
    title: "Informations de contact",
    description: "Adresse courriel, numéros de téléphone d'urgence",
    required: false,
    sensitive: false,
    purposes: ["Communication", "Urgences", "Rappels"],
    icon: <Globe className="h-4 w-4" />,
  },
  {
    type: DataType.INSURANCE_INFO,
    title: "Informations d'assurance",
    description: "Assurance privée, couverture, autorisations",
    required: false,
    sensitive: true,
    purposes: ["Facturation", "Vérification de couverture"],
    icon: <Shield className="h-4 w-4" />,
  },
  {
    type: DataType.EMERGENCY_CONTACTS,
    title: "Contacts d'urgence",
    description: "Personnes à contacter en cas d'urgence",
    required: false,
    sensitive: false,
    purposes: ["Urgences médicales", "Sécurité du patient"],
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

export function ConsentManager({
  userId,
  existingConsents = [],
  onConsentUpdate,
  mode = 'initial',
  className = ""
}: ConsentManagerProps) {

  const [consents, setConsents] = useState<Record<DataType, boolean>>({} as Record<DataType, boolean>);
  const [purposes, setPurposes] = useState<Record<DataType, string[]>>({} as Record<DataType, string[]>);
  const [crossBorderConsent, setCrossBorderConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentConsents, setCurrentConsents] = useState<ConsentRecord[]>(existingConsents);

  useEffect(() => {
    // Initialize consents from existing records
    if (existingConsents.length > 0) {
      const latestConsent = existingConsents
        .sort((a, b) => b.consentDate.getTime() - a.consentDate.getTime())[0];

      setConsents(latestConsent.granularConsent);
      setCrossBorderConsent(latestConsent.crossBorderTransfer);
    } else {
      // Set required consents to true by default for initial setup
      const initialConsents = {} as Record<DataType, boolean>;
      dataTypeConfigs.forEach(config => {
        initialConsents[config.type] = config.required;
      });
      setConsents(initialConsents);
    }
  }, [existingConsents]);

  const handleConsentChange = (dataType: DataType, granted: boolean) => {
    setConsents(prev => ({
      ...prev,
      [dataType]: granted
    }));
  };

  const handlePurposeChange = (dataType: DataType, purpose: string, granted: boolean) => {
    setPurposes(prev => {
      const currentPurposes = prev[dataType] || [];
      if (granted) {
        return {
          ...prev,
          [dataType]: [...currentPurposes, purpose]
        };
      } else {
        return {
          ...prev,
          [dataType]: currentPurposes.filter(p => p !== purpose)
        };
      }
    });
  };

  const handleSubmitConsents = async () => {
    setIsSubmitting(true);

    try {
      // Collect all purposes for granted consents
      const allPurposes: string[] = [];
      Object.entries(consents).forEach(([dataType, granted]) => {
        if (granted) {
          const config = dataTypeConfigs.find(c => c.type === dataType as DataType);
          if (config) {
            allPurposes.push(...config.purposes);
          }
        }
      });

      // Record consent with Law 25 compliance
      const consentRecord = await law25Compliance.recordConsent(
        userId,
        Object.keys(consents).filter(dt => consents[dt as DataType]) as DataType[],
        [...new Set(allPurposes)], // Remove duplicates
        consents
      );

      // Update state
      const updatedConsents = [...currentConsents, consentRecord];
      setCurrentConsents(updatedConsents);
      onConsentUpdate?.(updatedConsents);

    } catch (error) {
      console.error('Failed to record consent:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawConsent = async (dataType: DataType) => {
    // Implementation for consent withdrawal
    const updatedConsents = { ...consents };
    updatedConsents[dataType] = false;
    setConsents(updatedConsents);
  };

  const requiredConsentsGranted = dataTypeConfigs
    .filter(config => config.required)
    .every(config => consents[config.type]);

  const sensitiveDataConsented = dataTypeConfigs
    .filter(config => config.sensitive && consents[config.type])
    .length;

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Gestion des consentements - Loi 25 du Québec
          </CardTitle>
          <CardDescription>
            Contrôlez l'utilisation de vos données personnelles selon la Loi 25 sur la protection
            des renseignements personnels dans le secteur privé du Québec.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Selon la Loi 25, vous avez le droit de consentir à l'utilisation de vos données,
          de retirer votre consentement, d'accéder à vos données et de les faire corriger ou supprimer.
          Les données marquées comme "requises" sont nécessaires pour la prestation des soins de santé.
        </AlertDescription>
      </Alert>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé des consentements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(consents).filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Consentements accordés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sensitiveDataConsented}
              </div>
              <div className="text-sm text-gray-600">Données sensibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(consents).filter(granted => !granted).length}
              </div>
              <div className="text-sm text-gray-600">Consentements refusés</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${requiredConsentsGranted ? 'text-green-600' : 'text-red-600'}`}>
                {requiredConsentsGranted ? <CheckCircle className="h-8 w-8 mx-auto" /> : <XCircle className="h-8 w-8 mx-auto" />}
              </div>
              <div className="text-sm text-gray-600">Statut requis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Types Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Types de données personnelles</CardTitle>
          <CardDescription>
            Sélectionnez les types de données pour lesquels vous accordez votre consentement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {dataTypeConfigs.map((config) => (
                <div key={config.type} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{config.title}</h4>
                          {config.required && (
                            <Badge variant="secondary" className="text-xs">
                              Requis
                            </Badge>
                          )}
                          {config.sensitive && (
                            <Badge variant="destructive" className="text-xs">
                              Sensible
                            </Badge>
                          )}
                          {config.quebecSpecific && (
                            <Badge variant="outline" className="text-xs">
                              Spécifique QC
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {config.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          <strong>Finalités:</strong> {config.purposes.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={consents[config.type] || false}
                        onCheckedChange={(checked) => handleConsentChange(config.type, checked)}
                        disabled={config.required && mode === 'initial'}
                      />
                      <Label htmlFor={`consent-${config.type}`}>
                        {consents[config.type] ? 'Accordé' : 'Refusé'}
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cross-border Transfer Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Transferts transfrontaliers</CardTitle>
          <CardDescription>
            Consentement pour le transfert de données à l'extérieur du Québec/Canada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                Autoriser les transferts de données à l'extérieur du Canada
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Pour l'utilisation de services cloud ou d'outils d'analyse hébergés
                dans d'autres pays (ex: États-Unis, Europe).
              </p>
            </div>
            <Switch
              checked={crossBorderConsent}
              onCheckedChange={setCrossBorderConsent}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {mode === 'initial' && (
          <Button
            onClick={handleSubmitConsents}
            disabled={!requiredConsentsGranted || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les consentements'}
          </Button>
        )}

        {mode === 'management' && (
          <>
            <Button
              onClick={handleSubmitConsents}
              disabled={isSubmitting}
              variant="default"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
            <Button variant="outline">
              Télécharger mes données
            </Button>
            <Button variant="destructive">
              Retirer tous les consentements
            </Button>
          </>
        )}
      </div>

      {/* Legal Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Avis légal:</strong> Selon la Loi 25, vous pouvez retirer votre consentement
          en tout temps. Cependant, le retrait du consentement pour les données requises
          peut affecter notre capacité à vous fournir des soins de santé. Les données
          déjà traitées avant le retrait demeurent légalement collectées.
        </AlertDescription>
      </Alert>

    </div>
  );
}