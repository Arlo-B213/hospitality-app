import React from 'react'
import { SkillProficiency } from '../types/index'

interface SkillHeatmapProps {
  skills: SkillProficiency[]
}

const getColorClass = (proficiency: number): string => {
  if (proficiency >= 4.5) return 'bg-blue-500 dark:bg-blue-600'
  if (proficiency >= 3.5) return 'bg-green-500 dark:bg-green-600'
  if (proficiency >= 2.5) return 'bg-yellow-500 dark:bg-yellow-600'
  return 'bg-red-500 dark:bg-red-600'
}

const getLabel = (proficiency: number): string => {
  if (proficiency >= 4.5) return 'Expert'
  if (proficiency >= 3.5) return 'Proficient'
  if (proficiency >= 2.5) return 'Developing'
  return 'Beginner'
}

/**
 * SkillHeatmap component with React.memo optimization
 * Prevents re-renders when props haven't changed
 */
export const SkillHeatmap = React.memo<SkillHeatmapProps>(({ skills }) => {
  // Create a grid of skills (responsive: 2 cols on mobile, 3 on tablet, 4 on desktop)
  const gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skill Proficiency Heatmap</h3>

      <div className={`grid ${gridColsClass} gap-3`}>
        {skills.map((skill) => (
          <div
            key={skill.skillId}
            className="flex flex-col items-center rounded-lg p-4 text-white shadow-md transition-transform hover:scale-105"
            title={`${skill.skillName}: ${getLabel(skill.proficiency)} (${skill.proficiency.toFixed(1)}/5)`}
          >
            <div className={`w-full h-32 rounded-lg ${getColorClass(skill.proficiency)} flex flex-col items-center justify-center p-3 text-center`}>
              <div className="text-2xl font-bold">{skill.proficiency.toFixed(1)}</div>
              <div className="text-xs font-semibold mt-1">{getLabel(skill.proficiency)}</div>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center leading-tight line-clamp-2">
              {skill.skillName}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Proficiency Legend:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500 dark:bg-red-600"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Beginner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500 dark:bg-yellow-600"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Developing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500 dark:bg-green-600"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Proficient</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 dark:bg-blue-600"></div>
            <span className="text-xs text-gray-700 dark:text-gray-300">Expert</span>
          </div>
        </div>
      </div>
    </div>
  )
})
