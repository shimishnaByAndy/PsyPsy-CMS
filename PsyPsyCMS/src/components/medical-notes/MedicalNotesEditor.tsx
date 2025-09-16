import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText, Shield, Wifi, WifiOff } from 'lucide-react';
import { quebecMedicalTemplates } from './QuebecMedicalTemplates';
import { invoke } from '@tauri-apps/api/core';

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

interface MedicalNotesEditorProps {
  patientId: string;
  onSave: (note: MedicalNote) => void;
  existingNote?: MedicalNote;
}

export function MedicalNotesEditor({
  patientId,
  onSave,
  existingNote
}: MedicalNotesEditorProps) {
  const [content, setContent] = useState(existingNote?.content || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);
  const [consentObtained, setConsentObtained] = useState(existingNote?.consent_obtained || false);

  // Monitor online status for offline-first approach
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTemplateSelect = (templateKey: string) => {
    const template = quebecMedicalTemplates[templateKey as keyof typeof quebecMedicalTemplates];
    if (template) {
      setSelectedTemplate(templateKey);
      setContent(template.structure);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      // First create a new note with Quebec compliance defaults
      const noteTemplate = await invoke<any>('create_medical_note', {
        patient_id: patientId,
        template_type: selectedTemplate,
        user_id: 'current_user_id' // TODO: Get from auth context
      });

      if (!noteTemplate.success) {
        throw new Error(noteTemplate.error || 'Failed to create note template');
      }

      // Update with user content and consent
      const note: MedicalNote = {
        ...noteTemplate.data,
        content,
        consent_obtained: consentObtained,
        quebec_compliance: {
          ...noteTemplate.data.quebec_compliance,
          law_25_consent: consentObtained
        }
      };

      // Validate compliance before saving
      const validation = await invoke<any>('validate_note_compliance', { note });
      if (!validation.success) {
        throw new Error(validation.error || 'Validation failed');
      }

      if (validation.data.length > 0) {
        console.warn('Compliance violations:', validation.data);
        // TODO: Show compliance warnings to user
        return;
      }

      // Save to encrypted local storage via Tauri
      const result = await invoke<any>('save_medical_note', {
        note,
        user_id: 'current_user_id' // TODO: Get from auth context
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save note');
      }

      const savedNote = { ...note, id: result.data, created_at: new Date() };
      onSave(savedNote);

      // Show success feedback
      console.log('Note saved successfully with encryption:', result.data);
    } catch (error) {
      console.error('Error saving note:', error);
      // TODO: Show user-friendly error message
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = content.trim().length > 0 && consentObtained;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes médicales - Loi 25 Conforme
            </CardTitle>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  En ligne
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Hors ligne
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Chiffré localement
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium">Modèle de note</label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle québécois" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(quebecMedicalTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consent Verification */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="consent" className="text-sm">
              Le consentement éclairé du patient a été obtenu conformément à la Loi 25
            </label>
          </div>

          {/* Content Editor */}
          <div>
            <label className="text-sm font-medium">Contenu de la note</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisir le contenu de la note médicale..."
              className="min-h-[400px] font-mono"
            />
          </div>

          {/* Compliance Notice */}
          {selectedTemplate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note de conformité:</strong>{' '}
                {quebecMedicalTemplates[selectedTemplate as keyof typeof quebecMedicalTemplates]?.complianceNotes}
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder (Chiffré)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}