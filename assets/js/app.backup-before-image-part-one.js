import { categories, categoryDefaults, conversions, formats } from './data.js';
import { canConvertInBrowser, conversionUnavailableMessage, convertImageItem } from './convert.js';
import { initialStateFromPath, updateBrowserUrl, updateMeta } from './router.js';
import { createQueueItems } from './upload.js';
import {
  renderFormatInfo,
  renderFormatPicker,
  renderHero,
  renderOptionsModal,
  renderQueue,
  renderServiceMenu,
  renderToolsModal,
  renderToolsPreview
} from './ui.js';

const state = {
  ...initialStateFromPath(),
  queue: [],
  picker: {
    mode: 'from',
    search: '',
    activeCategory: null
  },
  activeOptionsId: null
};

const $ = selector => document.querySelector(selector);
const elements = {
  app: document.body,
  themeToggle: $('#themeToggle'),
  serviceButton: $('#serviceButton'),
  serviceCurrent: $('#serviceCurrent'),
  serviceMenu: $('#serviceMenu'),
  kicker: $('#pageKicker'),
  title: $('#pageTitle'),
  description: $('#pageDescription'),
  fromCard: $('#fromCard'),
  toCard: $('#toCard'),
  swapButton: $('#swapButton'),
  uploadPanel: $('#uploadPanel'),
  queuePanel: $('#queuePanel'),
  queueList: $('#queueList'),
  queueSummary: $('#queueSummary'),
  fileInput: $('#fileInput'),
  chooseFileButton: $('#chooseFileButton'),
  addFileButton: $('#addFileButton'),
  clearQueueButton: $('#clearQueueButton'),
  convertButton: $('#convertButton'),
  formatInfo: $('#formatInfo'),
  toolsPreview: $('#toolsPreview'),
  uploadMenuButton: $('#uploadMenuButton'),
  uploadMenu: $('#uploadMenu'),

  pickerBackdrop: $('#pickerBackdrop'),
  picker: $('#formatPicker'),
  pickerTitle: $('#pickerTitle'),
  pickerSubtitle: $('#pickerSubtitle'),
  pickerSearch: $('#pickerSearch'),
  pickerCategories: $('#pickerCategories'),
  pickerFormats: $('#pickerFormats'),
  closePicker: $('#closePicker'),

  optionsBackdrop: $('#optionsBackdrop'),
  optionsModal: $('#optionsModal'),
  optionsTitle: $('#optionsTitle'),
  optionsForm: $('#optionsForm'),
  optionsBody: $('#optionsBody'),
  optionsSave: $('#optionsSave'),
  closeOptions: $('#closeOptions'),

  toolsBackdrop: $('#toolsBackdrop'),
  toolsModal: $('#toolsModal'),
  toolsModalBody: $('#toolsModalBody'),
  openToolsButtons: document.querySelectorAll('[data-open-tools]'),
  closeTools: $('#closeTools')
};


let savedScrollY = 0;

function secondaryScreenOpen() {
  return [
    elements.picker,
    elements.optionsModal,
    elements.toolsModal
  ].some(screen => screen && screen.hidden === false);
}

function lockSecondaryScreenScroll() {
  if (document.body.classList.contains('secondary-screen-locked')) return;

  savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.lockScrollY = String(savedScrollY);
  document.body.classList.add('secondary-screen-locked');

  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockSecondaryScreenScroll() {
  window.setTimeout(() => {
    if (secondaryScreenOpen()) return;

    const y = Number(document.body.dataset.lockScrollY || savedScrollY || 0);

    document.body.classList.remove('secondary-screen-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo(0, y);
  }, 0);
}

function init() {
  const savedTheme = localStorage.getItem('flowsync-theme');
  document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
  bindEvents();
  renderAll(true);
  if (window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() === 'tools') {
    setTimeout(openTools, 150);
  }
}


function bindEvents() {
  elements.themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('flowsync-theme', html.dataset.theme || 'dark');
  });

  elements.serviceButton.addEventListener('click', () => {
    elements.serviceMenu.hidden = !elements.serviceMenu.hidden;
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.service-switcher')) elements.serviceMenu.hidden = true;
    if (!event.target.closest('.upload-split')) elements.uploadMenu.hidden = true;
  });

  elements.fromCard.addEventListener('click', () => openPicker('from'));
  elements.toCard.addEventListener('click', () => openPicker('to'));
  elements.swapButton.addEventListener('click', swapFormats);

  elements.chooseFileButton.addEventListener('click', () => elements.fileInput.click());
  elements.addFileButton.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', event => handleFiles(event.target.files));

  elements.uploadPanel.addEventListener('dragover', event => {
    event.preventDefault();
    elements.uploadPanel.classList.add('dragging');
  });
  elements.uploadPanel.addEventListener('dragleave', () => elements.uploadPanel.classList.remove('dragging'));
  elements.uploadPanel.addEventListener('drop', event => {
    event.preventDefault();
    elements.uploadPanel.classList.remove('dragging');
    handleFiles(event.dataTransfer.files);
  });

  elements.uploadMenuButton.addEventListener('click', event => {
    event.stopPropagation();
    elements.uploadMenu.hidden = !elements.uploadMenu.hidden;
  });
  elements.uploadMenu.querySelectorAll('[data-upload-option]').forEach(button => {
    button.addEventListener('click', () => {
      const option = button.dataset.uploadOption;
      elements.uploadMenu.hidden = true;
      if (option === 'computer') elements.fileInput.click();
      else alert(`${button.textContent.trim()} can be connected later with an API integration.`);
    });
  });

  elements.clearQueueButton.addEventListener('click', () => {
    state.queue = [];
    elements.fileInput.value = '';
    renderAll();
  });

  elements.convertButton.addEventListener('click', convertOrDownload);

  elements.closePicker.addEventListener('click', closePicker);
  elements.pickerBackdrop.addEventListener('click', closePicker);
  elements.pickerSearch.addEventListener('input', () => {
    state.picker.search = elements.pickerSearch.value;
    renderPicker();
  });

  elements.closeOptions.addEventListener('click', closeOptions);
  elements.optionsBackdrop.addEventListener('click', closeOptions);
  elements.optionsForm.addEventListener('submit', event => event.preventDefault());

  elements.openToolsButtons.forEach(button => button.addEventListener('click', openTools));
  elements.closeTools.addEventListener('click', closeTools);
  elements.toolsBackdrop.addEventListener('click', closeTools);

  window.addEventListener('popstate', () => {
    Object.assign(state, initialStateFromPath());
    renderAll(true);
  });
}

function renderAll(replaceUrl = false) {
  normalizeState();
  renderHero(state, elements);
  renderServiceMenu(state, elements, setCategory);
  renderFormatInfo(state, elements);
  renderToolsPreview(elements);
  renderQueue(state.queue, state, elements, {
    output: updateQueueOutput,
    options: openOptions,
    remove: removeQueueItem
  });
  bindPreviewTools();
  ensureZipButton();
  updateZipButton();
  updateMeta(state.from, state.to);
  updateBrowserUrl(state.from, state.to, replaceUrl);
}

function normalizeState() {
  if (!formats[state.from]) {
    [state.from, state.to] = categoryDefaults.image;
    state.category = 'image';
  }
  const currentCategory = formats[state.from].category;
  state.category = currentCategory === 'document' && state.from === 'pdf' ? 'pdf' : currentCategory;
  const allowed = conversions[state.from] || [];
  if (!allowed.includes(state.to)) state.to = allowed[0] || state.to;
}

function setCategory(category) {
  const pair = categoryDefaults[category] || categoryDefaults.image;
  state.category = category;
  state.from = pair[0];
  state.to = conversions[state.from]?.includes(pair[1])
    ? pair[1]
    : (conversions[state.from]?.[0] || pair[1]);

  elements.serviceMenu.hidden = true;
  syncQueueWithCurrentFormats();
  renderAll();
}

function setFormats(from, to) {
  if (state.queue.length) {
    state.to = to;
    syncQueueOutputWithCurrentTo();
    renderAll();
    return;
  }

  state.from = from;
  state.to = conversions[from]?.includes(to) && from !== to
    ? to
    : firstValidOutput(from, to);

  renderAll();
}

function swapFormats() {
  if (state.queue.length) {
    notifyFormatLock('Source locked');
    return;
  }

  if (conversions[state.to]?.includes(state.from)) {
    const nextFrom = state.to;
    const nextTo = state.from;

    state.from = nextFrom;
    state.to = nextTo;
  } else {
    state.to = firstValidOutput(state.from, state.to);
  }

  renderAll();
}

function openPicker(mode) {
  if (mode === 'from' && state.queue.length) {
    notifyFormatLock('Source locked');
    return;
  }

  state.picker.mode = mode;
  state.picker.search = '';
  state.picker.activeCategory = mode === 'to'
    ? (formats[state.to]?.category || state.category)
    : state.category;

  elements.pickerSearch.value = '';
  elements.picker.hidden = false;
  elements.pickerBackdrop.hidden = false;
  lockSecondaryScreenScroll();
  renderPicker();
  setTimeout(() => elements.pickerSearch.focus(), 60);
}

function closePicker() {
  elements.picker.hidden = true;
  elements.pickerBackdrop.hidden = true;
  unlockSecondaryScreenScroll();
}

function renderPicker() {
  renderFormatPicker({ mode: state.picker.mode, state, search: state.picker.search, activeCategory: state.picker.activeCategory }, elements, {
    category: category => {
      state.picker.activeCategory = category;
      renderPicker();
    },
    select: format => {
      if (state.picker.mode === 'from') {
        if (state.queue.length) {
          notifyFormatLock('Source locked');
          closePicker();
          return;
        }

        state.from = format;
        state.to = firstValidOutput(format, state.to);
      } else {
        state.to = format;

        if (state.queue.length) {
          syncQueueOutputWithCurrentTo();
        }
      }

      closePicker();
      renderAll();
    }
  });
}

function syncQueueWithCurrentFormats() {
  if (!state.queue.length) return;

  state.queue.forEach(item => {
    revokeItemDownload(item);

    const actualFrom = item.actualFrom || item.from;

    item.actualFrom = actualFrom;
    item.from = actualFrom;
    item.to = firstValidOutput(actualFrom, state.to);
    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  });

  syncHeroToFirstQueueItem();
}

function syncQueueOutputWithCurrentTo() {
  if (!state.queue.length) return;

  state.queue.forEach(item => {
    revokeItemDownload(item);

    const actualFrom = item.actualFrom || item.from;

    item.actualFrom = actualFrom;
    item.from = actualFrom;
    item.to = firstValidOutput(actualFrom, state.to);
    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  });

  syncHeroToFirstQueueItem();
}

/* Source format lock helpers start */
function firstValidOutput(from, preferredTo) {
  const allowed = (conversions[from] || []).filter(output => output !== from);

  if (allowed.includes(preferredTo)) return preferredTo;

  return allowed[0] || preferredTo;
}

function syncHeroToFirstQueueItem() {
  const first = state.queue[0];

  if (!first) return;

  const actualFrom = first.actualFrom || first.from;
  const to = firstValidOutput(actualFrom, first.to || state.to);

  first.actualFrom = actualFrom;
  first.from = actualFrom;
  first.to = to;

  state.from = actualFrom;
  state.to = to;
}

function notifyFormatLock(message) {
  if (typeof showBottomToast === 'function') {
    showBottomToast(message);
    return;
  }

  window.alert(message);
}
/* Source format lock helpers end */

function handleFiles(fileList) {
  if (!fileList || !fileList.length) return;

  const remaining = Math.max(0, 10 - state.queue.length);

  if (!remaining) {
    notifyFormatLock('10-file limit reached');
    elements.fileInput.value = '';
    return;
  }

  const incoming = Array.from(fileList).slice(0, remaining);

  if (fileList.length > remaining) {
    notifyFormatLock(`Free limit: added ${remaining} file${remaining === 1 ? '' : 's'}. Maximum 10 files per batch.`);
  }

  const items = createQueueItems(incoming, state);

  state.queue = [...state.queue, ...items].slice(0, 10);
  elements.fileInput.value = '';

  syncHeroToFirstQueueItem();
  renderAll();
}

function updateQueueOutput(id, output) {
  const item = state.queue.find(entry => entry.id === id);
  if (!item) return;

  const actualFrom = item.actualFrom || item.from;
  const allowed = (conversions[actualFrom] || []).filter(entry => entry !== actualFrom);

  if (!allowed.includes(output)) {
    notifyFormatLock('Choose another output');
    return;
  }

  revokeItemDownload(item);

  item.actualFrom = actualFrom;
  item.from = actualFrom;
  item.to = output;
  item.status = 'ready';
  item.progress = 0;
  item.error = '';

  syncHeroToFirstQueueItem();
  renderAll(true);
}

function removeQueueItem(id) {
  state.queue.filter(item => item.id === id).forEach(revokeItemDownload);
  state.queue = state.queue.filter(item => item.id !== id);
  renderAll(true);
}

function openOptions(id) {
  const item = state.queue.find(entry => entry.id === id);
  if (!item) return;

  state.activeOptionsId = id;
  lockSecondaryScreenScroll();

  renderOptionsModal(item, elements, data => {
    item.settings = data;

    // Important:
    // If user already converted this file, old download is no longer valid
    // after changing quality / rename / width / height.
    revokeItemDownload(item);
    item.status = 'ready';
    item.progress = 0;
    item.error = '';

    closeOptions();
    renderAll(true);
  });
}

function closeOptions() {
  elements.optionsModal.hidden = true;
  elements.optionsBackdrop.hidden = true;
  state.activeOptionsId = null;
  unlockSecondaryScreenScroll();
}

async function convertOrDownload() {
  if (!state.queue.length) return;

  const hasDownload = state.queue.some(item => item.status === 'converted' && item.downloadUrl);
  const hasPending = state.queue.some(item => !['converted', 'error'].includes(item.status));

  if (hasDownload && !hasPending) {
    downloadConvertedFiles();
    return;
  }

  state.queue.forEach(item => {
    if (item.status === 'converted' && item.downloadUrl) return;
    revokeItemDownload(item);
    item.status = 'converting';
    item.progress = 0;
    item.error = '';
  });
  renderAll(true);

  for (const item of state.queue) {
    if (item.status === 'converted' && item.downloadUrl) continue;

    if (!canConvertInBrowser(item)) {
      item.status = 'error';
      item.progress = 0;
      item.error = conversionUnavailableMessage(item);
      renderAll(true);
      continue;
    }

    try {
      item.progress = 35;
      renderAll(true);
      const result = await convertImageItem(item);
      item.downloadUrl = URL.createObjectURL(result.blob);
      item.downloadName = result.name;
      item.status = 'converted';
      item.progress = 100;
      item.error = '';
    } catch (error) {
      item.status = 'error';
      item.progress = 0;
      item.error = error instanceof Error ? error.message : 'Conversion failed in this browser.';
    }
    renderAll(true);
  }
}

function downloadConvertedFiles() {
  state.queue
    .filter(item => item.status === 'converted' && item.downloadUrl)
    .forEach(item => downloadUrl(item.downloadUrl, item.downloadName || item.name));
}

function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function revokeItemDownload(item) {
  if (item.downloadUrl) URL.revokeObjectURL(item.downloadUrl);
  item.downloadUrl = '';
  item.downloadName = '';
}

function openTools() {
  lockSecondaryScreenScroll();
  renderToolsModal(elements, (from, to) => {
    closeTools();
    setFormats(from, to);
  }, category => {
    closeTools();
    setCategory(category);
  });
}

function closeTools() {
  elements.toolsModal.hidden = true;
  elements.toolsBackdrop.hidden = true;
  unlockSecondaryScreenScroll();
}

function bindPreviewTools() {
  document.querySelectorAll('.mini-tool[data-category]').forEach(button => {
    button.onclick = () => setCategory(button.dataset.category);
  });
}

init();


/* Click empty upload area to choose files start */
function setupWholeDropBoxClick() {
  const uploadPanel =
    document.getElementById('uploadPanel') ||
    document.querySelector('.upload-panel') ||
    document.querySelector('.drop-zone') ||
    document.querySelector('.upload-box') ||
    document.querySelector('.upload-zone');

  if (!uploadPanel) return;

  const fileInput =
    document.getElementById('fileInput') ||
    document.querySelector('input[type="file"]');

  if (!fileInput) return;

  uploadPanel.addEventListener('click', event => {
    const ignored = event.target.closest(
      'button, a, input, select, textarea, label, .upload-menu, .upload-menu *'
    );

    if (ignored) return;

    fileInput.click();
  });

  uploadPanel.addEventListener('dragover', event => {
    event.preventDefault();
    uploadPanel.classList.add('is-dragging');
  });

  uploadPanel.addEventListener('dragleave', () => {
    uploadPanel.classList.remove('is-dragging');
  });

  uploadPanel.addEventListener('drop', () => {
    uploadPanel.classList.remove('is-dragging');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupWholeDropBoxClick);
} else {
  setupWholeDropBoxClick();
}
/* Click empty upload area to choose files end */

/* Queue see more controller start */
function setupQueueSeeMore() {
  const panel = document.getElementById('queuePanel');
  if (!panel) return;

  const list = panel.querySelector('.queue-list');
  const actions = panel.querySelector('.queue-actions');
  if (!list || !actions) return;

  function refreshQueueLimit() {
    const rows = Array.from(list.querySelectorAll('.queue-row'));
    const total = rows.length;

    panel.classList.toggle('queue-has-more', total > 3);

    let button = document.getElementById('seeMoreQueueButton');

    if (total <= 3) {
      panel.classList.remove('queue-expanded');
      if (button) button.remove();
      return;
    }

    if (!button) {
      button = document.createElement('button');
      button.id = 'seeMoreQueueButton';
      button.className = 'line-button queue-see-more';
      button.type = 'button';

      const firstChild = actions.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        actions.insertBefore(button, firstChild.nextSibling);
      } else {
        actions.prepend(button);
      }

      button.addEventListener('click', () => {
        panel.classList.toggle('queue-expanded');
        refreshQueueLimit();
      });
    }

    const expanded = panel.classList.contains('queue-expanded');
    button.textContent = expanded ? 'Show less' : `See more (${total - 3})`;
    button.setAttribute('aria-expanded', String(expanded));
  }

  const observer = new MutationObserver(refreshQueueLimit);
  observer.observe(list, { childList: true });

  refreshQueueLimit();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupQueueSeeMore);
} else {
  setupQueueSeeMore();
}
/* Queue see more controller end */

/* Safe upload dropdown direction start */
function setupUploadDropdownDirection() {
  const button =
    document.getElementById('uploadMenuButton') ||
    document.querySelector('.upload-menu-button');

  const menu =
    document.getElementById('uploadMenu') ||
    document.querySelector('.upload-menu');

  if (!button || !menu) return;

  const holder = button.closest('.upload-split') || menu.parentElement;
  if (!holder) return;

  function updateDirection() {
    const isOpen = !menu.hidden && getComputedStyle(menu).display !== 'none';
    if (!isOpen) return;

    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Open upward only when there is clearly not enough room below.
    const shouldDropUp = spaceBelow < 260 && spaceAbove > spaceBelow;

    holder.classList.toggle('drop-up', shouldDropUp);
    holder.classList.toggle('drop-down', !shouldDropUp);
  }

  button.addEventListener('click', () => {
    window.setTimeout(updateDirection, 0);
  });

  window.addEventListener('scroll', updateDirection, { passive: true });
  window.addEventListener('resize', updateDirection);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupUploadDropdownDirection);
} else {
  setupUploadDropdownDirection();
}
/* Safe upload dropdown direction end */

/* Final format picker state sync start */
(function setupFinalFormatPickerStateSync() {
  if (window.__flowSyncFinalFormatPickerStateSync) return;
  window.__flowSyncFinalFormatPickerStateSync = true;

  const browserReadyImageOutputs = {
    png: ['webp', 'jpg', 'pdf'],
    jpg: ['webp', 'png', 'pdf'],
    jpeg: ['webp', 'png', 'pdf'],
    webp: ['png', 'jpg', 'pdf'],
    svg: ['png', 'jpg', 'webp', 'pdf'],
    bmp: ['png', 'jpg', 'webp', 'pdf']
  };

  function categoryForFormat(format) {
    const item = formats[format];
    if (!item) return state.category;
    if (item.category === 'pdf') return 'pdf';
    return item.category;
  }

  function allowedOutputsFor(format) {
    return browserReadyImageOutputs[format] || conversions[format] || [];
  }

  function resetQueueItem(item) {
    revokeItemDownload(item);
    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  }

  function syncQueueFormatsToCurrent() {
    if (!state.queue.length) return;

    state.queue.forEach(item => {
      item.from = state.from;
      item.to = allowedOutputsFor(state.from).includes(state.to)
        ? state.to
        : (allowedOutputsFor(state.from)[0] || state.to);

      resetQueueItem(item);
    });
  }

  function syncQueueOutputToCurrent() {
    if (!state.queue.length) return;

    state.queue.forEach(item => {
      item.to = allowedOutputsFor(item.from).includes(state.to)
        ? state.to
        : (allowedOutputsFor(item.from)[0] || item.to);

      resetQueueItem(item);
    });
  }

  function applyFormatSelection(format) {
    if (!formats[format]) return;

    if (state.picker.mode === 'from') {
      state.from = format;
      state.category = categoryForFormat(format);

      const allowed = allowedOutputsFor(format);
      state.to = allowed.includes(state.to)
        ? state.to
        : (allowed[0] || state.to);

      syncQueueFormatsToCurrent();
    } else {
      const allowed = allowedOutputsFor(state.from);
      if (!allowed.includes(format)) return;

      state.to = format;
      syncQueueOutputToCurrent();
    }

    closePicker();
    renderAll(true);
  }

  elements.pickerFormats.addEventListener('click', event => {
    const button = event.target.closest('[data-format]');
    if (!button || !elements.pickerFormats.contains(button)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    applyFormatSelection(button.dataset.format);
  }, true);
})();
/* Final format picker state sync end */

/* ZIP download and toast final start */
function ensureZipButton() {
  const actions = document.querySelector('#queuePanel .queue-actions');
  const convertButton = document.getElementById('convertButton');

  if (!actions || !convertButton) return;

  let zipButton = document.getElementById('zipButton');

  if (!zipButton) {
    zipButton = document.createElement('button');
    zipButton.id = 'zipButton';
    zipButton.type = 'button';
    zipButton.className = 'secondary-button zip-button';
    zipButton.textContent = 'Download ZIP';
    zipButton.hidden = true;

    convertButton.insertAdjacentElement('afterend', zipButton);
    zipButton.addEventListener('click', downloadConvertedZip);
  }
}

function convertedQueueItems() {
  return state.queue.filter(item => item.status === 'converted' && item.downloadUrl);
}

function updateZipButton() {
  const zipButton = document.getElementById('zipButton');

  if (!zipButton) return;

  const converted = convertedQueueItems();
  const pending = state.queue.some(item => !['converted', 'error'].includes(item.status));

  zipButton.hidden = !(converted.length > 1 && !pending);
}

async function downloadConvertedZip() {
  const converted = convertedQueueItems();

  if (converted.length < 2) {
    showBottomToast('Convert at least 2 files before downloading ZIP.');
    return;
  }

  try {
    const files = [];

    for (const item of converted) {
      const response = await fetch(item.downloadUrl);
      const blob = await response.blob();
      const bytes = new Uint8Array(await blob.arrayBuffer());

      files.push({
        name: safeZipFileName(item.downloadName || item.name || 'converted-file'),
        bytes
      });
    }

    const zipBlob = buildZip(files);
    const zipUrl = URL.createObjectURL(zipBlob);

    downloadUrl(zipUrl, `${state.from}-to-${state.to}-converted.zip`);

    setTimeout(() => URL.revokeObjectURL(zipUrl), 1200);
  } catch (error) {
    showBottomToast('ZIP download failed. Try converting again.');
  }
}

function safeZipFileName(name) {
  return String(name || 'converted-file')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || 'converted-file';
}

function buildZip(files) {
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.bytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, file.bytes.length, true);
    view.setUint32(22, file.bytes.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);

    localHeader.set(nameBytes, 30);
    chunks.push(localHeader, file.bytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.bytes.length, true);
    centralView.setUint32(24, file.bytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);

    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);

    offset += localHeader.length + file.bytes.length;
  }

  const centralStart = offset;

  for (const part of central) {
    chunks.push(part);
    offset += part.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);

  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, offset - centralStart, true);
  endView.setUint32(16, centralStart, true);
  endView.setUint16(20, 0, true);

  chunks.push(end);

  return new Blob(chunks, { type: 'application/zip' });
}

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i++) {
    let c = i;

    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[i] = c >>> 0;
  }

  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function setupAddMoreLimitToast() {
  const addButton = document.getElementById('addFileButton');

  if (!addButton || addButton.dataset.limitToastReady === 'true') return;

  addButton.dataset.limitToastReady = 'true';

  addButton.addEventListener('click', event => {
    if (state.queue.length < 10) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showBottomToast('10-file limit reached Upgrade option coming later.');
  }, true);
}

function showBottomToast(message) {
  let toast = document.getElementById('appToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  window.clearTimeout(showBottomToast.timer);
  showBottomToast.timer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 1700);
}

ensureZipButton();
setupAddMoreLimitToast();
/* ZIP download and toast final end */





