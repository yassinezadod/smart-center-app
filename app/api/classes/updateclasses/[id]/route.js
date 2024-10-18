import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = params;
  const { niveauScolaire, niveauClasse, group } = await request.json();

  try {
    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { 
        niveauScolaire,
        niveauClasse,
        group
      },
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
