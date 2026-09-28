import React from 'react'
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RadarChartProps {
  technicalScore: number
  softSkillScore: number
  leadershipScore: number
}

export const RadarChart: React.FC<RadarChartProps> = ({
  technicalScore,
  softSkillScore,
  leadershipScore,
}) => {
  const data = [
    {
      category: 'Technical Skills',
      score: Math.round(technicalScore * 100) / 100,
      fullMark: 5,
    },
    {
      category: 'Soft Skills',
      score: Math.round(softSkillScore * 100) / 100,
      fullMark: 5,
    },
    {
      category: 'Leadership',
      score: Math.round(leadershipScore * 100) / 100,
      fullMark: 5,
    },
  ]

  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Competency Radar Chart
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Score (0-5)', angle: 90, position: 'insideBottomLeft', offset: 10 }}
          />
          <Radar
            name="User Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            verticalAlign="bottom"
            height={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
            }}
            formatter={(value: any) => `${value}/5`}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {technicalScore.toFixed(1)}
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Technical</div>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {softSkillScore.toFixed(1)}
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Soft Skills</div>
        </div>
        <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {leadershipScore.toFixed(1)}
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Leadership</div>
        </div>
      </div>
    </div>
  )
}
