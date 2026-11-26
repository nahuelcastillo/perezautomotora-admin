#!/usr/bin/env node

/**
 * Script de validación del sistema
 * Ejecutar: node validate.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

// Archivos que debe haber
const requiredFiles = [
	'src/app/page.tsx',
	'src/app/upload/page.tsx',
	'src/app/stock/page.tsx',
	'src/app/api/autos/create/route.ts',
	'src/app/api/autos/list/route.ts',
	'src/app/api/autos/delete/[autoId]/route.ts',
	'src/lib/utils.ts',
	'database.sql',
	'wrangler.jsonc',
	'package.json',
];

console.log('🔍 Validando configuración del sistema...\n');

let allGood = true;

// Verificar archivos
console.log('📁 Verificando archivos:');
requiredFiles.forEach(file => {
	const filePath = path.join(projectRoot, file);
	const exists = fs.existsSync(filePath);
	const status = exists ? '✅' : '❌';
	console.log(`${status} ${file}`);
	if (!exists) allGood = false;
});

// Verificar wrangler.jsonc
console.log('\n⚙️ Verificando configuración Cloudflare:');
const wranglerPath = path.join(projectRoot, 'wrangler.jsonc');
if (fs.existsSync(wranglerPath)) {
	const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
	
	const hasD1 = wranglerContent.includes('d1_databases');
	const hasR2 = wranglerContent.includes('r2_buckets');
	const hasCorrectD1ID = wranglerContent.includes('9c2cb7f7-4eeb-4824-81ec-991af035d6c2');
	const hasCorrectR2 = wranglerContent.includes('perez-automotora');
	
	console.log(`${hasD1 ? '✅' : '❌'} D1 Database configurado`);
	console.log(`${hasR2 ? '✅' : '❌'} R2 Bucket configurado`);
	console.log(`${hasCorrectD1ID ? '✅' : '❌'} D1 ID correcto (9c2cb7f7...)`);
	console.log(`${hasCorrectR2 ? '✅' : '❌'} R2 nombre correcto (perez-automotora)`);
	
	if (!hasD1 || !hasR2 || !hasCorrectD1ID || !hasCorrectR2) {
		allGood = false;
	}
}

// Verificar database.sql
console.log('\n🗄️ Verificando Schema D1:');
const dbPath = path.join(projectRoot, 'database.sql');
if (fs.existsSync(dbPath)) {
	const dbContent = fs.readFileSync(dbPath, 'utf-8');
	
	const hasTable = dbContent.includes('CREATE TABLE IF NOT EXISTS autos');
	const hasColumns = [
		'id TEXT PRIMARY KEY',
		'marca TEXT',
		'modelo TEXT',
		'año INTEGER',
		'precio REAL',
		'fotos TEXT',
		'createdAt TEXT'
	].every(col => dbContent.includes(col));
	const hasIndexes = dbContent.includes('CREATE INDEX');
	
	console.log(`${hasTable ? '✅' : '❌'} Tabla 'autos' definida`);
	console.log(`${hasColumns ? '✅' : '❌'} Columnas correctas`);
	console.log(`${hasIndexes ? '✅' : '❌'} Índices creados`);
	
	if (!hasTable || !hasColumns || !hasIndexes) {
		allGood = false;
	}
}

// Verificar package.json
console.log('\n📦 Verificando dependencias:');
const pkgPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(pkgPath)) {
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	
	const hasUuid = pkg.dependencies?.uuid;
	const hasNext = pkg.dependencies?.next;
	const hasReact = pkg.dependencies?.react;
	const hasTailwind = pkg.devDependencies?.tailwindcss;
	
	console.log(`${hasUuid ? '✅' : '❌'} uuid instalado`);
	console.log(`${hasNext ? '✅' : '❌'} next instalado`);
	console.log(`${hasReact ? '✅' : '❌'} react instalado`);
	console.log(`${hasTailwind ? '✅' : '❌'} tailwindcss instalado`);
	
	if (!hasUuid || !hasNext || !hasReact || !hasTailwind) {
		allGood = false;
	}
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood) {
	console.log('✅ ¡SISTEMA COMPLETAMENTE CONFIGURADO!');
	console.log('\nPróximos pasos:');
	console.log('1. npm run dev          (desarrollo local)');
	console.log('2. Ir a http://localhost:3000');
	console.log('3. Probar subir auto con fotos');
	console.log('4. Verificar en /stock');
	console.log('5. npm run deploy       (cuando esté listo)');
	process.exit(0);
} else {
	console.log('❌ Hay problemas en la configuración');
	console.log('\nVerifica los items marcados con ❌');
	process.exit(1);
}
