import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { verifyAdminSession, validateCsrfOrigin } from '@/lib/auth';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
};

function matchesMagicBytes(buf: Buffer, mime: string): boolean {
  if (buf.length < 12) return false;

  if (mime === 'image/jpeg') {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mime === 'image/png') {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  if (mime === 'image/webp') {
    const isRiff = buf.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buf.toString('ascii', 8, 12) === 'WEBP';
    return isRiff && isWebp;
  }
  if (mime === 'image/avif') {
    const ftyp = buf.toString('ascii', 4, 8);
    const brand = buf.toString('ascii', 8, 12);
    return ftyp === 'ftyp' && (brand === 'avif' || brand === 'avis');
  }
  return false;
}

export async function POST(request: Request) {
  try {
    // 1. Defesa em profundidade contra CSRF
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: 'Origem da requisição inválida' }, { status: 403 });
    }

    // 2. Validação rigorosa de autenticação no servidor
    const auth = await verifyAdminSession();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Autentique-se como gestor para realizar uploads.' },
        { status: 401 }
      );
    }

    // 3. Extração do arquivo multipart
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo válido foi enviado' }, { status: 400 });
    }

    // 4. Validação de tamanho
    if (file.size === 0) {
      return NextResponse.json({ error: 'O arquivo enviado está vazio' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'O arquivo excede o limite máximo permitido de 5 MB' },
        { status: 400 }
      );
    }

    // 5. Validação de tipo MIME (rejeita explicitamente SVG e outros formatos não permitidos)
    const mimeType = file.type.toLowerCase();
    const allowedExtensions = ALLOWED_MIME_TYPES[mimeType];
    if (!allowedExtensions) {
      return NextResponse.json(
        { error: 'Formato de arquivo não permitido. Apenas imagens JPEG, PNG, WEBP ou AVIF são aceitas.' },
        { status: 400 }
      );
    }

    // 6. Validação de extensão
    const rawExt = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(rawExt)) {
      return NextResponse.json(
        { error: 'Extensão de arquivo incompatível com o tipo de imagem declarado.' },
        { status: 400 }
      );
    }

    // 7. Validação do conteúdo real via magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!matchesMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        { error: 'O conteúdo real do arquivo não corresponde a uma imagem válida.' },
        { status: 400 }
      );
    }

    // 8. Sanitização de nome e prevenção contra Path Traversal
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanBase = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'foto';
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const fileName = `${cleanBase}-${Date.now()}-${randomSuffix}${rawExt}`;
    const filePath = path.resolve(uploadsDir, fileName);

    // Garante que o caminho final reside estritamente dentro da pasta uploads
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Caminho de arquivo inválido' }, { status: 400 });
    }

    // Gravação segura sem sobrescrever arquivos existentes ('wx')
    fs.writeFileSync(filePath, buffer, { flag: 'wx' });

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl, fileName });
  } catch (error) {
    console.error('Erro no endpoint POST /api/upload:', error);
    return NextResponse.json({ error: 'Erro ao processar o upload da imagem' }, { status: 500 });
  }
}

