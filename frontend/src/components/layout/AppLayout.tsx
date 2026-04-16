import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { TabBar } from './TabBar'

export const AppLayout = () => (
  <div className="min-h-screen bg-surface flex flex-col">
    <TopBar />
    <div className="hidden md:block border-b border-line bg-surface-raised">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <TabBar variant="desktop" />
      </div>
    </div>
    <main className="flex-1 pb-24 md:pb-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Outlet />
      </div>
    </main>
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-raised border-t border-line shadow-elevated z-40">
      <TabBar variant="mobile" />
    </div>
  </div>
)
