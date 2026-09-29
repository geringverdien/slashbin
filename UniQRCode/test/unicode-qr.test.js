import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderQr } from '../bin/unicode-qr.js';

test('renders 2x output with two columns per module', () => {
  const output = renderQr('hello', '2x');
  const lines = output.slice(0, -1).split('\n');

  assert.equal(lines.length, 21);
  assert.ok(lines.every((line) => line.length === 42));
  assert.match(output, /█/);
});

test('renders 1x output with half-block characters', () => {
  const output = renderQr('hello', '1x');
  const lines = output.slice(0, -1).split('\n');

  assert.equal(lines.length, 11);
  assert.ok(lines.every((line) => line.length === 21));
  assert.match(output, /[▀▄█]/);
});

test('rejects data that is too long for the QR version', () => {
  assert.throws(() => renderQr('x'.repeat(3000), '2x'));
});

test('runs when invoked through a symlink', () => {
  const directory = mkdtempSync(join(tmpdir(), 'unicode-qr-'));
  const link = join(directory, 'uqr');

  try {
    symlinkSync(new URL('../bin/unicode-qr.js', import.meta.url), link);
    const result = spawnSync(process.execPath, [link, '--no-copy', 'hello'], {
      encoding: 'utf8',
    });

    assert.equal(result.status, 0);
    assert.match(result.stdout, /[▀▄█]/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
