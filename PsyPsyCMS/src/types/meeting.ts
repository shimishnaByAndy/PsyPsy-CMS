// Meeting Types for PsyPsy CMS Integration

export interface ProcessRequest {
  transcript: string;
  custom_prompt?: string;
}

export interface SummaryResponse {
  title: string;
  summary: string;
  action_items: string[];
  key_decisions: string[];
  participants: string[];
  next_steps: string[];
  meeting_type: string;
  duration_minutes: number;
  follow_up_required: boolean;
  priority_level: 'low' | 'medium' | 'high';
  tags: string[];

  // Quebec Law 25 & PIPEDA Compliance Fields
  patient_id?: string;
  session_type?: string;
  confidentiality_level: 'standard' | 'high' | 'protected';
  consent_obtained: boolean;
  phi_present: boolean;
  retention_period_years: number;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  confidence: number;
  start_time: number;
  end_time: number;
}

export interface MeetingRecording {
  id: string;
  title: string;
  date: Date;
  duration_minutes: number;
  transcript: TranscriptSegment[];
  summary?: SummaryResponse;
  audio_file_path?: string;

  // Quebec Law 25 & PIPEDA Integration
  patient_id?: string;
  provider_id: string;
  session_id: string;
  encrypted: boolean;
  phi_classification: 'none' | 'limited' | 'full';
  consent_status: boolean;
  audit_log: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  user_id: string;
  details: string;
  ip_address?: string;
}

// Audio Processing Types
export interface AudioConfig {
  sample_rate: number;
  channels: number;
  bit_depth: number;
  format: 'wav' | 'mp3' | 'flac';
}

export interface TranscriptionConfig {
  model: string;
  language: string;
  enable_diarization: boolean;
  enable_punctuation: boolean;
  filter_profanity: boolean;
}

// Analytics Types
export interface SessionAnalytics {
  recording_started_at: Date;
  recording_ended_at: Date;
  total_duration_ms: number;
  audio_quality_score: number;
  transcription_accuracy: number;
  processing_time_ms: number;
  errors_encountered: string[];
}