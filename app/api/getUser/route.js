import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  // Extraire les paramètres de la requête
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Récupérer le paramètre 'id' de l'URL
  
  try {
    if (id) {
      // Si un id est fourni, trouver l'utilisateur correspondant
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(id), // Convertir l'id en entier si nécessaire
        },
      });

      // Si un utilisateur est trouvé, le renvoyer
      if (user) {
        return new Response(JSON.stringify(user), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Si aucun utilisateur n'est trouvé, renvoyer une erreur 404
        return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Si aucun id n'est fourni, renvoyer tous les utilisateurs
      const users = await prisma.user.findMany();
      return new Response(JSON.stringify(users), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect(); // Fermer la connexion Prisma
  }
}
