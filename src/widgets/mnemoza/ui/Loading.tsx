
export const Loading = () => (
	<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
		<div className='text-center'>
			<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
			<h1 className='text-xl font-semibold text-gray-900 mb-2'>Загрузка Mnemoza</h1>
			<p className='text-gray-600'>Инициализация базы данных...</p>
		</div>
	</div>
)