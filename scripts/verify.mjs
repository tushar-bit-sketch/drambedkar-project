import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = await readFile(resolve(root, 'frontend/dist/index.html'), 'utf8');
const data = JSON.parse(await readFile(resolve(root, 'frontend/src/data/archiveData.json'), 'utf8'));
if (!index.includes('assets/')) throw new Error('Vite build is missing generated asset references.');
if (!data.documents.length || !data.collections.length) throw new Error('Static catalogue data is empty.');
if (!data.documents.every((document) =>
  document.verification_status === 'CATALOGUED' && document.text_layer === 'NONE' && document.file_held === false
)) {
  throw new Error('Static documents must remain metadata-only, catalogued records with no held files.');
}
const forbiddenFields = new Set(['ocr_text', 'transcription_text', 'file_path', 'storage_path', 'absolute_path']);
const checkFields = (value) => {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenFields.has(key)) throw new Error(`Static catalogue contains forbidden field: ${key}`);
    checkFields(child);
  }
};
checkFields(data);
console.log(`Static build verified: ${data.documents.length} records, ${data.collections.length} collections.`);
