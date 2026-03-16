export interface Attachment {
  id: string;
  name: string;
  type: 'text' | 'image' | 'pdf';
  content: string;
  mimeType: string;
  size: number;
}

const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.html', '.xml', '.yml', '.yaml', '.toml', '.ini', '.log', '.tsx', '.ts', '.js', '.jsx', '.css', '.scss'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

function getExtension(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as text'));
    reader.readAsText(file);
  });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as data URL'));
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/ai/extract-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PDF extraction failed: ${err}`);
  }

  const { text } = await res.json();
  return text;
}

export async function extractFileContent(file: File): Promise<Attachment> {
  const ext = getExtension(file.name);
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (ext === '.pdf') {
    const content = await extractPdfText(file);
    return { id, name: file.name, type: 'pdf', content, mimeType: file.type, size: file.size };
  }

  if (IMAGE_EXTENSIONS.includes(ext) || file.type.startsWith('image/')) {
    const content = await readAsDataURL(file);
    return { id, name: file.name, type: 'image', content, mimeType: file.type, size: file.size };
  }

  // Default to text
  if (TEXT_EXTENSIONS.includes(ext) || file.type.startsWith('text/') || file.type === 'application/json') {
    const content = await readAsText(file);
    return { id, name: file.name, type: 'text', content, mimeType: file.type || 'text/plain', size: file.size };
  }

  // Try reading as text for unknown types
  try {
    const content = await readAsText(file);
    return { id, name: file.name, type: 'text', content, mimeType: file.type || 'text/plain', size: file.size };
  } catch {
    throw new Error(`Unsupported file type: ${ext || file.type}`);
  }
}
