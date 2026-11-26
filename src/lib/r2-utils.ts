export function generateR2PublicUrl(fotoReference: string): string {
	// fotoReference format: "autoId/index-filename.jpg"
	const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
	const accountId = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
	
	if (!bucketName || !accountId) {
		throw new Error('R2 configuration missing: NEXT_PUBLIC_R2_BUCKET_NAME or NEXT_PUBLIC_R2_ACCOUNT_ID not set');
	}
	
	return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fotoReference}`;
}


