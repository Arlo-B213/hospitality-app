import React, { useState } from 'react'
import { SoftSkill, SkillRating } from '../types/index'

interface SoftSkillRatingCardProps {
  skill: SoftSkill
  rating: SkillRating
  onRatingChange: (rating: SkillRating) => void
  isEditable: boolean
}

export const SoftSkillRatingCard: React.FC<SoftSkillRatingCardProps> = ({
  skill,
  rating,
  onRatingChange,
  isEditable,
}) => {
  const [showNotes, setShowNotes] = useState(!!rating.notes)

  const handleRating = (value: number) => {
    if (!isEditable) return
    const newRating = rating.rating === value ? null : value
    onRatingChange({
      ...rating,
      rating: newRating,
    })
  }

  const handleNotesChange = (notes: string) => {
    onRatingChange({
      ...rating,
      notes,
    })
  }

  const StarRating = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRating(value)}
            disabled={!isEditable}
            className={`text-2xl transition-transform ${
              rating.rating && rating.rating >= value
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            } ${
              isEditable
                ? 'cursor-pointer hover:scale-110'
                : 'cursor-default'
            } disabled:opacity-50`}
            title={`Rate ${value} star${value !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Skill Header */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900">{skill.name}</h4>
        <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
      </div>

      {/* Rating Section */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Rating</span>
          {rating.rating && (
            <span className="text-xs font-semibold text-gray-700">
              {rating.rating}/5
            </span>
          )}
        </div>
        <StarRating />
      </div>

      {/* Notes Section */}
      <div>
        {showNotes ? (
          <>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Optional Notes
            </label>
            <textarea
              value={rating.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              disabled={!isEditable}
              placeholder="Add notes about this skill..."
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-default"
              rows={2}
            />
          </>
        ) : (
          <button
            onClick={() => setShowNotes(true)}
            disabled={!isEditable}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-default"
          >
            + Add notes
          </button>
        )}
      </div>
    </div>
  )
}
