import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return new Response(
            JSON.stringify({ message: 'Email and password are required' }),
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return new Response(
                JSON.stringify({ token }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ message: 'Invalid email or password' }),
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Error in login API:', error);
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            { status: 500 }
        );
    }
}
