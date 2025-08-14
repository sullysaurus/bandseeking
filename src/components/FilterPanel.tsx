'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { COMMON_INSTRUMENTS, MUSIC_GENRES, EXPERIENCE_LEVELS, LOOKING_FOR_OPTIONS, BAND_ROLES } from '@/lib/constants/music'

export interface FilterOptions {
  instruments?: string[]
  genres?: string[]
  experienceLevel?: string[]
  lookingFor?: string[]
  location?: string
  availability?: 'all' | 'available' | 'not-looking'
  status?: 'all' | 'recruiting' | 'complete' | 'on_hold'
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  type: 'musicians' | 'bands'
}

export default function FilterPanel({ isOpen, onClose, filters, onFiltersChange, type }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (dropdown: string) => {
    const newOpenDropdowns = new Set(openDropdowns)
    if (newOpenDropdowns.has(dropdown)) {
      newOpenDropdowns.delete(dropdown)
    } else {
      newOpenDropdowns.add(dropdown)
    }
    setOpenDropdowns(newOpenDropdowns)
  }

  const handleArrayFilterChange = (key: keyof FilterOptions, value: string) => {
    const currentArray = (localFilters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    setLocalFilters({
      ...localFilters,
      [key]: newArray
    })
  }

  const handleSingleFilterChange = (key: keyof FilterOptions, value: string) => {
    setLocalFilters({
      ...localFilters,
      [key]: value
    })
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      instruments: [],
      genres: [],
      experienceLevel: [],
      lookingFor: [],
      location: '',
      availability: 'all',
      status: 'all'
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.instruments?.length) count++
    if (localFilters.genres?.length) count++
    if (localFilters.experienceLevel?.length) count++
    if (localFilters.lookingFor?.length) count++
    if (localFilters.location) count++
    if (localFilters.availability && localFilters.availability !== 'all') count++
    if (localFilters.status && localFilters.status !== 'all') count++
    return count
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-card w-full max-w-md h-full overflow-y-auto">
        <div className="p-6 border-b border-card">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Filter {type === 'musicians' ? 'Musicians' : 'Bands'}
            </h3>
            <button
              onClick={onClose}
              className="text-medium hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Location Filter */}
          <div>
            <label className="block text-white font-medium mb-3">Location</label>
            <input
              type="text"
              value={localFilters.location || ''}
              onChange={(e) => handleSingleFilterChange('location', e.target.value)}
              placeholder="City, State or Country"
              className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
            />
          </div>

          {/* Instruments Filter (Musicians only) */}
          {type === 'musicians' && (
            <div>
              <button
                onClick={() => toggleDropdown('instruments')}
                className="w-full flex items-center justify-between text-white font-medium mb-3 p-2 bg-background rounded-lg border border-card hover:border-accent-teal transition-colors"
              >
                <span>Instruments ({(localFilters.instruments || []).length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdowns.has('instruments') ? 'rotate-180' : ''}`} />
              </button>
              {openDropdowns.has('instruments') && (
                <div className="bg-background rounded-lg border border-card max-h-48 overflow-y-auto p-3 space-y-2">
                  {COMMON_INSTRUMENTS.map(instrument => (
                    <label key={instrument} className="flex items-center space-x-3 cursor-pointer hover:bg-card/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={(localFilters.instruments || []).includes(instrument)}
                        onChange={() => handleArrayFilterChange('instruments', instrument)}
                        className="rounded border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                      />
                      <span className="text-white text-sm">{instrument}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Genres Filter */}
          <div>
            <button
              onClick={() => toggleDropdown('genres')}
              className="w-full flex items-center justify-between text-white font-medium mb-3 p-2 bg-background rounded-lg border border-card hover:border-accent-teal transition-colors"
            >
              <span>Genres ({(localFilters.genres || []).length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openDropdowns.has('genres') ? 'rotate-180' : ''}`} />
            </button>
            {openDropdowns.has('genres') && (
              <div className="bg-background rounded-lg border border-card max-h-48 overflow-y-auto p-3 space-y-2">
                {MUSIC_GENRES.map(genre => (
                  <label key={genre} className="flex items-center space-x-3 cursor-pointer hover:bg-card/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(localFilters.genres || []).includes(genre)}
                      onChange={() => handleArrayFilterChange('genres', genre)}
                      className="rounded border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-white text-sm">{genre}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Experience Level Filter (Musicians only) */}
          {type === 'musicians' && (
            <div>
              <button
                onClick={() => toggleDropdown('experienceLevel')}
                className="w-full flex items-center justify-between text-white font-medium mb-3 p-2 bg-background rounded-lg border border-card hover:border-accent-teal transition-colors"
              >
                <span>Experience Level ({(localFilters.experienceLevel || []).length})</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdowns.has('experienceLevel') ? 'rotate-180' : ''}`} />
              </button>
              {openDropdowns.has('experienceLevel') && (
                <div className="bg-background rounded-lg border border-card p-3 space-y-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <label key={level.value} className="flex items-center space-x-3 cursor-pointer hover:bg-card/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={(localFilters.experienceLevel || []).includes(level.value)}
                        onChange={() => handleArrayFilterChange('experienceLevel', level.value)}
                        className="rounded border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                      />
                      <div>
                        <span className="text-white text-sm font-medium">{level.label}</span>
                        <p className="text-xs text-secondary">{level.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Looking For Filter */}
          <div>
            <button
              onClick={() => toggleDropdown('lookingFor')}
              className="w-full flex items-center justify-between text-white font-medium mb-3 p-2 bg-background rounded-lg border border-card hover:border-accent-teal transition-colors"
            >
              <span>
                {type === 'musicians' ? 'Looking For' : 'Looking For (Roles/Instruments)'} ({(localFilters.lookingFor || []).length})
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openDropdowns.has('lookingFor') ? 'rotate-180' : ''}`} />
            </button>
            {openDropdowns.has('lookingFor') && (
              <div className="bg-background rounded-lg border border-card max-h-48 overflow-y-auto p-3 space-y-2">
                {(type === 'musicians' ? LOOKING_FOR_OPTIONS : BAND_ROLES).map(option => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-card/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={(localFilters.lookingFor || []).includes(option)}
                      onChange={() => handleArrayFilterChange('lookingFor', option)}
                      className="rounded border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-offset-0"
                    />
                    <span className="text-white text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Availability Filter (Musicians only) */}
          {type === 'musicians' && (
            <div>
              <label className="block text-white font-medium mb-3">Availability</label>
              <select
                value={localFilters.availability || 'all'}
                onChange={(e) => handleSingleFilterChange('availability', e.target.value)}
                className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
              >
                <option value="all">All Musicians</option>
                <option value="available">Available Now</option>
                <option value="not-looking">Not Currently Looking</option>
              </select>
            </div>
          )}

          {/* Status Filter (Bands only) */}
          {type === 'bands' && (
            <div>
              <label className="block text-white font-medium mb-3">Band Status</label>
              <select
                value={localFilters.status || 'all'}
                onChange={(e) => handleSingleFilterChange('status', e.target.value)}
                className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
              >
                <option value="all">All Bands</option>
                <option value="recruiting">Looking for Members</option>
                <option value="complete">Complete Lineup</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          )}
        </div>

        <div className="border-t border-card p-6">
          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="flex-1 bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Apply Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </button>
            <button
              onClick={clearFilters}
              className="bg-card hover:bg-opacity-80 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}