import jwt from 'jsonwebtoken';

export async function POST(req) {
    const { token } = await req.json();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return new Response(
            JSON.stringify({ message: 'JWT secret not defined' }),
            { status: 500 }
        );
    }

    try {
        const decoded = jwt.verify(token, secret);
        return new Response(
            JSON.stringify({ user: decoded }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: 'Invalid token' }),
            { status: 401 }
        );
    }
}
