// Enhanced Console Capture Script for CMS Debugger
// This script MUST execute before React loads to capture all errors
// Self-contained - no Tauri dependencies until Tauri is ready

(function() {
    'use strict';

    // Prevent double injection
    if (window.__CMS_DEBUGGER_INJECTED__) {
        return;
    }
    window.__CMS_DEBUGGER_INJECTED__ = true;

    console.log('🚀 CMS Debugger Console Interceptor initializing...');

    // Store original console methods before any framework can override them
    const originalConsole = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
        trace: console.trace.bind(console)
    };

    // Error queue for before Tauri is ready
    let errorQueue = [];
    let tauriReady = false;

    // Enhanced error capture with advanced React pattern matching
    function captureError(error, source = 'unknown', level = 'error') {
        const errorAnalysis = analyzeReactError(error);

        const errorData = {
            type: 'error',
            level: level,
            message: error.message || String(error),
            stack: error.stack,
            source: source,
            timestamp: Date.now(),
            // React-specific error info
            componentStack: error.componentStack,
            errorBoundary: error.errorBoundary,
            errorBoundaryFound: error.errorBoundaryFound,
            errorBoundaryName: error.errorBoundaryName,
            // Additional context
            file: error.fileName,
            line: error.lineNumber,
            column: error.columnNumber,
            userAgent: navigator.userAgent,
            url: window.location.href,
            // Enhanced error analysis
            category: errorAnalysis.category,
            severity: errorAnalysis.severity,
            reactPattern: errorAnalysis.pattern,
            suggestions: errorAnalysis.suggestions,
            healthcareImpact: errorAnalysis.healthcareImpact,
            complianceRisk: errorAnalysis.complianceRisk
        };

        // Queue or send immediately
        if (tauriReady && window.__TAURI__) {
            sendToDevTools(level, errorData);
        } else {
            errorQueue.push({ level, data: errorData });
        }

        return errorData;
    }

    // Advanced React error pattern analysis
    function analyzeReactError(error) {
        const message = error.message || String(error);
        const stack = error.stack || '';
        const componentStack = error.componentStack || '';

        // React error patterns with healthcare context
        const patterns = {
            // Hook-related errors
            HOOKS_RULES: {
                pattern: /(invalid hook call|hooks can only be called|hook is called conditionally)/i,
                category: 'React Hooks Violation',
                severity: 'high',
                suggestions: [
                    'Ensure hooks are called at the top level of the component',
                    'Do not call hooks inside loops, conditions, or nested functions',
                    'Check for conditional hook usage in error boundary fallbacks'
                ],
                healthcareImpact: 'Critical - Can prevent proper rendering of patient data',
                complianceRisk: 'High - May cause PHI display failures'
            },

            // State management errors
            STATE_MUTATION: {
                pattern: /(cannot assign to read only property|mutating prop|state.*directly)/i,
                category: 'State Mutation Error',
                severity: 'medium',
                suggestions: [
                    'Use setState or state setters instead of direct mutation',
                    'Ensure immutable updates for complex state objects',
                    'Check for direct prop modifications in child components'
                ],
                healthcareImpact: 'Medium - May cause incorrect patient data display',
                complianceRisk: 'Medium - Potential audit trail inconsistencies'
            },

            // Key prop errors (common in medical lists)
            MISSING_KEYS: {
                pattern: /(warning.*each child.*unique.*key|missing.*key.*prop)/i,
                category: 'React Keys Missing',
                severity: 'low',
                suggestions: [
                    'Add unique key props to list items',
                    'Use patient IDs or appointment IDs as keys for medical records',
                    'Avoid using array indices for dynamic medical data lists'
                ],
                healthcareImpact: 'Low - May cause rendering inconsistencies in patient lists',
                complianceRisk: 'Low - No direct compliance impact'
            },

            // Component lifecycle errors
            LIFECYCLE_ERROR: {
                pattern: /(componentdidmount|componentwillunmount|useeffect.*cleanup)/i,
                category: 'Component Lifecycle Error',
                severity: 'medium',
                suggestions: [
                    'Check useEffect cleanup functions',
                    'Ensure proper component unmounting',
                    'Verify async operations are cancelled on unmount'
                ],
                healthcareImpact: 'Medium - May cause memory leaks in long-running sessions',
                complianceRisk: 'Medium - Potential session management issues'
            },

            // Memory and performance errors
            MEMORY_LEAK: {
                pattern: /(memory.*leak|too many.*renders|maximum.*update.*depth)/i,
                category: 'Performance/Memory Issue',
                severity: 'high',
                suggestions: [
                    'Check for infinite re-renders in useEffect',
                    'Verify state update dependencies',
                    'Look for missing cleanup in event listeners'
                ],
                healthcareImpact: 'High - Can freeze healthcare interface during critical operations',
                complianceRisk: 'High - May prevent proper audit logging'
            },

            // Prop validation errors
            PROP_TYPES: {
                pattern: /(failed.*prop.*type|invalid.*prop|expected.*received)/i,
                category: 'Prop Validation Error',
                severity: 'medium',
                suggestions: [
                    'Check component prop types and interfaces',
                    'Verify patient data structure matches expected format',
                    'Ensure medical record props are properly typed'
                ],
                healthcareImpact: 'Medium - May cause incorrect patient information display',
                complianceRisk: 'High - Critical for PHI data integrity'
            },

            // Context errors
            CONTEXT_ERROR: {
                pattern: /(context.*undefined|provider.*not.*found|usecontext.*outside)/i,
                category: 'React Context Error',
                severity: 'high',
                suggestions: [
                    'Ensure component is wrapped in proper context provider',
                    'Check authentication context for protected medical routes',
                    'Verify theme and configuration contexts are available'
                ],
                healthcareImpact: 'High - May prevent access to authentication and patient context',
                complianceRisk: 'Critical - Authentication context failures can expose PHI'
            },

            // Portal and DOM errors
            DOM_ERROR: {
                pattern: /(portal.*unmounted|node.*not.*found|dom.*manipulation)/i,
                category: 'DOM/Portal Error',
                severity: 'medium',
                suggestions: [
                    'Check portal mount points exist before rendering',
                    'Verify modal and tooltip containers are available',
                    'Ensure DOM elements exist before manipulation'
                ],
                healthcareImpact: 'Medium - May prevent modal dialogs for critical medical alerts',
                complianceRisk: 'Medium - Could affect consent and warning dialogs'
            },

            // Hydration errors (SSR/Static)
            HYDRATION_ERROR: {
                pattern: /(hydration.*failed|text.*content.*match|server.*client.*mismatch)/i,
                category: 'Hydration Mismatch',
                severity: 'medium',
                suggestions: [
                    'Ensure server and client render the same content',
                    'Check for client-only features affecting initial render',
                    'Verify dynamic content is properly handled'
                ],
                healthcareImpact: 'Medium - May cause flash of incorrect content',
                complianceRisk: 'Medium - Potential inconsistent PHI display'
            },

            // Network and async errors
            ASYNC_ERROR: {
                pattern: /(fetch.*failed|network.*error|promise.*rejected|async.*error)/i,
                category: 'Async/Network Error',
                severity: 'high',
                suggestions: [
                    'Implement proper error boundaries for async operations',
                    'Add retry logic for critical medical data fetching',
                    'Check network connectivity and Firebase emulator status'
                ],
                healthcareImpact: 'Critical - May prevent loading of patient medical records',
                complianceRisk: 'Critical - Network failures can affect audit trail completeness'
            },

            // Security and authentication errors
            AUTH_ERROR: {
                pattern: /(unauthorized|authentication.*failed|permission.*denied|403|401)/i,
                category: 'Authentication/Security Error',
                severity: 'critical',
                suggestions: [
                    'Check user authentication status',
                    'Verify RBAC permissions for medical data access',
                    'Ensure proper session management'
                ],
                healthcareImpact: 'Critical - Prevents access to patient care functions',
                complianceRisk: 'Critical - Authentication failures must be audited per HIPAA'
            }
        };

        // Analyze error against patterns
        for (const [key, patternInfo] of Object.entries(patterns)) {
            if (patternInfo.pattern.test(message) || patternInfo.pattern.test(stack)) {
                return {
                    category: patternInfo.category,
                    pattern: key,
                    severity: patternInfo.severity,
                    suggestions: patternInfo.suggestions,
                    healthcareImpact: patternInfo.healthcareImpact,
                    complianceRisk: patternInfo.complianceRisk
                };
            }
        }

        // Component stack analysis for additional context
        const componentAnalysis = analyzeComponentStack(componentStack);

        // Default categorization for unknown errors
        return {
            category: 'Unknown React Error',
            pattern: 'UNKNOWN',
            severity: 'medium',
            suggestions: [
                'Review error message and stack trace for specific details',
                'Check if error occurs in healthcare-critical components',
                'Consider adding error boundary for better error handling'
            ],
            healthcareImpact: componentAnalysis.healthcareImpact,
            complianceRisk: componentAnalysis.complianceRisk
        };
    }

    // Analyze component stack for healthcare-specific context
    function analyzeComponentStack(componentStack) {
        if (!componentStack) {
            return {
                healthcareImpact: 'Unknown - No component stack available',
                complianceRisk: 'Unknown - Cannot determine PHI involvement'
            };
        }

        // Healthcare-critical component patterns
        const healthcareCritical = [
            /patient/i, /medical/i, /appointment/i, /prescription/i,
            /diagnosis/i, /treatment/i, /insurance/i, /billing/i,
            /professional/i, /provider/i, /clinic/i, /hospital/i
        ];

        // PHI-related component patterns
        const phiRelated = [
            /ssn/i, /social/i, /insurance.*number/i, /medical.*record/i,
            /health.*info/i, /personal.*health/i, /patient.*data/i
        ];

        const isHealthcareCritical = healthcareCritical.some(pattern => pattern.test(componentStack));
        const isPhiRelated = phiRelated.some(pattern => pattern.test(componentStack));

        let healthcareImpact = 'Low - General UI component error';
        let complianceRisk = 'Low - No PHI components identified';

        if (isHealthcareCritical) {
            healthcareImpact = 'High - Error in healthcare-critical component';
        }

        if (isPhiRelated) {
            complianceRisk = 'Critical - Error in PHI-handling component';
        }

        return { healthcareImpact, complianceRisk };
    }

    // Send enhanced error data to DevTools via Tauri
    function sendToDevTools(level, data) {
        if (window.__TAURI__ && window.__TAURI__.invoke) {
            window.__TAURI__.invoke('log_to_devtools', {
                level: level,
                message: data.message,
                timestamp: data.timestamp,
                source: data.source,
                stack: data.stack,
                component_stack: data.componentStack,
                error_boundary: data.errorBoundary,
                file: data.file,
                line: data.line,
                column: data.column,
                // Enhanced error analysis fields
                category: data.category,
                severity: data.severity,
                react_pattern: data.reactPattern,
                suggestions: data.suggestions ? JSON.stringify(data.suggestions) : null,
                healthcare_impact: data.healthcareImpact,
                compliance_risk: data.complianceRisk
            }).catch(err => {
                originalConsole.warn('CMS Debugger: Failed to send to DevTools:', err);
            });
        }
    }

    // Process queued errors when Tauri becomes ready
    function processQueue() {
        if (errorQueue.length > 0) {
            originalConsole.log(`CMS Debugger: Processing ${errorQueue.length} queued errors`);
            errorQueue.forEach(item => {
                sendToDevTools(item.level, item.data);
            });
            errorQueue = [];
        }
    }

    // Override console methods with enhanced capture
    ['log', 'info', 'warn', 'error', 'debug', 'trace'].forEach(method => {
        console[method] = function(...args) {
            // Always call original first
            originalConsole[method].apply(console, arguments);

            // Process arguments for sending to debugger
            const processedArgs = args.map(arg => {
                if (arg instanceof Error) {
                    return captureError(arg, `console.${method}`, method);
                }
                try {
                    return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch {
                    return String(arg);
                }
            });

            const message = processedArgs.join(' ');
            const logData = {
                message: message,
                timestamp: Date.now(),
                source: `console.${method}`,
                level: method === 'log' ? 'info' : method,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Queue or send
            if (tauriReady && window.__TAURI__) {
                sendToDevTools(logData.level, logData);
            } else {
                errorQueue.push({ level: logData.level, data: logData });
            }
        };
    });

    // Capture global errors (before React error boundaries)
    window.addEventListener('error', (event) => {
        const error = {
            message: event.message,
            stack: event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`,
            name: event.error?.name || 'Error',
            fileName: event.filename,
            lineNumber: event.lineno,
            columnNumber: event.colno
        };

        captureError(error, 'window.error', 'error');
    }, true); // Use capture phase

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = {
            message: `Unhandled Promise Rejection: ${event.reason}`,
            stack: event.reason?.stack,
            name: 'UnhandledPromiseRejection'
        };

        captureError(error, 'promise.rejection', 'error');
    });

    // React Error Boundary detection (when React loads)
    function setupReactErrorCapture() {
        // Wait for React to be available
        if (typeof window.React === 'undefined') {
            setTimeout(setupReactErrorCapture, 50);
            return;
        }

        try {
            // Hook into React error boundaries
            if (window.React && window.React.Component) {
                const originalComponentDidCatch = window.React.Component.prototype.componentDidCatch;
                window.React.Component.prototype.componentDidCatch = function(error, errorInfo) {
                    const enhancedError = {
                        ...error,
                        componentStack: errorInfo.componentStack,
                        errorBoundary: true,
                        errorBoundaryName: this.constructor.name
                    };

                    captureError(enhancedError, 'react.errorBoundary', 'error');

                    // Call original if it exists
                    if (originalComponentDidCatch) {
                        originalComponentDidCatch.call(this, error, errorInfo);
                    }
                };

                originalConsole.log('CMS Debugger: React error boundary capture enabled');
            }
        } catch (e) {
            originalConsole.warn('CMS Debugger: Failed to setup React error capture:', e);
        }
    }

    // Wait for Tauri to be ready
    function waitForTauri() {
        if (window.__TAURI__ && window.__TAURI__.invoke) {
            tauriReady = true;
            originalConsole.log('CMS Debugger: Tauri ready, processing queue');
            processQueue();

            // Initialize DevTools connection
            window.__TAURI__.invoke('initialize_devtools').catch(err => {
                originalConsole.warn('CMS Debugger: DevTools initialization failed:', err);
            });
        } else {
            setTimeout(waitForTauri, 10);
        }
    }

    // Start monitoring for Tauri readiness
    setTimeout(waitForTauri, 0);

    // Start monitoring for React (after a brief delay to let React load)
    setTimeout(setupReactErrorCapture, 100);

    // Mark injection complete
    window.__CMS_DEBUGGER_READY__ = true;
    originalConsole.log('🎯 CMS Debugger Console Interceptor ready - all errors will be captured');

    // Test injection timing
    console.log('CMS Debugger: Script injection test - this should be captured');
})();