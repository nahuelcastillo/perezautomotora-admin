export function generateR2PublicUrl(fotoReference: string): string {
	// fotoReference format: "autoId/index-filename.jpg"
	const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
	
	if (!publicUrl) {
		throw new Error('R2 public URL not configured: NEXT_PUBLIC_R2_PUBLIC_URL not set');
	}
	
	return `${publicUrl}/${fotoReference}`;
}

