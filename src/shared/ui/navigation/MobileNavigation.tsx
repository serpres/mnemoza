import { motion } from 'framer-motion'
import { Archive, Home, Plus } from 'lucide-react'
import React from 'react'

interface MobileNavigationProps {
  currentView: 'decks' | 'deck' | 'study'
  onNavigateHome: () => void
  onCreateDeck: () => void
  onShowBackup: () => void
  className?: string
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onNavigateHome,
  onCreateDeck,
  onShowBackup,
  className = ''
}) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Главная',
      onClick: onNavigateHome,
      active: currentView === 'decks'
    },
    {
      id: 'create',
      icon: Plus,
      label: 'Создать',
      onClick: onCreateDeck,
      active: false
    },
    {
      id: 'backup',
      icon: Archive,
      label: 'Резервные копии',
      onClick: onShowBackup,
      active: false
    }
  ]

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40 md:hidden ${className}`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
