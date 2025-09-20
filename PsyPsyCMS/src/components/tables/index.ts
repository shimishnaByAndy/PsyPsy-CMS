/**
 * Table Components Export - PsyPsy CMS Tables
 *
 * Comprehensive table system with:
 * - TanStack Table v8 with advanced features
 * - Server-side filtering, sorting, pagination
 * - PIPEDA + Quebec Law 25 compliance
 * - Export functionality (CSV, Excel, JSON)
 * - Responsive design
 * - Type-safe implementations
 */

// Base table component
export { DataTable } from './DataTable'
export type { DataTableProps, TableFilters, TableMeta } from './DataTable'

// Specialized table implementations
export { UsersTable } from './UsersTable'
export { ProfessionalsTable } from './ProfessionalsTable'
export { AppointmentsTable } from './AppointmentsTable'

// Re-export hooks for convenience
export {
  useServerSideTableQuery,
  useUsersTableQuery,
  useProfessionalsTableQuery,
  useAppointmentsTableQuery,
  useOffersTableQuery,
  useNotificationsTableQuery,
  useTableMutation,
  useBulkTableMutation,
} from '@/hooks/useTableQuery'

export type { ServerSideTableParams, ServerSideTableResult } from '@/hooks/useTableQuery'