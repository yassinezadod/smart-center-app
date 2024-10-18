import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  const { email } = params;

  if (!email) {
    return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
  }

  try {
    // Delete the user with the given email
    await prisma.user.delete({
      where: { email: email },
    });

    return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting user.' }, { status: 500 });
  }
}
