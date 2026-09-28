import React from 'react'
import { EvaluationTab } from '../types/index'

interface TabNavigationProps {
  activeTab: EvaluationTab
  onTabChange: (tab: EvaluationTab) => void
}

const tabs: { id: EvaluationTab; label: string; icon: string }[] = [
  { id: 'skills', label: 'Skills', icon: '📋' },
  { id: 'soft-skills', label: 'Soft Skills', icon: '🤝' },
  { id: 'leadership', label: 'Leadership', icon: '👥' },
  { id: 'strengths', label: 'Strengths', icon: '⭐' },
  { id: 'areas', label: 'Areas for Improvement', icon: '📈' },
  { id: 'notes', label: 'Notes', icon: '📝' },
]

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab)

  return (
    <div className="border-b border-gray-200 bg-white overflow-x-auto">
      <div className="flex min-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            title={tab.label}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Progress Indicator */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
        Tab {currentTabIndex + 1} of {tabs.length}
      </div>
    </div>
  )
}
