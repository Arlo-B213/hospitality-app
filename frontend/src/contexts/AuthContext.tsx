import React, { createContext, useState, useEffect, ReactNode } from 'react'

export interface AuthUser {
  userId: string
  email: string
  role: string
  team?: string
}

export interface AuthContextType {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
      // TODO: Verify token validity and fetch user info from API
      // For now, we'll assume the token is valid
    }
  }, [])

  const login = async (_email: string, _password: string): Promise<void> => {
    // TODO: Call backend login endpoint
    // const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // })
    // const data = await response.json()
    // setToken(data.token)
    // setUser(data.user)
    // localStorage.setItem('authToken', data.token)
    throw new Error('Login not yet implemented')
  }

  const logout = (): void => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
