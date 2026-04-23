import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppLayout } from './components/layout/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { OverviewPage } from './pages/OverviewPage'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage } from './pages/CalendarPage'
import { DebtsPage } from './pages/DebtsPage'
import { Toaster } from './components/ui/Toaster'
import { useSessionManager } from './hooks/useSessionManager'
import type { ReactNode } from 'react'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  useSessionManager()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/resumen" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<OverviewPage />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="deudas" element={<DebtsPage />} />
          <Route path="estadisticas" element={<DashboardPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
