

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const classId = parseInt(url.searchParams.get('classId'));

  if (isNaN(classId)) {
    return new Response('ID de classe invalide', { status: 400 });
  }

  try {
    const student = await prisma.student.findMany({
      where: {
        classId: classId,
        depart: "Actif",
      },
    });

    return new Response(JSON.stringify(student), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return new Response('Erreur lors de la récupération des données', { status: 500 });
  }
}
