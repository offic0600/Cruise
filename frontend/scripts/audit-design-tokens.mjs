import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const targets = (process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['src/app', 'src/components'])
  .map((target) => resolve(process.cwd(), target));

const forbiddenPatterns = [
  { pattern: /\b(bg|text|border|shadow)-slate-\d+\b/g, reason: '禁止继续依赖 slate utility 作为长期语义色' },
  { pattern: /#[0-9a-fA-F]{3,8}\b/g, reason: '禁止在前端源码中直接写十六进制色值' },
  { pattern: /rgba?\(/g, reason: '禁止在前端源码中直接写 rgba/rgb 颜色' },
];

function walk(dir, result = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, result);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|css)$/.test(entry.name)) {
      result.push(full);
    }
  }
  return result;
}

const violations = [];

for (const target of targets) {
  const stats = statSync(target, { throwIfNoEntry: false });
  if (!stats) continue;
  const files = stats.isDirectory() ? walk(target) : [target];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const rule of forbiddenPatterns) {
      for (const match of source.matchAll(rule.pattern)) {
        violations.push(`${file}: "${match[0]}" -> ${rule.reason}`);
      }
    }
  }
}

if (violations.length) {
  console.error('Design system audit failed:');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('Design system audit passed.');
