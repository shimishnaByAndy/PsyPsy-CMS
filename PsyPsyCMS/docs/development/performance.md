# PsyPsy CMS Performance Guide
**Last Updated**: September 29, 2025  
**Audience**: Developers, Performance Engineers, DevOps  
**Prerequisites**: React 19, Tauri 2.1+, Performance monitoring knowledge  
**Categories**: Performance, Optimization, Monitoring  
**Topics**: Bundle Optimization, Memory Management, Load Performance, Monitoring  

## Overview

This document provides comprehensive performance guidelines for the PsyPsy CMS, covering optimization strategies, monitoring techniques, and performance budgets specific to healthcare applications.

## Table of Contents

- [Performance Targets](#performance-targets)
- [React 19 Optimizations](#react-19-optimizations)
- [Bundle Optimization](#bundle-optimization)
- [Memory Management](#memory-management)
- [Load Performance](#load-performance)
- [Database Performance](#database-performance)
- [Monitoring & Metrics](#monitoring--metrics)
- [Performance Testing](#performance-testing)
- [Troubleshooting](#troubleshooting)

## Performance Targets

### Application Performance Budgets

| Metric | Target | Maximum | Current |
|--------|--------|---------|---------|
| **Initial Load Time** | < 2s | < 3s | ~1.8s |
| **Bundle Size** | < 1.5MB | < 2MB | ~1.2MB |
| **Memory Usage** | < 150MB | < 200MB | ~120MB |
| **Time to Interactive** | < 2.5s | < 4s | ~2.1s |
| **First Contentful Paint** | < 1s | < 1.5s | ~0.9s |
| **Largest Contentful Paint** | < 2s | < 3s | ~1.7s |

### Healthcare-Specific Performance Requirements

| Feature | Requirement | Rationale |
|---------|-------------|-----------|
| **Patient Data Load** | < 500ms | Clinical workflow efficiency |
| **Search Results** | < 300ms | Real-time patient lookup |
| **Form Validation** | < 100ms | Immediate feedback for data entry |
| **Report Generation** | < 5s | Compliance and efficiency |
| **Offline Sync** | < 30s | Emergency access requirements |

## React 19 Optimizations

### Automatic Compiler Optimizations

React 19's compiler automatically handles many optimizations that previously required manual implementation:

```typescript
// ❌ No longer needed in React 19
const MemoizedComponent = memo(MyComponent);
const memoizedValue = useMemo(() => expensiveCalculation(), [dep]);
const memoizedCallback = useCallback(() => handleClick(), [dep]);

// ✅ React 19 - Compiler handles optimization automatically
function MyComponent({ data }: Props) {
  const result = expensiveCalculation(data); // Automatically optimized
  
  const handleClick = () => {
    // Automatically memoized when beneficial
  };
  
  return <div onClick={handleClick}>{result}</div>;
}
```

### Server Components Integration

```typescript
// Use Server Components for static healthcare content
import { Suspense } from 'react';

export default function HealthcareDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PatientListServer /> {/* Server Component */}
      <AppointmentCalendarClient /> {/* Client Component */}
    </Suspense>
  );
}
```

### Form Performance with React 19

```typescript
import { useFormStatus, useFormState } from 'react-dom';

function PatientForm() {
  const [state, formAction] = useFormState(savePatient, null);
  const { pending } = useFormStatus();
  
  return (
    <form action={formAction}>
      <input name="patientId" />
      <button disabled={pending}>
        {pending ? 'Saving...' : 'Save Patient'}
      </button>
    </form>
  );
}
```

## Bundle Optimization

### Code Splitting Strategy

```typescript
// Route-based splitting
import { lazy, Suspense } from 'react';

const ProfessionalManagement = lazy(() => 
  import('./components/professionals/ProfessionalManagement')
);
const AppointmentManagement = lazy(() => 
  import('./components/appointments/AppointmentManagement')
);
const ClientManagement = lazy(() => 
  import('./components/clients/ClientManagement')
);

// Feature-based splitting
const AdvancedReporting = lazy(() => 
  import('./components/reporting/AdvancedReporting')
    .then(module => ({ default: module.AdvancedReporting }))
);
```

### Vite Configuration Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@nextui-org/react', '@radix-ui/react-dialog'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'professionals': ['./src/components/professionals'],
          'appointments': ['./src/components/appointments'],
          'reports': ['./src/components/reporting'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@nextui-org/react',
    ],
  },
});
```

### Tree Shaking Optimization

```typescript
// Import only what you need
import { Button } from '@nextui-org/react'; // ✅ Specific import
import * as NextUI from '@nextui-org/react'; // ❌ Entire library

// For healthcare components
import { PatientCard } from '@/components/ui/healthcare/PatientCard'; // ✅
import { validateMedicalId } from '@/utils/validation/medical'; // ✅
```

## Memory Management

### TanStack Query v5 Memory Optimization

```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes (renamed from cacheTime)
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Custom retry logic for healthcare apps
        return failureCount < 3 && !error.message.includes('403');
      },
    },
  },
});

// Memory-efficient patient data fetching
function usePatientsOptimized() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    gcTime: 1000 * 60 * 30, // 30 minutes for frequently accessed data
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      // Transform data to reduce memory footprint
      return data.map(patient => ({
        id: patient.id,
        name: patient.name,
        lastVisit: patient.lastVisit,
        // Omit large fields that aren't needed immediately
      }));
    },
  });
}
```

### Component Memory Management

```typescript
// Cleanup subscriptions and timers
import { useEffect, useRef } from 'react';

function HealthMonitoringComponent() {
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Setup monitoring
    intervalRef.current = setInterval(() => {
      // Monitor patient vitals
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return <div>Monitoring...</div>;
}
```

### Large List Virtualization

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function PatientList({ patients }: { patients: Patient[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Patient card height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <PatientCard
            key={virtualItem.key}
            patient={patients[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Load Performance

### Resource Loading Strategy

```typescript
// Preload critical healthcare resources
function preloadCriticalResources() {
  // Preload patient management module
  import('./components/patients/PatientManagement');
  
  // Preload emergency contact forms
  import('./components/emergency/EmergencyContactForm');
  
  // Preload medical validation utilities
  import('./utils/medical/validation');
}

// Call during app initialization
preloadCriticalResources();
```

### Image Optimization

```typescript
// Optimized avatar/photo loading
function PatientAvatar({ patientId, size = 'md' }: Props) {
  const [imageSrc, setImageSrc] = useState<string>();
  
  useEffect(() => {
    // Load appropriate size based on usage
    const imageSize = size === 'sm' ? 50 : size === 'md' ? 100 : 200;
    loadPatientPhoto(patientId, imageSize).then(setImageSrc);
  }, [patientId, size]);
  
  return (
    <Avatar
      src={imageSrc}
      loading="lazy"
      className={cn(
        'transition-opacity duration-200',
        imageSrc ? 'opacity-100' : 'opacity-0'
      )}
    />
  );
}
```

### Service Worker Implementation

```typescript
// sw.js - Cache healthcare static assets
const CACHE_NAME = 'psypsy-cms-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/fonts/medical-icons.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Cache API responses with healthcare-appropriate TTL
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/patients')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Serve from cache, update in background
            fetch(event.request).then(fetchResponse => {
              cache.put(event.request, fetchResponse.clone());
            });
            return response;
          }
          return fetch(event.request);
        });
      })
    );
  }
});
```

## Database Performance

### Firestore Optimization

```typescript
// Efficient patient data queries
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs 
} from 'firebase/firestore';

// Paginated patient loading
async function loadPatients(lastDoc?: DocumentSnapshot, pageSize = 25) {
  let q = query(
    collection(db, 'patients'),
    where('professionalId', '==', currentProfessionalId),
    where('active', '==', true),
    orderBy('lastVisit', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  return {
    patients: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
}

// Optimized search with composite indexes
async function searchPatients(searchTerm: string) {
  // Use composite index: [professionalId, searchTerms, lastVisit]
  const q = query(
    collection(db, 'patients'),
    where('professionalId', '==', currentProfessionalId),
    where('searchTerms', 'array-contains-any', 
      searchTerm.toLowerCase().split(' ')),
    orderBy('lastVisit', 'desc'),
    limit(10)
  );
  
  return getDocs(q);
}
```

### Offline Data Strategy

```typescript
// Offline-first data layer
import { enableNetwork, disableNetwork } from 'firebase/firestore';

class OfflineDataManager {
  private syncQueue: PendingOperation[] = [];
  
  async savePatientOffline(patient: Patient) {
    // Save to local storage/IndexedDB
    await this.localDB.patients.put(patient);
    
    // Queue for sync when online
    this.syncQueue.push({
      type: 'update',
      collection: 'patients',
      data: patient,
      timestamp: Date.now(),
    });
    
    this.scheduleSync();
  }
  
  private async scheduleSync() {
    if (navigator.onLine && this.syncQueue.length > 0) {
      try {
        await enableNetwork(db);
        await this.processSyncQueue();
        this.syncQueue = [];
      } catch (error) {
        console.error('Sync failed:', error);
        await disableNetwork(db);
      }
    }
  }
}
```

## Monitoring & Metrics

### Performance Monitoring Setup

```typescript
// Performance metrics collection
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  measureComponentRender(componentName: string) {
    return {
      start: () => performance.mark(`${componentName}-start`),
      end: () => {
        performance.mark(`${componentName}-end`);
        performance.measure(
          componentName,
          `${componentName}-start`,
          `${componentName}-end`
        );
        
        const measure = performance.getEntriesByName(componentName)[0];
        this.recordMetric({
          name: componentName,
          type: 'component-render',
          duration: measure.duration,
          timestamp: Date.now(),
        });
      },
    };
  }
  
  measureAPICall(endpoint: string) {
    const startTime = performance.now();
    
    return {
      success: () => {
        this.recordMetric({
          name: endpoint,
          type: 'api-call',
          duration: performance.now() - startTime,
          status: 'success',
          timestamp: Date.now(),
        });
      },
      error: (error: Error) => {
        this.recordMetric({
          name: endpoint,
          type: 'api-call',
          duration: performance.now() - startTime,
          status: 'error',
          error: error.message,
          timestamp: Date.now(),
        });
      },
    };
  }
  
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Send to analytics (anonymized for healthcare compliance)
    this.sendToAnalytics(this.anonymizeMetric(metric));
  }
}
```

### Real-time Performance Dashboard

```typescript
function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  
  useEffect(() => {
    const monitor = new PerformanceMonitor();
    
    // Monitor critical healthcare workflows
    const patientLoadMetric = monitor.measureComponentRender('PatientList');
    const appointmentSaveMetric = monitor.measureAPICall('/api/appointments');
    
    // Collect browser performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => [...prev, {
            name: 'page-load',
            type: 'navigation',
            duration: navEntry.loadEventEnd - navEntry.loadEventStart,
            timestamp: Date.now(),
          }]);
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="performance-dashboard">
      <h2>Performance Metrics</h2>
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  );
}
```

## Performance Testing

### Automated Performance Tests

```typescript
// tests/performance/load-testing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load patient dashboard within performance budget', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure loading performance
    const navigationTiming = await page.evaluate(() => {
      return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
    });
    
    // Performance assertions
    expect(navigationTiming.loadEventEnd - navigationTiming.loadEventStart).toBeLessThan(3000);
    expect(navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart).toBeLessThan(1000);
  });
  
  test('should handle large patient lists efficiently', async ({ page }) => {
    await page.goto('/patients');
    
    // Simulate large dataset
    await page.evaluate(() => {
      // Mock API to return 1000+ patients
      window.mockLargeDataset = true;
    });
    
    await page.reload();
    
    // Should implement virtualization for performance
    const listContainer = page.locator('[data-testid="patient-list"]');
    await expect(listContainer).toBeVisible();
    
    // Verify only visible items are rendered
    const renderedItems = await page.locator('[data-testid="patient-item"]').count();
    expect(renderedItems).toBeLessThan(50); // Should virtualize
  });
});
```

### Memory Leak Testing

```typescript
// tests/performance/memory.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Memory Management', () => {
  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through app multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/patients');
      await page.goto('/appointments');
      await page.goto('/reports');
      await page.goto('/dashboard');
    }
    
    // Force garbage collection
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });
    
    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
  });
});
```

## Troubleshooting

### Common Performance Issues

#### Slow Initial Load
```bash
# Analyze bundle
npm run build
npx webpack-bundle-analyzer dist/stats.json

# Check for:
- Large vendor chunks
- Unoptimized images
- Unnecessary polyfills
- Missing code splitting
```

#### High Memory Usage
```typescript
// Debug memory leaks
function debugMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
    });
  }
}

// Call regularly during development
setInterval(debugMemoryUsage, 10000);
```

#### Slow Database Queries
```typescript
// Enable Firestore query profiling
import { connectFirestoreEmulator, enableNetwork } from 'firebase/firestore';

// In development
if (process.env.NODE_ENV === 'development') {
  // Monitor query performance
  enableNetwork(db).then(() => {
    console.log('Firestore connected - monitor queries in Firebase console');
  });
}
```

### Performance Optimization Checklist

#### Frontend Optimization
- [ ] React 19 compiler enabled
- [ ] Code splitting implemented
- [ ] Bundle size < 2MB
- [ ] Images optimized and lazy loaded
- [ ] Service worker configured
- [ ] Critical resources preloaded

#### Backend Optimization
- [ ] Firestore queries optimized
- [ ] Composite indexes created
- [ ] Data pagination implemented
- [ ] Offline support enabled
- [ ] API response caching

#### Monitoring
- [ ] Performance metrics collection
- [ ] Error tracking enabled
- [ ] User experience monitoring
- [ ] Performance budgets defined
- [ ] Automated performance tests

---

## Related Documentation

- [Architecture Guide](architecture.md) - System design and performance considerations
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Performance testing approach
- [Scripts Documentation](scripts.md) - Performance-related build scripts
- [Tables Guide](../TABLES_GUIDE.md) - High-performance table implementations

---

*For performance-related issues, always start with the monitoring dashboard and automated performance tests to identify bottlenecks before implementing optimizations.*