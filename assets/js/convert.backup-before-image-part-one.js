import { formats } from './data.js';

const browserImageOutputs = {
  png: { mime: 'image/png', extension: 'png' },
  jpg: { mime: 'image/jpeg', extension: 'jpg' },
  jpeg: { mime: 'image/jpeg', extension: 'jpg' },
  webp: { mime: 'image/webp', extension: 'webp' }
};

const browserImageInputs = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp']);
const browserPdfInputs = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp']);

export function canConvertInBrowser(item) {
  if (browserImageInputs.has(item.from) && Boolean(browserImageOutputs[item.to])) return true;
  if (browserPdfInputs.has(item.from) && item.to === 'pdf') return true;
  return false;
}

export function conversionUnavailableMessage(item) {
  const from = formats[item.from]?.label || item.from.toUpperCase();
  const to = formats[item.to]?.label || item.to.toUpperCase();
  return `${from} to ${to} needs a later conversion engine. Browser support now: PNG, JPG, JPEG, WEBP, SVG, and BMP to PNG/JPG/WEBP/PDF.`;
}

export async function convertImageItem(item) {
  if (!canConvertInBrowser(item)) {
    throw new Error(conversionUnavailableMessage(item));
  }

  const image = await loadBitmap(item.file);
  const dimensions = outputDimensions(image.width, image.height, item.settings);

  if (!dimensions.width || !dimensions.height) {
    closeBitmap(image);
    throw new Error('This image does not have a readable size.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare an image canvas.');

  const output = browserImageOutputs[item.to];
  const needsWhiteBackground = item.to === 'pdf' || output?.mime === 'image/jpeg';

  if (needsWhiteBackground) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  closeBitmap(image);

  if (item.to === 'pdf') {
    const quality = qualityFromSettings(item.settings);
    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const blob = buildImagePdf(jpegBytes, canvas.width, canvas.height, item.settings);
    const name = outputName(item, 'pdf');

    return { blob, name, mime: 'application/pdf' };
  }

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

  return {
    width: Math.max(1, Math.round((width / height) * requestedHeight)),
    height: requestedHeight
  };
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
      else reject(new Error('This browser could not export the converted file.'));
    }, mime, quality);
  });
}

function buildImagePdf(imageBytes, imageWidth, imageHeight, settings = {}) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;

  function pushString(value) {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    offset += bytes.length;
  }

  function pushBytes(bytes) {
    chunks.push(bytes);
    offset += bytes.length;
  }

  function beginObject(number) {
    offsets[number] = offset;
    pushString(`${number} 0 obj\n`);
  }

  const layout = pdfLayout(imageWidth, imageHeight, settings);
  const content = [
    'q',
    `${formatNumber(layout.drawWidth)} 0 0 ${formatNumber(layout.drawHeight)} ${formatNumber(layout.x)} ${formatNumber(layout.y)} cm`,
    '/Im0 Do',
    'Q',
    ''
  ].join('\n');

  pushString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  beginObject(1);
  pushString('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  beginObject(2);
  pushString('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  beginObject(3);
  pushString(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatNumber(layout.pageWidth)} ${formatNumber(layout.pageHeight)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

  beginObject(4);
  pushString(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
  pushBytes(imageBytes);
  pushString('\nendstream\nendobj\n');

  beginObject(5);
  pushString(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  const xrefOffset = offset;
  pushString('xref\n0 6\n');
  pushString('0000000000 65535 f \n');

  for (let i = 1; i <= 5; i++) {
    pushString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }

  pushString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
}

function pdfLayout(imageWidth, imageHeight, settings = {}) {
  const pageSize = String(settings.pageSize || 'auto');
  const orientation = String(settings.orientation || 'auto');
  const marginMode = String(settings.margin || 'none');

  let page = basePdfPageSize(pageSize, imageWidth, imageHeight);

  if (orientation === 'portrait' && page.width > page.height) {
    page = { width: page.height, height: page.width };
  }

  if (orientation === 'landscape' && page.height > page.width) {
    page = { width: page.height, height: page.width };
  }

  if (orientation === 'auto' && pageSize !== 'auto') {
    const imageIsLandscape = imageWidth > imageHeight;
    const pageIsLandscape = page.width > page.height;

    if (imageIsLandscape !== pageIsLandscape) {
      page = { width: page.height, height: page.width };
    }
  }

  const margin = pdfMargin(marginMode);
  const availableWidth = Math.max(1, page.width - margin * 2);
  const availableHeight = Math.max(1, page.height - margin * 2);
  const fitted = fitInside(imageWidth, imageHeight, availableWidth, availableHeight);

  return {
    pageWidth: page.width,
    pageHeight: page.height,
    drawWidth: fitted.width,
    drawHeight: fitted.height,
    x: margin + (availableWidth - fitted.width) / 2,
    y: margin + (availableHeight - fitted.height) / 2
  };
}

function basePdfPageSize(pageSize, imageWidth, imageHeight) {
  if (pageSize === 'a4') return { width: 595.28, height: 841.89 };
  if (pageSize === 'letter') return { width: 612, height: 792 };

  const maxSide = 1440;
  const scale = Math.min(1, maxSide / Math.max(imageWidth, imageHeight));

  return {
    width: Math.max(1, Math.round(imageWidth * scale)),
    height: Math.max(1, Math.round(imageHeight * scale))
  };
}

function pdfMargin(mode) {
  if (mode === 'small') return 28;
  return 0;
}

function fitInside(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, width * scale),
    height: Math.max(1, height * scale)
  };
}

function pdfPageSize(width, height) {
  const maxSide = 1440;
  const scale = Math.min(1, maxSide / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '');
}

