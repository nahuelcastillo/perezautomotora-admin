'use client';

import Link from 'next/link';

export default function Home() {
	return (
		<>
			<header className="w-full bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<h1 className="text-3xl font-bold text-gray-900">
						Perez Automotora - Administración
					</h1>
				</div>
			</header>

			<main className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Subir Autos */}
						<Link href="/upload">
							<div className="h-full p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-900">
										Subir Autos
									</h2>
									<span className="text-4xl">📤</span>
								</div>
								<p className="text-gray-600 mb-4">
									Agrega nuevos vehículos al stock con fotos y detalles. Cada auto recibe un ID único para organizar sus imágenes.
								</p>
								<div className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
									Ir a subir
								</div>
							</div>
						</Link>

						{/* Revisar Stock */}
						<Link href="/stock">
							<div className="h-full p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-900">
										Revisar Stock
									</h2>
									<span className="text-4xl">📋</span>
								</div>
								<p className="text-gray-600 mb-4">
									Consulta todos los vehículos disponibles en el sistema. Visualiza sus fotos, detalles y datos asociados.
								</p>
								<div className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
									Ver stock
								</div>
							</div>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
