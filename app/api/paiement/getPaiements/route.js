import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  // Extraire les paramètres de la requête
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Récupérer le paramètre 'id' de l'URL
  
  try {
    if (id) {
      // Si un 'id' est fourni, récupérer le paiement spécifique
      const payment = await prisma.payment.findUnique({
        where: { id: parseInt(id) },
        include: {
          student: {
            select: {
              nom: true,
              prenom: true,
              inscription: true,
              picture: true,
              createdAt: true,
              depart: true,
            },
          },
        },
      });

      if (payment) {
        const basePath = '/uploads/';
        const updatedPayment = {
          id: payment.id,
          studentId: payment.studentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate.toISOString(),
          frais_ins: payment.frais_ins,
          septembre: payment.septembre,
          octobre: payment.octobre,
          novembre: payment.novembre,
          decembre: payment.decembre,
          janvier: payment.janvier,
          fevrier: payment.fevrier,
          mars: payment.mars,
          avril: payment.avril,
          mai: payment.mai,
          juin: payment.juin,
          juillet: payment.juillet,
          aout: payment.aout,
          studentNom: payment.student.nom,
          studentPrenom: payment.student.prenom,
          studentInscription: payment.student.inscription,
          studentPicture: payment.student.picture ? basePath + payment.student.picture.split('/').pop() : null,
          studentCreatedAt: payment.student.createdAt.toISOString(),
          studentDepart: payment.student.depart
        };

        return new Response(JSON.stringify(updatedPayment), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Si le paiement n'est pas trouvé, retourner une erreur 404
        return new Response(JSON.stringify({ error: 'Paiement non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Si aucun 'id' n'est fourni, renvoyer tous les paiements
      const payments = await prisma.payment.findMany({
        include: {
          student: {
            select: {
              nom: true,
              prenom: true,
              inscription: true,
              picture: true,
              createdAt: true,
              depart: true,
            },
          },
        },
      });

      // Chemin de base pour les images
      const basePath = '/uploads/';

      // Mettre à jour les paiements avec les chemins d'images complets
      const updatedPayments = payments.map(payment => ({
        id: payment.id,
        studentId: payment.studentId,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toISOString(),
        frais_ins: payment.frais_ins,
        septembre: payment.septembre,
        octobre: payment.octobre,
        novembre: payment.novembre,
        decembre: payment.decembre,
        janvier: payment.janvier,
        fevrier: payment.fevrier,
        mars: payment.mars,
        avril: payment.avril,
        mai: payment.mai,
        juin: payment.juin,
        juillet: payment.juillet,
        aout: payment.aout,
        studentNom: payment.student.nom,
        studentPrenom: payment.student.prenom,
        studentInscription: payment.student.inscription,
        studentPicture: payment.student.picture ? basePath + payment.student.picture.split('/').pop() : null,
        studentCreatedAt: payment.student.createdAt.toISOString(),
        studentDepart: payment.student.depart
      }));

      return new Response(JSON.stringify(updatedPayments), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements :', error);
    return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
