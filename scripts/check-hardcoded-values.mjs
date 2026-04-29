import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, 'scripts', 'hardcoded-values.config.json');
const configRaw = await fs.readFile(configPath, 'utf8');
const config = JSON.parse(configRaw);
const targetDir = path.join(rootDir, config.targetDir);
const includeExtensions = new Set(config.includeExtensions ?? ['.tsx']);
const ignoreFiles = new Set((config.ignoreFiles ?? []).map((f) => path.normalize(f)));

const globalRules = (config.globalPatterns ?? []).map((rule) => ({
  id: rule.id,
  pattern: new RegExp(rule.pattern, 'gi')
}));

const fileRules = Object.fromEntries(
  Object.entries(config.fileRules ?? {}).map(([file, rules]) => [
    path.normalize(file),
    rules.map((rule) => ({ id: rule.id, pattern: new RegExp(rule.pattern, 'gi') }))
  ])
);

const collectFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
      continue;
    }
    if (entry.isFile() && includeExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

const files = await collectFiles(targetDir);
const violations = [];

for (const file of files) {
  const relativeFile = path.normalize(path.relative(rootDir, file));
  if (ignoreFiles.has(relativeFile)) continue;
  const source = await fs.readFile(file, 'utf8');
  const rulesToCheck = [
    ...globalRules,
    ...(fileRules[relativeFile] ?? [])
  ];

  for (const rule of rulesToCheck) {
    const match = source.match(rule.pattern);
    if (match) {
      violations.push({
        file: relativeFile,
        ruleId: rule.id,
        pattern: rule.pattern.toString(),
        sample: match[0]
      });
    }
  }
}

if (violations.length > 0) {
  console.error('Foram encontrados possíveis valores legais hardcoded em páginas:');
  for (const violation of violations) {
    console.error(`- ${violation.file} | regra: ${violation.ruleId} | match: "${violation.sample}" | pattern: ${violation.pattern}`);
  }
  console.error('Use constantes de utils/taxConstants.ts em vez de valores fixos nas páginas.');
  process.exit(1);
}

console.log('Check de hardcoded legal values OK.');

