import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const constantsPath = path.join(rootDir, 'utils', 'taxConstants.ts');

const source = await fs.readFile(constantsPath, 'utf8');

const extractStringConst = (name) => {
  const regex = new RegExp(`export const ${name} = '([^']+)'`);
  const match = source.match(regex);
  return match?.[1];
};

const extractNumberConst = (name) => {
  const regex = new RegExp(`export const ${name} = (\\d+)`);
  const match = source.match(regex);
  return match ? Number(match[1]) : undefined;
};

const extractArrayConstCount = (name) => {
  const regex = new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\]`);
  const match = source.match(regex);
  if (!match) return 0;
  return (match[1].match(/'https?:\/\/[^']+'/g) || []).length;
};

const lastUpdated = extractStringConst('LEGAL_REVIEW_LAST_UPDATED');
const maxAgeDays = extractNumberConst('LEGAL_REVIEW_MAX_AGE_DAYS') ?? 60;
const sourcesCount = extractArrayConstCount('LEGAL_OFFICIAL_SOURCES');

if (!lastUpdated) {
  throw new Error('Constante LEGAL_REVIEW_LAST_UPDATED ausente em utils/taxConstants.ts');
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated)) {
  throw new Error('LEGAL_REVIEW_LAST_UPDATED deve seguir o formato YYYY-MM-DD');
}

if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0) {
  throw new Error('LEGAL_REVIEW_MAX_AGE_DAYS deve ser um numero inteiro positivo');
}

if (sourcesCount < 2) {
  throw new Error('LEGAL_OFFICIAL_SOURCES deve conter ao menos 2 fontes oficiais');
}

const updatedDate = new Date(`${lastUpdated}T00:00:00Z`);
if (Number.isNaN(updatedDate.getTime())) {
  throw new Error('LEGAL_REVIEW_LAST_UPDATED invalida');
}

const now = new Date();
const ageMs = now.getTime() - updatedDate.getTime();
const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

if (ageDays > maxAgeDays) {
  throw new Error(
    `Revisao legal vencida: ${ageDays} dias desde ${lastUpdated}. Limite atual: ${maxAgeDays} dias.`
  );
}

console.log(`Validação legal OK: revisão há ${ageDays} dias (limite ${maxAgeDays}).`);

