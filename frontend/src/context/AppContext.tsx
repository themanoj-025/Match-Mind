import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  isPro: boolean
}

interface AppContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const clearToast = () => setToast(null)

  return (
    <AppContext.Provider value={{ user, token, login, logout, toast, showToast, clearToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] px-5 py-3 rounded-lg shadow-xl backdrop-blur-md border border-white/10 text-sm font-medium transition-all duration-300 transform translate-y-0 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
          toast.type === 'error' ? 'bg-rose-500/20 text-rose-300' :
          'bg-indigo-500/20 text-indigo-300'
        }`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
