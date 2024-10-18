import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // Vérifiez si l'ID est bien un nombre
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Supprimez le paiement de la base de données
    await prisma.payment.delete({
      where: {
        id: paymentId,
      },
    });

    return NextResponse.json({ message: 'Paiement supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du paiement' },
      { status: 500 }
    );
  }
}
