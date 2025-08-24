name: "Data Export Functionality - Excel and CSV Export with Streaming"
description: |

## Purpose
Implement comprehensive data export functionality for PsyPsy CMS using xlsx and papaparse libraries, providing Excel and CSV export capabilities with streaming support for large datasets, progress indicators, and Material-UI integrated export controls.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create a robust data export system that allows administrators to export client data, professional profiles, appointments, and system statistics to Excel and CSV formats with support for large datasets, custom formatting, and user-friendly progress indicators.

## Why
- **Business value**: Data portability for compliance, reporting, and analysis; administrative efficiency for data management
- **Integration**: Seamless integration with existing TanStack Table components and Parse Server data
- **Problems solved**: Manual data extraction, lack of reporting capabilities, compliance requirements for data export

## What
A comprehensive export system where:
- All data grid components support Excel and CSV export with custom formatting
- Large dataset export uses streaming with progress indicators and cancellation support
- Professional and client data exports include privacy controls and data filtering
- Export functionality integrates with existing table filtering and search capabilities
- Custom export templates support branding and compliance requirements

### Success Criteria
- [ ] Excel export works for all data grids with proper formatting and styling
- [ ] CSV export supports large datasets with streaming and progress indicators
- [ ] Export functionality integrates with table filtering and search
- [ ] Professional/client data exports respect privacy settings and permissions
- [ ] Progress indicators show during large export operations
- [ ] Export files include proper metadata and branding

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.sheetjs.com/
  why: xlsx library documentation, Excel formatting, workbook creation
  
- url: https://www.papaparse.com/docs
  why: PapaParse CSV processing, streaming, web worker support
  
- url: https://www.papaparse.com/demo
  why: CSV export examples and streaming implementation patterns
  
- url: https://mui.com/material-ui/react-button/
  why: Material-UI button integration for export controls
  
- file: src/components/TanStackTable/index.js
  why: Table component for export integration, data access patterns
  
- file: src/components/ClientsDataGrid/index.js
  why: Client data structure for export formatting and privacy considerations
  
- file: src/components/ProfessionalsDataGrid/index.js  
  why: Professional data export with credential privacy handling
  
- file: src/services/parseService.js
  why: Parse Server data fetching patterns for large dataset export

- docfile: INITIAL.md
  why: Data export examples and PapaParse streaming patterns

- file: src/localization/locales/en/translation.json
  why: Export operation messages, progress indicators, error handling
```

### Current Codebase tree
```bash
src/
├── components/
│   ├── TanStackTable/           # Table components for export integration
│   ├── ClientsDataGrid/         # Client data grid with export needs
│   ├── ProfessionalsDataGrid/   # Professional data grid with privacy requirements
│   ├── AppointmentsDataGrid/    # Appointment data export functionality
│   ├── MDButton/                # Material Dashboard buttons for export controls
│   └── LoadingState/            # Loading indicators for export progress
├── services/
│   ├── parseService.js          # Parse Server data fetching
│   ├── clientService.js         # Client data operations
│   └── professionalService.js   # Professional data operations
├── assets/theme/
│   └── components/
│       └── button/              # Button styling for export controls
└── localization/
    └── locales/
        ├── en/translation.json  # English export messages
        └── fr/translation.json  # French export messages
```

### Desired Codebase tree with files to be added
```bash
src/
├── components/
│   ├── Export/                  # New: Export functionality components
│   │   ├── index.js            # Main export component
│   │   ├── ExportButton.js     # Export trigger button with dropdown
│   │   ├── ExportProgress.js   # Progress indicator for large exports
│   │   ├── ExportSettings.js   # Export configuration modal
│   │   └── ExportPreview.js    # Preview export data before download
│   ├── TanStackTable/           # Enhanced with export functionality
│   │   ├── TableToolbar.js     # Enhanced toolbar with export buttons
│   │   └── hooks/
│   │       └── useTableExport.js  # Table export hook
│   └── DataGrids/               # Enhanced with export capabilities
│       ├── ClientsDataGrid/     # Updated with privacy-aware export
│       ├── ProfessionalsDataGrid/ # Updated with credential filtering
│       └── AppointmentsDataGrid/  # Updated with scheduling export
├── hooks/
│   ├── useExcelExport.js        # Excel export functionality
│   ├── useCSVExport.js          # CSV export with streaming
│   └── useDataExport.js         # Generic data export hook
├── services/
│   ├── exportService.js         # Export operations and formatting
│   └── streamingService.js      # Large dataset streaming service
├── utils/
│   ├── exportFormatters.js      # Data formatting utilities
│   ├── exportTemplates.js       # Export template definitions
│   └── privacyFilters.js        # Privacy and permission filtering
├── workers/                     # New: Web workers for export processing
│   └── exportWorker.js          # Background export processing
└── types/
    └── export.types.js          # TypeScript definitions for export
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: xlsx library requires proper data structure for Excel export
// Arrays of objects work best, nested objects need flattening
// Date objects need proper Excel date formatting

// CRITICAL: PapaParse streaming requires proper memory management
// Large datasets can cause memory issues without streaming
// Use step callback for processing chunks, not complete callback

// CRITICAL: Browser file download limits and security restrictions
// Large files (>100MB) may fail to download in some browsers
// Use Blob URLs for file download, clean up after download

// CRITICAL: Parse Server data transformation for export
// Parse objects use .get() method, need plain object conversion
// Handle Parse Server pagination for complete data export

// CRITICAL: Privacy and compliance considerations
// Client PII data requires proper filtering and permissions
// Professional credentials need privacy protection in exports
// GDPR compliance requires data export controls

// CRITICAL: Material-UI integration with export progress
// Long-running exports need proper loading states
// Export cancellation requires cleanup of workers and streams
```

## Implementation Blueprint

### Data models and structure

Create export system with privacy controls and formatting templates.
```typescript
// types/export.types.js - Export type definitions
export interface ExportConfig {
  format: 'xlsx' | 'csv';
  filename?: string;
  includeHeaders: boolean;
  dateFormat: string;
  includeMetadata: boolean;
  privacyLevel: 'full' | 'basic' | 'anonymous';
  customFields?: string[];
  filters?: Record<string, any>;
}

export interface ExportProgress {
  total: number;
  processed: number;
  percentage: number;
  status: 'idle' | 'processing' | 'completed' | 'error' | 'cancelled';
  message?: string;
  error?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'xlsx' | 'csv';
  fields: ExportField[];
  styling?: ExcelStyling;
  privacyLevel: 'full' | 'basic' | 'anonymous';
}

// utils/exportTemplates.js - Export template definitions
export const clientExportTemplate = {
  id: 'clients-full',
  name: 'Client Export (Full)',
  description: 'Complete client information with contact details',
  format: 'xlsx',
  privacyLevel: 'full',
  fields: [
    {
      key: 'id',
      header: 'Client ID',
      formatter: (value) => value,
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
      formatter: (value) => value,
      privacy: 'full'
    },
    {
      key: 'clientPtr.phoneNb',
      header: 'Phone',
      formatter: (value) => formatCanadianPhone(value),
      privacy: 'full'
    },
    {
      key: 'createdAt',
      header: 'Registration Date',
      formatter: (value) => new Date(value).toLocaleDateString(),
      privacy: 'basic'
    },
    {
      key: 'clientPtr.dob',
      header: 'Age',
      formatter: (value) => calculateAge(value),
      privacy: 'basic'
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

export const professionalExportTemplate = {
  id: 'professionals-basic',
  name: 'Professional Export (Basic)',
  description: 'Professional information with privacy protection',
  format: 'xlsx',
  privacyLevel: 'basic',
  fields: [
    {
      key: 'id',
      header: 'Professional ID',
      formatter: (value) => value,
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.firstName',
      header: 'First Name',
      formatter: (value) => value || '',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.profType',
      header: 'Profession Type',
      formatter: (value) => value,
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
      formatter: (value) => value ? 'Verified' : 'Pending',
      privacy: 'basic'
    },
    {
      key: 'professionalPtr.servOfferedArr',
      header: 'Services',
      formatter: (value) => Array.isArray(value) ? value.join(', ') : '',
      privacy: 'basic'
    }
    // NOTE: Exclude sensitive fields like licenseNumber, bussEmail in basic template
  ]
};
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Install Dependencies and Setup
INSTALL packages:
  - xlsx: "latest"
  - papaparse: "^5.4.0"
  - VERIFY: No conflicts with existing dependencies

Task 2: Create Export Service Infrastructure
CREATE services/exportService.js:
  - PATTERN: Service layer for export operations
  - IMPLEMENT: Data transformation, formatting, privacy filtering
  - HANDLE: Parse Server data conversion to export format
  - PROVIDE: Generic export functions for different data types

CREATE utils/exportFormatters.js:
  - PATTERN: Data formatting utilities for export
  - IMPLEMENT: Phone number formatting, date formatting, text cleanup
  - HANDLE: Canadian postal codes, business information formatting
  - PROVIDE: Privacy-aware data masking functions

CREATE utils/privacyFilters.js:
  - PATTERN: Privacy and compliance filtering utilities
  - IMPLEMENT: Data filtering based on privacy levels and permissions
  - HANDLE: PII protection, credential masking, GDPR compliance
  - PROVIDE: Role-based data access control for exports

Task 3: Create Excel Export Functionality
CREATE hooks/useExcelExport.js:
  - PATTERN: Hook for Excel export using xlsx library
  - IMPLEMENT: Workbook creation, styling, multiple sheets support
  - HANDLE: Large dataset export with progress tracking
  - INTEGRATE: PsyPsy branding and custom styling

CREATE utils/exportTemplates.js:
  - PATTERN: Export template definitions for different data types
  - IMPLEMENT: Client, professional, appointment export templates
  - HANDLE: Privacy levels and field selection
  - PROVIDE: Custom styling and formatting options

Task 4: Create CSV Export with Streaming
CREATE hooks/useCSVExport.js:
  - PATTERN: Hook for CSV export with PapaParse streaming
  - IMPLEMENT: Streaming export for large datasets
  - HANDLE: Progress tracking, cancellation, error handling
  - PROVIDE: Memory-efficient export for thousands of records

CREATE workers/exportWorker.js:
  - PATTERN: Web worker for background export processing
  - IMPLEMENT: Off-main-thread CSV generation and processing
  - HANDLE: Large dataset processing without UI blocking
  - PROVIDE: Progress updates and cancellation support

Task 5: Create Export UI Components
CREATE components/Export/ExportButton.js:
  - PATTERN: Material-UI button with export dropdown menu
  - IMPLEMENT: Format selection (Excel/CSV), template selection
  - STYLE: Material Dashboard button styling with export icons
  - HANDLE: Export initiation and progress display

CREATE components/Export/ExportProgress.js:
  - PATTERN: Progress indicator for export operations
  - IMPLEMENT: Progress bar, status messages, cancellation button
  - STYLE: Material-UI LinearProgress with custom styling
  - HANDLE: Real-time progress updates and user feedback

CREATE components/Export/ExportSettings.js:
  - PATTERN: Modal dialog for export configuration
  - IMPLEMENT: Privacy level selection, field customization
  - STYLE: Material-UI Dialog with form controls
  - HANDLE: Export template selection and customization

Task 6: Integrate Export with TanStack Table
CREATE components/TanStackTable/hooks/useTableExport.js:
  - PATTERN: Table-specific export hook
  - IMPLEMENT: Current table data export with filtering
  - HANDLE: Selected rows export, filtered data export
  - INTEGRATE: Table state (search, filters, sorting) with export

MODIFY components/TanStackTable/TableToolbar.js:
  - ADD: Export button integration with table toolbar
  - PRESERVE: Existing search and filter functionality
  - IMPLEMENT: Export current view vs. all data options
  - STYLE: Consistent Material-UI toolbar styling

Task 7: Enhance Data Grid Components with Export
MODIFY src/components/ClientsDataGrid/index.js:
  - ADD: Client-specific export functionality
  - IMPLEMENT: Privacy-aware client data export
  - HANDLE: Client data filtering and permission checks
  - PRESERVE: Existing component interface and functionality

MODIFY src/components/ProfessionalsDataGrid/index.js:
  - ADD: Professional-specific export with credential protection
  - IMPLEMENT: Professional verification status in exports
  - HANDLE: Business information and licensing privacy
  - PRESERVE: Existing professional management functionality

MODIFY src/components/AppointmentsDataGrid/index.js:
  - ADD: Appointment scheduling export functionality
  - IMPLEMENT: Time-based filtering and scheduling data
  - HANDLE: Client-professional privacy in appointment exports
  - PRESERVE: Existing appointment management functionality

Task 8: Create Data Export Service
CREATE services/streamingService.js:
  - PATTERN: Service for large dataset streaming and export
  - IMPLEMENT: Parse Server pagination with streaming export
  - HANDLE: Memory management and progress tracking
  - PROVIDE: Cancellable export operations

CREATE hooks/useDataExport.js:
  - PATTERN: Generic data export hook for all components
  - IMPLEMENT: Export orchestration and state management
  - HANDLE: Format selection, progress tracking, error handling
  - PROVIDE: Unified export interface for all data grids

Task 9: Add Export Progress and Feedback
CREATE components/Export/ExportPreview.js:
  - PATTERN: Preview component for export data before download
  - IMPLEMENT: Data sample display, field verification
  - HANDLE: Large dataset preview with pagination
  - STYLE: Material-UI table with export preview styling

ENHANCE components/LoadingState/index.js:
  - ADD: Export-specific loading states and progress indicators
  - IMPLEMENT: Cancellable loading with progress percentages
  - HANDLE: Long-running export operations feedback
  - PRESERVE: Existing loading state patterns

Task 10: Add Internationalization and Testing
ADD localization/locales/*/translation.json:
  - ADD: Export operation messages, progress indicators
  - IMPLEMENT: Privacy notices, export confirmations
  - HANDLE: Error messages and export completion notifications
  - PROVIDE: Multi-language support for export workflow

TEST export functionality:
  - VERIFY: Excel export works with proper formatting
  - CHECK: CSV streaming handles large datasets
  - VALIDATE: Privacy filtering works correctly
  - CONFIRM: Progress indicators and cancellation work
  - ENSURE: Export integration with all data grids
```

### Per task pseudocode

```typescript
// Task 3: Excel Export Implementation
// hooks/useExcelExport.js
import * as XLSX from 'xlsx';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clientExportTemplate, professionalExportTemplate } from 'utils/exportTemplates';

const useExcelExport = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState({ percentage: 0, status: 'idle' });
  
  const exportToExcel = useCallback(async ({ 
    data, 
    template, 
    filename,
    privacyLevel = 'basic' 
  }) => {
    setProgress({ percentage: 0, status: 'processing' });
    
    try {
      // PATTERN: Filter data based on privacy level
      const filteredFields = template.fields.filter(field => {
        const fieldPrivacy = field.privacy || 'basic';
        return getPrivacyLevel(privacyLevel) >= getPrivacyLevel(fieldPrivacy);
      });
      
      // Transform data for Excel export
      const exportData = data.map((row, index) => {
        setProgress({ 
          percentage: (index / data.length) * 80, 
          status: 'processing',
          message: t('export.processing', { current: index + 1, total: data.length })
        });
        
        const exportRow = {};
        filteredFields.forEach(field => {
          const value = getNestedValue(row, field.key);
          exportRow[field.header] = field.formatter ? field.formatter(value) : value;
        });
        
        return exportRow;
      });
      
      // Create workbook with styling
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      
      // Apply PsyPsy styling
      if (template.styling) {
        // PATTERN: Apply header styling
        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
          if (worksheet[cellRef]) {
            worksheet[cellRef].s = template.styling.headerStyle;
          }
        }
        
        // Apply cell styling for data rows
        for (let row = 1; row <= headerRange.e.r; row++) {
          for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
            if (worksheet[cellRef]) {
              worksheet[cellRef].s = template.styling.cellStyle;
            }
          }
        }
      }
      
      // Add metadata sheet
      const metadataSheet = XLSX.utils.json_to_sheet([
        { Property: 'Export Date', Value: new Date().toISOString() },
        { Property: 'Records Exported', Value: exportData.length },
        { Property: 'Privacy Level', Value: privacyLevel },
        { Property: 'Template Used', Value: template.name },
        { Property: 'Generated By', Value: 'PsyPsy CMS' }
      ]);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
      
      setProgress({ percentage: 90, status: 'processing', message: t('export.generating') });
      
      // Generate and download file
      const finalFilename = filename || `${template.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, finalFilename);
      
      setProgress({ percentage: 100, status: 'completed', message: t('export.completed') });
      
      return {
        success: true,
        filename: finalFilename,
        recordsExported: exportData.length
      };
      
    } catch (error) {
      setProgress({ percentage: 0, status: 'error', error: error.message });
      throw error;
    }
  }, [t]);
  
  return { exportToExcel, progress };
};

// Task 4: CSV Export with Streaming
// hooks/useCSVExport.js
import Papa from 'papaparse';
import { useCallback, useState, useRef } from 'react';

const useCSVExport = () => {
  const [progress, setProgress] = useState({ percentage: 0, status: 'idle' });
  const cancelRef = useRef(false);
  const workerRef = useRef(null);
  
  const exportToCSV = useCallback(async ({ 
    data, 
    template, 
    filename,
    privacyLevel = 'basic',
    useStreaming = true 
  }) => {
    cancelRef.current = false;
    setProgress({ percentage: 0, status: 'processing' });
    
    try {
      if (useStreaming && data.length > 1000) {
        return await streamingCSVExport({ data, template, filename, privacyLevel });
      } else {
        return await simpleCSVExport({ data, template, filename, privacyLevel });
      }
    } catch (error) {
      setProgress({ percentage: 0, status: 'error', error: error.message });
      throw error;
    }
  }, []);
  
  const streamingCSVExport = useCallback(async ({ data, template, filename, privacyLevel }) => {
    return new Promise((resolve, reject) => {
      const filteredFields = template.fields.filter(field => {
        const fieldPrivacy = field.privacy || 'basic';
        return getPrivacyLevel(privacyLevel) >= getPrivacyLevel(fieldPrivacy);
      });
      
      const csvRows = [];
      const headers = filteredFields.map(field => field.header);
      csvRows.push(headers);
      
      let processed = 0;
      const total = data.length;
      
      // PATTERN: Process data in chunks to prevent memory issues
      const processChunk = (startIndex) => {
        if (cancelRef.current) {
          reject(new Error('Export cancelled'));
          return;
        }
        
        const endIndex = Math.min(startIndex + 100, data.length);
        
        for (let i = startIndex; i < endIndex; i++) {
          const row = data[i];
          const csvRow = filteredFields.map(field => {
            const value = getNestedValue(row, field.key);
            return field.formatter ? field.formatter(value) : value;
          });
          csvRows.push(csvRow);
          processed++;
        }
        
        const percentage = (processed / total) * 90;
        setProgress({ 
          percentage, 
          status: 'processing',
          message: `Processed ${processed}/${total} records`
        });
        
        if (endIndex < data.length) {
          // Process next chunk asynchronously
          setTimeout(() => processChunk(endIndex), 10);
        } else {
          // Generate CSV and download
          setProgress({ percentage: 95, status: 'processing', message: 'Generating CSV...' });
          
          const csvContent = Papa.unparse(csvRows, {
            quotes: true,
            delimiter: ',',
            header: false, // We already added headers
          });
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename || `export-${Date.now()}.csv`;
          link.click();
          
          // Clean up
          URL.revokeObjectURL(link.href);
          
          setProgress({ percentage: 100, status: 'completed' });
          resolve({
            success: true,
            filename: link.download,
            recordsExported: processed
          });
        }
      };
      
      // Start processing
      processChunk(0);
    });
  }, []);
  
  const cancelExport = useCallback(() => {
    cancelRef.current = true;
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setProgress({ percentage: 0, status: 'cancelled' });
  }, []);
  
  return { exportToCSV, progress, cancelExport };
};

// Task 5: Export Button Component
// components/Export/ExportButton.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Material-UI components
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Material Dashboard components
import MDButton from 'components/MDButton';
import ExportProgress from './ExportProgress';
import ExportSettings from './ExportSettings';

const ExportButton = ({ 
  data, 
  onExport, 
  templates = [],
  disabled = false,
  size = 'medium',
  variant = 'outlined'
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleExport = async (format, template) => {
    setExporting(true);
    handleClose();
    
    try {
      await onExport({ format, template, data });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };
  
  const handleCustomExport = (template) => {
    setSelectedTemplate(template);
    setSettingsOpen(true);
    handleClose();
  };
  
  return (
    <>
      <MDButton
        variant={variant}
        color="info"
        size={size}
        startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
        onClick={handleClick}
        disabled={disabled || exporting || !data?.length}
      >
        {exporting ? t('export.exporting') : t('export.export')}
      </MDButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {/* Quick export options */}
        <MenuItem onClick={() => handleExport('xlsx', templates[0])}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.quickExcel')} />
        </MenuItem>
        
        <MenuItem onClick={() => handleExport('csv', templates[0])}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('export.quickCSV')} />
        </MenuItem>
        
        {/* Custom export templates */}
        {templates.map((template) => (
          <MenuItem
            key={template.id}
            onClick={() => handleCustomExport(template)}
          >
            <ListItemIcon>
              {template.format === 'xlsx' ? <TableChartIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText 
              primary={template.name}
              secondary={template.description}
            />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Export settings modal */}
      <ExportSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        template={selectedTemplate}
        onExport={handleExport}
        data={data}
      />
    </>
  );
};

// Task 6: Table Export Integration
// components/TanStackTable/hooks/useTableExport.js
const useTableExport = (table, data, tableConfig) => {
  const { exportToExcel } = useExcelExport();
  const { exportToCSV } = useCSVExport();
  
  const exportCurrentView = useCallback(async ({ format, template }) => {
    // Get currently filtered and sorted data
    const currentRows = table.getRowModel().rows.map(row => row.original);
    
    // Apply current search/filter state to export
    const filteredData = applyTableFilters(currentRows, tableConfig.filters);
    
    if (format === 'xlsx') {
      return await exportToExcel({
        data: filteredData,
        template,
        filename: `${template.name}-current-view-${new Date().toISOString().split('T')[0]}`
      });
    } else {
      return await exportToCSV({
        data: filteredData,
        template,
        filename: `${template.name}-current-view-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  }, [table, tableConfig, exportToExcel, exportToCSV]);
  
  const exportAllData = useCallback(async ({ format, template }) => {
    // Export complete dataset (may require server-side fetch for large datasets)
    const allData = await fetchAllData(tableConfig.dataSource);
    
    if (format === 'xlsx') {
      return await exportToExcel({ data: allData, template });
    } else {
      return await exportToCSV({ 
        data: allData, 
        template,
        useStreaming: allData.length > 1000
      });
    }
  }, [tableConfig, exportToExcel, exportToCSV]);
  
  return { exportCurrentView, exportAllData };
};
```

### Integration Points
```yaml
DEPENDENCIES:
  - add to: package.json
  - packages: |
      xlsx: "latest"
      papaparse: "^5.4.0"

TANSTACK-TABLE:
  - enhance: Table components with export functionality
  - integrate: Current view export with table state (filters, search, sorting)
  - preserve: Existing table functionality and performance

PARSE-SERVER:
  - integrate: Large dataset export with Parse Server pagination
  - handle: Parse object transformation for export formats
  - implement: Privacy-aware data filtering for compliance

MATERIAL-UI:
  - integrate: Export buttons and progress components with Material-UI design
  - enhance: Loading states and progress indicators
  - maintain: PsyPsy theme consistency throughout export UI
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm install xlsx papaparse@^5.4.0
npm run build # Ensure no compilation errors with export functionality
npx eslint src/components/Export/ src/hooks/use*Export.js # Check code style

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests
```javascript
// CREATE __tests__/hooks/useExcelExport.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useExcelExport } from '../../hooks/useExcelExport';
import { clientExportTemplate } from '../../utils/exportTemplates';

const mockData = [
  { 
    id: '1', 
    email: 'test@example.com',
    clientPtr: { firstName: 'John', lastName: 'Doe' },
    createdAt: '2024-01-01T00:00:00Z'
  },
];

test('useExcelExport exports data successfully', async () => {
  const { result } = renderHook(() => useExcelExport());
  
  let exportResult;
  await waitFor(async () => {
    exportResult = await result.current.exportToExcel({
      data: mockData,
      template: clientExportTemplate,
      filename: 'test-export.xlsx'
    });
  });
  
  expect(exportResult.success).toBe(true);
  expect(exportResult.recordsExported).toBe(1);
  expect(result.current.progress.status).toBe('completed');
});

// CREATE __tests__/hooks/useCSVExport.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useCSVExport } from '../../hooks/useCSVExport';

test('useCSVExport handles streaming for large datasets', async () => {
  const { result } = renderHook(() => useCSVExport());
  
  const largeDataset = Array(2000).fill(mockData[0]).map((item, index) => ({
    ...item,
    id: `${index + 1}`
  }));
  
  let exportResult;
  await waitFor(async () => {
    exportResult = await result.current.exportToCSV({
      data: largeDataset,
      template: clientExportTemplate,
      useStreaming: true
    });
  });
  
  expect(exportResult.success).toBe(true);
  expect(exportResult.recordsExported).toBe(2000);
});

// CREATE __tests__/utils/exportFormatters.test.js
import { formatCanadianPhone, calculateAge } from '../../utils/exportFormatters';

test('formatCanadianPhone formats phone numbers correctly', () => {
  expect(formatCanadianPhone('+15551234567')).toBe('(555) 123-4567');
  expect(formatCanadianPhone('5551234567')).toBe('(555) 123-4567');
  expect(formatCanadianPhone('invalid')).toBe('invalid');
});

test('calculateAge computes age correctly', () => {
  const birthDate = new Date('1990-01-01');
  const age = calculateAge(birthDate);
  expect(age).toBeGreaterThan(30);
  expect(age).toBeLessThan(40);
});
```

```bash
# Run tests iteratively until passing:
npm test -- __tests__/hooks/use*Export __tests__/utils/export
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Start the development server
npm start

# Test in browser - Export functionality
# Navigate to /clients - try Excel export
# Navigate to /professionals - try CSV export
# Test large dataset export with progress indicators
# Test export cancellation functionality

# Expected behaviors:
# - Excel export downloads file with proper formatting
# - CSV export handles large datasets with streaming
# - Progress indicators show during export operations
# - Export buttons integrate seamlessly with table toolbars
# - Privacy filtering works correctly for different user roles
# - Export files include proper metadata and branding
```

## Final Validation Checklist
- [ ] All tests pass: `npm test -- __tests__/hooks/use*Export`
- [ ] No linting errors: `npx eslint src/components/Export/`
- [ ] No compilation errors: `npm run build`
- [ ] Excel export works with proper formatting and styling
- [ ] CSV export supports large datasets with streaming
- [ ] Export functionality integrates with table filtering
- [ ] Professional/client data exports respect privacy settings
- [ ] Progress indicators show during large export operations
- [ ] Export files include proper metadata and branding
- [ ] Export cancellation works correctly
- [ ] Material-UI theming consistency maintained

---

## Anti-Patterns to Avoid
- ❌ Don't export raw Parse objects without transformation
- ❌ Don't ignore privacy and compliance requirements for data export
- ❌ Don't block UI thread with large dataset processing
- ❌ Don't forget to clean up Blob URLs after file download
- ❌ Don't skip progress indicators for long-running exports
- ❌ Don't hardcode export templates - make them configurable

## Confidence Score: 8/10

High confidence due to:
- xlsx and PapaParse libraries are well-documented with React integration
- Existing table components provide clear data access patterns
- Privacy filtering requirements are well-defined in ClassStructDocs
- Material-UI integration patterns established in current codebase

Minor uncertainty around performance optimization for very large datasets (>10,000 records) and ensuring proper memory management during streaming exports.