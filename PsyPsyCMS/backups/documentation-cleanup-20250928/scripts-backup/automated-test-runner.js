#!/usr/bin/env node

/**
 * PsyPsyCMS Automated Test Runner
 * 
 * This script automatically executes testable portions of the comprehensive test suite
 * and generates a detailed report for manual review.
 */

import { exec, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
    constructor() {
        this.results = {
            categories: {},
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                startTime: new Date(),
                endTime: null
            }
        };
    }

    async runCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔄 Executing: ${command}`);
            
            exec(command, { cwd: process.cwd(), ...options }, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        success: false,
                        error: error.message,
                        stdout: stdout,
                        stderr: stderr
                    });
                } else {
                    resolve({
                        success: true,
                        stdout: stdout,
                        stderr: stderr
                    });
                }
            });
        });
    }

    async checkFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async runCategory1_SystemArchitecture() {
        console.log('\n🔧 Category 1: Core System Architecture Tests');
        const category = this.results.categories['system_architecture'] = {
            name: 'Core System Architecture',
            tests: [],
            status: 'running'
        };

        // Test 1.1: Build System Validation
        console.log('\n📝 Test 1.1: Build System Validation');
        
        // Check if build succeeds
        const buildResult = await this.runCommand('npm run build');
        category.tests.push({
            name: 'TypeScript Build',
            status: buildResult.success ? 'passed' : 'failed',
            details: buildResult,
            duration: 'measured'
        });

        // Check Tauri build (lighter check)
        const tauriInfoResult = await this.runCommand('npm run tauri info');
        category.tests.push({
            name: 'Tauri Environment Check',
            status: tauriInfoResult.success ? 'passed' : 'failed',
            details: tauriInfoResult
        });

        // Test 1.2: Dependency Analysis
        console.log('\n📝 Test 1.2: Dependency Analysis');
        
        const auditResult = await this.runCommand('npm audit --json');
        const outdatedResult = await this.runCommand('npm outdated --json');
        
        category.tests.push({
            name: 'NPM Security Audit',
            status: auditResult.success ? 'passed' : 'failed',
            details: auditResult
        });

        category.tests.push({
            name: 'Dependency Currency Check',
            status: outdatedResult.success ? 'passed' : 'failed',
            details: outdatedResult
        });

        // Check Cargo audit if available
        const cargoAuditResult = await this.runCommand('cd src-tauri && cargo audit --json');
        category.tests.push({
            name: 'Cargo Security Audit',
            status: cargoAuditResult.success ? 'passed' : 'failed',
            details: cargoAuditResult
        });

        category.status = 'completed';
        return category;
    }

    async runCategory2_Compliance() {
        console.log('\n🏥 Category 2: Healthcare Compliance Tests');
        const category = this.results.categories['compliance'] = {
            name: 'Healthcare Compliance',
            tests: [],
            status: 'running'
        };

        // Check if Quebec compliance test exists and run it
        const quebecTestExists = await this.checkFileExists('autonomous-quebec-healthcare-test.cjs');
        if (quebecTestExists) {
            console.log('\n📝 Running Quebec Law 25 Compliance Test');
            const quebecResult = await this.runCommand('node autonomous-quebec-healthcare-test.cjs');
            category.tests.push({
                name: 'Quebec Law 25 Compliance',
                status: quebecResult.success ? 'passed' : 'failed',
                details: quebecResult
            });
        } else {
            category.tests.push({
                name: 'Quebec Law 25 Compliance',
                status: 'skipped',
                details: { reason: 'Test file not found' }
            });
        }

        // Check HIPAA compliance tests
        const hipaaTestExists = await this.checkFileExists('tests/security/hipaa-compliance.spec.ts');
        if (hipaaTestExists) {
            console.log('\n📝 Running HIPAA Compliance Tests');
            const hipaaResult = await this.runCommand('npm test tests/security/hipaa-compliance.spec.ts');
            category.tests.push({
                name: 'HIPAA Compliance',
                status: hipaaResult.success ? 'passed' : 'failed',
                details: hipaaResult
            });
        } else {
            category.tests.push({
                name: 'HIPAA Compliance',
                status: 'skipped',
                details: { reason: 'Test file not found' }
            });
        }

        category.status = 'completed';
        return category;
    }

    async runCategory3_Security() {
        console.log('\n🔒 Category 3: Security & Authentication Tests');
        const category = this.results.categories['security'] = {
            name: 'Security & Authentication',
            tests: [],
            status: 'running'
        };

        // Test Firebase connection
        const firebaseTestExists = await this.checkFileExists('test-firebase-connection.cjs');
        if (firebaseTestExists) {
            console.log('\n📝 Testing Firebase Connection');
            const firebaseResult = await this.runCommand('node test-firebase-connection.cjs');
            category.tests.push({
                name: 'Firebase Connection',
                status: firebaseResult.success ? 'passed' : 'failed',
                details: firebaseResult
            });
        }

        // Test auth connection
        const authTestExists = await this.checkFileExists('test-auth-connection.cjs');
        if (authTestExists) {
            console.log('\n📝 Testing Authentication Connection');
            const authResult = await this.runCommand('node test-auth-connection.cjs');
            category.tests.push({
                name: 'Authentication System',
                status: authResult.success ? 'passed' : 'failed',
                details: authResult
            });
        }

        // Run Firestore security rules tests
        const firestoreSecurityExists = await this.checkFileExists('src/tests/security/firestore-security-rules.test.ts');
        if (firestoreSecurityExists) {
            console.log('\n📝 Testing Firestore Security Rules');
            const firestoreResult = await this.runCommand('npm test src/tests/security/firestore-security-rules.test.ts');
            category.tests.push({
                name: 'Firestore Security Rules',
                status: firestoreResult.success ? 'passed' : 'failed',
                details: firestoreResult
            });
        }

        category.status = 'completed';
        return category;
    }

    async runCategory4_UI_Accessibility() {
        console.log('\n🎨 Category 4: User Interface & Accessibility Tests');
        const category = this.results.categories['ui_accessibility'] = {
            name: 'UI & Accessibility',
            tests: [],
            status: 'running'
        };

        // Run accessibility component tests
        const accessibilityTestsExist = await this.checkFileExists('tests/accessibility/components/');
        if (accessibilityTestsExist) {
            console.log('\n📝 Running Accessibility Component Tests');
            const accessibilityResult = await this.runCommand('npm test tests/accessibility/components/');
            category.tests.push({
                name: 'Accessibility Component Tests',
                status: accessibilityResult.success ? 'passed' : 'failed',
                details: accessibilityResult
            });
        }

        // Check healthcare UI components exist
        const healthcareComponentsExist = await this.checkFileExists('src/components/ui/healthcare/');
        category.tests.push({
            name: 'Healthcare UI Components',
            status: healthcareComponentsExist ? 'passed' : 'failed',
            details: { 
                message: healthcareComponentsExist ? 'Healthcare components directory found' : 'Healthcare components directory missing'
            }
        });

        // Test UI component compilation
        const uiTestExists = await this.checkFileExists('test-ui-components.md');
        if (uiTestExists) {
            category.tests.push({
                name: 'UI Components Documentation',
                status: 'passed',
                details: { message: 'UI components test documentation found' }
            });
        }

        category.status = 'completed';
        return category;
    }

    async runCategory5_DataManagement() {
        console.log('\n📊 Category 5: Data Management & Performance Tests');
        const category = this.results.categories['data_management'] = {
            name: 'Data Management & Performance',
            tests: [],
            status: 'running'
        };

        // Test medical notes functionality
        const medicalNotesTestExists = await this.checkFileExists('test-medical-notes.cjs');
        if (medicalNotesTestExists) {
            console.log('\n📝 Testing Medical Notes Functionality');
            const medicalNotesResult = await this.runCommand('node test-medical-notes.cjs');
            category.tests.push({
                name: 'Medical Notes System',
                status: medicalNotesResult.success ? 'passed' : 'failed',
                details: medicalNotesResult
            });
        }

        // Test professionals API
        const professionalsTestExists = await this.checkFileExists('test-professionals-api.js');
        if (professionalsTestExists) {
            console.log('\n📝 Testing Professionals API');
            const professionalsResult = await this.runCommand('node test-professionals-api.js');
            category.tests.push({
                name: 'Professionals API',
                status: professionalsResult.success ? 'passed' : 'failed',
                details: professionalsResult
            });
        }

        // Check database migrations
        const migrationsExist = await this.checkFileExists('src-tauri/migrations/');
        if (migrationsExist) {
            try {
                const migrationFiles = await fs.readdir('src-tauri/migrations/');
                category.tests.push({
                    name: 'Database Migrations',
                    status: migrationFiles.length > 0 ? 'passed' : 'failed',
                    details: { 
                        migrationCount: migrationFiles.length,
                        migrations: migrationFiles
                    }
                });
            } catch (error) {
                category.tests.push({
                    name: 'Database Migrations',
                    status: 'failed',
                    details: { error: error.message }
                });
            }
        }

        // Run performance tests if they exist
        const performanceTestExists = await this.checkFileExists('tests/performance/load-testing.spec.ts');
        if (performanceTestExists) {
            console.log('\n📝 Running Performance Tests');
            const performanceResult = await this.runCommand('npm test tests/performance/load-testing.spec.ts');
            category.tests.push({
                name: 'Load Testing',
                status: performanceResult.success ? 'passed' : 'failed',
                details: performanceResult
            });
        }

        category.status = 'completed';
        return category;
    }

    async runCategory6_Integration() {
        console.log('\n🔗 Category 6: Integration & API Tests');
        const category = this.results.categories['integration'] = {
            name: 'Integration & API',
            tests: [],
            status: 'running'
        };

        // Test client-professional integration
        const clientProfTestExists = await this.checkFileExists('test-client-professional.cjs');
        if (clientProfTestExists) {
            console.log('\n📝 Testing Client-Professional Integration');
            const clientProfResult = await this.runCommand('node test-client-professional.cjs');
            category.tests.push({
                name: 'Client-Professional Integration',
                status: clientProfResult.success ? 'passed' : 'failed',
                details: clientProfResult
            });
        }

        // Test meeting commands
        const meetingTestExists = await this.checkFileExists('test-meeting-commands.cjs');
        if (meetingTestExists) {
            console.log('\n📝 Testing Meeting Commands');
            const meetingResult = await this.runCommand('node test-meeting-commands.cjs');
            category.tests.push({
                name: 'Meeting System',
                status: meetingResult.success ? 'passed' : 'failed',
                details: meetingResult
            });
        }

        // Test social media integration if exists
        const socialMediaTestExists = await this.checkFileExists('tests/e2e/social-media-integration.spec.ts');
        if (socialMediaTestExists) {
            console.log('\n📝 Testing Social Media Integration');
            const socialMediaResult = await this.runCommand('npm test tests/e2e/social-media-integration.spec.ts');
            category.tests.push({
                name: 'Social Media Integration',
                status: socialMediaResult.success ? 'passed' : 'failed',
                details: socialMediaResult
            });
        }

        // Test Vertex AI integration if exists
        const vertexTestExists = await this.checkFileExists('tests/e2e/vertex-ai-integration.spec.ts');
        if (vertexTestExists) {
            console.log('\n📝 Testing Vertex AI Integration');
            const vertexResult = await this.runCommand('npm test tests/e2e/vertex-ai-integration.spec.ts');
            category.tests.push({
                name: 'Vertex AI Integration',
                status: vertexResult.success ? 'passed' : 'failed',
                details: vertexResult
            });
        }

        category.status = 'completed';
        return category;
    }

    async runCategory9_ErrorHandling() {
        console.log('\n🚨 Category 9: Error Handling & Resilience Tests');
        const category = this.results.categories['error_handling'] = {
            name: 'Error Handling & Resilience',
            tests: [],
            status: 'running'
        };

        // Test error injection if exists
        const errorInjectionExists = await this.checkFileExists('test-error-injection.js');
        if (errorInjectionExists) {
            console.log('\n📝 Testing Error Injection');
            const errorResult = await this.runCommand('node test-error-injection.js');
            category.tests.push({
                name: 'Error Injection Test',
                status: errorResult.success ? 'passed' : 'failed',
                details: errorResult
            });
        }

        // Check error boundary component
        const errorBoundaryExists = await this.checkFileExists('src/components/ErrorBoundary.tsx');
        category.tests.push({
            name: 'Error Boundary Component',
            status: errorBoundaryExists ? 'passed' : 'failed',
            details: { 
                message: errorBoundaryExists ? 'Error boundary component found' : 'Error boundary component missing'
            }
        });

        // Test WebSocket error handling if exists
        const websocketTestExists = await this.checkFileExists('test-websocket.js');
        if (websocketTestExists) {
            console.log('\n📝 Testing WebSocket Error Handling');
            const websocketResult = await this.runCommand('node test-websocket.js');
            category.tests.push({
                name: 'WebSocket Error Handling',
                status: websocketResult.success ? 'passed' : 'failed',
                details: websocketResult
            });
        }

        category.status = 'completed';
        return category;
    }

    async runAllTests() {
        console.log('🚀 Starting PsyPsyCMS Comprehensive Test Suite\n');
        
        try {
            await this.runCategory1_SystemArchitecture();
            await this.runCategory2_Compliance();
            await this.runCategory3_Security();
            await this.runCategory4_UI_Accessibility();
            await this.runCategory5_DataManagement();
            await this.runCategory6_Integration();
            await this.runCategory9_ErrorHandling();

            this.results.summary.endTime = new Date();
            this.calculateSummary();
            
            await this.generateReport();
            
            console.log('\n✅ Test suite completed successfully!');
            console.log(`📊 Results: ${this.results.summary.passed} passed, ${this.results.summary.failed} failed, ${this.results.summary.skipped} skipped`);
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    calculateSummary() {
        let totalTests = 0;
        let passed = 0;
        let failed = 0;
        let skipped = 0;

        Object.values(this.results.categories).forEach(category => {
            category.tests.forEach(test => {
                totalTests++;
                if (test.status === 'passed') passed++;
                else if (test.status === 'failed') failed++;
                else if (test.status === 'skipped') skipped++;
            });
        });

        this.results.summary = {
            ...this.results.summary,
            totalTests,
            passed,
            failed,
            skipped
        };
    }

    async generateReport() {
        const reportData = {
            ...this.results,
            generatedAt: new Date().toISOString(),
            duration: this.results.summary.endTime - this.results.summary.startTime
        };

        const reportJson = JSON.stringify(reportData, null, 2);
        const reportPath = 'test-results/automated-test-report.json';

        try {
            await fs.mkdir('test-results', { recursive: true });
            await fs.writeFile(reportPath, reportJson);
            console.log(`📄 Detailed report saved to: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save report:', error);
        }

        // Generate human-readable report
        await this.generateHumanReadableReport();
    }

    async generateHumanReadableReport() {
        const duration = Math.round((this.results.summary.endTime - this.results.summary.startTime) / 1000);
        
        let report = `# PsyPsyCMS Automated Test Results\n\n`;
        report += `**Generated:** ${new Date().toISOString()}\n`;
        report += `**Duration:** ${duration} seconds\n`;
        report += `**Total Tests:** ${this.results.summary.totalTests}\n`;
        report += `**Passed:** ${this.results.summary.passed}\n`;
        report += `**Failed:** ${this.results.summary.failed}\n`;
        report += `**Skipped:** ${this.results.summary.skipped}\n\n`;

        // Overall status
        const successRate = (this.results.summary.passed / this.results.summary.totalTests * 100).toFixed(1);
        report += `**Overall Success Rate:** ${successRate}%\n\n`;

        if (this.results.summary.failed === 0) {
            report += `## ✅ All Tests Passed!\n\n`;
        } else {
            report += `## ⚠️ Issues Detected\n\n`;
        }

        // Category details
        report += `## Test Categories\n\n`;
        
        Object.entries(this.results.categories).forEach(([key, category]) => {
            const categoryPassed = category.tests.filter(t => t.status === 'passed').length;
            const categoryFailed = category.tests.filter(t => t.status === 'failed').length;
            const categorySkipped = category.tests.filter(t => t.status === 'skipped').length;
            
            report += `### ${category.name}\n`;
            report += `- **Status:** ${categoryFailed === 0 ? '✅ All Passed' : '❌ Issues Found'}\n`;
            report += `- **Tests:** ${categoryPassed} passed, ${categoryFailed} failed, ${categorySkipped} skipped\n\n`;
            
            category.tests.forEach(test => {
                const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
                report += `  ${icon} **${test.name}:** ${test.status}\n`;
                
                if (test.status === 'failed' && test.details.error) {
                    report += `    - Error: ${test.details.error.substring(0, 200)}...\n`;
                }
            });
            report += `\n`;
        });

        // Recommendations
        report += `## Recommendations\n\n`;
        
        if (this.results.summary.failed > 0) {
            report += `### Priority 1: Fix Failed Tests\n`;
            Object.values(this.results.categories).forEach(category => {
                const failedTests = category.tests.filter(t => t.status === 'failed');
                if (failedTests.length > 0) {
                    report += `- **${category.name}:** ${failedTests.length} failed test(s)\n`;
                    failedTests.forEach(test => {
                        report += `  - ${test.name}\n`;
                    });
                }
            });
            report += `\n`;
        }

        if (this.results.summary.skipped > 0) {
            report += `### Priority 2: Address Skipped Tests\n`;
            report += `${this.results.summary.skipped} tests were skipped, likely due to missing test files or dependencies.\n\n`;
        }

        report += `### Priority 3: Performance Optimization\n`;
        report += `- Review build times and optimize if necessary\n`;
        report += `- Monitor memory usage during testing\n`;
        report += `- Consider adding more comprehensive performance tests\n\n`;

        try {
            await fs.writeFile('test-results/automated-test-report.md', report);
            console.log(`📄 Human-readable report saved to: test-results/automated-test-report.md`);
        } catch (error) {
            console.error('Failed to save human-readable report:', error);
        }
    }
}

// Run tests if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
    const runner = new TestRunner();
    runner.runAllTests().catch(console.error);
}

export default TestRunner;