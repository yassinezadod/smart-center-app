import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { niveauScolaire, niveauClasse, group } = await request.json();

    // Validation des données (facultatif, mais recommandé)
    if (!niveauScolaire || !niveauClasse || !group) {
      return NextResponse.json({ error: "Tous les champs doivent être remplis" }, { status: 400 });
    }

    // Création de la nouvelle classe dans la base de données
    const newClass = await prisma.class.create({
      data: {
        niveauScolaire,
        niveauClasse,
        group,
      },
    });

    return NextResponse.json(newClass);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
