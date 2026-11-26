'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generateR2PublicUrl } from '@/lib/r2-utils';

interface Auto {
	id: string;
	marca: string;
	modelo: string;
	año: number;
	precio: number;
	descripcion: string;
	kilometraje: number;
	fotos: string[];
	createdAt: string;
}

interface ListResponse {
	autos: Auto[];
}

export default function StockPage() {
	const [autos, setAutos] = useState<Auto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);

	useEffect(() => {
		fetchAutos();
	}, []);

	const fetchAutos = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/autos/list');
			const data = (await response.json()) as ListResponse;

			if (response.ok) {
				setAutos(data.autos || []);
			} else {
				setError('No se pudieron cargar los autos');
			}
		} catch (err) {
			setError(`Error: ${err}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (autoId: string) => {
		if (!confirm('¿Estás seguro de que quieres eliminar este auto?')) return;

		try {
			const response = await fetch(`/api/autos/delete/${autoId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				setAutos(autos.filter(a => a.id !== autoId));
				setSelectedAuto(null);
			} else {
				setError('Error al eliminar el auto');
			}
		} catch (err) {
			setError(`Error: ${err}`);
		}
	};

	return (
		<>
			<header className="w-full bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">
						Stock de Autos
					</h1>
					<Link href="/" className="text-blue-500 hover:text-blue-700">
						← Volver
					</Link>
				</div>
			</header>

			<main className="min-h-screen bg-gray-50 py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
							{error}
						</div>
					)}

					{isLoading ? (
						<div className="text-center py-16">
							<p className="text-gray-600">Cargando autos...</p>
						</div>
					) : autos.length === 0 ? (
						<div className="text-center py-16 bg-white rounded-lg shadow-md">
							<p className="text-gray-600 mb-4">No hay autos en el stock</p>
							<Link href="/upload" className="text-blue-500 hover:text-blue-700">
								Subir el primer auto
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Lista de autos */}
							<div className="lg:col-span-1">
								<div className="bg-white rounded-lg shadow-md overflow-hidden">
									<div className="p-4 border-b">
										<h2 className="text-lg font-semibold text-gray-900">
											Autos ({autos.length})
										</h2>
									</div>
									<div className="divide-y max-h-96 overflow-y-auto">
										{autos.map(auto => (
											<div
												key={auto.id}
												onClick={() => setSelectedAuto(auto)}
												className={`p-4 cursor-pointer transition-colors ${
													selectedAuto?.id === auto.id
														? 'bg-blue-50 border-l-4 border-blue-500'
														: 'hover:bg-gray-50'
												}`}
											>
												<p className="font-semibold text-gray-900">
													{auto.marca} {auto.modelo}
												</p>
												<p className="text-sm text-gray-600">{auto.año}</p>
												<p className="text-sm font-medium text-blue-600">
													${auto.precio.toLocaleString()}
												</p>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Detalles del auto seleccionado */}
							{selectedAuto && (
								<div className="lg:col-span-2">
									<div className="bg-white rounded-lg shadow-md p-8">
										<div className="mb-6">
											<h2 className="text-3xl font-bold text-gray-900 mb-2">
												{selectedAuto.marca} {selectedAuto.modelo}
											</h2>
											<div className="grid grid-cols-2 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600">Año</p>
													<p className="text-lg font-semibold">{selectedAuto.año}</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">Kilometraje</p>
													<p className="text-lg font-semibold">
														{selectedAuto.kilometraje.toLocaleString()} km
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">Precio</p>
													<p className="text-lg font-semibold text-blue-600">
														${selectedAuto.precio.toLocaleString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600">ID del Auto</p>
													<p className="text-sm font-mono bg-gray-100 p-2 rounded">
														{selectedAuto.id}
													</p>
												</div>
											</div>
										</div>

										{/* Descripción */}
										{selectedAuto.descripcion && (
											<div className="mb-6">
												<p className="text-sm text-gray-600 mb-2">Descripción</p>
												<p className="text-gray-700 bg-gray-50 p-4 rounded">
													{selectedAuto.descripcion}
												</p>
											</div>
										)}

										{/* Fotos */}
										{selectedAuto.fotos && selectedAuto.fotos.length > 0 && (
											<div className="mb-6">
												<p className="text-sm text-gray-600 mb-4">
													Fotos ({selectedAuto.fotos.length})
												</p>
												<div className="grid grid-cols-2 gap-4">
													{selectedAuto.fotos.map((foto, idx) => (
														<div
															key={idx}
															className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative"
														>
															<Image
																src={generateR2PublicUrl(foto)}
																alt={`Foto ${idx + 1} de ${selectedAuto.marca} ${selectedAuto.modelo}`}
																fill
																className="object-cover"
																unoptimized
																onError={(e) => {
																	const img = e.target as HTMLImageElement;
																	img.style.display = 'none';
																	const parent = img.parentElement;
																	if (parent) {
																		parent.innerHTML = '<p class="text-gray-500 text-xs text-center px-2">Error al cargar imagen</p>';
																	}
																}}
															/>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Acciones */}
										<div className="flex gap-4">
											<button
												onClick={() => handleDelete(selectedAuto.id)}
												className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
											>
												Eliminar Auto
											</button>
											<Link
												href="/upload"
												className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
											>
												Subir otro Auto
											</Link>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</>
	);
}
