import { formats } from './data.js';

const browserImageOutputs = {
  png: { mime: 'image/png', extension: 'png' },
  jpg: { mime: 'image/jpeg', extension: 'jpg' },
  jpeg: { mime: 'image/jpeg', extension: 'jpg' },
  webp: { mime: 'image/webp', extension: 'webp' }
};

const browserImageInputs = new Set(['png', 'jpg', 'jpeg', 'webp']);

export function canConvertInBrowser(item) {
  return browserImageInputs.has(item.from) && Boolean(browserImageOutputs[item.to]);
}

export function conversionUnavailableMessage(item) {
  const from = formats[item.from]?.label || item.from.toUpperCase();
  const to = formats[item.to]?.label || item.to.toUpperCase();
  return `${from} to ${to} needs the conversion engine. Image PNG, JPG, and WEBP conversion works in this browser now.`;
}

export async function convertImageItem(item) {
  if (!canConvertInBrowser(item)) {
    throw new Error(conversionUnavailableMessage(item));
  }

  const image = await loadBitmap(item.file);
  const output = browserImageOutputs[item.to];
  const dimensions = outputDimensions(image.width, image.height, item.settings);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare an image canvas.');

  if (output.mime === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  closeBitmap(image);

  const blob = await canvasToBlob(canvas, output.mime, qualityFromSettings(item.settings));
  const name = outputName(item, output.extension);

  return { blob, name, mime: output.mime };
}

function outputDimensions(width, height, settings = {}) {
  const requestedWidth = positiveInteger(settings.width);
  const requestedHeight = positiveInteger(settings.height);

  if (!requestedWidth && !requestedHeight) return { width, height };
  if (requestedWidth && requestedHeight) return { width: requestedWidth, height: requestedHeight };
  if (requestedWidth) return { width: requestedWidth, height: Math.max(1, Math.round((height / width) * requestedWidth)) };
  return { width: Math.max(1, Math.round((width / height) * requestedHeight)), height: requestedHeight };
}

function positiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function qualityFromSettings(settings = {}) {
  const quality = Number.parseInt(settings.quality, 10);
  if (!Number.isFinite(quality)) return 0.88;
  return Math.min(1, Math.max(0.01, quality / 100));
}

function outputName(item, extension) {
  const rawName = (item.settings?.rename || stripExtension(item.name) || 'converted').trim();
  const safeName = stripExtension(rawName)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || 'converted';

  return `${safeName}.${extension}`;
}

function stripExtension(name = '') {
  return name.replace(/\.[^/.]+$/, '');
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try {
      return await window.createImageBitmap(file);
    } catch {
      return loadImageElement(file);
    }
  }

  return loadImageElement(file);
}

async function loadImageElement(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('This image could not be loaded.'));
      element.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function closeBitmap(image) {
  if (typeof image.close === 'function') image.close();
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('This browser could not export the converted image.'));
    }, mime, quality);
  });
}


