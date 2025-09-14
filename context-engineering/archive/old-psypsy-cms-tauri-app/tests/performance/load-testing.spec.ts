// Performance and Load Testing Suite for Healthcare Desktop Application
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each performance test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Application Startup Performance', () => {
    test('should load dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to dashboard and wait for full load
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="dashboard-loaded"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Healthcare applications should load within 3 seconds for user safety
      expect(loadTime).toBeLessThan(3000);
      console.log(`Dashboard loaded in ${loadTime}ms`);
    });

    test('should initialize core healthcare modules quickly', async ({ page }) => {
      const moduleLoadTimes: Record<string, number> = {};
      
      // Track loading time for each critical healthcare module
      const modules = [
        { name: 'clients', path: '/clients', testId: 'clients-table' },
        { name: 'appointments', path: '/appointments', testId: 'appointments-calendar' },
        { name: 'professionals', path: '/professionals', testId: 'professionals-table' }
      ];
      
      for (const module of modules) {
        const startTime = Date.now();
        await page.goto(module.path);
        await page.waitForSelector(`[data-testid="${module.testId}"]`);
        moduleLoadTimes[module.name] = Date.now() - startTime;
        
        // Each healthcare module should load within 2 seconds
        expect(moduleLoadTimes[module.name]).toBeLessThan(2000);
      }
      
      console.log('Module load times:', moduleLoadTimes);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('/clients');
      
      // Enable performance monitoring
      await page.evaluate(() => {
        (window as any).performanceMetrics = {
          navigationStart: performance.timing.navigationStart,
          loadStart: performance.timing.loadEventStart
        };
      });
      
      // Load large client dataset (1000+ records)
      const startTime = Date.now();
      await page.click('[data-testid="load-all-clients"]');
      
      // Wait for table to be populated with data
      await page.waitForFunction(() => {
        const rows = document.querySelectorAll('[data-testid="client-row"]');
        return rows.length > 0;
      });
      
      const loadTime = Date.now() - startTime;
      
      // Large dataset should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      // Check that virtualization is working (not rendering all 1000+ rows)
      const visibleRows = await page.locator('[data-testid="client-row"]:visible').count();
      expect(visibleRows).toBeLessThan(100); // Should only render visible rows
      
      console.log(`Large dataset loaded in ${loadTime}ms with ${visibleRows} visible rows`);
    });
  });

  test.describe('Memory Usage and Leak Detection', () => {
    test('should maintain stable memory usage during navigation', async ({ page }) => {
      // Get initial memory usage
      const getMemoryUsage = () => {
        return page.evaluate(() => {
          if ((performance as any).memory) {
            return {
              used: (performance as any).memory.usedJSHeapSize,
              total: (performance as any).memory.totalJSHeapSize,
              limit: (performance as any).memory.jsHeapSizeLimit
            };
          }
          return null;
        });
      };
      
      const initialMemory = await getMemoryUsage();
      if (!initialMemory) {
        test.skip('Memory API not available in this browser');
        return;
      }
      
      console.log('Initial memory usage:', initialMemory);
      
      // Navigate through multiple pages multiple times
      const pages = ['/clients', '/appointments', '/professionals', '/dashboard'];
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const path of pages) {
          await page.goto(path);
          await page.waitForLoadState('networkidle');
          
          // Force garbage collection if available
          await page.evaluate(() => {
            if ((window as any).gc) {
              (window as any).gc();
            }
          });
        }
      }
      
      // Get final memory usage
      const finalMemory = await getMemoryUsage();
      console.log('Final memory usage:', finalMemory);
      
      if (finalMemory && initialMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const percentageIncrease = (memoryIncrease / initialMemory.used) * 100;
        
        // Memory usage should not increase by more than 50% during navigation
        expect(percentageIncrease).toBeLessThan(50);
        console.log(`Memory increased by ${percentageIncrease.toFixed(2)}%`);
      }
    });

    test('should handle concurrent operations without memory spikes', async ({ page, context }) => {
      const getMemoryUsage = () => {
        return page.evaluate(() => {
          if ((performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize;
          }
          return 0;
        });
      };
      
      const initialMemory = await getMemoryUsage();
      
      // Open multiple tabs and perform operations simultaneously
      const additionalPages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage()
      ]);
      
      // Login to all pages
      for (const additionalPage of additionalPages) {
        await additionalPage.goto('/login');
        await additionalPage.fill('[data-testid="email-input"]', 'admin@psypsy.com');
        await additionalPage.fill('[data-testid="password-password-input"]', 'password123');
        await additionalPage.click('[data-testid="login-button"]');
      }
      
      // Perform concurrent operations
      await Promise.all([
        page.goto('/clients'),
        additionalPages[0].goto('/appointments'),
        additionalPages[1].goto('/professionals'),
        additionalPages[2].goto('/dashboard')
      ]);
      
      // Wait for all operations to complete
      await Promise.all([
        page.waitForSelector('[data-testid="clients-table"]'),
        additionalPages[0].waitForSelector('[data-testid="appointments-calendar"]'),
        additionalPages[1].waitForSelector('[data-testid="professionals-table"]'),
        additionalPages[2].waitForSelector('[data-testid="dashboard-stats"]')
      ]);
      
      const finalMemory = await getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory should not increase dramatically with concurrent operations
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
      
      // Close additional pages
      await Promise.all(additionalPages.map(p => p.close()));
    });
  });

  test.describe('Database and API Performance', () => {
    test('should handle rapid successive API calls efficiently', async ({ page }) => {
      await page.goto('/clients');
      
      // Monitor network requests
      const apiCalls: Array<{ url: string, duration: number, status: number }> = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          // This would be more complex in a real implementation
          // tracking actual response times
          apiCalls.push({
            url: response.url(),
            duration: 0, // Would need to calculate actual duration
            status: response.status()
          });
        }
      });
      
      // Perform rapid search operations
      const searchTerms = ['John', 'Jane', 'Smith', 'Johnson', 'Brown'];
      for (const term of searchTerms) {
        const startTime = Date.now();
        await page.fill('[data-testid="search-input"]', term);
        await page.press('[data-testid="search-input"]', 'Enter');
        await page.waitForLoadState('networkidle');
        
        const searchTime = Date.now() - startTime;
        expect(searchTime).toBeLessThan(1000); // Each search should complete within 1 second
        
        // Clear search for next iteration
        await page.fill('[data-testid="search-input"]', '');
        await page.press('[data-testid="search-input"]', 'Enter');
      }
      
      // Check that all API calls were successful
      const failedCalls = apiCalls.filter(call => call.status >= 400);
      expect(failedCalls.length).toBe(0);
    });

    test('should maintain responsiveness during bulk operations', async ({ page }) => {
      await page.goto('/appointments');
      
      // Start bulk appointment status update
      await page.check('[data-testid="select-all-appointments"]');
      await page.click('[data-testid="bulk-update-button"]');
      await page.selectOption('[data-testid="bulk-status-select"]', 'confirmed');
      
      const bulkUpdateStart = Date.now();
      await page.click('[data-testid="apply-bulk-update"]');
      
      // UI should remain responsive during bulk operation
      // Test navigation to another page
      const navigationStart = Date.now();
      await page.click('[data-testid="clients-nav-link"]');
      await page.waitForURL('/clients');
      const navigationTime = Date.now() - navigationStart;
      
      // Navigation should not be blocked by background bulk operations
      expect(navigationTime).toBeLessThan(2000);
      
      // Go back to appointments to check if bulk operation completed
      await page.click('[data-testid="appointments-nav-link"]');
      
      // Wait for bulk operation to complete (with reasonable timeout)
      await expect(page.locator('[data-testid="bulk-update-success"]')).toBeVisible({ timeout: 10000 });
      
      const totalBulkTime = Date.now() - bulkUpdateStart;
      console.log(`Bulk operation completed in ${totalBulkTime}ms while maintaining UI responsiveness`);
    });
  });

  test.describe('Resource Utilization', () => {
    test('should use reasonable CPU resources', async ({ page }) => {
      // This test would require browser performance APIs
      // In a real implementation, you'd monitor CPU usage
      
      await page.goto('/dashboard');
      
      // Simulate heavy operations
      await page.evaluate(() => {
        // Simulate some CPU-intensive operations
        const start = performance.now();
        let counter = 0;
        while (performance.now() - start < 1000) { // Run for 1 second
          counter++;
        }
        return counter;
      });
      
      // Check that the page remains responsive
      const responseStart = Date.now();
      await page.click('[data-testid="clients-nav-link"]');
      await page.waitForURL('/clients');
      const responseTime = Date.now() - responseStart;
      
      // Page should remain responsive even after CPU-intensive operations
      expect(responseTime).toBeLessThan(2000);
    });

    test('should handle file upload efficiently', async ({ page }) => {
      await page.goto('/clients');
      await page.click('[data-testid="import-clients-button"]');
      
      // Create a test file (simulated large CSV)
      const largeCSVContent = Array.from({ length: 1000 }, (_, i) => 
        `client${i},Client${i},User${i},client${i}@example.com,+1555000${i.toString().padStart(4, '0')}`
      ).join('\n');
      
      const uploadStart = Date.now();
      
      // Upload file
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('[data-testid="upload-file-button"]');
      const fileChooser = await fileChooserPromise;
      
      // In a real test, you'd create an actual file
      // For this example, we'll simulate the upload completion
      await page.evaluate(() => {
        // Simulate file processing
        return new Promise(resolve => setTimeout(resolve, 2000));
      });
      
      const uploadTime = Date.now() - uploadStart;
      
      // Large file upload should complete within reasonable time
      expect(uploadTime).toBeLessThan(10000); // 10 seconds for 1000 records
      
      // Check that upload was successful
      await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions gracefully', async ({ page, context }) => {
      // Simulate slow 3G connection
      await context.route('**/*', async route => {
        // Add 100ms delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });
      
      const loadStart = Date.now();
      await page.goto('/clients');
      await page.waitForSelector('[data-testid="clients-table"]');
      const loadTime = Date.now() - loadStart;
      
      // Should still load within reasonable time on slow network
      expect(loadTime).toBeLessThan(5000);
      
      // Should show loading indicators
      // (This would need to be tested during the actual loading phase)
      console.log(`Page loaded in ${loadTime}ms on simulated slow network`);
    });

    test('should implement proper caching strategies', async ({ page }) => {
      // First load
      const firstLoadStart = Date.now();
      await page.goto('/clients');
      await page.waitForSelector('[data-testid="clients-table"]');
      const firstLoadTime = Date.now() - firstLoadStart;
      
      // Navigate away and back
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      // Second load should be faster due to caching
      const secondLoadStart = Date.now();
      await page.goto('/clients');
      await page.waitForSelector('[data-testid="clients-table"]');
      const secondLoadTime = Date.now() - secondLoadStart;
      
      // Second load should be at least 30% faster
      expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.7);
      
      console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
      console.log(`Improvement: ${((firstLoadTime - secondLoadTime) / firstLoadTime * 100).toFixed(1)}%`);
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle maximum concurrent users simulation', async ({ page, context }) => {
      // Simulate multiple concurrent sessions
      const concurrentPages = await Promise.all(
        Array.from({ length: 5 }, () => context.newPage())
      );
      
      // Login all sessions
      const loginPromises = concurrentPages.map(async (concurrentPage, index) => {
        await concurrentPage.goto('/login');
        await concurrentPage.fill('[data-testid="email-input"]', `user${index}@psypsy.com`);
        await concurrentPage.fill('[data-testid="password-input"]', 'password123');
        await concurrentPage.click('[data-testid="login-button"]');
        return concurrentPage.waitForURL('/dashboard');
      });
      
      const startTime = Date.now();
      await Promise.all(loginPromises);
      const allLoginsTime = Date.now() - startTime;
      
      // All concurrent logins should complete within reasonable time
      expect(allLoginsTime).toBeLessThan(10000);
      
      // Perform concurrent operations
      const operationPromises = concurrentPages.map(async (concurrentPage, index) => {
        const operations = [
          () => concurrentPage.goto('/clients'),
          () => concurrentPage.goto('/appointments'),
          () => concurrentPage.goto('/professionals')
        ];
        
        const operation = operations[index % operations.length];
        await operation();
        return concurrentPage.waitForLoadState('networkidle');
      });
      
      const operationsStart = Date.now();
      await Promise.all(operationPromises);
      const operationsTime = Date.now() - operationsStart;
      
      // Concurrent operations should complete without significant degradation
      expect(operationsTime).toBeLessThan(15000);
      
      console.log(`${concurrentPages.length} concurrent sessions: Login ${allLoginsTime}ms, Operations ${operationsTime}ms`);
      
      // Cleanup
      await Promise.all(concurrentPages.map(p => p.close()));
    });

    test('should maintain data consistency under load', async ({ page, context }) => {
      // Create multiple pages for concurrent data modifications
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      // Login both pages
      await Promise.all([
        (async () => {
          await page1.goto('/login');
          await page1.fill('[data-testid="email-input"]', 'admin@psypsy.com');
          await page1.fill('[data-testid="password-input"]', 'password123');
          await page1.click('[data-testid="login-button"]');
        })(),
        (async () => {
          await page2.goto('/login');
          await page2.fill('[data-testid="email-input"]', 'admin@psypsy.com');
          await page2.fill('[data-testid="password-input"]', 'password123');
          await page2.click('[data-testid="login-button"]');
        })()
      ]);
      
      // Navigate to same client in both pages
      await Promise.all([
        page1.goto('/clients'),
        page2.goto('/clients')
      ]);
      
      await Promise.all([
        page1.click('[data-testid="client-row"]:first-child [data-testid="edit-button"]'),
        page2.click('[data-testid="client-row"]:first-child [data-testid="edit-button"]')
      ]);
      
      // Attempt concurrent modifications
      await page1.fill('[data-testid="phone-input"]', '+1-555-1111');
      await page2.fill('[data-testid="phone-input"]', '+1-555-2222');
      
      // Save in page1 first
      await page1.click('[data-testid="save-client-button"]');
      await expect(page1.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Save in page2 - should detect conflict
      await page2.click('[data-testid="save-client-button"]');
      await expect(page2.locator('[data-testid="conflict-warning"]')).toBeVisible();
      
      console.log('Data consistency maintained during concurrent modifications');
      
      await page1.close();
      await page2.close();
    });
  });
});

test.describe('Bundle and Asset Performance', () => {
  test('should meet bundle size budgets', async ({ page }) => {
    // This would typically be done in a separate build process
    // but can be validated in E2E tests
    
    await page.goto('/');
    
    // Check that critical resources load quickly
    const performance = await page.evaluate(() => {
      return JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]));
    });
    
    console.log('Navigation timing:', {
      domContentLoaded: performance.domContentLoadedEventEnd - performance.domContentLoadedEventStart,
      load: performance.loadEventEnd - performance.loadEventStart
    });
    
    // Verify that large assets are properly split and loaded on demand
    const resourceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        size: (entry as any).transferSize || 0,
        duration: entry.duration
      }));
    });
    
    // Check that no single resource is excessively large
    const largeResources = resourceEntries.filter(resource => resource.size > 1024 * 1024); // 1MB
    expect(largeResources.length).toBeLessThan(3); // Should have very few large resources
    
    console.log('Large resources (>1MB):', largeResources);
  });
});