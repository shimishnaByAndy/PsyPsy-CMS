import React from 'react'
import {
  Input,
  Button,
  Card,
  CardBody,
  Chip,
  Badge,
  Select,
  SelectItem,
  DatePicker,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Divider,
  Spinner
} from '@/components/ui/nextui'
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  MapPin,
  Clock,
  FileText,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  RotateCcw,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'checkbox' | 'radio' | 'number'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  multiple?: boolean
  containsPHI?: boolean
}

interface FilterValue {
  [key: string]: any
}

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  description?: string
  metadata?: Record<string, any>
  avatar?: string
  badges?: Array<{
    label: string
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
    variant?: 'solid' | 'bordered' | 'flat'
  }>
  containsPHI?: boolean
  lastAccessed?: string
  relevanceScore?: number
}

interface AdvancedSearchProps {
  /**
   * Search configuration
   */
  searchPlaceholder?: string
  searchableFields?: string[]
  filters?: SearchFilter[]
  savedSearches?: Array<{
    id: string
    name: string
    filters: FilterValue
    query: string
  }>

  /**
   * Results configuration
   */
  results?: SearchResult[]
  isLoading?: boolean
  hasMore?: boolean
  totalResults?: number

  /**
   * Features
   */
  enableAdvancedFilters?: boolean
  enableSavedSearches?: boolean
  enableExport?: boolean
  enableRecentSearches?: boolean
  enableAutoSuggest?: boolean

  /**
   * PHI and compliance
   */
  auditSearches?: boolean
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'
  userAccessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'

  /**
   * Event handlers
   */
  onSearch?: (query: string, filters: FilterValue) => void
  onFilterChange?: (filters: FilterValue) => void
  onResultClick?: (result: SearchResult) => void
  onSaveSearch?: (name: string, query: string, filters: FilterValue) => void
  onLoadSearch?: (searchId: string) => void
  onExport?: (format: 'csv' | 'excel') => void
  onLoadMore?: () => void

  /**
   * Styling
   */
  className?: string
  resultsHeight?: number
}

interface QuickSearchProps {
  queries: Array<{
    label: string
    query: string
    icon?: React.ReactNode
    count?: number
  }>
  onQuickSearch: (query: string) => void
  className?: string
}

interface SmartSuggestionsProps {
  suggestions: Array<{
    type: 'patient' | 'appointment' | 'document' | 'professional'
    label: string
    sublabel?: string
    icon?: React.ReactNode
    action: () => void
  }>
  isLoading?: boolean
  className?: string
}

/**
 * AdvancedSearch - Comprehensive search component for healthcare applications
 */
export function AdvancedSearch({
  searchPlaceholder = 'Search patients, appointments, medical records...',
  filters = [],
  savedSearches = [],
  results = [],
  isLoading = false,
  hasMore = false,
  totalResults = 0,
  enableAdvancedFilters = true,
  enableSavedSearches = true,
  enableExport = true,
  enableRecentSearches = true,
  enableAutoSuggest = true,
  auditSearches = true,
  complianceLevel,
  userAccessLevel = 'public',
  onSearch,
  onFilterChange,
  onResultClick,
  onSaveSearch,
  onLoadSearch,
  onExport,
  onLoadMore,
  className,
  resultsHeight = 400
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeFilters, setActiveFilters] = React.useState<FilterValue>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])

  const { isOpen: isSaveSearchOpen, onOpen: openSaveSearch, onClose: closeSaveSearch } = useDisclosure()
  const { isOpen: isFiltersOpen, onOpen: openFilters, onClose: closeFilters } = useDisclosure()

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() || Object.keys(activeFilters).length > 0) {
      // Add to recent searches
      if (searchQuery.trim()) {
        setRecentSearches(prev => {
          const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5)
          localStorage.setItem('healthcare-recent-searches', JSON.stringify(updated))
          return updated
        })
      }

      // Audit search action
      if (auditSearches && complianceLevel) {
        console.log('[Healthcare Audit] Search Performed:', {
          query: searchQuery,
          filters: activeFilters,
          complianceLevel,
          userAccessLevel,
          timestamp: new Date().toISOString(),
        })
      }

      onSearch?.(searchQuery, activeFilters)
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
    onFilterChange?.({})
  }

  // Get filter count
  const activeFilterCount = Object.keys(activeFilters).length

  // Render filter input
  const renderFilterInput = (filter: SearchFilter) => {
    const value = activeFilters[filter.key]

    switch (filter.type) {
      case 'text':
        return (
          <Input
            label={filter.label}
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            size="sm"
            variant="bordered"
          />
        )

      case 'select':
        return (
          <Select
            label={filter.label}
            placeholder={filter.placeholder}
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => {
              const selectedValue = Array.from(keys)[0] as string
              handleFilterChange(filter.key, selectedValue || null)
            }}
            size="sm"
            variant="bordered"
          >
            {filter.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        )

      case 'checkbox':
        return (
          <CheckboxGroup
            label={filter.label}
            value={value || []}
            onValueChange={(values) => handleFilterChange(filter.key, values)}
            size="sm"
          >
            {filter.options?.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        )

      case 'radio':
        return (
          <RadioGroup
            label={filter.label}
            value={value || ''}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
            size="sm"
          >
            {filter.options?.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        )

      case 'date':
        return (
          <DatePicker
            label={filter.label}
            value={value}
            onChange={(date) => handleFilterChange(filter.key, date)}
            size="sm"
            variant="bordered"
          />
        )

      default:
        return null
    }
  }

  // Load recent searches from localStorage
  React.useEffect(() => {
    if (enableRecentSearches) {
      const stored = localStorage.getItem('healthcare-recent-searches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    }
  }, [enableRecentSearches])

  return (
    <div className={cn('healthcare-advanced-search', className)}>
      {/* Main Search Bar */}
      <Card>
        <CardBody className="p-4">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              startContent={<Search className="h-4 w-4 text-gray-600" />}
              className="flex-1"
              size="lg"
            />

            <Button
              color="primary"
              onClick={handleSearch}
              isLoading={isLoading}
              size="lg"
            >
              Search
            </Button>

            {enableAdvancedFilters && (
              <Button
                variant="bordered"
                onClick={openFilters}
                size="lg"
                startContent={<Filter className="h-4 w-4" />}
                endContent={activeFilterCount > 0 && (
                  <Badge color="primary" content={activeFilterCount} size="sm" />
                )}
              >
                Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(activeFilters).map(([key, value]) => {
                const filter = filters.find(f => f.key === key)
                if (!filter || !value) return null

                return (
                  <Chip
                    key={key}
                    onClose={() => handleFilterChange(key, null)}
                    variant="flat"
                    color="primary"
                    size="sm"
                  >
                    {filter.label}: {Array.isArray(value) ? value.join(', ') : value.toString()}
                  </Chip>
                )
              })}
              <Button
                size="sm"
                variant="light"
                onClick={clearFilters}
                startContent={<X className="h-3 w-3" />}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {enableSavedSearches && savedSearches.length > 0 && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="light" size="sm">
                      Saved Searches
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    {savedSearches.map((search) => (
                      <DropdownItem
                        key={search.id}
                        onClick={() => onLoadSearch?.(search.id)}
                      >
                        {search.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}

              {enableSavedSearches && (searchQuery || activeFilterCount > 0) && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={openSaveSearch}
                  startContent={<Save className="h-3 w-3" />}
                >
                  Save Search
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {enableExport && results.length > 0 && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="light" size="sm" startContent={<Download className="h-3 w-3" />}>
                      Export
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem onClick={() => onExport?.('csv')}>
                      Export as CSV
                    </DropdownItem>
                    <DropdownItem onClick={() => onExport?.('excel')}>
                      Export as Excel
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}

              <Button
                variant="light"
                size="sm"
                onClick={clearFilters}
                startContent={<RotateCcw className="h-3 w-3" />}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      <Card className="mt-4">
        <CardBody className="p-0">
          {/* Results Header */}
          <div className="p-4 border-b border-default-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-default-600">
                {isLoading ? 'Searching...' : `${totalResults} results found`}
              </span>
              {totalResults > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Sorted by relevance
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div style={{ height: resultsHeight }} className="overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-16" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-default-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery || activeFilterCount > 0
                    ? 'No results found. Try adjusting your search criteria.'
                    : 'Enter a search query to find healthcare records.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-default-200">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 hover:bg-default-50 cursor-pointer transition-colors"
                    onClick={() => onResultClick?.(result)}
                  >
                    <div className="flex items-start space-x-3">
                      {result.avatar && (
                        <div className="w-10 h-10 rounded-full bg-default-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-default-900 truncate">
                            {result.title}
                          </h3>
                          {result.containsPHI && (
                            <Badge color="warning" variant="flat" size="sm">
                              PHI
                            </Badge>
                          )}
                          {result.badges?.map((badge, index) => (
                            <Chip
                              key={index}
                              color={badge.color}
                              variant={badge.variant}
                              size="sm"
                            >
                              {badge.label}
                            </Chip>
                          ))}
                        </div>

                        {result.subtitle && (
                          <p className="text-xs text-default-600 mb-1">
                            {result.subtitle}
                          </p>
                        )}

                        {result.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                        )}

                        {result.lastAccessed && (
                          <p className="text-xs text-gray-600 mt-1">
                            Last accessed: {result.lastAccessed}
                          </p>
                        )}
                      </div>

                      {result.relevanceScore && (
                        <div className="text-xs text-gray-600">
                          {Math.round(result.relevanceScore * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && !isLoading && (
              <div className="p-4 border-t border-default-200 text-center">
                <Button
                  variant="light"
                  onClick={onLoadMore}
                >
                  Load More Results
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Advanced Filters Modal */}
      <Modal isOpen={isFiltersOpen} onClose={closeFilters} size="2xl">
        <ModalContent>
          <ModalHeader>Advanced Filters</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={clearFilters}>
              Clear All
            </Button>
            <Button color="primary" onClick={() => {
              closeFilters()
              handleSearch()
            }}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Save Search Modal */}
      <Modal isOpen={isSaveSearchOpen} onClose={closeSaveSearch}>
        <ModalContent>
          <ModalHeader>Save Search</ModalHeader>
          <ModalBody>
            <Input
              label="Search Name"
              placeholder="Enter a name for this search"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={closeSaveSearch}>
              Cancel
            </Button>
            <Button color="primary" onClick={() => {
              // Handle save logic here
              closeSaveSearch()
            }}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

/**
 * QuickSearch - Quick search shortcuts for common queries
 */
export function QuickSearch({
  queries,
  onQuickSearch,
  className
}: QuickSearchProps) {
  return (
    <Card className={className}>
      <CardBody className="p-4">
        <h3 className="text-sm font-medium mb-3">Quick Search</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {queries.map((query, index) => (
            <Button
              key={index}
              variant="bordered"
              size="sm"
              onClick={() => onQuickSearch(query.query)}
              startContent={query.icon}
              endContent={query.count && (
                <Chip size="sm" color="primary" variant="flat">
                  {query.count}
                </Chip>
              )}
              className="justify-start"
            >
              {query.label}
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * SmartSuggestions - AI-powered search suggestions
 */
export function SmartSuggestions({
  suggestions,
  isLoading = false,
  className
}: SmartSuggestionsProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Spinner size="sm" />
            <span className="text-sm">Getting suggestions...</span>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-full h-8" />
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <Card className={className}>
      <CardBody className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Smart Suggestions
        </h3>
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="light"
              size="sm"
              onClick={suggestion.action}
              startContent={suggestion.icon}
              className="w-full justify-start h-auto p-2"
            >
              <div className="text-left">
                <div className="text-sm font-medium">{suggestion.label}</div>
                {suggestion.sublabel && (
                  <div className="text-xs text-gray-600">
                    {suggestion.sublabel}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}