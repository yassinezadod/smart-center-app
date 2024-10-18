import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
    const { nom, prenom, email, password, role } = await req.json();

    if (!nom || !prenom || !email || !password || !role) {
        return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new Response(JSON.stringify({ message: 'Email already in use' }), { status: 400 });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await prisma.user.create({
            data: {
                nom,
                prenom,
                email,
                password: hashedPassword,
                role,
            },
        });

        return new Response(JSON.stringify(newUser), { status: 201 });
    } catch (error) {
        console.error('Error in register API:', error);
        return new Response(JSON.stringify({ message: 'User creation failed', error: error.message }), { status: 500 });
    }
}
