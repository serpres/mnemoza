import { useState } from 'react'
import { useAppModel } from '@/entities/app'
import { useDatabase } from '@/shared/database'

import { StudySession } from '@/features/study-session'
import { DeckList } from '@/features/deck-list/DeckList'
import { DeckView } from '@/features/deck-view'
import { CreateDeckModal } from '@/features/modals/create-deck'
import { InitializationError } from './ui/InitializationError'
import { Loading } from './ui/Loading'

export const MnemozaApp = () => {
  const appModel = useAppModel()
  const { dbInitialized, initError, initializeDatabase } = useDatabase()
  const [showBackupRestore, setShowBackupRestore] = useState(false)
	
	if (!dbInitialized) {
		if (initError) {
			return <InitializationError initError={initError} initializeDatabase={initializeDatabase} />
		}
	
		return (
			<Loading />
		)
	}
  return (
    <div className="relative min-h-screen">
      {dbInitialized && appModel.currentView === 'decks' && (
        <DeckList 
          onSelectDeck={appModel.selectDeck} 
          onCreateDeck={appModel.openCreateDeckModal}
          showBackupRestore={showBackupRestore}
          setShowBackupRestore={setShowBackupRestore}
        />
      )}

      {dbInitialized && appModel.currentView === 'deck' && appModel.selectedDeck && (
        <DeckView
          deck={appModel.selectedDeck}
          onBack={appModel.backToDecks}
          onStartStudy={appModel.startStudy}
        />
      )}

      {dbInitialized && appModel.currentView === 'study' && appModel.selectedDeck && (
        <StudySession deck={appModel.selectedDeck} onBack={appModel.backToDeck} />
      )}

      {dbInitialized && (
        <CreateDeckModal
          isOpen={appModel.showCreateDeckModal}
          onClose={appModel.closeCreateDeckModal}
          onDeckCreated={appModel.closeCreateDeckModal}
        />
      )}

    </div>
  )
}