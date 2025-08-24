/**
 * Export Templates - Predefined templates for different data exports
 */

import { 
  formatCanadianPhone, 
  formatBusinessAddress, 
  formatDateTime, 
  calculateAge,
  formatCurrency,
  formatArray,
  formatBoolean,
  formatVerificationStatus,
  formatAppointmentStatus,
  formatProfessionalServices,
  formatLicenseInfo
} from './exportFormatters';

/**
 * Client Export Template - Full Information
 */
export const clientExportTemplate = {
  id: 'clients-full',
  name: 'Client Export (Full)',
  description: 'Complete client information with contact details and privacy controls',
  format: 'xlsx',
  privacyLevel: 'full',
  fields: [
    {
      key: 'id',
      header: 'Client ID',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.firstName',
      header: 'First Name',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'clientPtr.lastName',
      header: 'Last Name',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'email',
      header: 'Email',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'clientPtr.phoneNb',
      header: 'Phone Number',
      formatter: (value) => formatCanadianPhone(value),
      privacy: 'full'
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    },
    {
      key: 'clientPtr.dob',
      header: 'Age',
      formatter: (value) => calculateAge(value),
      privacy: 'basic'
    },
    {
      key: 'clientPtr.gender',
      header: 'Gender',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.addressObj',
      header: 'Address',
      formatter: (value) => formatBusinessAddress(value),
      privacy: 'full'
    },
    {
      key: 'isActive',
      header: 'Status',
      formatter: (value) => formatBoolean(value, 'Active', 'Inactive'),
      privacy: 'basic'
    },
    {
      key: 'clientPtr.emergencyContact',
      header: 'Emergency Contact',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'clientPtr.emergencyPhone',
      header: 'Emergency Phone',
      formatter: (value) => formatCanadianPhone(value),
      privacy: 'full'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } }, // PsyPsy green
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Client Export Template - Basic Information
 */
export const clientBasicExportTemplate = {
  id: 'clients-basic',
  name: 'Client Export (Basic)',
  description: 'Basic client information without sensitive personal data',
  format: 'xlsx',
  privacyLevel: 'basic',
  fields: [
    {
      key: 'id',
      header: 'Client ID',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.firstName',
      header: 'First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.lastName',
      header: 'Last Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    },
    {
      key: 'clientPtr.gender',
      header: 'Gender',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'isActive',
      header: 'Status',
      formatter: (value) => formatBoolean(value, 'Active', 'Inactive'),
      privacy: 'basic'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } },
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Professional Export Template - Full Information
 */
export const professionalExportTemplate = {
  id: 'professionals-full',
  name: 'Professional Export (Full)',
  description: 'Complete professional information with credentials and contact details',
  format: 'xlsx',
  privacyLevel: 'full',
  fields: [
    {
      key: 'id',
      header: 'Professional ID',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.firstName',
      header: 'First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.lastName',
      header: 'Last Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'email',
      header: 'Personal Email',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'professionalPtr.bussEmail',
      header: 'Business Email',
      formatter: (value) => value || '',
      privacy: 'full'
    },
    {
      key: 'professionalPtr.phoneNb',
      header: 'Personal Phone',
      formatter: (value) => formatCanadianPhone(value),
      privacy: 'full'
    },
    {
      key: 'professionalPtr.bussPhoneNb',
      header: 'Business Phone',
      formatter: (value) => formatCanadianPhone(value),
      privacy: 'full'
    },
    {
      key: 'professionalPtr.profType',
      header: 'Profession Type',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.businessName',
      header: 'Business Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.licenseNumber',
      header: 'License Number',
      formatter: (value, row, privacyLevel) => formatLicenseInfo(value, privacyLevel),
      privacy: 'full'
    },
    {
      key: 'isVerified',
      header: 'Verification Status',
      formatter: (value, row) => formatVerificationStatus(value, row?.verificationDate),
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.servOfferedArr',
      header: 'Services Offered',
      formatter: (value) => formatProfessionalServices(value),
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.addressObj',
      header: 'Business Address',
      formatter: (value) => formatBusinessAddress(value),
      privacy: 'full'
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.hourlyRate',
      header: 'Hourly Rate',
      formatter: (value) => formatCurrency(value),
      privacy: 'basic'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } },
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Professional Export Template - Basic Information
 */
export const professionalBasicExportTemplate = {
  id: 'professionals-basic',
  name: 'Professional Export (Basic)',
  description: 'Professional information with privacy protection for credentials',
  format: 'xlsx',
  privacyLevel: 'basic',
  fields: [
    {
      key: 'id',
      header: 'Professional ID',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.firstName',
      header: 'First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.lastName',
      header: 'Last Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.profType',
      header: 'Profession Type',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.businessName',
      header: 'Business Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'isVerified',
      header: 'Verification Status',
      formatter: (value) => formatBoolean(value, 'Verified', 'Pending'),
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.servOfferedArr',
      header: 'Services Offered',
      formatter: (value) => formatProfessionalServices(value),
      privacy: 'basic'
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } },
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Appointment Export Template
 */
export const appointmentExportTemplate = {
  id: 'appointments-full',
  name: 'Appointment Export',
  description: 'Appointment scheduling data with client and professional information',
  format: 'xlsx',
  privacyLevel: 'basic',
  fields: [
    {
      key: 'id',
      header: 'Appointment ID',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.firstName',
      header: 'Client First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'clientPtr.lastName',
      header: 'Client Last Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.firstName',
      header: 'Professional First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.lastName',
      header: 'Professional Last Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.profType',
      header: 'Professional Type',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'appointmentDate',
      header: 'Appointment Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    },
    {
      key: 'appointmentTime',
      header: 'Appointment Time',
      formatter: (value) => formatDateTime(value, 'time'),
      privacy: 'basic'
    },
    {
      key: 'duration',
      header: 'Duration (minutes)',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'status',
      header: 'Status',
      formatter: (value) => formatAppointmentStatus(value),
      privacy: 'basic'
    },
    {
      key: 'appointmentType',
      header: 'Appointment Type',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      formatter: (value) => formatDateTime(value, 'datetime'),
      privacy: 'basic'
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      formatter: (value) => formatDateTime(value, 'datetime'),
      privacy: 'basic'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } },
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Statistics Export Template
 */
export const statisticsExportTemplate = {
  id: 'statistics-summary',
  name: 'Statistics Export',
  description: 'Platform statistics and analytics data',
  format: 'xlsx',
  privacyLevel: 'basic',
  fields: [
    {
      key: 'date',
      header: 'Date',
      formatter: (value) => formatDateTime(value, 'date'),
      privacy: 'basic'
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'totalProfessionals',
      header: 'Total Professionals',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'totalAppointments',
      header: 'Total Appointments',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'completedAppointments',
      header: 'Completed Appointments',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'cancelledAppointments',
      header: 'Cancelled Appointments',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'verifiedProfessionals',
      header: 'Verified Professionals',
      formatter: (value) => value || 0,
      privacy: 'basic'
    },
    {
      key: 'activeClients',
      header: 'Active Clients',
      formatter: (value) => value || 0,
      privacy: 'basic'
    }
  ],
  styling: {
    headerStyle: {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '899581' } },
    },
    cellStyle: {
      alignment: { wrapText: true, vertical: 'top' }
    }
  }
};

/**
 * Get all available export templates
 */
export const getAllExportTemplates = () => {
  return {
    clients: [clientExportTemplate, clientBasicExportTemplate],
    professionals: [professionalExportTemplate, professionalBasicExportTemplate],
    appointments: [appointmentExportTemplate],
    statistics: [statisticsExportTemplate]
  };
};

/**
 * Get templates by data type
 */
export const getTemplatesByType = (dataType) => {
  const templates = getAllExportTemplates();
  return templates[dataType] || [];
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
  const allTemplates = getAllExportTemplates();
  
  for (const typeTemplates of Object.values(allTemplates)) {
    const template = typeTemplates.find(t => t.id === templateId);
    if (template) return template;
  }
  
  return null;
};

/**
 * Create custom template based on existing template
 */
export const createCustomTemplate = (baseTemplate, customizations) => {
  return {
    ...baseTemplate,
    id: customizations.id || `${baseTemplate.id}-custom`,
    name: customizations.name || `${baseTemplate.name} (Custom)`,
    description: customizations.description || baseTemplate.description,
    fields: customizations.fields || baseTemplate.fields,
    privacyLevel: customizations.privacyLevel || baseTemplate.privacyLevel,
    styling: { ...baseTemplate.styling, ...(customizations.styling || {}) }
  };
};

export default {
  clientExportTemplate,
  clientBasicExportTemplate,
  professionalExportTemplate,
  professionalBasicExportTemplate,
  appointmentExportTemplate,
  statisticsExportTemplate,
  getAllExportTemplates,
  getTemplatesByType,
  getTemplateById,
  createCustomTemplate
};