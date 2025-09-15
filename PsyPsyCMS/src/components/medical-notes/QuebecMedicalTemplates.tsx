/**
 * Quebec-Specific Medical Note Templates
 *
 * Templates compliant with Quebec medical standards:
 * - RAMQ (Régie de l'assurance maladie du Québec)
 * - CNESST (Commission des normes, de l'équité, de la santé et de la sécurité du travail)
 * - Professional Orders (OPQ, OIIQ, OPPQ, etc.)
 * - Quebec Law 25 privacy requirements
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Shield,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Stethoscope,
  Heart,
  Brain,
  Eye
} from 'lucide-react';

export interface QuebecMedicalTemplate {
  id: string;
  name: string;
  nameEnglish: string;
  description: string;
  category: TemplateCategory;
  organization: QuebecOrganization;
  structure: string;
  requiredFields: string[];
  optionalFields: string[];
  complianceNotes: string[];
  ramqCodes?: string[];
  cnesstCompatible?: boolean;
  professionalOrderCompatible?: ProfessionalOrder[];
  icon: React.ReactNode;
}

export enum TemplateCategory {
  PROGRESS_NOTE = "progress_note",
  ASSESSMENT = "assessment",
  TREATMENT_PLAN = "treatment_plan",
  DISCHARGE_SUMMARY = "discharge_summary",
  WORK_INJURY = "work_injury",
  INSURANCE_REPORT = "insurance_report",
  PSYCHIATRIC_EVALUATION = "psychiatric_evaluation",
  PSYCHOLOGICAL_ASSESSMENT = "psychological_assessment"
}

export enum QuebecOrganization {
  RAMQ = "ramq", // Régie de l'assurance maladie du Québec
  CNESST = "cnesst", // Commission des normes, de l'équité, de la santé et de la sécurité du travail
  SAAQ = "saaq", // Société de l'assurance automobile du Québec
  MSSS = "msss", // Ministère de la Santé et des Services sociaux
  GENERAL = "general"
}

export enum ProfessionalOrder {
  OPQ = "opq", // Ordre des psychologues du Québec
  OIIQ = "oiiq", // Ordre des infirmières et infirmiers du Québec
  OPPQ = "oppq", // Ordre des psychoéducateurs et psychoéducatrices du Québec
  OTPQ = "otpq", // Ordre des travailleurs sociaux et des thérapeutes conjugaux et familiaux du Québec
  CMQ = "cmq", // Collège des médecins du Québec
  OEQ = "oeq", // Ordre des ergothérapeutes du Québec
}

export const quebecMedicalTemplates: QuebecMedicalTemplate[] = [
  {
    id: "ramq_progress_note",
    name: "Note d'évolution RAMQ",
    nameEnglish: "RAMQ Progress Note",
    description: "Note d'évolution conforme aux exigences de facturation RAMQ",
    category: TemplateCategory.PROGRESS_NOTE,
    organization: QuebecOrganization.RAMQ,
    structure: `## Note d'évolution - {{date}}

### Informations du dossier
- Numéro de dossier: {{dossier_number}}
- Code d'acte RAMQ: {{ramq_code}}
- Date de la visite: {{visit_date}}
- Durée de la consultation: {{duration}} minutes

### Motif de consultation
{{chief_complaint}}

### Histoire de la maladie actuelle
{{history_present_illness}}

### Observations cliniques
**Examen subjectif:**
{{subjective_findings}}

**Examen objectif:**
{{objective_findings}}

### Évaluation clinique
{{clinical_assessment}}

### Plan d'intervention
{{treatment_plan}}

### Prochaine visite
- Date prévue: {{next_visit}}
- Objectifs: {{next_visit_goals}}

### Enseignement au patient
{{patient_education}}

---
**Signature électronique:** {{practitioner_name}}
**Numéro de permis:** {{license_number}}
**Date:** {{signature_date}}

*Conforme aux normes RAMQ - {{compliance_date}}*`,
    requiredFields: [
      "dossier_number", "ramq_code", "visit_date", "duration",
      "chief_complaint", "clinical_assessment", "treatment_plan",
      "practitioner_name", "license_number"
    ],
    optionalFields: [
      "history_present_illness", "subjective_findings", "objective_findings",
      "next_visit", "next_visit_goals", "patient_education"
    ],
    complianceNotes: [
      "Ne jamais inclure le numéro RAMQ du patient dans les notes",
      "Utiliser uniquement les codes d'actes RAMQ approuvés",
      "Documenter la durée exacte de la consultation",
      "Signature électronique obligatoire avec numéro de permis"
    ],
    ramqCodes: ["00403", "00404", "00405", "00406", "09922", "09923"],
    professionalOrderCompatible: [ProfessionalOrder.OPQ, ProfessionalOrder.CMQ],
    icon: <Shield className="h-4 w-4" />
  },

  {
    id: "cnesst_work_injury",
    name: "Rapport médical CNESST",
    nameEnglish: "CNESST Medical Report",
    description: "Rapport médical pour accident de travail ou maladie professionnelle",
    category: TemplateCategory.WORK_INJURY,
    organization: QuebecOrganization.CNESST,
    structure: `## Rapport médical - CNESST

### Informations de l'accident
- Date de l'accident: {{accident_date}}
- Numéro de réclamation CNESST: {{claim_number}}
- Employeur: {{employer_name}}
- Poste occupé: {{job_title}}

### Description de l'événement
{{accident_description}}

### Nature de la lésion
**Site anatomique:** {{injury_site}}
**Type de lésion:** {{injury_type}}
**Code CIM-10:** {{icd10_code}}

### Examen médical
**Date de l'examen:** {{exam_date}}
**Symptômes rapportés:** {{reported_symptoms}}
**Signes cliniques:** {{clinical_signs}}

### Limitations fonctionnelles
**Limitations actuelles:**
{{current_limitations}}

**Capacités préservées:**
{{preserved_capacities}}

### Diagnostic médical
**Diagnostic principal:** {{primary_diagnosis}}
**Diagnostics secondaires:** {{secondary_diagnoses}}

### Pronostic
**Durée prévisible d'incapacité:** {{disability_duration}}
**Séquelles permanentes probables:** {{permanent_sequelae}}

### Recommandations
**Soins requis:** {{required_care}}
**Suivi médical:** {{medical_followup}}

### Retour au travail
**Capacité de retour au travail:** {{return_to_work_capacity}}
**Adaptations requises:** {{work_adaptations}}
**Date prévue de retour:** {{return_date}}

---
**Médecin traitant:** {{physician_name}}
**Numéro de permis CMQ:** {{cmq_license}}
**Date du rapport:** {{report_date}}
**Signature:** {{signature}}

*Conforme aux exigences CNESST - Loi sur les accidents du travail et les maladies professionnelles*`,
    requiredFields: [
      "accident_date", "injury_site", "injury_type", "exam_date",
      "primary_diagnosis", "physician_name", "cmq_license", "report_date"
    ],
    optionalFields: [
      "claim_number", "employer_name", "job_title", "accident_description",
      "reported_symptoms", "clinical_signs", "secondary_diagnoses",
      "return_to_work_capacity", "work_adaptations", "return_date"
    ],
    complianceNotes: [
      "Utiliser les codes de diagnostic CIM-10 obligatoirement",
      "Décrire précisément les limitations fonctionnelles",
      "Documenter le lien causal entre l'accident et les lésions",
      "Signature du médecin traitant obligatoire"
    ],
    cnesstCompatible: true,
    professionalOrderCompatible: [ProfessionalOrder.CMQ],
    icon: <AlertTriangle className="h-4 w-4" />
  },

  {
    id: "opq_psychological_assessment",
    name: "Évaluation psychologique OPQ",
    nameEnglish: "OPQ Psychological Assessment",
    description: "Évaluation psychologique conforme aux normes de l'Ordre des psychologues du Québec",
    category: TemplateCategory.PSYCHOLOGICAL_ASSESSMENT,
    organization: QuebecOrganization.GENERAL,
    structure: `## Évaluation psychologique

### Informations générales
- Date de l'évaluation: {{assessment_date}}
- Psychologue: {{psychologist_name}}
- Numéro de permis OPQ: {{opq_license}}

### Motif de consultation
{{referral_reason}}

### Consentement éclairé
- [ ] Consentement à l'évaluation obtenu
- [ ] Limites de la confidentialité expliquées
- [ ] Droits selon la Loi 25 expliqués

### Histoire personnelle
**Histoire développementale:** {{developmental_history}}
**Histoire familiale:** {{family_history}}
**Histoire médicale:** {{medical_history}}
**Histoire psychologique:** {{psychological_history}}

### Observation clinique
**Présentation:** {{presentation}}
**Comportement:** {{behavior}}
**Humeur et affect:** {{mood_affect}}
**Processus de pensée:** {{thought_process}}

### Tests administrés
{{tests_administered}}

### Résultats
**Fonctionnement cognitif:** {{cognitive_functioning}}
**Fonctionnement émotionnel:** {{emotional_functioning}}
**Fonctionnement social:** {{social_functioning}}

### Diagnostic psychologique
**Axes selon le DSM-5-TR:**
- Troubles mentaux: {{mental_disorders}}
- Facteurs psychosociaux: {{psychosocial_factors}}
- Évaluation globale: {{global_assessment}}

### Recommandations
**Interventions recommandées:** {{recommended_interventions}}
**Suivi psychologique:** {{psychological_followup}}
**Références:** {{referrals}}

### Conclusion
{{conclusion}}

---
**Psychologue:** {{psychologist_name}}
**Titre professionnel:** {{professional_title}}
**Numéro OPQ:** {{opq_license}}
**Date:** {{signature_date}}

*Évaluation conforme au Code de déontologie des psychologues du Québec*
*Respecte les exigences de la Loi 25 sur la protection des renseignements personnels*`,
    requiredFields: [
      "assessment_date", "psychologist_name", "opq_license", "referral_reason",
      "presentation", "tests_administered", "recommended_interventions"
    ],
    optionalFields: [
      "developmental_history", "family_history", "medical_history",
      "psychological_history", "behavior", "mood_affect", "thought_process",
      "cognitive_functioning", "emotional_functioning", "social_functioning",
      "psychological_followup", "referrals", "conclusion"
    ],
    complianceNotes: [
      "Consentement éclairé obligatoire avant l'évaluation",
      "Respecter le code de déontologie de l'OPQ",
      "Utiliser la terminologie du DSM-5-TR",
      "Documenter les limites de la confidentialité"
    ],
    professionalOrderCompatible: [ProfessionalOrder.OPQ],
    icon: <Brain className="h-4 w-4" />
  },

  {
    id: "oiiq_nursing_note",
    name: "Note infirmière OIIQ",
    nameEnglish: "OIIQ Nursing Note",
    description: "Note de soins infirmiers conforme aux normes de l'OIIQ",
    category: TemplateCategory.PROGRESS_NOTE,
    organization: QuebecOrganization.GENERAL,
    structure: `## Note de soins infirmiers

### Identification
- Date et heure: {{datetime}}
- Infirmière: {{nurse_name}}
- Numéro OIIQ: {{oiiq_license}}
- Quart de travail: {{shift}}

### Évaluation infirmière
**État général:** {{general_condition}}
**Signes vitaux:** {{vital_signs}}
**Douleur (échelle 0-10):** {{pain_score}}
**Conscience/Orientation:** {{consciousness}}

### Observations
**Respiratoire:** {{respiratory}}
**Cardiovasculaire:** {{cardiovascular}}
**Neurologique:** {{neurological}}
**Gastro-intestinal:** {{gastrointestinal}}
**Génito-urinaire:** {{genitourinary}}
**Tégumentaire:** {{integumentary}}

### Interventions infirmières
{{nursing_interventions}}

### Médication administrée
{{medications_given}}

### Enseignement au patient/famille
{{patient_teaching}}

### Évaluation des résultats
{{outcome_evaluation}}

### Plan de soins
{{care_plan}}

### Transmission
{{communication}}

---
**Infirmière:** {{nurse_name}}
**Numéro OIIQ:** {{oiiq_license}}
**Signature:** {{signature}}
**Date/Heure:** {{signature_datetime}}

*Note conforme aux Normes de documentation de l'OIIQ*`,
    requiredFields: [
      "datetime", "nurse_name", "oiiq_license", "general_condition",
      "vital_signs", "nursing_interventions"
    ],
    optionalFields: [
      "shift", "pain_score", "consciousness", "respiratory", "cardiovascular",
      "neurological", "gastrointestinal", "genitourinary", "integumentary",
      "medications_given", "patient_teaching", "outcome_evaluation",
      "care_plan", "communication"
    ],
    complianceNotes: [
      "Documentation en temps réel obligatoire",
      "Signature avec numéro OIIQ requis",
      "Respecter les normes de documentation OIIQ",
      "Utiliser la terminologie infirmière standardisée"
    ],
    professionalOrderCompatible: [ProfessionalOrder.OIIQ],
    icon: <Heart className="h-4 w-4" />
  },

  {
    id: "saaq_medical_report",
    name: "Rapport médical SAAQ",
    nameEnglish: "SAAQ Medical Report",
    description: "Rapport médical pour la Société de l'assurance automobile du Québec",
    category: TemplateCategory.INSURANCE_REPORT,
    organization: QuebecOrganization.SAAQ,
    structure: `## Rapport médical - SAAQ

### Informations de l'accident
- Numéro de dossier SAAQ: {{saaq_file_number}}
- Date de l'accident: {{accident_date}}
- Type d'accident: {{accident_type}}

### Informations médicales
**Date de l'examen:** {{exam_date}}
**Médecin examinateur:** {{physician_name}}
**Spécialité:** {{specialty}}
**Numéro de permis:** {{license_number}}

### Lésions reliées à l'accident
{{accident_related_injuries}}

### Examen physique
**Système musculosquelettique:** {{musculoskeletal}}
**Système neurologique:** {{neurological_exam}}
**Autres systèmes:** {{other_systems}}

### Capacités fonctionnelles
**Mobilité:** {{mobility}}
**Autonomie:** {{autonomy}}
**Activités de la vie quotidienne:** {{daily_activities}}
**Capacité de travail:** {{work_capacity}}

### Diagnostic médical
**Diagnostic principal:** {{primary_diagnosis}}
**Diagnostics secondaires:** {{secondary_diagnoses}}
**Lien de causalité avec l'accident:** {{causality_link}}

### Pronostic
**Stabilisation médicale:** {{medical_stabilization}}
**Amélioration possible:** {{potential_improvement}}
**Séquelles permanentes:** {{permanent_sequelae}}

### Recommandations
**Traitements requis:** {{required_treatments}}
**Adaptations nécessaires:** {{necessary_adaptations}}
**Suivi médical:** {{medical_followup}}

---
**Médecin:** {{physician_name}}
**Spécialité:** {{specialty}}
**Numéro de permis:** {{license_number}}
**Date:** {{report_date}}
**Signature:** {{signature}}

*Rapport conforme aux exigences de la SAAQ*`,
    requiredFields: [
      "saaq_file_number", "accident_date", "exam_date", "physician_name",
      "license_number", "primary_diagnosis", "causality_link"
    ],
    optionalFields: [
      "accident_type", "specialty", "accident_related_injuries",
      "musculoskeletal", "neurological_exam", "other_systems",
      "mobility", "autonomy", "daily_activities", "work_capacity",
      "secondary_diagnoses", "medical_stabilization", "potential_improvement",
      "permanent_sequelae", "required_treatments", "necessary_adaptations"
    ],
    complianceNotes: [
      "Établir clairement le lien de causalité avec l'accident",
      "Documenter toutes les limitations fonctionnelles",
      "Utiliser les critères d'évaluation SAAQ",
      "Signature du médecin spécialiste si requis"
    ],
    professionalOrderCompatible: [ProfessionalOrder.CMQ],
    icon: <MapPin className="h-4 w-4" />
  }
];

interface QuebecTemplateEditorProps {
  template: QuebecMedicalTemplate;
  onSave: (templateData: any) => void;
  onCancel: () => void;
  initialData?: Record<string, string>;
}

export function QuebecTemplateEditor({
  template,
  onSave,
  onCancel,
  initialData = {}
}: QuebecTemplateEditorProps) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (value.trim()) {
      setCompletedFields(prev => new Set([...prev, fieldName]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const generateTemplate = () => {
    let generatedContent = template.structure;

    // Replace all template variables with form data
    Object.entries(formData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      generatedContent = generatedContent.replace(regex, value || `[${key}]`);
    });

    // Add current date if not specified
    if (!formData.date) {
      generatedContent = generatedContent.replace(/{{date}}/g, new Date().toLocaleDateString('fr-CA'));
    }

    return generatedContent;
  };

  const requiredFieldsCompleted = template.requiredFields.every(field =>
    completedFields.has(field)
  );

  const handleSave = () => {
    const templateData = {
      templateId: template.id,
      templateName: template.name,
      organization: template.organization,
      category: template.category,
      formData,
      generatedContent: generateTemplate(),
      completedFields: Array.from(completedFields),
      isComplete: requiredFieldsCompleted,
      createdAt: new Date().toISOString(),
      complianceLevel: 'LAW25'
    };

    onSave(templateData);
  };

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {template.icon}
            {template.name}
            <Badge variant="outline">{template.organization.toUpperCase()}</Badge>
          </CardTitle>
          <CardDescription>
            {template.description}
            {template.professionalOrderCompatible && (
              <div className="mt-2">
                <span className="text-sm font-medium">Ordres professionnels compatibles: </span>
                {template.professionalOrderCompatible.map(order => (
                  <Badge key={order} variant="secondary" className="ml-1">
                    {order.toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression du template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">
                Champs complétés: {completedFields.size} / {template.requiredFields.length + template.optionalFields.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(completedFields.size / (template.requiredFields.length + template.optionalFields.length)) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              {requiredFieldsCompleted ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Prêt
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  En cours
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Tabs defaultValue="required" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="required">Champs requis</TabsTrigger>
          <TabsTrigger value="optional">Champs optionnels</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="required" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Champs obligatoires</CardTitle>
              <CardDescription>
                Ces champs sont requis pour la conformité avec {template.organization.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.requiredFields.map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="flex items-center gap-2">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {completedFields.has(field) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </Label>
                  {field.includes('date') ? (
                    <Input
                      id={field}
                      type="date"
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                    />
                  ) : field.includes('description') || field.includes('notes') || field.includes('history') ? (
                    <Textarea
                      id={field}
                      placeholder={`Entrez ${field.replace(/_/g, ' ')}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field}
                      placeholder={`Entrez ${field.replace(/_/g, ' ')}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Champs optionnels</CardTitle>
              <CardDescription>
                Ces champs enrichissent la documentation mais ne sont pas obligatoires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.optionalFields.map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="flex items-center gap-2">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {completedFields.has(field) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </Label>
                  {field.includes('date') ? (
                    <Input
                      id={field}
                      type="date"
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                    />
                  ) : field.includes('description') || field.includes('notes') || field.includes('history') ? (
                    <Textarea
                      id={field}
                      placeholder={`Entrez ${field.replace(/_/g, ' ')}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field}
                      placeholder={`Entrez ${field.replace(/_/g, ' ')}`}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={completedFields.has(field) ? 'border-green-500' : ''}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du document</CardTitle>
              <CardDescription>
                Prévisualisation du document généré avec les données saisies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm">
                  {generateTemplate()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Notes */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Notes de conformité:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {template.complianceNotes.map((note, index) => (
              <li key={index} className="text-sm">{note}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={!requiredFieldsCompleted}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Enregistrer le document
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}

// Template Selector Component
interface QuebecTemplateSelectorProps {
  onTemplateSelect: (template: QuebecMedicalTemplate) => void;
  selectedCategory?: TemplateCategory;
  selectedOrganization?: QuebecOrganization;
}

export function QuebecTemplateSelector({
  onTemplateSelect,
  selectedCategory,
  selectedOrganization
}: QuebecTemplateSelectorProps) {
  const [filteredTemplates, setFilteredTemplates] = useState(quebecMedicalTemplates);

  useEffect(() => {
    let filtered = quebecMedicalTemplates;

    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedOrganization) {
      filtered = filtered.filter(t => t.organization === selectedOrganization);
    }

    setFilteredTemplates(filtered);
  }, [selectedCategory, selectedOrganization]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map(template => (
        <Card
          key={template.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onTemplateSelect(template)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {template.icon}
              {template.name}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {template.organization.toUpperCase()}
              </Badge>
              {template.cnesstCompatible && (
                <Badge variant="secondary">CNESST</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              {template.description}
            </p>
            {template.professionalOrderCompatible && (
              <div className="flex flex-wrap gap-1">
                {template.professionalOrderCompatible.map(order => (
                  <Badge key={order} variant="outline" className="text-xs">
                    {order.toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}