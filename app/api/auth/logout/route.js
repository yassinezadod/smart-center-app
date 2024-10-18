export async function POST() {
    // Ici, tu pourrais ajouter toute logique de nettoyage côté serveur si nécessaire.
    // Pour la plupart des applications client-side, il suffit de supprimer le token côté client.

    return new Response(
        JSON.stringify({ message: 'Logged out successfully' }),
        { status: 200 }
    );
}
