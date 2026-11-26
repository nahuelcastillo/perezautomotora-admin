/**
 * Utilidades para el sistema de administración
 */

export function generateAutoId(): string {
	return crypto.randomUUID();
}

export function formatPrice(price: number): string {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'USD',
	}).format(price);
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('es-AR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

export function formatKilometers(km: number): string {
	return new Intl.NumberFormat('es-AR').format(km);
}

export interface Auto {
	id: string;
	marca: string;
	modelo: string;
	año: number;
	precio: number;
	descripcion: string;
	kilometraje: number;
	fotos: string[];
	createdAt: string;
	updatedAt?: string;
}

export interface CreateAutoRequest {
	marca: string;
	modelo: string;
	año: number;
	precio: number;
	descripcion?: string;
	kilometraje?: number;
	fotos?: File[];
}

export interface CreateAutoResponse {
	message: string;
	autoId: string;
	fotoCount: number;
}

export interface ListAutosResponse {
	autos: Auto[];
}

export interface DeleteAutoResponse {
	message: string;
}

/**
 * Verifica que un auto tenga datos válidos
 */
export function validateAutoData(data: any): boolean {
	return (
		typeof data.marca === 'string' &&
		data.marca.trim().length > 0 &&
		typeof data.modelo === 'string' &&
		data.modelo.trim().length > 0 &&
		typeof data.año === 'number' &&
		data.año > 1900 &&
		data.año <= new Date().getFullYear() + 1 &&
		typeof data.precio === 'number' &&
		data.precio > 0
	);
}

/**
 * Genera el path de una foto en R2
 */
export function getFotoPath(autoId: string, index: number, filename: string): string {
	return `${autoId}/${index}-${filename}`;
}

/**
 * Extrae el autoId del path de una foto
 */
export function extractAutoIdFromFotoPath(path: string): string {
	return path.split('/')[0];
}

/**
 * Verifica que la foto pertenece a un auto específico
 */
export function isFotoForAuto(fotoPath: string, autoId: string): boolean {
	return fotoPath.startsWith(`${autoId}/`);
}
