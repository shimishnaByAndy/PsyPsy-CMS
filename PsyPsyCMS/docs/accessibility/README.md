# PsyPsy CMS Accessibility Guide
**Last Updated**: September 29, 2025  
**Audience**: Frontend Developers, UX Designers, QA Engineers  
**Prerequisites**: WCAG knowledge, React 19, assistive technology basics  
**Categories**: Accessibility, WCAG Compliance, Healthcare UX  
**Topics**: WCAG 2.1 AA/AAA, Screen Readers, Keyboard Navigation, Healthcare Accessibility  

## Overview

This comprehensive guide covers accessibility implementation for the PsyPsy CMS, ensuring WCAG 2.1 AA compliance with AAA standards where possible, specifically tailored for healthcare applications.

## Table of Contents

- [Accessibility Standards](#accessibility-standards)
- [Healthcare-Specific Requirements](#healthcare-specific-requirements)
- [Component Accessibility](#component-accessibility)
- [Testing & Validation](#testing--validation)
- [Implementation Guidelines](#implementation-guidelines)
- [Assistive Technology Support](#assistive-technology-support)
- [Performance & Accessibility](#performance--accessibility)
- [Troubleshooting](#troubleshooting)

## Accessibility Standards

### WCAG 2.1 Compliance Levels

| Level | Target | Status | Implementation |
|-------|--------|--------|----------------|
| **WCAG 2.1 A** | 100% | ✅ Complete | Base accessibility requirements |
| **WCAG 2.1 AA** | 100% | ✅ Complete | Professional healthcare standard |
| **WCAG 2.1 AAA** | 90%+ | 🟡 In Progress | Enhanced accessibility features |

### Healthcare Accessibility Requirements

#### Critical Patient Safety Considerations

```typescript
// Healthcare-specific accessibility requirements
export const HealthcareA11yRequirements = {
  criticalAlerts: {
    // Medical alerts must be perceivable by all users
    implementation: 'Multi-modal feedback (visual + audio + haptic)',
    wcagLevel: 'AAA',
    rationale: 'Patient safety depends on alert perception',
  },
  
  medicationData: {
    // Medication info must be clearly readable
    implementation: 'High contrast, large text, clear typography',
    wcagLevel: 'AAA',
    rationale: 'Medication errors can be life-threatening',
  },
  
  patientIdentification: {
    // Patient IDs must be unambiguous
    implementation: 'Multiple verification methods, clear visual design',
    wcagLevel: 'AA',
    rationale: 'Prevent medical record mix-ups',
  },
  
  emergencyContacts: {
    // Emergency info must be quickly accessible
    implementation: 'Keyboard shortcuts, voice commands, clear hierarchy',
    wcagLevel: 'AA',
    rationale: 'Time-critical access in emergencies',
  },
};
```

#### Quebec Language Requirements

```typescript
// Bilingual accessibility implementation
export const BilingualA11y = {
  screenReaderSupport: {
    french: 'Optimized for French screen readers (JAWS French, NVDA French)',
    english: 'Standard English screen reader support',
    implementation: 'Language-specific ARIA labels and announcements',
  },
  
  keyboardNavigation: {
    french: 'AZERTY keyboard layout support',
    english: 'QWERTY keyboard layout support',
    implementation: 'Locale-aware keyboard shortcuts',
  },
  
  dateFormats: {
    french: 'DD/MM/YYYY format with French month names',
    english: 'MM/DD/YYYY format with English month names',
    implementation: 'Accessible date pickers with proper localization',
  },
};
```

## Healthcare-Specific Requirements

### Patient Data Accessibility

#### PHI Display with Accessibility

```typescript
// Accessible PHI display component
interface AccessiblePHIDisplayProps {
  data: string;
  maskingLevel: 'full' | 'partial' | 'none';
  accessibilityLevel: 'standard' | 'enhanced';
  userRole: UserRole;
}

export function AccessiblePHIDisplay({ 
  data, 
  maskingLevel, 
  accessibilityLevel,
  userRole 
}: AccessiblePHIDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [announceChange, setAnnounceChange] = useState(false);
  
  const handleReveal = () => {
    if (hasPermission(userRole, 'phi.reveal')) {
      setIsRevealed(true);
      setAnnounceChange(true);
      logAuditEvent('phi_revealed', { userRole, dataType: 'patient_data' });
    }
  };
  
  const displayValue = useMemo(() => {
    if (!isRevealed && maskingLevel !== 'none') {
      return maskData(data, maskingLevel);
    }
    return data;
  }, [data, isRevealed, maskingLevel]);
  
  return (
    <div className="phi-display">
      {/* Screen reader announcement for PHI reveal */}
      {announceChange && (
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          Protected health information revealed. Use arrow keys to navigate.
        </div>
      )}
      
      <span
        role="button"
        tabIndex={0}
        aria-label={`Protected health information. ${
          isRevealed ? 'Data is visible' : 'Press enter to reveal'
        }`}
        aria-describedby="phi-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleReveal();
          }
        }}
        onClick={handleReveal}
        className={cn(
          'font-mono text-sm',
          !isRevealed && 'cursor-pointer hover:bg-muted',
          'focus:ring-2 focus:ring-primary focus:outline-none'
        )}
      >
        {displayValue}
      </span>
      
      <div id="phi-instructions" className="sr-only">
        This is protected health information. 
        {!isRevealed && 'Press Enter to reveal if you have permission.'}
        Data access is logged for audit purposes.
      </div>
    </div>
  );
}
```

#### Medical Form Accessibility

```typescript
// Accessible medical form with enhanced validation
export function AccessibleMedicalForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  return (
    <form noValidate>
      {/* Form-level error summary for screen readers */}
      {Object.keys(errors).length > 0 && (
        <div 
          role="alert" 
          aria-labelledby="error-summary-title"
          className="error-summary bg-destructive/10 border border-destructive p-4 rounded-md mb-6"
        >
          <h2 id="error-summary-title" className="text-lg font-semibold text-destructive mb-2">
            Please correct the following errors:
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a 
                  href={`#${field}`}
                  className="text-destructive underline focus:ring-2 focus:ring-primary"
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Patient ID field with enhanced accessibility */}
      <div className="form-group">
        <label 
          htmlFor="patient-id" 
          className="block text-sm font-medium mb-2"
        >
          Patient ID <span aria-label="required" className="text-destructive">*</span>
        </label>
        <input
          id="patient-id"
          type="text"
          required
          aria-describedby="patient-id-description patient-id-error"
          aria-invalid={errors.patientId ? 'true' : 'false'}
          className={cn(
            'w-full px-3 py-2 border rounded-md',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            errors.patientId && 'border-destructive'
          )}
          onBlur={(e) => validateField('patientId', e.target.value)}
        />
        <div id="patient-id-description" className="text-sm text-muted-foreground mt-1">
          Format: Two letters followed by six numbers (e.g., AB123456)
        </div>
        {errors.patientId && (
          <div 
            id="patient-id-error" 
            role="alert"
            className="text-sm text-destructive mt-1"
          >
            {errors.patientId}
          </div>
        )}
      </div>
      
      {/* Medication dosage with high-precision requirements */}
      <fieldset className="border rounded-md p-4 mb-4">
        <legend className="text-lg font-semibold px-2">Medication Information</legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="medication-name" className="block text-sm font-medium mb-2">
              Medication Name
            </label>
            <input
              id="medication-name"
              type="text"
              list="medication-suggestions"
              aria-describedby="medication-help"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
            <datalist id="medication-suggestions">
              <option value="Acetaminophen" />
              <option value="Ibuprofen" />
              <option value="Aspirin" />
            </datalist>
            <div id="medication-help" className="text-sm text-muted-foreground mt-1">
              Start typing to see medication suggestions
            </div>
          </div>
          
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium mb-2">
              Dosage
            </label>
            <div className="flex">
              <input
                id="dosage"
                type="number"
                step="0.1"
                min="0"
                aria-describedby="dosage-unit"
                className="flex-1 px-3 py-2 border rounded-l-md focus:ring-2 focus:ring-primary"
              />
              <select 
                id="dosage-unit"
                aria-label="Dosage unit"
                className="px-3 py-2 border-l-0 border rounded-r-md focus:ring-2 focus:ring-primary"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
```

### Alert and Notification Accessibility

```typescript
// Healthcare-grade accessible alerts
export function HealthcareAlert({ 
  type, 
  message, 
  priority = 'medium',
  persistent = false 
}: HealthcareAlertProps) {
  const alertId = useId();
  const [announced, setAnnounced] = useState(false);
  
  // Critical alerts get immediate focus and audio
  useEffect(() => {
    if (priority === 'critical' && !announced) {
      // Move focus to alert for immediate attention
      const alertElement = document.getElementById(alertId);
      alertElement?.focus();
      
      // Play audio alert if permitted
      if (window.speechSynthesis && 'speak' in window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(
          `Critical alert: ${message}`
        );
        utterance.rate = 1.2; // Slightly faster for urgency
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
      
      setAnnounced(true);
    }
  }, [priority, message, announced, alertId]);
  
  const getAlertProps = () => {
    const baseProps = {
      id: alertId,
      role: priority === 'critical' ? 'alert' : 'status',
      'aria-live': priority === 'critical' ? 'assertive' : 'polite',
      'aria-atomic': 'true',
      tabIndex: priority === 'critical' ? 0 : -1,
    };
    
    if (priority === 'critical') {
      baseProps['aria-labelledby'] = `${alertId}-title`;
      baseProps['aria-describedby'] = `${alertId}-description`;
    }
    
    return baseProps;
  };
  
  return (
    <div 
      {...getAlertProps()}
      className={cn(
        'alert rounded-md p-4 border-l-4',
        {
          'bg-destructive/10 border-destructive text-destructive': type === 'error',
          'bg-yellow-50 border-yellow-400 text-yellow-800': type === 'warning',
          'bg-blue-50 border-blue-400 text-blue-800': type === 'info',
          'bg-green-50 border-green-400 text-green-800': type === 'success',
        },
        priority === 'critical' && 'ring-2 ring-destructive animate-pulse'
      )}
    >
      <div className="flex items-start">
        <AlertIcon type={type} priority={priority} />
        <div className="ml-3 flex-1">
          {priority === 'critical' && (
            <h3 id={`${alertId}-title`} className="font-semibold">
              Critical Alert
            </h3>
          )}
          <div 
            id={priority === 'critical' ? `${alertId}-description` : undefined}
            className={priority === 'critical' ? 'mt-1' : ''}
          >
            {message}
          </div>
          {priority === 'critical' && (
            <div className="mt-2 text-sm">
              <button 
                className="font-medium underline hover:no-underline focus:ring-2 focus:ring-destructive"
                onClick={() => window.location.href = '/emergency-protocols'}
              >
                View Emergency Protocols
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Component Accessibility

### Data Table Accessibility

```typescript
// Accessible healthcare data table
export function AccessibleHealthcareTable<T>({ 
  data, 
  columns, 
  caption,
  sortable = true,
  selectable = false 
}: AccessibleTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  const tableId = useId();
  const captionId = `${tableId}-caption`;
  
  return (
    <div className="overflow-x-auto">
      <table 
        id={tableId}
        role="table"
        aria-labelledby={captionId}
        aria-rowcount={data.length + 1} // +1 for header
        className="w-full border-collapse"
      >
        <caption id={captionId} className="sr-only">
          {caption}. 
          {sortable && 'Use arrow keys to navigate, enter to sort columns.'}
          {selectable && 'Use space to select rows.'}
        </caption>
        
        <thead>
          <tr role="row" aria-rowindex={1}>
            {selectable && (
              <th 
                scope="col" 
                aria-colindex={1}
                className="p-2 border text-left"
              >
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={selectedRows.size === data.length}
                  indeterminate={selectedRows.size > 0 && selectedRows.size < data.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(data.map((_, index) => String(index))));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                  className="w-4 h-4"
                />
              </th>
            )}
            
            {columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                aria-colindex={index + (selectable ? 2 : 1)}
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
                className="p-2 border text-left bg-muted"
              >
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center space-x-1 w-full text-left hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-describedby={`${column.key}-sort-description`}
                  >
                    <span>{column.header}</span>
                    <SortIcon direction={
                      sortConfig?.key === column.key ? sortConfig.direction : null
                    } />
                  </button>
                ) : (
                  column.header
                )}
                
                {sortable && (
                  <div id={`${column.key}-sort-description`} className="sr-only">
                    {sortConfig?.key === column.key
                      ? `Sorted by ${column.header} in ${sortConfig.direction}ending order. Press Enter to reverse sort.`
                      : `Press Enter to sort by ${column.header}.`
                    }
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              role="row"
              aria-rowindex={rowIndex + 2}
              aria-selected={selectedRows.has(String(rowIndex))}
              className={cn(
                'hover:bg-muted/50',
                selectedRows.has(String(rowIndex)) && 'bg-primary/10'
              )}
            >
              {selectable && (
                <td 
                  role="gridcell"
                  aria-colindex={1}
                  className="p-2 border"
                >
                  <input
                    type="checkbox"
                    aria-label={`Select row ${rowIndex + 1}`}
                    checked={selectedRows.has(String(rowIndex))}
                    onChange={(e) => {
                      const newSelected = new Set(selectedRows);
                      if (e.target.checked) {
                        newSelected.add(String(rowIndex));
                      } else {
                        newSelected.delete(String(rowIndex));
                      }
                      setSelectedRows(newSelected);
                    }}
                    className="w-4 h-4"
                  />
                </td>
              )}
              
              {columns.map((column, colIndex) => (
                <td
                  key={column.key}
                  role="gridcell"
                  aria-colindex={colIndex + (selectable ? 2 : 1)}
                  className="p-2 border"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Table summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        Table with {data.length} rows and {columns.length} columns.
        {selectedRows.size > 0 && ` ${selectedRows.size} rows selected.`}
        {sortConfig && ` Sorted by ${sortConfig.key} in ${sortConfig.direction}ending order.`}
      </div>
    </div>
  );
}
```

### Navigation Accessibility

```typescript
// Accessible navigation with skip links
export function AccessibleNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);
  
  return (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      
      {/* Skip to navigation link */}
      <a
        href="#main-navigation"
        className="sr-only focus:not-sr-only fixed top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </a>
      
      <nav 
        id="main-navigation"
        role="navigation" 
        aria-label="Main navigation"
        className="bg-background border-b"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-xl font-bold focus:ring-2 focus:ring-primary focus:outline-none rounded"
              >
                <span className="sr-only">PsyPsy CMS - </span>
                Healthcare Management
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavigationItem href="/dashboard" current={location.pathname === '/dashboard'}>
                  Dashboard
                </NavigationItem>
                <NavigationItem href="/patients" current={location.pathname === '/patients'}>
                  Patients
                </NavigationItem>
                <NavigationItem href="/appointments" current={location.pathname === '/appointments'}>
                  Appointments
                </NavigationItem>
                <NavigationItem href="/reports" current={location.pathname === '/reports'}>
                  Reports
                </NavigationItem>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-muted">
              <MobileNavigationItem href="/dashboard">Dashboard</MobileNavigationItem>
              <MobileNavigationItem href="/patients">Patients</MobileNavigationItem>
              <MobileNavigationItem href="/appointments">Appointments</MobileNavigationItem>
              <MobileNavigationItem href="/reports">Reports</MobileNavigationItem>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Navigation item with proper ARIA attributes
function NavigationItem({ 
  href, 
  children, 
  current = false 
}: NavigationItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary',
        current 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      aria-current={current ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
```

## Testing & Validation

### Automated Accessibility Testing

```typescript
// Automated accessibility test suite
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Patient Form', () => {
    test('should have no accessibility violations', async () => {
      const { container } = render(<PatientForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PatientForm />);
      
      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/patient id/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/first name/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/last name/i)).toHaveFocus();
    });
    
    test('should announce form errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<PatientForm />);
      
      // Submit form without required fields
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      await user.click(submitButton);
      
      // Check for error announcements
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/please correct the following errors/i)).toBeInTheDocument();
    });
    
    test('should provide clear error messaging', async () => {
      const user = userEvent.setup();
      render(<PatientForm />);
      
      const patientIdField = screen.getByLabelText(/patient id/i);
      await user.type(patientIdField, 'invalid');
      await user.tab(); // Trigger blur validation
      
      expect(screen.getByText(/patient id must be in format/i)).toBeInTheDocument();
      expect(patientIdField).toHaveAttribute('aria-invalid', 'true');
    });
  });
  
  describe('Data Table', () => {
    test('should have proper table semantics', async () => {
      const mockData = [
        { id: '1', name: 'John Doe', age: 35 },
        { id: '2', name: 'Jane Smith', age: 42 },
      ];
      
      render(<HealthcareTable data={mockData} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAccessibleName();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(3); // Name, Age, Actions
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // Header + 2 data rows
    });
    
    test('should support sorting with keyboard', async () => {
      const user = userEvent.setup();
      const mockData = [
        { id: '1', name: 'John Doe', age: 35 },
        { id: '2', name: 'Jane Smith', age: 42 },
      ];
      
      render(<HealthcareTable data={mockData} sortable />);
      
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');
      
      await user.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
      
      await user.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    });
  });
  
  describe('Alert System', () => {
    test('should announce critical alerts immediately', async () => {
      render(
        <HealthcareAlert 
          type="error" 
          priority="critical"
          message="Patient vitals are critical"
        />
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveTextContent(/critical alert/i);
    });
    
    test('should use appropriate ARIA live regions', () => {
      const { rerender } = render(
        <HealthcareAlert 
          type="info" 
          priority="medium"
          message="Patient updated successfully"
        />
      );
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      
      rerender(
        <HealthcareAlert 
          type="error" 
          priority="critical"
          message="Emergency alert"
        />
      );
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
```

### Manual Testing Checklist

```typescript
// Manual accessibility testing checklist
export const ManualA11yTestingChecklist = {
  keyboardNavigation: [
    '✅ Can reach all interactive elements with Tab key',
    '✅ Tab order follows logical sequence',
    '✅ Focus indicators are clearly visible',
    '✅ Can activate buttons with Enter/Space',
    '✅ Can escape from modal dialogs',
    '✅ Can operate dropdown menus with arrow keys',
  ],
  
  screenReaderTesting: [
    '✅ All content is announced correctly',
    '✅ Headings create logical document structure',
    '✅ Form labels are associated with inputs',
    '✅ Error messages are announced',
    '✅ Dynamic content changes are announced',
    '✅ Tables have proper headers and captions',
  ],
  
  visualDesign: [
    '✅ Text contrast meets WCAG AA standards (4.5:1)',
    '✅ UI controls meet WCAG AA standards (3:1)',
    '✅ Text can be resized to 200% without horizontal scroll',
    '✅ Color is not the only way to convey information',
    '✅ Touch targets are at least 44x44 pixels',
    '✅ Animation can be disabled via user preferences',
  ],
  
  cognitiveAccessibility: [
    '✅ Instructions are clear and concise',
    '✅ Error messages provide specific guidance',
    '✅ Important actions require confirmation',
    '✅ Time limits can be extended or disabled',
    '✅ Complex tasks can be saved and resumed',
    '✅ Help documentation is available',
  ],
};
```

### Performance Impact Testing

```typescript
// Accessibility performance testing
describe('Accessibility Performance', () => {
  test('should not significantly impact page load with accessibility features', async () => {
    const startTime = performance.now();
    
    render(<ComplexHealthcareDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Accessibility features should not add more than 10% overhead
    expect(loadTime).toBeLessThan(1000); // Base expectation
  });
  
  test('should maintain performance with screen reader optimizations', async () => {
    // Simulate screen reader environment
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0 NVDA/2023.1',
      writable: true
    });
    
    const startTime = performance.now();
    render(<PatientManagementPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1500);
  });
});
```

## Implementation Guidelines

### Development Workflow

#### Pre-Development Accessibility Checklist

```typescript
// Accessibility-first development checklist
export const A11yDevelopmentChecklist = {
  designReview: [
    '✅ Color contrast validated in design',
    '✅ Focus states designed for all interactive elements',
    '✅ Text hierarchy uses proper heading levels',
    '✅ Form layout supports clear labeling',
    '✅ Error states clearly communicate issues',
  ],
  
  implementation: [
    '✅ Semantic HTML structure',
    '✅ ARIA labels for complex interactions',
    '✅ Keyboard event handlers implemented',
    '✅ Focus management for dynamic content',
    '✅ Screen reader testing conducted',
  ],
  
  testing: [
    '✅ Automated axe tests passing',
    '✅ Keyboard navigation verified',
    '✅ Screen reader testing completed',
    '✅ Color contrast verified',
    '✅ Manual accessibility review done',
  ],
};
```

#### Code Review Accessibility Guidelines

```typescript
// Accessibility code review guidelines
export const A11yCodeReviewGuidelines = {
  htmlStructure: {
    checkFor: [
      'Proper heading hierarchy (h1 → h2 → h3)',
      'Semantic elements (main, nav, article, aside)',
      'Form labels and fieldsets',
      'Button vs link usage (actions vs navigation)',
      'Table structure (thead, tbody, th, td)',
    ],
    avoid: [
      'DIVs for interactive elements',
      'Missing alt text for images',
      'Empty links or buttons',
      'Placeholder text as labels',
      'Unlabeled form controls',
    ],
  },
  
  ariaImplementation: {
    required: [
      'aria-label for icon-only buttons',
      'aria-describedby for help text',
      'aria-live for dynamic content',
      'aria-expanded for toggleable content',
      'role for custom components',
    ],
    validate: [
      'ARIA roles match component behavior',
      'ARIA properties have valid values',
      'ARIA states update correctly',
      'No redundant ARIA on semantic elements',
      'Screen reader tested with real devices',
    ],
  },
};
```

---

## Related Documentation

- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Accessibility testing approach
- [Design System Research](../design-system/research.md) - Accessibility design patterns
- [Component Documentation](../TABLES_GUIDE.md) - Accessible component implementations
- [Scripts Documentation](../development/scripts.md) - Accessibility testing scripts

---

*For accessibility support or questions, contact the UX team or refer to the WCAG 2.1 guidelines. All accessibility implementations should prioritize patient safety and healthcare workflow efficiency.*