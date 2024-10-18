import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour comparer les mots de passe
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && await comparePassword(password, user.password)) {
      // Exclure le mot de passe avant de retourner les données de l'utilisateur
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error during login.' }, { status: 500 });
  }
}
