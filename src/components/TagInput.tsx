'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  suggestions?: string[]
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  tagColor?: string
}

export default function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add item...',
  maxTags,
  disabled = false,
  tagColor = 'accent-teal'
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (input) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(suggestion)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions(suggestions.filter(s => !value.includes(s)))
    }
  }, [input, suggestions, value])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (
      trimmedTag && 
      !value.includes(trimmedTag) && 
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, trimmedTag])
      setInput('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const colorClasses = {
    'accent-teal': 'bg-accent-teal/20 text-accent-teal',
    'accent-purple': 'bg-accent-purple/20 text-accent-purple',
    'success': 'bg-success/20 text-success',
  }

  const tagColorClass = colorClasses[tagColor as keyof typeof colorClasses] || colorClasses['accent-teal']

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-2">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 ${tagColorClass} px-2 py-1 rounded-full text-sm`}
            >
              {tag}
              {!disabled && (
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-400 transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Input Field */}
        {!disabled && (!maxTags || value.length < maxTags) && (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder={placeholder}
              className="w-full bg-background border border-card rounded px-3 py-2 pr-8 text-white text-sm placeholder-medium focus:outline-none focus:ring-1 focus:ring-accent-teal"
            />
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-medium hover:text-white transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-card rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-background hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {maxTags && (
        <p className="text-xs text-medium mt-1">
          {value.length}/{maxTags} items added
        </p>
      )}
    </div>
  )
}