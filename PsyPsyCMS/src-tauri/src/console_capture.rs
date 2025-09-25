use crate::devtools_server::{DevToolsMessage, LogMessage};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager, Window};
use tokio::sync::broadcast;
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsoleMessage {
    pub level: String,
    pub message: String,
    pub timestamp: u64,
    pub stack: Option<String>,
    pub source: Option<String>,
}

// State to hold the broadcast sender
pub struct DevToolsBroadcaster {
    pub tx: broadcast::Sender<DevToolsMessage>,
}

#[command]
pub async fn get_devtools_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "enabled": true,
        "websocket_port": 9223,
        "websocket_url": "ws://127.0.0.1:9223",
        "stdout_capture": cfg!(unix),
        "status": "running",
        "healthcare_features": {
            "hipaa_compliance": true,
            "quebec_law_25": true,
            "phi_tracking": true,
            "audit_logging": true
        }
    }))
}

// Tauri command to receive console logs from frontend
#[command]
pub async fn log_to_devtools(
    app: AppHandle,
    _window: Window,
    level: String,
    message: String,
    _stack: Option<String>,
    source: Option<String>,
) -> Result<(), String> {
    // Try to get the broadcaster from app state
    if let Some(broadcaster) = app.try_state::<DevToolsBroadcaster>() {
        // Create a LogMessage to send to DevTools
        let log_msg = LogMessage {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp_millis() as u64,
            level: level.clone(),
            target: source.clone().unwrap_or_else(|| "webview".to_string()),
            message: message.clone(),
            file: source.clone(),
            line: None,
            module_path: None,
            fields: HashMap::new(),
        };

        let devtools_msg = DevToolsMessage {
            msg_type: "log".to_string(),
            data: serde_json::to_value(log_msg).unwrap_or(serde_json::json!({})),
        };

        // Send to WebSocket clients
        let _ = broadcaster.tx.send(devtools_msg.clone());
    }

    // Also log to stdout for debugging (this will be captured)
    match level.as_str() {
        "trace" => log::trace!(target: "webview", "{}", message),
        "debug" => log::debug!(target: "webview", "{}", message),
        "info" => log::info!(target: "webview", "{}", message),
        "warn" => log::warn!(target: "webview", "{}", message),
        "error" => log::error!(target: "webview", "❌ {}", message),
        _ => log::info!(target: "webview", "{}", message),
    }

    Ok(())
}

// JavaScript injection code to capture console logs with healthcare-specific React error patterns
pub fn get_console_injection_script() -> String {
    r#"
    (function() {
        // CRITICAL: Log to original console FIRST before any overrides
        const origConsole = window.console;
        origConsole.log('🧪 [CMS Debugger] PsyPsy healthcare console injection executing!');
        origConsole.log('🧪 [CMS Debugger] Time:', new Date().toISOString());
        origConsole.log('🧪 [CMS Debugger] URL:', window.location.href);

        // Prevent double injection with more robust checking
        if (window.__CMS_DEBUGGER_INJECTED__) {
            origConsole.log('[CMS Debugger] Healthcare console interceptor already injected, skipping...');
            return;
        }
        window.__CMS_DEBUGGER_INJECTED__ = true;

        // Log injection timing for debugging
        origConsole.log('[CMS Debugger] Injecting healthcare console interceptor at:', new Date().toISOString());
        origConsole.log('[CMS Debugger] Document readyState:', document.readyState);
        origConsole.log('[CMS Debugger] React detected:', typeof window.React !== 'undefined');
        origConsole.log('[CMS Debugger] Tauri API available:', window.__TAURI__ !== undefined);

        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
            trace: console.trace
        };

        // Enhanced React error patterns with healthcare context
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
                healthcareImpact: 'Unknown - No component stack available',
                complianceRisk: 'Unknown - Cannot determine PHI involvement'
            };
        }

        // Helper to extract component name from React error messages
        function extractComponentName(message) {
            // Try to extract component name from various React error patterns
            const patterns = [
                /in (\w+) \(at/,
                /Check the render method of `(\w+)`/,
                /Component (\w+)/,
                /<(\w+)>/
            ];

            for (const pattern of patterns) {
                const match = message.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }

            return null;
        }

        // Enhanced error capture with React support
        function captureError(error, source = 'unknown') {
            const errorData = {
                message: error.message || String(error),
                stack: error.stack,
                source: source,
                timestamp: Date.now(),
                // React-specific error info
                componentStack: error.componentStack,
                errorBoundary: error.errorBoundary,
                errorBoundaryFound: error.errorBoundaryFound,
                errorBoundaryName: error.errorBoundaryName,
                // Additional error properties
                name: error.name,
                fileName: error.fileName,
                lineNumber: error.lineNumber,
                columnNumber: error.columnNumber
            };

            // Analyze with healthcare patterns
            const analysis = analyzeReactError(errorData);
            const enhancedError = {
                ...errorData,
                analysis: analysis,
                component: extractComponentName(errorData.message),
                cmsDebuggerEnhanced: true
            };

            sendToDevTools('error', [enhancedError]);
        }

        function sendToDevTools(level, args) {
            try {
                const message = args.map(arg => {
                    // Special handling for error objects
                    if (arg instanceof Error) {
                        return JSON.stringify({
                            message: arg.message,
                            stack: arg.stack,
                            name: arg.name
                        }, null, 2);
                    }
                    // Handle React error data objects
                    if (arg && typeof arg === 'object' && arg.stack) {
                        return JSON.stringify(arg, null, 2);
                    }
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');

                const stack = new Error().stack;
                const source = window.location.href;

                if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
                    window.__TAURI__.core.invoke('log_to_devtools', {
                        level: level,
                        message: message,
                        stack: stack,
                        source: source
                    }).catch(err => {
                        originalConsole.error('Failed to send log to DevTools:', err);
                    });
                }
            } catch (e) {
                originalConsole.error('Error in console interceptor:', e);
            }
        }

        // Override console methods with enhanced error detection
        console.log = function(...args) {
            originalConsole.log.apply(console, args);
            sendToDevTools('info', args);
        };

        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            sendToDevTools('info', args);
        };

        console.warn = function(...args) {
            originalConsole.warn.apply(console, args);
            // Treat React warnings as errors for better visibility
            if (args.length > 0 && typeof args[0] === 'string') {
                const message = args[0];
                if (message.includes('Warning:')) {
                    const errorData = {
                        type: 'react-warning',
                        message: args.map(a => String(a)).join(' '),
                        timestamp: Date.now(),
                        source: 'console.warn',
                        component: extractComponentName(message),
                        stack: new Error().stack
                    };

                    // Analyze with healthcare patterns
                    const analysis = analyzeReactError(errorData);
                    const enhancedWarning = {
                        ...errorData,
                        analysis: analysis,
                        cmsDebuggerEnhanced: true
                    };

                    sendToDevTools('error', [enhancedWarning]);
                    return;
                }
            }
            sendToDevTools('warn', args);
        };

        console.debug = function(...args) {
            originalConsole.debug.apply(console, args);
            sendToDevTools('debug', args);
        };

        console.trace = function(...args) {
            originalConsole.trace.apply(console, args);
            sendToDevTools('trace', args);
        };

        // Enhanced console.error override for React error detection
        console.error = function(...args) {
            originalConsole.error.apply(console, args);

            const now = Date.now();

            // Check if this looks like a React error
            if (args.length > 0 && typeof args[0] === 'string') {
                const firstArg = args[0];

                const errorData = {
                    type: 'react-categorized-error',
                    message: args.map(a => String(a)).join(' '),
                    timestamp: now,
                    source: 'console.error',
                    component: extractComponentName(firstArg),
                    stack: new Error().stack
                };

                // Analyze with healthcare patterns
                const analysis = analyzeReactError(errorData);
                const enhancedError = {
                    ...errorData,
                    analysis: analysis,
                    cmsDebuggerEnhanced: true
                };

                sendToDevTools('error', [enhancedError]);
                return;
            }

            // Send all other errors as well
            sendToDevTools('error', args);
        };

        // Capture unhandled errors with enhanced details
        window.addEventListener('error', function(event) {
            const errorInfo = {
                message: event.message,
                source: 'window.error',
                fileName: event.filename,
                lineNumber: event.lineno,
                columnNumber: event.colno,
                stack: event.error ? event.error.stack : `at ${event.filename}:${event.lineno}:${event.colno}`,
                timestamp: Date.now()
            };

            // Analyze with healthcare patterns
            const analysis = analyzeReactError(errorInfo);
            const enhancedError = {
                ...errorInfo,
                analysis: analysis,
                cmsDebuggerEnhanced: true
            };

            sendToDevTools('error', [enhancedError]);
        });

        // Capture unhandled promise rejections with details
        window.addEventListener('unhandledrejection', function(event) {
            const errorInfo = {
                message: `Unhandled Promise Rejection: ${event.reason}`,
                source: 'promise.rejection',
                reason: event.reason,
                stack: event.reason && event.reason.stack ? event.reason.stack : undefined,
                timestamp: Date.now()
            };

            // Analyze with healthcare patterns
            const analysis = analyzeReactError(errorInfo);
            const enhancedError = {
                ...errorInfo,
                analysis: analysis,
                cmsDebuggerEnhanced: true
            };

            sendToDevTools('error', [enhancedError]);
        });

        // React Error Boundary detection via monkey-patching
        // This will catch errors that React's error boundaries handle
        if (window.React && window.React.Component) {
            const originalComponentDidCatch = window.React.Component.prototype.componentDidCatch;
            window.React.Component.prototype.componentDidCatch = function(error, errorInfo) {
                captureError({
                    ...error,
                    componentStack: errorInfo.componentStack,
                    errorBoundary: true,
                    errorBoundaryName: this.constructor.name
                }, 'react.errorBoundary');

                if (originalComponentDidCatch) {
                    originalComponentDidCatch.call(this, error, errorInfo);
                }
            };
        }

        // Network request interceptor for DevTools
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const startTime = performance.now();
            const [url, options = {}] = args;

            sendToDevTools('debug', [`🌐 Fetch: ${options.method || 'GET'} ${url}`]);

            return originalFetch.apply(this, args).then(response => {
                const duration = performance.now() - startTime;
                sendToDevTools('debug', [
                    `✅ Fetch completed: ${options.method || 'GET'} ${url}`,
                    `Status: ${response.status}`,
                    `Duration: ${duration.toFixed(2)}ms`
                ]);
                return response;
            }).catch(error => {
                const duration = performance.now() - startTime;
                const errorData = {
                    message: `❌ Fetch failed: ${options.method || 'GET'} ${url} - ${error.message}`,
                    source: 'fetch.error',
                    timestamp: Date.now(),
                    duration: duration.toFixed(2),
                    url: url,
                    method: options.method || 'GET',
                    stack: error.stack
                };

                // Analyze with healthcare patterns
                const analysis = analyzeReactError(errorData);
                const enhancedError = {
                    ...errorData,
                    analysis: analysis,
                    cmsDebuggerEnhanced: true
                };

                sendToDevTools('error', [enhancedError]);
                throw error;
            });
        };

        // Final confirmation with invoke test
        origConsole.log('🚀 Enhanced PsyPsy CMS Debugger console interceptor initialized with healthcare React error tracking');

        // Test direct invocation to DevTools
        if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
            window.__TAURI__.core.invoke('log_to_devtools', {
                level: 'info',
                message: '✅ PsyPsy CMS Console capture successfully initialized - Healthcare error patterns active',
                stack: null,
                source: 'cms-console-capture-init'
            }).then(() => {
                origConsole.log('✅ Successfully sent initialization message to CMS Debugger');
            }).catch(err => {
                origConsole.error('❌ Failed to send init message to CMS Debugger:', err);
            });
        } else {
            origConsole.error('❌ CRITICAL: Tauri API not available for CMS console capture!');
            origConsole.error('❌ Available APIs:', Object.keys(window.__TAURI__ || {}));
        }
    })();
    "#.to_string()
}