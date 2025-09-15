/**
 * Drag and Drop Type Definitions
 * Constants for drag operation types and drop zones
 */

export const DRAG_TYPES = {
  COLUMN: 'table-column',
  ROW: 'table-row',
  PROFESSIONAL_STATUS: 'professional-status',
  APPOINTMENT_SLOT: 'appointment-slot',
  CLIENT_PRIORITY: 'client-priority',
};

export const DROP_ZONES = {
  TABLE_HEADER: 'table-header',
  TABLE_BODY: 'table-body',
  STATUS_AREA: 'status-area',
  CALENDAR_SLOT: 'calendar-slot',
  PRIORITY_ZONE: 'priority-zone',
};

export const DRAG_STATUS = {
  IDLE: 'idle',
  DRAGGING: 'dragging',
  OVER: 'over',
  DROPPED: 'dropped',
};

export const PROFESSIONAL_STATUS_ZONES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under-review',
};

export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  ASSESSMENT: 'assessment',
  THERAPY_SESSION: 'therapy-session',
};