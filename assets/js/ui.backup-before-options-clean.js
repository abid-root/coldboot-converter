import { categories, conversions, formats, formatNotes, popularRoutes } from './data.js';
import { bytesToSize } from './upload.js';

const iconMap = {
  image: 'M4 5.5A2.5 2.5 0 0 1 6.5 3h6.1L20 10.4v8.1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Zm9 0V10h4.5L13 5.5ZM7 17h10l-3.1-4.1-2.3 2.8-1.6-2.1L7 17Zm1.5-5.8a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z',
  video: 'M5 5h10a2 2 0 0 1 2 2v1.2l3-1.8v9.2l-3-1.8V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3.5 3.2v7l5.5-3.5-5.5-3.5Z',
  audio: 'M9 4h9v3H12v8.6A3.2 3.2 0 1 1 9 12.4V4Z',
  pdf: 'M6 3h7l5 5v13H6V3Zm7 1.5V9h4.5L13 4.5ZM8.3 16.8c.9-1.3 1.5-2.7 1.8-4.1-.4-1.3-.3-2.2.3-2.5.5-.2 1 .2 1.1.9.1.6 0 1.2-.2 1.8.4.9.9 1.7 1.5 2.3.9-.2 1.7-.2 2.2.1.5.4.3 1-.2 1.2-.6.2-1.4 0-2.2-.6-1 .2-2 .5-3 .9-.7 1-1.4 1.5-2 1.4-.5-.1-.7-.6-.4-1 .2-.2.5-.4 1.1-.4Z',
  document: 'M6 3h7l5 5v13H6V3Zm7 1.5V9h4.5L13 4.5ZM8 13h8v1.5H8V13Zm0 3h8v1.5H8V16Zm0-6h5v1.5H8V10Z',
  presentation: 'M4 5h16v10H4V5Zm2 2v6h12V7H6Zm5 8h2v3h4v2H7v-2h4v-3Z',
  archive: 'M7 3h10v18H7V3Zm2 2v2h2V5H9Zm2 2v2h2V7h-2Zm-2 2v2h2V9H9Zm2 2v2h2v-2h-2Zm-2 2v2h2v-2H9Z',
  ebook: 'M5 4h11a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2V4Zm3 3v9h8V7H8Z'
};

export function formatIcon(format) {
  const icon = formats[format]?.icon || formats[format]?.category || 'document';
  const path = iconMap[icon] || iconMap.document;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}

export function renderServiceMenu(state, elements, onCategory) {
  const active = categories[state.category] || categories.image;
  elements.serviceCurrent.textContent = active.label;
  elements.serviceMenu.innerHTML = Object.entries(categories)
    .filter(([key]) => ['image', 'video', 'audio', 'pdf', 'document', 'presentation'].includes(key))
    .map(([key, item]) => `
      <button class="service-menu-item ${key === state.category ? 'active' : ''}" data-category="${key}">
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.description)}</small>
      </button>
    `).join('');
  elements.serviceMenu.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => onCategory(button.dataset.category));
  });
}

export function renderHero(state, elements) {
  const from = formats[state.from];
  const to = formats[state.to];
  const categoryLabel = categories[state.category]?.label || 'Files';
  elements.kicker.textContent = `${categoryLabel} conversion`;
  elements.title.textContent = `${from.label} to ${to.label} Converter`;
  elements.description.textContent = `Convert ${from.label} files to ${to.label} with a clean queue, smart output choices, and per-file settings for size, quality, and names.`;
  elements.fromCard.innerHTML = formatCardMarkup(state.from, 'From');
  elements.toCard.innerHTML = formatCardMarkup(state.to, 'To');
}

function formatCardMarkup(format, eyebrow) {
  const item = formats[format];
  return `
    <span class="format-eyebrow">${escapeHtml(eyebrow)}</span>
    <span class="format-icon">${formatIcon(format)}</span>
    <strong>${escapeHtml(item.label)}</strong>
    <small>${escapeHtml(item.title)}</small>
    <span class="format-chevron">&rsaquo;</span>
  `;
}

export function renderFormatInfo(state, elements) {
  const items = [state.from, state.to].filter(Boolean);
  elements.formatInfo.innerHTML = items.map(format => {
    const data = formats[format];
    const note = formatNotes[format] || `${data.label} is a common file format used in ${categories[data.category]?.label?.toLowerCase() || 'file'} workflows.`;
    const route = categories[data.category]?.route || 'tools';
    return `
      <article class="info-card">
        <div class="info-icon">${formatIcon(format)}</div>
        <div>
          <h3>${escapeHtml(data.label)} <span>- ${escapeHtml(data.title)}</span></h3>
          <p>${escapeHtml(note)}</p>
          <a href="/${route}/">${escapeHtml(data.label)} tools &rarr;</a>
        </div>
      </article>
    `;
  }).join('');
}

export function renderToolsPreview(elements) {
  elements.toolsPreview.innerHTML = Object.entries(categories)
    .filter(([key]) => ['image', 'video', 'audio', 'pdf', 'document', 'presentation'].includes(key))
    .map(([key, item]) => `
      <button class="mini-tool" data-category="${key}">
        <span class="mini-tool-icon">${formatIcon(item.formats[0])}</span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${item.formats.slice(0, 6).map(f => formats[f]?.label || f.toUpperCase()).join(', ')}</small>
      </button>
    `).join('');
}

export function renderFormatPicker({ mode, state, search = '', activeCategory = null }, elements, handlers) {
  const categoryKey = activeCategory || state.category;
  const categoryList = Object.entries(categories);
  const validOutputs = conversions[state.from] || [];
  const allFromFormats = categoryKey === 'all'
    ? Object.keys(formats)
    : (categories[categoryKey]?.formats || []);
  const source = mode === 'to' ? validOutputs : allFromFormats;
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFormats = source.filter(format => {
    const item = formats[format];
    if (!item) return false;
    return !normalizedSearch || item.label.toLowerCase().includes(normalizedSearch) || item.title.toLowerCase().includes(normalizedSearch);
  });

  elements.pickerTitle.textContent = mode === 'to' ? `Choose output for ${formats[state.from].label}` : 'Choose input format';
  elements.pickerSubtitle.textContent = mode === 'to' ? 'Only possible outputs are shown.' : 'Pick a category, then choose a source format.';

  elements.pickerCategories.innerHTML = categoryList.map(([key, item]) => `
    <button class="picker-category ${key === categoryKey ? 'active' : ''}" data-picker-category="${key}">
      <span>${escapeHtml(item.label)}</span><small>${item.formats.length}</small>
    </button>
  `).join('');

  elements.pickerFormats.innerHTML = visibleFormats.length ? visibleFormats.map(format => {
    const item = formats[format];
    const selected = (mode === 'to' ? state.to : state.from) === format;
    return `
      <button class="format-chip ${selected ? 'active' : ''}" data-format="${format}">
        <span>${formatIcon(format)}</span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.title)}</small>
      </button>
    `;
  }).join('') : '<p class="empty-message">No matching format found.</p>';

  elements.pickerCategories.querySelectorAll('[data-picker-category]').forEach(button => {
    button.addEventListener('click', () => handlers.category(button.dataset.pickerCategory));
  });
  elements.pickerFormats.querySelectorAll('[data-format]').forEach(button => {
    button.addEventListener('click', () => handlers.select(button.dataset.format));
  });
}

export function renderQueue(queue, state, elements, handlers) {
  const hasFiles = queue.length > 0;
  elements.uploadPanel.hidden = hasFiles;
  elements.queuePanel.hidden = !hasFiles;
  if (!hasFiles) return;

  const total = queue.reduce((sum, item) => sum + item.size, 0);
  elements.queueSummary.textContent = `${queue.length} file${queue.length > 1 ? 's' : ''} ready - ${bytesToSize(total)} total - Free limit: 10 files`;

  elements.queueList.innerHTML = queue.map(item => `
    <article class="queue-row" data-id="${item.id}">
      <div class="queue-file">
        <span class="queue-icon">${formatIcon(item.from)}</span>
        <div>
          <strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong>
          <small>${bytesToSize(item.size)} - ${formats[item.from]?.label || item.from.toUpperCase()} file</small>
        </div>
      </div>
      <div class="queue-conversion">
        <span class="convert-word">Convert</span>
        <span class="tag">${formats[item.from]?.label || item.from.toUpperCase()}</span>
        <span class="arrow">&rarr;</span>
        <div class="queue-output-picker">
          <button class="queue-output-button" type="button" aria-label="Output format">
            <span>${formats[item.to]?.label || item.to.toUpperCase()}</span>
            <span aria-hidden="true">&#9662;</span>
          </button>
          <div class="queue-output-menu">
            ${(conversions[item.from] || conversions[state.from] || []).map(output => `
              <button type="button" class="${output === item.to ? 'active' : ''}" data-output="${item.id}" data-output-value="${output}">
                ${formats[output]?.label || output.toUpperCase()}
              </button>
            `).join('')}
          </div>
        </div>
        <button class="line-button" data-options="${item.id}">Options</button>
        <button class="icon-only" data-remove="${item.id}" aria-label="Remove ${escapeHtml(item.name)}">&times;</button>
      </div>
      <div class="queue-status ${item.status}">
        ${queueStatusText(item)}
      </div>
    </article>
  `).join('');

  elements.queueList.querySelectorAll('[data-output][data-output-value]').forEach(button => {
    button.addEventListener('click', () => handlers.output(button.dataset.output, button.dataset.outputValue));
  });
  elements.queueList.querySelectorAll('[data-options]').forEach(button => {
    button.addEventListener('click', () => handlers.options(button.dataset.options));
  });
  elements.queueList.querySelectorAll('[data-remove]').forEach(button => {
    button.addEventListener('click', () => handlers.remove(button.dataset.remove));
  });

  const converted = queue.some(item => item.status === 'converted' && item.downloadUrl);
  const pending = queue.some(item => !['converted', 'error'].includes(item.status));
  elements.convertButton.textContent = converted && !pending ? 'Download converted' : 'Convert';
  elements.convertButton.classList.toggle('converted', converted && !pending);
}

export function renderOptionsModal(item, elements, onSave) {
  const category = formats[item.from]?.category || formats[item.to]?.category || 'image';
  const fields = optionsForCategory(category, item);
  elements.optionsTitle.textContent = `${formats[item.to]?.label || item.to.toUpperCase()} options`;
  elements.optionsBody.innerHTML = fields;
  elements.optionsModal.hidden = false;
  elements.optionsBackdrop.hidden = false;
  elements.optionsSave.onclick = () => {
    const data = Object.fromEntries(new FormData(elements.optionsForm).entries());
    onSave(data);
  };
}

function queueStatusText(item) {
  if (item.status === 'converted') return `Ready to download${item.downloadName ? ` - ${escapeHtml(item.downloadName)}` : ''}`;
  if (item.status === 'converting') return `Converting ${item.progress}%`;
  if (item.status === 'error') return escapeHtml(item.error || 'Conversion engine coming later for this format.');
  return 'Ready';
}

function optionsForCategory(category, item) {
  const baseName = escapeHtml(stripExtension(item.name));
  const renameValue = escapeHtml(item.settings.rename || '');
  const rename = `<label class="field full"><span>Output name</span><input name="rename" placeholder="${baseName}" value="${renameValue}"><small>Leave empty to keep the original name.</small></label>`;

  if (category === 'video') {
    return `
      <label class="field"><span>Resolution</span><select name="resolution"><option>Original</option><option>1080p</option><option>720p</option><option>480p</option></select></label>
      <label class="field"><span>Quality</span><input name="quality" type="number" min="1" max="100" placeholder="80"></label>
      <label class="field"><span>Trim start</span><input name="trimStart" placeholder="00:00"></label>
      <label class="field"><span>Trim end</span><input name="trimEnd" placeholder="00:30"></label>
      <label class="switch-field"><span>Remove audio</span><input name="removeAudio" type="checkbox"></label>
      ${rename}
    `;
  }

  if (category === 'audio') {
    return `
      <label class="field"><span>Bitrate</span><select name="bitrate"><option>Auto</option><option>128 kbps</option><option>192 kbps</option><option>256 kbps</option><option>320 kbps</option></select></label>
      <label class="field"><span>Sample rate</span><select name="sampleRate"><option>Auto</option><option>44100 Hz</option><option>48000 Hz</option></select></label>
      <label class="switch-field"><span>Normalize volume</span><input name="normalize" type="checkbox"></label>
      <label class="field"><span>Trim</span><input name="trim" placeholder="00:00 - 00:30"></label>
      ${rename}
    `;
  }

  if (category === 'pdf' || item.from === 'pdf' || item.to === 'pdf') {
    return `
      <label class="field"><span>Page range</span><input name="pages" placeholder="All or 1-5"></label>
      <label class="field"><span>DPI</span><select name="dpi"><option>150</option><option>200</option><option>300</option></select></label>
      <label class="field"><span>Image quality</span><input name="quality" type="number" min="1" max="100" placeholder="85"></label>
      <label class="switch-field"><span>Merge pages</span><input name="merge" type="checkbox"></label>
      ${rename}
    `;
  }

  if (category === 'document' || category === 'presentation') {
    return `
      <label class="field"><span>Page size</span><select name="pageSize"><option>Auto</option><option>A4</option><option>Letter</option></select></label>
      <label class="switch-field"><span>Keep formatting</span><input name="formatting" type="checkbox" checked></label>
      <label class="field"><span>Range</span><input name="range" placeholder="All"></label>
      ${rename}
    `;
  }

  return `
    <label class="field"><span>Width</span><input name="width" type="number" placeholder="Auto"><small>Output width in pixels.</small></label>
    <label class="field"><span>Height</span><input name="height" type="number" placeholder="Auto"><small>Output height in pixels.</small></label>
    <label class="field"><span>Fit</span><select name="fit"><option>Keep aspect ratio</option><option>Crop to size</option><option>Stretch</option></select></label>
    <label class="field"><span>Quality</span><input name="quality" type="number" min="1" max="100" placeholder="85"><small>${escapeHtml(formats[item.to]?.label || 'Output')} quality level.</small></label>
    <label class="switch-field"><span>Remove metadata</span><input name="strip" type="checkbox" checked></label>
    <label class="switch-field"><span>White background</span><input name="background" type="checkbox"></label>
    ${rename}
  `;
}

function stripExtension(name) {
  return name.replace(/\.[^/.]+$/, '');
}

export function renderToolsModal(elements, onSelectPair, onSelectCategory) {
  const popular = popularRoutes.map(([from, to]) => `
    <button class="tool-pill" data-from="${from}" data-to="${to}">${formats[from].label} to ${formats[to].label}</button>
  `).join('');

  const groups = Object.entries(categories).map(([key, item]) => `
    <article class="tool-card-large">
      <div class="tool-card-top">
        <span>${formatIcon(item.formats[0])}</span>
        <button data-category-jump="${key}">Open</button>
      </div>
      <h3>${escapeHtml(item.label)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="tool-tags">${item.formats.slice(0, 7).map(format => `<small>${formats[format]?.label || format.toUpperCase()}</small>`).join('')}</div>
    </article>
  `).join('');

  elements.toolsModalBody.innerHTML = `
    <div class="tools-search-row">
      <input id="toolSearch" type="search" placeholder="Search a tool, for example: png to webp" autocomplete="off">
    </div>
    <div class="popular-tools">${popular}</div>
    <div class="tool-grid-large">${groups}</div>
  `;
  elements.toolsModal.hidden = false;
  elements.toolsBackdrop.hidden = false;

  elements.toolsModalBody.querySelectorAll('[data-from][data-to]').forEach(button => {
    button.addEventListener('click', () => onSelectPair(button.dataset.from, button.dataset.to));
  });
  elements.toolsModalBody.querySelectorAll('[data-category-jump]').forEach(button => {
    button.addEventListener('click', () => onSelectCategory(button.dataset.categoryJump));
  });

  const search = elements.toolsModalBody.querySelector('#toolSearch');
  search.addEventListener('input', () => {
    const value = search.value.toLowerCase().replace(/\s+/g, ' ').trim();
    elements.toolsModalBody.querySelectorAll('.tool-pill').forEach(button => {
      const text = button.textContent.toLowerCase().replace(/\s+/g, ' ').trim();
      button.hidden = Boolean(value) && !text.includes(value);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
