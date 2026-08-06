import { rmSync } from 'node:fs';

const targets = ['.next', 'node_modules/.cache'];

for (const dir of targets) {
  rmSync(dir, { recursive: true, force: true });
}

console.log('cleaned:', targets.join(', '));