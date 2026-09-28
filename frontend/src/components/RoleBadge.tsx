import React from 'react'
import { UserRole } from '../types/index'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = (userRole: UserRole): { label: string; bgColor: string; textColor: string; icon: string } => {
    switch (userRole) {
      case 'admin':
        return {
          label: 'Admin',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: '👑',
        }
      case 'manager':
        return {
          label: 'Manager',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: '💼',
        }
      case 'lead':
        return {
          label: 'Lead',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: '⭐',
        }
      case 'staff':
        return {
          label: 'Staff',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: '👤',
        }
      case 'new_hire':
        return {
          label: 'New Hire',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          icon: '🎯',
        }
      case 'asst_manager':
        return {
          label: 'Assistant Manager',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-800',
          icon: '📋',
        }
      default:
        return {
          label: 'User',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '👤',
        }
    }
  }

  const config = getRoleConfig(role)

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
