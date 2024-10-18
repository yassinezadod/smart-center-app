import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    // Assurez-vous d'utiliser un parser de données approprié pour récupérer les fichiers et les champs texte
    const data = await req.formData();
    const image = data.get('image');
    const nom = data.get('nom');
    const prenom = data.get('prenom');
    const birthDate = new Date(data.get('birthDate'));
    const ecoleOrigine = data.get('ecoleOrigine');
    const genre = data.get('genre');
    const inscription = data.get('inscription');
    const telephone = data.get('telephone');
    const classId = parseInt(data.get('classId'));
    const depart = data.get('depart');  // Récupération du champ depart

    if (!id || !nom || !prenom || !birthDate || !ecoleOrigine || !genre || !inscription || !depart || !telephone || isNaN(classId)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    

    let pictureUrl = null;
    if (image) {
      // Créer un chemin pour sauvegarder l'image dans le dossier app
      const uploadDir = path.join(process.cwd(), 'app/uploads');
      const filePath = path.join(uploadDir, image.name);

      // Créer le dossier s'il n'existe pas déjà
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Écrire l'image sur le disque
      fs.writeFileSync(filePath, Buffer.from(await image.arrayBuffer()));

      pictureUrl = `/app/uploads/${image.name}`;
    }

    // Mettre à jour les informations dans la base de données
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        picture: pictureUrl || undefined, // N'utilisez pas pictureUrl si il n'est pas fourni
        nom,
        prenom,
        birthDate,
        ecoleOrigine,
        genre,
        inscription,
        telephone,
        classId: isNaN(classId) ? undefined : classId,
        depart,
      },
    });

    return NextResponse.json({ message: 'eleve updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating eleve:', error);
    return NextResponse.json({ message: 'Error updating eleve' }, { status: 500 });
  }
}

// Config pour désactiver le body parser et gérer les fichiers
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
