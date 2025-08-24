/**
 * Excel Export Hook - Using xlsx library for Excel export functionality
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

import { 
  transformDataForExport, 
  generateExportMetadata, 
  validateExportConfig,
  getPrivacyLevel 
} from 'services/exportService';
import { applyPrivacyFilters } from 'utils/privacyFilters';

const useExcelExport = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState({ 
    percentage: 0, 
    status: 'idle', 
    message: '', 
    error: null 
  });

  /**
   * Export data to Excel format
   */
  const exportToExcel = useCallback(async ({ 
    data, 
    template, 
    filename,
    privacyLevel = 'basic',
    includeMetadata = true,
    userRole = 'admin'
  }) => {
    setProgress({ percentage: 0, status: 'processing', message: t('export.starting', { defaultValue: 'Starting export...' }) });
    
    try {
      // Validate export configuration
      const validation = validateExportConfig(data, template, { privacyLevel });
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      setProgress({ percentage: 10, status: 'processing', message: t('export.applyingFilters', { defaultValue: 'Applying privacy filters...' }) });
      
      // Apply privacy filters to data
      const filteredData = applyPrivacyFilters(data, privacyLevel, userRole);
      
      setProgress({ percentage: 30, status: 'processing', message: t('export.transformingData', { defaultValue: 'Transforming data...' }) });
      
      // Transform data using template
      const exportData = transformDataForExport(filteredData, template, privacyLevel);
      
      if (exportData.length === 0) {
        throw new Error('No data available for export after filtering');
      }

      setProgress({ percentage: 50, status: 'processing', message: t('export.creatingWorkbook', { defaultValue: 'Creating Excel workbook...' }) });
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Create main data worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Apply styling if defined in template
      if (template.styling) {
        applyWorksheetStyling(worksheet, template.styling, exportData.length);
      }
      
      // Set column widths for better readability
      const columnWidths = template.fields.map(field => ({
        wch: Math.max(field.header?.length || 10, 15) // Minimum 15 chars, or header length
      }));
      worksheet['!cols'] = columnWidths;
      
      // Add the main data sheet
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      setProgress({ percentage: 70, status: 'processing', message: t('export.addingMetadata', { defaultValue: 'Adding metadata...' }) });
      
      // Add metadata sheet if requested
      if (includeMetadata) {
        const metadata = generateExportMetadata(template, exportData.length, privacyLevel);
        const metadataSheet = createMetadataSheet(metadata, template, userRole);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info');
      }
      
      setProgress({ percentage: 90, status: 'processing', message: t('export.generating', { defaultValue: 'Generating file...' }) });
      
      // Generate filename
      const finalFilename = filename || generateFilename(template, 'xlsx');
      
      // Write and download file
      XLSX.writeFile(workbook, finalFilename);
      
      setProgress({ 
        percentage: 100, 
        status: 'completed', 
        message: t('export.completed', { defaultValue: 'Export completed successfully!' })
      });
      
      return {
        success: true,
        filename: finalFilename,
        recordsExported: exportData.length,
        privacyLevel: privacyLevel,
        format: 'xlsx'
      };
      
    } catch (error) {
      console.error('Excel export failed:', error);
      setProgress({ 
        percentage: 0, 
        status: 'error', 
        error: error.message,
        message: t('export.failed', { defaultValue: 'Export failed' })
      });
      throw error;
    }
  }, [t]);

  /**
   * Reset export progress
   */
  const resetProgress = useCallback(() => {
    setProgress({ percentage: 0, status: 'idle', message: '', error: null });
  }, []);

  return { 
    exportToExcel, 
    progress,
    resetProgress 
  };
};

/**
 * Apply styling to Excel worksheet
 */
const applyWorksheetStyling = (worksheet, styling, dataRowCount) => {
  if (!worksheet['!ref']) return;
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Apply header styling
  if (styling.headerStyle) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: styling.headerStyle.font || { bold: true, color: { rgb: 'FFFFFF' } },
          fill: styling.headerStyle.fill || { fgColor: { rgb: '899581' } }, // PsyPsy green
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      }
    }
  }
  
  // Apply cell styling for data rows
  if (styling.cellStyle) {
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            alignment: styling.cellStyle.alignment || { wrapText: true, vertical: 'top' },
            border: {
              top: { style: 'thin', color: { rgb: 'CCCCCC' } },
              bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
              left: { style: 'thin', color: { rgb: 'CCCCCC' } },
              right: { style: 'thin', color: { rgb: 'CCCCCC' } }
            },
            // Alternate row colors
            fill: row % 2 === 0 ? 
              { fgColor: { rgb: 'F8F9FA' } } : 
              { fgColor: { rgb: 'FFFFFF' } }
          };
        }
      }
    }
  }
};

/**
 * Create metadata worksheet
 */
const createMetadataSheet = (metadata, template, userRole) => {
  const metadataRows = [
    ['Property', 'Value'],
    ['Export Date', metadata.exportDate],
    ['Records Exported', metadata.recordsExported],
    ['Privacy Level', metadata.privacyLevel],
    ['Template Used', metadata.templateUsed],
    ['Template ID', metadata.templateId],
    ['Generated By', metadata.generatedBy],
    ['Version', metadata.version],
    ['User Role', userRole],
    [''],
    ['Template Fields', ''],
    ['Field Name', 'Privacy Level']
  ];
  
  // Add field information
  template.fields.forEach(field => {
    metadataRows.push([field.header, field.privacy || 'basic']);
  });
  
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataRows);
  
  // Style the metadata sheet
  metadataSheet['!cols'] = [
    { wch: 20 }, // Property column
    { wch: 30 }  // Value column
  ];
  
  return metadataSheet;
};

/**
 * Generate filename for export
 */
const generateFilename = (template, format) => {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const templateName = template.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `${templateName}-${date}-${time}.${format}`;
};

export default useExcelExport;