import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  // Extraire les paramètres de la requête
  const { searchParams } = new URL(request.url);
  const niveauScolaire = searchParams.get('niveauScolaire'); // Récupérer le paramètre 'niveauScolaire' de l'URL

  try {
    // Récupérer toutes les classes avec les étudiants
    const classes = await prisma.class.findMany({
      include: {
        students: true,
      },
    });

    // Filtrer les classes selon le niveau scolaire si le paramètre est fourni
    const filteredClasses = niveauScolaire ? 
      classes.filter(cls => cls.niveauScolaire === niveauScolaire) : classes;

    // Créer un objet pour stocker le nombre d'étudiants pour chaque 'niveauScolaire'
    const studentCountByNiveau = {};

    filteredClasses.forEach(cls => {
      const activeStudents = cls.students.filter(student => student.depart === "Actif");

      // Si le 'niveauScolaire' n'existe pas dans l'objet, l'initialiser
      if (!studentCountByNiveau[cls.niveauScolaire]) {
        studentCountByNiveau[cls.niveauScolaire] = 0;
      }

      // Incrémenter le nombre d'étudiants actifs pour ce 'niveauScolaire'
      studentCountByNiveau[cls.niveauScolaire] += activeStudents.length;
    });

    const result = Object.keys(studentCountByNiveau).map(niveau => ({
      niveau: niveau,
      studentCount: studentCountByNiveau[niveau],
    }));

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return new Response('Erreur lors de la récupération des données', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
