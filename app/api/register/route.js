import { NextResponse } from 'next/server';
import { hashPassword } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { nom, prenom, email, password, role } = await request.json();

  if (!nom || !prenom || !email || !password || !role) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
  }

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Save the new user in the database
    await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        role,
      },
    });
    return NextResponse.json({ message: 'User successfully created!' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating user.' }, { status: 500 });
  }
}
