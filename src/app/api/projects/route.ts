import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { PROJECTS_DATA, TRACK_OPTIONS } from '@/data/projectsData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track');
    const id = searchParams.get('id');

    const db = getDatabase();
    const sourceProjects = (db.projects && db.projects.length > 0) ? db.projects : PROJECTS_DATA;

    if (id) {
      const project = sourceProjects.find((p) => p.id === id);
      if (!project) {
        return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, project });
    }

    let items = sourceProjects;
    if (track && track !== 'Todas as Trilhas' && !track.includes('Todas')) {
      items = items.filter((p) => p.track === track);
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      tracks: TRACK_OPTIONS,
      items,
    });
  } catch (error) {
    console.error('Erro na rota /api/projects:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar projetos' }, { status: 500 });
  }
}
