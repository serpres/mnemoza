import { PWAPrompt } from '@/features/pwa-prompt'
import { MnemozaApp } from '@/widgets/mnemoza'

function App() {
  return (
    <div className='min-h-screen w-full bg-gray-50'>
      <PWAPrompt />
      <MnemozaApp />
    </div>
  )
}

export default App
