import React, { useState, useMemo } from 'react'
import { ModernProfessionalCard } from '@/components/healthcare/ModernProfessionalCard'
import { Professional } from '@/types/professional'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Grid3X3,
  LayoutGrid,
  List,
  Layers,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react'

export type GridLayout = 'list' | 'grid' | 'bento' | 'masonry' | 'magazine'

interface ProfessionalGridProps {
  professionals: Professional[]
  layout?: GridLayout
  onLayoutChange?: (layout: GridLayout) => void
  onProfessionalAction?: (professional: Professional, action: string) => void
  className?: string
  showLayoutControls?: boolean
  enableSwipe?: boolean
  prioritizeAvailable?: boolean
  showFeatured?: boolean
}

// Layout configurations
const layoutConfigs = {
  list: {
    containerClass: 'space-y-4',
    cardClass: 'w-full',
    variant: 'compact' as const
  },
  grid: {
    containerClass: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    cardClass: '',
    variant: 'default' as const
  },
  bento: {
    containerClass: 'bento-grid',
    cardClass: '',
    variant: 'default' as const
  },
  masonry: {
    containerClass: 'masonry-grid',
    cardClass: '',
    variant: 'default' as const
  },
  magazine: {
    containerClass: 'magazine-grid',
    cardClass: '',
    variant: 'featured' as const
  }
}

// Bento grid pattern generator
const generateBentoPattern = (professionals: Professional[]) => {
  const patterns = [
    'col-span-2 row-span-2', // Large featured card
    'col-span-1 row-span-1', // Normal card
    'col-span-1 row-span-1', // Normal card
    'col-span-1 row-span-2', // Tall card
    'col-span-2 row-span-1', // Wide card
    'col-span-1 row-span-1', // Normal card
  ]

  return professionals.map((prof, index) => {
    const patternIndex = index % patterns.length
    const isSpecial = patternIndex === 0 || patternIndex === 3 || patternIndex === 4

    return {
      professional: prof,
      gridClass: patterns[patternIndex],
      variant: isSpecial ? 'featured' : 'default',
      showStats: isSpecial
    }
  })
}

// Magazine layout generator
const generateMagazineLayout = (professionals: Professional[]) => {
  return professionals.map((prof, index) => {
    if (index === 0) {
      return {
        professional: prof,
        gridClass: 'col-span-2 row-span-2',
        variant: 'featured',
        showStats: true
      }
    }

    const isHighlight = (index - 1) % 6 === 0
    return {
      professional: prof,
      gridClass: isHighlight ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1',
      variant: isHighlight ? 'featured' : 'default',
      showStats: isHighlight
    }
  })
}

export function ProfessionalGrid({
  professionals,
  layout = 'grid',
  onLayoutChange,
  onProfessionalAction,
  className,
  showLayoutControls = true,
  enableSwipe = true,
  prioritizeAvailable = true,
  showFeatured = true
}: ProfessionalGridProps) {
  const [currentLayout, setCurrentLayout] = useState<GridLayout>(layout)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'availability' | 'experience'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Sort and filter professionals
  const sortedProfessionals = useMemo(() => {
    let sorted = [...professionals]

    // Prioritize available professionals if enabled
    if (prioritizeAvailable) {
      sorted = sorted.sort((a, b) => {
        const aAvailable = a.status === 'active' ? 1 : 0
        const bAvailable = b.status === 'active' ? 1 : 0
        return bAvailable - aAvailable
      })
    }

    // Apply sorting
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          const aName = `${a.profile?.firstName} ${a.profile?.lastName}`
          const bName = `${b.profile?.firstName} ${b.profile?.lastName}`
          comparison = aName.localeCompare(bName)
          break
        case 'rating':
          comparison = (a.rating?.averageRating || 0) - (b.rating?.averageRating || 0)
          break
        case 'experience':
          const aExp = Math.max(...(a.expertises?.map(e => e.experience) || [0]))
          const bExp = Math.max(...(b.expertises?.map(e => e.experience) || [0]))
          comparison = aExp - bExp
          break
        case 'availability':
          comparison = (a.availability?.length || 0) - (b.availability?.length || 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [professionals, sortBy, sortOrder, prioritizeAvailable])

  // Generate layout-specific data
  const layoutData = useMemo(() => {
    switch (currentLayout) {
      case 'bento':
        return generateBentoPattern(sortedProfessionals)
      case 'magazine':
        return generateMagazineLayout(sortedProfessionals)
      default:
        return sortedProfessionals.map(prof => ({
          professional: prof,
          gridClass: '',
          variant: layoutConfigs[currentLayout].variant,
          showStats: true
        }))
    }
  }, [sortedProfessionals, currentLayout])

  const handleLayoutChange = (newLayout: GridLayout) => {
    setCurrentLayout(newLayout)
    onLayoutChange?.(newLayout)
  }

  const handleProfessionalAction = (professional: Professional, action: string) => {
    onProfessionalAction?.(professional, action)
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const layoutIcons = {
    list: List,
    grid: Grid3X3,
    bento: LayoutGrid,
    masonry: Layers,
    magazine: MoreHorizontal
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Layout Controls */}
      {showLayoutControls && (
        <div
          className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
          role="toolbar"
          aria-label="Professional grid layout controls"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300" id="layout-group-label">
              Layout:
            </span>
            <div
              className="flex items-center space-x-1"
              role="group"
              aria-labelledby="layout-group-label"
            >
              {Object.entries(layoutIcons).map(([layoutKey, Icon]) => (
                <Button
                  key={layoutKey}
                  variant={currentLayout === layoutKey ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleLayoutChange(layoutKey as GridLayout)}
                  className="w-8 h-8 p-0"
                  aria-label={`Switch to ${layoutKey} layout`}
                  aria-pressed={currentLayout === layoutKey}
                >
                  <Icon className="w-4 h-4" />
                  <span className="sr-only">{layoutKey} layout</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort professionals by"
              >
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="availability">Availability</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSort}
                className="w-8 h-8 p-0"
                aria-label={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}. Click to toggle.`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                <span className="sr-only">
                  {sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
                </span>
              </Button>
            </div>

            <Badge
              variant="outline"
              className="text-xs"
              role="status"
              aria-label={`Showing ${professionals.length} professionals`}
            >
              {professionals.length} professionals
            </Badge>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div
        className={cn(
          layoutConfigs[currentLayout].containerClass,
          // Custom CSS classes for complex layouts
          currentLayout === 'bento' && 'grid grid-cols-4 auto-rows-min gap-4',
          currentLayout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6',
          currentLayout === 'magazine' && 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-min gap-6'
        )}
        role="grid"
        aria-label={`Professionals displayed in ${currentLayout} layout`}
        aria-rowcount={layoutData.length}
      >
        {layoutData.map(({ professional, gridClass, variant, showStats }, index) => (
          <div
            key={professional.objectId}
            className={cn(
              layoutConfigs[currentLayout].cardClass,
              gridClass,
              currentLayout === 'masonry' && 'break-inside-avoid mb-6'
            )}
            role="gridcell"
            aria-posinset={index + 1}
            aria-setsize={layoutData.length}
          >
            <ModernProfessionalCard
              professional={professional}
              variant={variant}
              showStats={showStats}
              enableSwipe={enableSwipe}
              onViewProfile={(prof) => handleProfessionalAction(prof, 'view')}
              onScheduleWith={(prof) => handleProfessionalAction(prof, 'schedule')}
              onSendMessage={(prof) => handleProfessionalAction(prof, 'message')}
              onAddToFavorites={(prof) => handleProfessionalAction(prof, 'favorite')}
              onShare={(prof) => handleProfessionalAction(prof, 'share')}
              className={cn(
                'h-full',
                // Animation delays for staggered entrance
                'animate-in fade-in-50 slide-in-from-bottom-4',
                `animation-delay-${(index % 6) * 100}`
              )}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {professionals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No professionals found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Try adjusting your search or filter criteria to find the professionals you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

// CSS for custom layouts (to be added to global styles)
export const ProfessionalGridStyles = `
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 1rem;
  }

  .masonry-grid {
    column-count: 1;
    column-gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .masonry-grid {
      column-count: 2;
    }
  }

  @media (min-width: 1024px) {
    .masonry-grid {
      column-count: 3;
    }
  }

  @media (min-width: 1280px) {
    .masonry-grid {
      column-count: 4;
    }
  }

  .magazine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: minmax(200px, auto);
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .magazine-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .magazine-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Animation delays */
  .animation-delay-0 { animation-delay: 0ms; }
  .animation-delay-100 { animation-delay: 100ms; }
  .animation-delay-200 { animation-delay: 200ms; }
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-400 { animation-delay: 400ms; }
  .animation-delay-500 { animation-delay: 500ms; }
`