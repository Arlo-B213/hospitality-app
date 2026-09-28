import React from 'react'
import { Department, NewHireStatus, FilterOptions } from '../types/index'

interface FilterBarProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      department: e.target.value as Department | 'all',
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as NewHireStatus | 'all',
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    })
  }

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value as 'start_date' | 'completion_percent',
    })
  }

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortOrder: e.target.value as 'asc' | 'desc',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <input
            id="search"
            type="text"
            placeholder="Enter name..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Department Filter */}
        <div className="lg:col-span-1">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            id="department"
            value={filters.department}
            onChange={handleDepartmentChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Departments</option>
            <option value="FOH">Front of House</option>
            <option value="BOH">Back of House</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="lg:col-span-1">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={handleSortByChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="start_date">Start Date</option>
            <option value="completion_percent">Completion %</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="lg:col-span-1">
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder}
            onChange={handleSortOrderChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  )
}
