import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const niveauScolaire = url.searchParams.get('niveauScolaire');
    const niveauClasse = url.searchParams.get('niveauClasse');

    let query = {};

    if (niveauScolaire) {
      query.niveauScolaire = niveauScolaire;
    }

    if (niveauClasse) {
      query.niveauClasse = niveauClasse;
    }

    const classes = await prisma.class.findMany({
      where: query,
    });

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
