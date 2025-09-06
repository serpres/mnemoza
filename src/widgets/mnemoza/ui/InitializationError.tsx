export const InitializationError = ({
	initializeDatabase,
	initError,
}: {
	initializeDatabase: () => void
	initError: string
}) => (
	<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
		<div className='text-center'>
			<div className='text-red-500 text-6xl mb-4'>⚠️</div>
			<h1 className='text-2xl font-bold text-gray-900 mb-2'>Ошибка инициализации</h1>
			<p className='text-gray-600 mb-4'>{initError}</p>
			<button
				onClick={initializeDatabase}
				className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors'
			>
				Попробовать снова
			</button>
		</div>
	</div>
)
