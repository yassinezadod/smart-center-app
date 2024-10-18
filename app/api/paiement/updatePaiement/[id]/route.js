// app/api/paiement/updatePaiement/[id]/route.js

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = params;
  
  // Convertir l'ID en entier
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
  }

  const data = await request.json();
  
  // Valider les champs requis
  const { studentId, amount, paymentDate, frais_ins, septembre, octobre, novembre, decembre, janvier, fevrier, mars, avril, mai, juin, juillet, aout } = data;
  
  if (!studentId || !amount || !paymentDate || !frais_ins) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Vérifier si le paiement existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Mettre à jour le paiement
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        studentId: parseInt(studentId, 10), // S'assurer que l'ID de l'étudiant est un entier
        amount: parseFloat(amount),         // Convertir le montant en flottant
        paymentDate: new Date(paymentDate), // Convertir la date en objet Date
        frais_ins: parseFloat(frais_ins),   // Convertir les frais en flottant
        septembre: septembre || 'PENDING',
        octobre: octobre || 'PENDING',
        novembre: novembre || 'PENDING',
        decembre: decembre || 'PENDING',
        janvier: janvier || 'PENDING',
        fevrier: fevrier || 'PENDING',
        mars: mars || 'PENDING',
        avril: avril || 'PENDING',
        mai: mai || 'PENDING',
        juin: juin || 'PENDING',
        juillet: juillet || 'PENDING',
        aout: aout || 'PENDING',
      },
    });

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
