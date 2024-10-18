import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
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
      const depart = data.get('depart'); // Récupération du champ départ
  
      if (!image || !nom || !prenom || !birthDate || !ecoleOrigine || !genre || !inscription || !telephone || !depart || isNaN(classId)) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
      }


     
  
      // Créer un chemin pour sauvegarder l'image dans le dossier app
      const uploadDir = path.join(process.cwd(), 'app/uploads');
      const filePath = path.join(uploadDir, image.name);
  
      // Créer le dossier s'il n'existe pas déjà
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
  
      // Écrire l'image sur le disque
      fs.writeFileSync(filePath, Buffer.from(await image.arrayBuffer()));
  
      // Sauvegarder l'URL relative de l'image et les autres informations dans la base de données
      const student = await prisma.student.create({
        data: {
          picture: `/app/uploads/${image.name}`,
          nom: nom,
          prenom: prenom,
          birthDate: birthDate,
          ecoleOrigine: ecoleOrigine,
          genre: genre,
          inscription: inscription,
          telephone: telephone,
          classId: classId,
          depart: depart // Ajout du champ départ
        },
      });
  
      return NextResponse.json({ message: 'Eleve enregistrer par succès', url: student.picture });
    } catch (error) {
      console.error('Erreur lors de lajout d un éleve:', error);
      return NextResponse.json({ message: 'Erreur lors de lajout d un éleve' }, { status: 500 });
    }
  }
  
  // Config pour désactiver le body parser et gérer les fichiers
  // export const config = {
  //   api: {
  //     bodyParser: false,
  //   },
  // };
  