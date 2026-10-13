import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_ROOT = path.resolve(process.env.LOAN_DOCUMENT_STORAGE_PATH || path.join(process.cwd(), '.private-storage'));

function safeApplicationId(applicationId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(applicationId)) {
    throw new Error('Invalid loan application id');
  }
  return applicationId;
}

function resolveStorageKey(storageKey) {
  if (typeof storageKey !== 'string' || !/^loan-applications\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z0-9]{1,10}$/i.test(storageKey)) {
    throw new Error('Invalid document storage key');
  }
  const resolved = path.resolve(STORAGE_ROOT, ...storageKey.split('/'));
  if (resolved !== STORAGE_ROOT && !resolved.startsWith(`${STORAGE_ROOT}${path.sep}`)) throw new Error('Invalid document storage key');
  return resolved;
}

export function createDocumentStorageKey(applicationId, extension) {
  safeApplicationId(applicationId);
  const safeExtension = String(extension || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!safeExtension) throw new Error('Invalid document extension');
  return `loan-applications/${applicationId}/${randomUUID()}.${safeExtension}`;
}

export async function saveLoanApplicationDocument(applicationId, buffer, extension) {
  const storageKey = createDocumentStorageKey(applicationId, extension);
  const destination = resolveStorageKey(storageKey);
  await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  await writeFile(destination, buffer, { flag: 'wx', mode: 0o600 });
  return storageKey;
}

export async function getLoanApplicationDocument(storageKey) {
  const filePath = resolveStorageKey(storageKey);
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) throw new Error('Stored document is not a file');
  return { stream: createReadStream(filePath), size: fileStat.size };
}

export async function deleteLoanApplicationDocument(storageKey) {
  await rm(resolveStorageKey(storageKey), { force: true });
}
