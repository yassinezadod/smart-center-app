import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

// Fonction pour hasher un mot de passe
async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

export async function PUT(request, { params }) {
  const { email } = params;
  const { nom, prenom, password, role } = await request.json();

  if (!nom || !prenom || !email || !role) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  try {
    // Vérifiez si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Hasher le mot de passe s'il est fourni
    const hashedPassword = password ? await hashPassword(password) : existingUser.password;

    // Mettre à jour l'utilisateur dans la base de données
    await prisma.user.update({
      where: { email: email },
      data: {
        nom,
        prenom,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ message: 'User successfully updated!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating user.' }, { status: 500 });
  }
}
