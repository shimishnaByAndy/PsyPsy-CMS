/**
 * CSV Export Hook - Using PapaParse for CSV export with streaming support
 */

import { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';

import { 
  transformDataForExport, 
  validateExportConfig,
  chunkData 
} from 'services/exportService';
import { applyPrivacyFilters } from 'utils/privacyFilters';

const useCSVExport = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState({ 
    percentage: 0, 
    status: 'idle', 
    message: '', 
    error: null,
    processed: 0,
    total: 0
  });
  
  const cancelRef = useRef(false);
  const timeoutRef = useRef(null);

  /**
   * Export data to CSV format
   */
  const exportToCSV = useCallback(async ({ 
    data, 
    template, 
    filename,
    privacyLevel = 'basic',
    useStreaming = true,
    userRole = 'admin',
    chunkSize = 100
  }) => {
    cancelRef.current = false;
    setProgress({ 
      percentage: 0, 
      status: 'processing', 
      message: t('export.starting', { defaultValue: 'Starting CSV export...' }),
      processed: 0,
      total: data.length
    });
    
    try {
      // Validate export configuration
      const validation = validateExportConfig(data, template, { privacyLevel });
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      // Determine if we should use streaming based on data size
      const shouldUseStreaming = useStreaming && data.length > 1000;
      
      if (shouldUseStreaming) {
        return await streamingCSVExport({ 
          data, 
          template, 
          filename, 
          privacyLevel, 
          userRole, 
          chunkSize 
        });
      } else {
        return await simpleCSVExport({ 
          data, 
          template, 
          filename, 
          privacyLevel, 
          userRole 
        });
      }
    } catch (error) {
      if (error.message === 'Export cancelled') {
        setProgress({ 
          percentage: 0, 
          status: 'cancelled', 
          message: t('export.cancelled', { defaultValue: 'Export cancelled' }),
          processed: 0,
          total: 0
        });
      } else {
        console.error('CSV export failed:', error);
        setProgress({ 
          percentage: 0, 
          status: 'error', 
          error: error.message,
          message: t('export.failed', { defaultValue: 'Export failed' }),
          processed: 0,
          total: 0
        });
      }
      throw error;
    }
  }, [t]);

  /**
   * Simple CSV export for smaller datasets
   */
  const simpleCSVExport = useCallback(async ({ 
    data, 
    template, 
    filename, 
    privacyLevel, 
    userRole 
  }) => {
    setProgress(prev => ({ 
      ...prev, 
      percentage: 10, 
      message: t('export.applyingFilters', { defaultValue: 'Applying privacy filters...' })
    }));
    
    // Apply privacy filters
    const filteredData = applyPrivacyFilters(data, privacyLevel, userRole);
    
    setProgress(prev => ({ 
      ...prev, 
      percentage: 30, 
      message: t('export.transformingData', { defaultValue: 'Transforming data...' })
    }));
    
    // Transform data
    const exportData = transformDataForExport(filteredData, template, privacyLevel);
    
    if (exportData.length === 0) {
      throw new Error('No data available for export after filtering');
    }

    setProgress(prev => ({ 
      ...prev, 
      percentage: 80, 
      message: t('export.generating', { defaultValue: 'Generating CSV...' })
    }));
    
    // Generate CSV
    const csvContent = Papa.unparse(exportData, {
      quotes: true,
      delimiter: ',',
      header: true,
      skipEmptyLines: true
    });
    
    // Download file
    const finalFilename = filename || generateFilename(template, 'csv');
    downloadCSV(csvContent, finalFilename);
    
    setProgress(prev => ({ 
      ...prev, 
      percentage: 100, 
      status: 'completed', 
      message: t('export.completed', { defaultValue: 'CSV export completed!' }),
      processed: exportData.length
    }));
    
    return {
      success: true,
      filename: finalFilename,
      recordsExported: exportData.length,
      privacyLevel: privacyLevel,
      format: 'csv'
    };
  }, [t]);

  /**
   * Streaming CSV export for large datasets
   */
  const streamingCSVExport = useCallback(async ({ 
    data, 
    template, 
    filename, 
    privacyLevel, 
    userRole, 
    chunkSize 
  }) => {
    return new Promise((resolve, reject) => {
      setProgress(prev => ({ 
        ...prev, 
        percentage: 5, 
        message: t('export.preparingStream', { defaultValue: 'Preparing streaming export...' })
      }));
      
      // Apply privacy filters
      const filteredData = applyPrivacyFilters(data, privacyLevel, userRole);
      
      // Get filtered fields for headers
      const allowedFields = template.fields.filter(field => {
        const fieldPrivacy = field.privacy || 'basic';
        return getPrivacyLevel(privacyLevel) >= getPrivacyLevel(fieldPrivacy);
      });
      
      const headers = allowedFields.map(field => field.header);
      const csvRows = [headers]; // Start with headers
      
      // Split data into chunks
      const chunks = chunkData(filteredData, chunkSize);
      let processed = 0;
      let chunkIndex = 0;
      
      const processNextChunk = () => {
        if (cancelRef.current) {
          reject(new Error('Export cancelled'));
          return;
        }
        
        if (chunkIndex >= chunks.length) {
          // All chunks processed, generate and download CSV
          finalizeCsvExport();
          return;
        }
        
        const chunk = chunks[chunkIndex];
        
        // Transform chunk data
        try {
          const transformedChunk = transformDataForExport(chunk, template, privacyLevel);
          
          // Convert to array format for CSV
          transformedChunk.forEach(row => {
            const csvRow = headers.map(header => row[header] || '');
            csvRows.push(csvRow);
          });
          
          processed += chunk.length;
          chunkIndex++;
          
          // Update progress
          const percentage = Math.min((processed / filteredData.length) * 85, 85);
          setProgress(prev => ({
            ...prev,
            percentage,
            processed,
            message: t('export.processing', { 
              defaultValue: 'Processing {{current}}/{{total}} records...',
              current: processed,
              total: filteredData.length
            })
          }));
          
          // Schedule next chunk processing
          timeoutRef.current = setTimeout(processNextChunk, 10);
          
        } catch (error) {
          reject(error);
        }
      };
      
      const finalizeCsvExport = () => {
        try {
          setProgress(prev => ({
            ...prev,
            percentage: 95,
            message: t('export.finalizing', { defaultValue: 'Finalizing CSV export...' })
          }));
          
          // Generate CSV content
          const csvContent = Papa.unparse(csvRows, {
            quotes: true,
            delimiter: ',',
            header: false // We already have headers in the array
          });
          
          // Download file
          const finalFilename = filename || generateFilename(template, 'csv');
          downloadCSV(csvContent, finalFilename);
          
          setProgress(prev => ({
            ...prev,
            percentage: 100,
            status: 'completed',
            message: t('export.completed', { defaultValue: 'Streaming CSV export completed!' })
          }));
          
          resolve({
            success: true,
            filename: finalFilename,
            recordsExported: processed,
            privacyLevel: privacyLevel,
            format: 'csv',
            streamingUsed: true
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      // Start processing
      processNextChunk();
    });
  }, [t]);

  /**
   * Cancel ongoing export operation
   */
  const cancelExport = useCallback(() => {
    cancelRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setProgress({ 
      percentage: 0, 
      status: 'cancelled', 
      message: t('export.cancelled', { defaultValue: 'Export cancelled by user' }),
      processed: 0,
      total: 0
    });
  }, [t]);

  /**
   * Reset export progress
   */
  const resetProgress = useCallback(() => {
    cancelRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setProgress({ 
      percentage: 0, 
      status: 'idle', 
      message: '', 
      error: null,
      processed: 0,
      total: 0
    });
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    cancelExport();
  }, [cancelExport]);

  return { 
    exportToCSV, 
    progress,
    cancelExport,
    resetProgress,
    cleanup
  };
};

/**
 * Download CSV content as file
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Generate filename for CSV export
 */
const generateFilename = (template, format) => {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  const templateName = template.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `${templateName}-${date}-${time}.${format}`;
};

/**
 * Get privacy level numeric value for comparison
 */
const getPrivacyLevel = (level) => {
  const levels = { 'anonymous': 1, 'basic': 2, 'full': 3 };
  return levels[level] || levels.basic;
};

export default useCSVExport;