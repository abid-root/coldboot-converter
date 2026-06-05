export const categories = {
  image: {
    label: 'Images',
    route: 'image-converter',
    description: 'Convert, resize, compress, and optimize image files.',
    formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'gif', 'svg', 'bmp', 'tiff', 'ico']
  },
  video: {
    label: 'Video',
    route: 'video-converter',
    description: 'Convert clips, extract audio, create GIFs, and prepare web video.',
    formats: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'gif']
  },
  audio: {
    label: 'Audio',
    route: 'audio-converter',
    description: 'Convert music, voice notes, podcasts, and audio tracks.',
    formats: ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus']
  },
  pdf: {
    label: 'PDF',
    route: 'pdf-converter',
    description: 'Convert PDFs to images, create PDFs, merge, split, and compress.',
    formats: ['pdf', 'png', 'jpg', 'webp', 'docx', 'pptx', 'txt']
  },
  document: {
    label: 'Documents',
    route: 'document-converter',
    description: 'Convert office files, text, spreadsheets, and web documents.',
    formats: ['docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'md', 'xlsx', 'csv']
  },
  presentation: {
    label: 'Presentations',
    route: 'presentation-converter',
    description: 'Convert slides to PDF or images, and prepare presentation files.',
    formats: ['pptx', 'ppt', 'pdf', 'odp', 'jpg', 'png']
  },
  archive: {
    label: 'Archives',
    route: 'tools',
    description: 'Compress and extract common archive formats.',
    formats: ['zip', 'rar', '7z', 'tar']
  },
  ebook: {
    label: 'Ebook',
    route: 'tools',
    description: 'Convert reading files for ebook readers and documents.',
    formats: ['epub', 'mobi', 'pdf', 'txt']
  }
};

export const formats = {
  png: { label: 'PNG', category: 'image', mime: 'image/png', title: 'Portable Network Graphic', icon: 'image' },
  jpg: { label: 'JPG', category: 'image', mime: 'image/jpeg', title: 'JPEG Image', icon: 'image' },
  jpeg: { label: 'JPEG', category: 'image', mime: 'image/jpeg', title: 'JPEG Image', icon: 'image' },
  webp: { label: 'WEBP', category: 'image', mime: 'image/webp', title: 'Web Picture Format', icon: 'image' },
  avif: { label: 'AVIF', category: 'image', mime: 'image/avif', title: 'AV1 Image Format', icon: 'image' },
  heic: { label: 'HEIC', category: 'image', mime: 'image/heic', title: 'High Efficiency Image', icon: 'image' },
  gif: { label: 'GIF', category: 'image', mime: 'image/gif', title: 'Graphics Interchange Format', icon: 'image' },
  svg: { label: 'SVG', category: 'image', mime: 'image/svg+xml', title: 'Scalable Vector Graphic', icon: 'image' },
  bmp: { label: 'BMP', category: 'image', mime: 'image/bmp', title: 'Bitmap Image', icon: 'image' },
  tiff: { label: 'TIFF', category: 'image', mime: 'image/tiff', title: 'Tagged Image File', icon: 'image' },
  ico: { label: 'ICO', category: 'image', mime: 'image/x-icon', title: 'Icon File', icon: 'image' },

  mp4: { label: 'MP4', category: 'video', mime: 'video/mp4', title: 'MPEG-4 Video', icon: 'video' },
  mov: { label: 'MOV', category: 'video', mime: 'video/quicktime', title: 'QuickTime Movie', icon: 'video' },
  webm: { label: 'WEBM', category: 'video', mime: 'video/webm', title: 'WebM Video', icon: 'video' },
  avi: { label: 'AVI', category: 'video', mime: 'video/x-msvideo', title: 'Audio Video Interleave', icon: 'video' },
  mkv: { label: 'MKV', category: 'video', mime: 'video/x-matroska', title: 'Matroska Video', icon: 'video' },
  m4v: { label: 'M4V', category: 'video', mime: 'video/x-m4v', title: 'MPEG-4 Video', icon: 'video' },

  mp3: { label: 'MP3', category: 'audio', mime: 'audio/mpeg', title: 'MP3 Audio', icon: 'audio' },
  wav: { label: 'WAV', category: 'audio', mime: 'audio/wav', title: 'Waveform Audio', icon: 'audio' },
  m4a: { label: 'M4A', category: 'audio', mime: 'audio/mp4', title: 'MPEG-4 Audio', icon: 'audio' },
  aac: { label: 'AAC', category: 'audio', mime: 'audio/aac', title: 'Advanced Audio Coding', icon: 'audio' },
  flac: { label: 'FLAC', category: 'audio', mime: 'audio/flac', title: 'Free Lossless Audio Codec', icon: 'audio' },
  ogg: { label: 'OGG', category: 'audio', mime: 'audio/ogg', title: 'Ogg Audio', icon: 'audio' },
  opus: { label: 'OPUS', category: 'audio', mime: 'audio/opus', title: 'Opus Audio', icon: 'audio' },

  pdf: { label: 'PDF', category: 'pdf', mime: 'application/pdf', title: 'Portable Document Format', icon: 'pdf' },
  docx: { label: 'DOCX', category: 'document', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', title: 'Word Document', icon: 'document' },
  doc: { label: 'DOC', category: 'document', mime: 'application/msword', title: 'Word Document', icon: 'document' },
  txt: { label: 'TXT', category: 'document', mime: 'text/plain', title: 'Plain Text', icon: 'document' },
  rtf: { label: 'RTF', category: 'document', mime: 'application/rtf', title: 'Rich Text Format', icon: 'document' },
  odt: { label: 'ODT', category: 'document', mime: 'application/vnd.oasis.opendocument.text', title: 'OpenDocument Text', icon: 'document' },
  html: { label: 'HTML', category: 'document', mime: 'text/html', title: 'HTML Document', icon: 'document' },
  md: { label: 'MD', category: 'document', mime: 'text/markdown', title: 'Markdown File', icon: 'document' },
  xlsx: { label: 'XLSX', category: 'document', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', title: 'Excel Spreadsheet', icon: 'document' },
  csv: { label: 'CSV', category: 'document', mime: 'text/csv', title: 'Comma-separated Values', icon: 'document' },

  pptx: { label: 'PPTX', category: 'presentation', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', title: 'PowerPoint Presentation', icon: 'presentation' },
  ppt: { label: 'PPT', category: 'presentation', mime: 'application/vnd.ms-powerpoint', title: 'PowerPoint Presentation', icon: 'presentation' },
  odp: { label: 'ODP', category: 'presentation', mime: 'application/vnd.oasis.opendocument.presentation', title: 'OpenDocument Presentation', icon: 'presentation' },

  zip: { label: 'ZIP', category: 'archive', mime: 'application/zip', title: 'ZIP Archive', icon: 'archive' },
  rar: { label: 'RAR', category: 'archive', mime: 'application/vnd.rar', title: 'RAR Archive', icon: 'archive' },
  '7z': { label: '7Z', category: 'archive', mime: 'application/x-7z-compressed', title: '7-Zip Archive', icon: 'archive' },
  tar: { label: 'TAR', category: 'archive', mime: 'application/x-tar', title: 'Tape Archive', icon: 'archive' },
  epub: { label: 'EPUB', category: 'ebook', mime: 'application/epub+zip', title: 'EPUB Ebook', icon: 'ebook' },
  mobi: { label: 'MOBI', category: 'ebook', mime: 'application/x-mobipocket-ebook', title: 'Mobipocket Ebook', icon: 'ebook' }
};

export const conversions = {
  png: ['webp', 'jpg'],
  jpg: ['webp', 'png'],
  jpeg: ['webp', 'png'],
  webp: ['png', 'jpg'],
  avif: ['jpg', 'png', 'webp'],
  heic: ['jpg', 'png', 'webp', 'pdf'],
  svg: ['png', 'jpg', 'webp', 'pdf'],
  gif: ['mp4', 'webp', 'png'],
  bmp: ['png', 'jpg', 'webp'],
  tiff: ['jpg', 'png', 'pdf'],
  ico: ['png', 'jpg'],

  mp4: ['mp3', 'gif', 'webm', 'mov', 'm4a'],
  mov: ['mp4', 'webm', 'mp3'],
  webm: ['mp4', 'mp3', 'gif'],
  avi: ['mp4', 'webm'],
  mkv: ['mp4', 'webm'],
  m4v: ['mp4', 'webm'],

  mp3: ['wav', 'm4a', 'ogg', 'flac'],
  wav: ['mp3', 'm4a', 'flac', 'ogg'],
  m4a: ['mp3', 'wav', 'aac'],
  aac: ['mp3', 'wav', 'm4a'],
  flac: ['mp3', 'wav', 'ogg'],
  ogg: ['mp3', 'wav', 'opus'],
  opus: ['mp3', 'wav', 'ogg'],

  pdf: ['jpg', 'png', 'webp', 'docx', 'pptx', 'txt'],
  docx: ['pdf', 'txt', 'html'],
  doc: ['pdf', 'docx', 'txt'],
  txt: ['pdf', 'docx', 'html'],
  rtf: ['pdf', 'docx'],
  odt: ['pdf', 'docx'],
  html: ['pdf', 'txt'],
  md: ['html', 'pdf', 'txt'],
  xlsx: ['csv', 'pdf'],
  csv: ['xlsx', 'pdf'],

  pptx: ['pdf', 'jpg', 'png'],
  ppt: ['pdf', 'pptx'],
  odp: ['pdf', 'pptx'],

  zip: ['7z', 'tar'],
  rar: ['zip', '7z'],
  '7z': ['zip', 'tar'],
  tar: ['zip', '7z'],
  epub: ['pdf', 'txt'],
  mobi: ['epub', 'pdf']
};

export const popularRoutes = [
  ['png', 'webp'], ['jpg', 'webp'], ['webp', 'png'], ['webp', 'jpg'], ['png', 'jpg'], ['jpg', 'png'],
  ['heic', 'jpg'], ['svg', 'png'], ['png', 'pdf'], ['jpg', 'pdf'], ['pdf', 'jpg'], ['pdf', 'png'],
  ['mp4', 'mp3'], ['mov', 'mp4'], ['wav', 'mp3'], ['m4a', 'mp3'], ['pptx', 'pdf'], ['docx', 'pdf']
];

export const categoryDefaults = {
  image: ['png', 'webp'],
  video: ['mp4', 'mp3'],
  audio: ['wav', 'mp3'],
  pdf: ['pdf', 'jpg'],
  document: ['docx', 'pdf'],
  presentation: ['pptx', 'pdf'],
  archive: ['zip', '7z'],
  ebook: ['epub', 'pdf']
};

export const formatNotes = {
  png: 'A lossless image format commonly used for transparent graphics, UI images, and screenshots.',
  webp: 'A modern image format designed for smaller web images with strong compression and good quality.',
  jpg: 'A popular photo format with small file size and broad compatibility across devices and browsers.',
  pdf: 'A portable document format used for sharing pages, scans, forms, and printable documents.',
  mp4: 'A widely supported video container commonly used for online video and device playback.',
  mp3: 'A common audio format supported almost everywhere for music, voice, and compressed sound files.',
  docx: 'A modern Word document format used for editable text documents with formatting.',
  pptx: 'A modern presentation format used for slides, pitch decks, and teaching materials.'
};


