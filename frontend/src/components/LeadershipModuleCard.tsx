import React, { useState } from 'react'
import { LeadershipModule, LeadershipReflection } from '../types/index'

interface LeadershipModuleCardProps {
  module: LeadershipModule
  reflection: LeadershipReflection
  onReflectionChange: (reflection: LeadershipReflection) => void
  isEditable: boolean
}

export const LeadershipModuleCard: React.FC<LeadershipModuleCardProps> = ({
  module,
  reflection,
  onReflectionChange,
  isEditable,
}) => {
  const [showNotes, setShowNotes] = useState(!!reflection.notes)

  const handleCompletionToggle = () => {
    if (!isEditable) return

    const newCompleted = !reflection.completed
    const completedDate = newCompleted ? new Date().toISOString().split('T')[0] : undefined

    onReflectionChange({
      ...reflection,
      completed: newCompleted,
      completedDate,
    })
  }

  const handleNotesChange = (notes: string) => {
    onReflectionChange({
      ...reflection,
      notes,
    })
  }

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      reflection.completed
        ? 'border-green-200 bg-green-50 hover:shadow-md'
        : 'border-gray-200 bg-white hover:shadow-md'
    }`}>
      {/* Module Header */}
      <div className="mb-3">
        <div className="flex items-start gap-3">
          {/* Completion Checkbox */}
          <input
            type="checkbox"
            checked={reflection.completed}
            onChange={handleCompletionToggle}
            disabled={!isEditable}
            className={`mt-1 w-5 h-5 rounded cursor-pointer accent-green-600 ${
              !isEditable ? 'opacity-50 cursor-default' : ''
            }`}
            aria-label={`Mark ${module.name} as complete`}
          />

          {/* Module Info */}
          <div className="flex-1">
            <h4 className={`font-semibold ${
              reflection.completed ? 'text-green-900 line-through' : 'text-gray-900'
            }`}>
              {module.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{module.description}</p>
            <p className="text-xs text-gray-400 mt-1">Days {module.days}</p>
          </div>
        </div>
      </div>

      {/* Completion Date */}
      {reflection.completedDate && (
        <div className="mb-3 pb-3 border-b border-green-200">
          <p className="text-xs text-green-700">
            ✓ Completed on {new Date(reflection.completedDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Reflection Notes Section */}
      <div>
        {showNotes ? (
          <>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Reflection Notes
            </label>
            <textarea
              value={reflection.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              disabled={!isEditable}
              placeholder="Add reflection notes about this module..."
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-default disabled:bg-gray-50"
              rows={3}
            />
          </>
        ) : (
          <button
            onClick={() => setShowNotes(true)}
            disabled={!isEditable}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-default"
          >
            + Add reflection notes
          </button>
        )}
      </div>
    </div>
  )
}
