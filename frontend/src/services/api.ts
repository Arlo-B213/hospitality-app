/**
 * API Client - Connects to backend endpoints
 * All calls are parameterized to prevent SQL injection
 * Uses JWT token from AuthContext for authorization
 */

import { NewHire, AnalyticsResponse, SkillRating } from '../types/index'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

export interface ApiErrorResponse {
  error: string
  message: string
  timestamp: string
}

export interface ApiClient {
  // New Hire endpoints
  getNewHires(token: string, filters?: { department?: string }): Promise<NewHire[]>
  getNewHire(token: string, id: string): Promise<NewHire>

  // Evaluation endpoints
  getEvaluations(token: string, newHireId: string): Promise<any>
  saveSkillRatings(token: string, newHireId: string, ratings: SkillRating[]): Promise<any>
  markLeadershipComplete(
    token: string,
    newHireId: string,
    moduleId: string,
    notes?: string
  ): Promise<any>

  // Analytics endpoint
  getAnalytics(token: string, newHireId: string): Promise<AnalyticsResponse>

  // Auth endpoint
  changePassword(token: string, oldPassword: string, newPassword: string): Promise<any>
}

class ApiClientImpl implements ApiClient {
  /**
   * Helper to make API calls with proper headers
   */
  private async call<T>(
    endpoint: string,
    method: string = 'GET',
    token: string,
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

    if (!response.ok) {
      const errorData = (await response.json()) as ApiErrorResponse
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  // --- New Hire Endpoints ---

  async getNewHires(token: string, filters?: { department?: string }): Promise<NewHire[]> {
    let endpoint = '/new-hires'

    if (filters?.department && filters.department !== 'all') {
      endpoint += `?department=${encodeURIComponent(filters.department)}`
    }

    return this.call<NewHire[]>(endpoint, 'GET', token)
  }

  async getNewHire(token: string, id: string): Promise<NewHire> {
    // Parameterize ID to prevent injection
    const endpoint = `/new-hires/${encodeURIComponent(id)}`
    return this.call<NewHire>(endpoint, 'GET', token)
  }

  // --- Evaluation Endpoints ---

  async getEvaluations(token: string, newHireId: string): Promise<any> {
    const endpoint = `/evaluations/${encodeURIComponent(newHireId)}`
    return this.call<any>(endpoint, 'GET', token)
  }

  async saveSkillRatings(token: string, newHireId: string, ratings: SkillRating[]): Promise<any> {
    // Parameterize each skill rating
    const body = {
      new_hire_id: newHireId,
      ratings: ratings.map((rating) => ({
        skill_id: rating.skillId,
        skill_type: 'technical',
        rating: rating.rating,
        comments: rating.notes,
      })),
    }

    return this.call<any>('/evaluations/skills', 'POST', token, body)
  }

  async markLeadershipComplete(
    token: string,
    newHireId: string,
    moduleId: string,
    notes?: string
  ): Promise<any> {
    const endpoint = `/evaluations/leadership/${encodeURIComponent(newHireId)}/${encodeURIComponent(
      moduleId
    )}`

    const body = {
      completed: true,
      notes: notes || '',
    }

    return this.call<any>(endpoint, 'POST', token, body)
  }

  // --- Analytics Endpoint ---

  async getAnalytics(token: string, newHireId: string): Promise<AnalyticsResponse> {
    const endpoint = `/analytics/${encodeURIComponent(newHireId)}`
    return this.call<AnalyticsResponse>(endpoint, 'GET', token)
  }

  // --- Auth Endpoint ---

  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<any> {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
    }

    return this.call<any>('/auth/change-password', 'POST', token, body)
  }
}

export const apiClient = new ApiClientImpl()
