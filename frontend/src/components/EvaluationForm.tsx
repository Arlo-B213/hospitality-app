import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NewHire, EvaluationFormData, EvaluationTab, SkillRating, LeadershipReflection } from '../types/index'
import { fohSkills, bohSkills, softSkills, leadershipModules } from '../utils/mockData'
import { SkillRatingCard } from './SkillRatingCard'
import { SoftSkillRatingCard } from './SoftSkillRatingCard'
import { LeadershipModuleCard } from './LeadershipModuleCard'
import { TabNavigation } from './TabNavigation'
import { useAuth } from '../hooks/useAuth'
import { useEvaluationSync } from '../hooks/useSync'

interface EvaluationFormProps {
  newHire: NewHire
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ newHire }) => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { saveSkillRatings, markLeadershipComplete, isOnline } = useEvaluationSync(newHire.id, { token })
  const [activeTab, setActiveTab] = useState<EvaluationTab>('skills')
  const [formData, setFormData] = useState<EvaluationFormData>({
    newHireId: newHire.id,
    evaluatorId: user?.userId || 'evaluator-1',
    skillsRatings: [],
    softSkillsRatings: [],
    leadershipReflections: [],
    strengths: '',
    areasForImprovement: '',
    overallNotes: '',
    saveState: 'idle',
  })

  // Initialize ratings with empty SkillRating objects for FOH/BOH skills and soft skills
  // Also initialize leadership module reflections
  useEffect(() => {
    const skillsToUse = newHire.department === 'FOH' ? fohSkills : bohSkills
    const skillsRatings = skillsToUse.map((skill) => ({
      skillId: skill.id,
      rating: null,
      notes: '',
    }))

    const softSkillsRatings = softSkills.map((skill) => ({
      skillId: skill.id,
      rating: null,
      notes: '',
    }))

    const leadershipReflections = leadershipModules.map((module) => ({
      moduleId: module.id,
      completed: false,
      completedDate: undefined,
      notes: '',
    }))

    setFormData((prev) => ({
      ...prev,
      skillsRatings,
      softSkillsRatings,
      leadershipReflections,
    }))
  }, [newHire.id, newHire.department])

  // Auto-save to backend when data changes
  useEffect(() => {
    if (formData.saveState === 'saving' && token) {
      const timer = setTimeout(async () => {
        try {
          // Save skill ratings
          const skillRatingsToSave = formData.skillsRatings.filter((r) => r.rating !== null)
          const softSkillRatingsToSave = formData.softSkillsRatings.filter((r) => r.rating !== null)

          if (skillRatingsToSave.length > 0) {
            await saveSkillRatings(skillRatingsToSave)
          }
          if (softSkillRatingsToSave.length > 0) {
            await saveSkillRatings(softSkillRatingsToSave)
          }

          // Save leadership completions
          for (const reflection of formData.leadershipReflections) {
            if (reflection.completed) {
              await markLeadershipComplete(reflection.moduleId, reflection.notes)
            }
          }

          setFormData((prev) => ({
            ...prev,
            saveState: 'saved',
            lastSavedAt: new Date().toLocaleTimeString(),
          }))

          // Reset to idle after 2 seconds
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              saveState: 'idle',
            }))
          }, 2000)
        } catch (error) {
          console.error('Failed to save evaluation:', error)
          setFormData((prev) => ({
            ...prev,
            saveState: 'idle',
          }))
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [formData.saveState, token, saveSkillRatings, markLeadershipComplete])

  // Trigger save when data changes
  useEffect(() => {
    if (formData.saveState === 'idle') {
      const timer = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          saveState: 'saving',
        }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.skillsRatings, formData.softSkillsRatings, formData.leadershipReflections, formData.strengths, formData.areasForImprovement, formData.overallNotes])

  // For now, allow editing if user has manager or asst_manager role
  // Mock users for testing: if no real auth, default to manager for editing capability
  const isEditable =
    (user?.role === 'manager' || user?.role === 'asst_manager') ||
    user?.role === undefined // Allow by default for development/testing

  const handleRatingChange = (index: number, rating: SkillRating) => {
    const newRatings = [...formData.skillsRatings]
    newRatings[index] = rating
    setFormData((prev) => ({
      ...prev,
      skillsRatings: newRatings,
    }))
  }

  const handleSoftSkillRatingChange = (index: number, rating: SkillRating) => {
    const newRatings = [...formData.softSkillsRatings]
    newRatings[index] = rating
    setFormData((prev) => ({
      ...prev,
      softSkillsRatings: newRatings,
    }))
  }

  const handleLeadershipReflectionChange = (index: number, reflection: LeadershipReflection) => {
    const newReflections = [...formData.leadershipReflections]
    newReflections[index] = reflection
    setFormData((prev) => ({
      ...prev,
      leadershipReflections: newReflections,
    }))
  }

  const handleStrengthsChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      strengths: value,
    }))
  }

  const handleAreasChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      areasForImprovement: value,
    }))
  }

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      overallNotes: value,
    }))
  }

  const isAtLeastOneSkillRated = formData.skillsRatings.some((r) => r.rating !== null)

  const handleBackClick = () => {
    navigate('/')
  }

  const handleNextClick = () => {
    if (activeTab === 'skills' && !isAtLeastOneSkillRated) {
      alert('Please rate at least one skill before proceeding.')
      return
    }
    // Move to next tab
    const tabs: EvaluationTab[] = ['skills', 'soft-skills', 'leadership', 'strengths', 'areas', 'notes']
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePreviousClick = () => {
    const tabs: EvaluationTab[] = ['skills', 'soft-skills', 'leadership', 'strengths', 'areas', 'notes']
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  return (
    <div className="space-y-6">
      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            🌐 You are offline. Changes will be saved locally and synced when you reconnect.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{newHire.name}</h2>
            <p className="text-gray-600 mt-1">
              {newHire.role} • {newHire.department === 'FOH' ? 'Front of House' : 'Back of House'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formData.saveState === 'saving' && (
              <span className="text-sm text-yellow-600">💾 Saving...</span>
            )}
            {formData.saveState === 'saved' && (
              <span className="text-sm text-green-600">✓ Saved at {formData.lastSavedAt}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Technical Skills</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rate the new hire's proficiency in each technical skill area.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.skillsRatings.map((rating, index) => {
                const skillsToUse = newHire.department === 'FOH' ? fohSkills : bohSkills
                const skill = skillsToUse.find((s) => s.id === rating.skillId)
                return skill ? (
                  <SkillRatingCard
                    key={skill.id}
                    skill={skill}
                    rating={rating}
                    onRatingChange={(newRating) => handleRatingChange(index, newRating)}
                    isEditable={isEditable}
                  />
                ) : null
              })}
            </div>
            {!isAtLeastOneSkillRated && isEditable && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please rate at least one skill to proceed to the next tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Soft Skills Tab */}
        {activeTab === 'soft-skills' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Soft Skills</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rate the new hire's interpersonal and professional soft skills on a scale of 1-5.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.softSkillsRatings.map((rating, index) => {
                const skill = softSkills.find((s) => s.id === rating.skillId)
                return skill ? (
                  <SoftSkillRatingCard
                    key={skill.id}
                    skill={skill}
                    rating={rating}
                    onRatingChange={(newRating) => handleSoftSkillRatingChange(index, newRating)}
                    isEditable={isEditable}
                  />
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Leadership Tab */}
        {activeTab === 'leadership' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Leadership Modules</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track progress through the Thirty Percent Framework leadership modules. Mark modules as complete and add reflection notes.
              </p>
            </div>
            <div className="space-y-3">
              {formData.leadershipReflections.map((reflection, index) => {
                const module = leadershipModules.find((m) => m.id === reflection.moduleId)
                return module ? (
                  <LeadershipModuleCard
                    key={module.id}
                    module={module}
                    reflection={reflection}
                    onReflectionChange={(newReflection) => handleLeadershipReflectionChange(index, newReflection)}
                    isEditable={isEditable}
                  />
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Strengths Tab */}
        {activeTab === 'strengths' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Strengths</h3>
              <p className="text-sm text-gray-600 mb-4">
                Identify the new hire's strongest areas and key accomplishments.
              </p>
            </div>
            <textarea
              value={formData.strengths}
              onChange={(e) => handleStrengthsChange(e.target.value)}
              disabled={!isEditable}
              placeholder="What are this employee's key strengths and accomplishments so far?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-default"
              rows={6}
            />
          </div>
        )}

        {/* Areas for Improvement Tab */}
        {activeTab === 'areas' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Identify areas where the employee can develop and improve.
              </p>
            </div>
            <textarea
              value={formData.areasForImprovement}
              onChange={(e) => handleAreasChange(e.target.value)}
              disabled={!isEditable}
              placeholder="What areas would benefit from further development or improvement?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-default"
              rows={6}
            />
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Notes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add any additional observations or recommendations for this employee.
              </p>
            </div>
            <textarea
              value={formData.overallNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              disabled={!isEditable}
              placeholder="Add any final notes, recommendations, or areas for improvement..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-default"
              rows={6}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
        <button
          onClick={handleBackClick}
          className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="flex gap-3">
          <button
            onClick={handlePreviousClick}
            disabled={activeTab === 'skills'}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-default"
          >
            ← Previous
          </button>
          <button
            onClick={handleNextClick}
            disabled={activeTab === 'notes'}
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-default"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Read-Only Notice */}
      {!isEditable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ You do not have permission to edit this evaluation. Contact a manager to make changes.
          </p>
        </div>
      )}
    </div>
  )
}
