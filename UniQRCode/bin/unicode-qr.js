#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import qrcode from 'qrcode-generator';
import clipboard from 'clipboardy';

const usage = `Usage: unicode-qr [options] [text]

Generate a Unicode QR code from text or a UTF-8 file.

Options:
  -f, --file <path>  Read the QR content from a UTF-8 file
  -m, --mode <mode>  Render as 1x (half-block) or 2x (full-block)
                     (default: 1x)
      --no-copy      Do not copy the generated QR code to the clipboard
  -h, --help         Show this help
`;

function fail(message) {
  console.error(`unicode-qr: ${message}`);
  console.error('Run "unicode-qr --help" for usage.');
  process.exitCode = 1;
}

function parseArgs(args) {
  let file;
  let mode = '1x';
  let copy = true;
  let text;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '-h' || arg === '--help') {
      console.log(usage);
      process.exit(0);
    }
    if (arg === '--no-copy') {
      copy = false;
      continue;
    }
    if (arg === '-f' || arg === '--file') {
      file = args[++index];
      if (!file) throw new Error(`${arg} requires a path`);
      continue;
    }
    if (arg === '-m' || arg === '--mode') {
      mode = args[++index];
      if (!mode) throw new Error(`${arg} requires 1x or 2x`);
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`unknown option: ${arg}`);
    }
    if (text !== undefined) {
      throw new Error('only one text argument is allowed');
    }
    text = arg;
  }

  if (!['1x', '2x'].includes(mode)) {
    throw new Error(`invalid mode "${mode}"; expected 1x or 2x`);
  }
  if (file && text !== undefined) {
    throw new Error('text and --file cannot be used together');
  }

  return { file, mode, copy, text };
}

export function renderQr(content, mode) {
  const qr = qrcode(0, 'M');
  qr.addData(content);
  qr.make();

  const size = qr.getModuleCount();
  let output = '';

  if (mode === '1x') {
    for (let row = 0; row < size; row += 2) {
      for (let column = 0; column < size; column += 1) {
        const top = qr.isDark(row, column);
        const bottom = row + 1 < size && qr.isDark(row + 1, column);
        output += top && bottom ? '█' : top ? '▀' : bottom ? '▄' : ' ';
      }
      output += '\n';
    }
  } else {
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        output += qr.isDark(row, column) ? '██' : '  ';
      }
      output += '\n';
    }
  }

  return output;
}

async function readContent({ file, text }) {
  if (file) return readFile(file, 'utf8');
  if (text !== undefined) return text;
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error('provide text, --file <path>, or pipe text on stdin');
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    const content = await readContent(options);
    const output = renderQr(content, options.mode);
    process.stdout.write(output);
    if (options.copy) {
      await clipboard.write(output);
      console.error('Copied QR code to the clipboard.');
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
