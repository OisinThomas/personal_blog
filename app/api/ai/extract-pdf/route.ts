import { NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    return NextResponse.json({
      text: text as string,
      pages: totalPages,
    });
  } catch (err) {
    console.error('PDF extraction error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF extraction failed' },
      { status: 500 }
    );
  }
}
