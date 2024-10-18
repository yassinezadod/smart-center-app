import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import mime from 'mime-types'; // Importer la bibliothèque mime-types

const prisma = new PrismaClient();

export async function GET(request) {
  // Extraire les paramètres de la requête
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // Récupérer le paramètre 'id' de l'URL

  try {
    if (id) {
      // Si un 'id' est fourni, récupérer l'étudiant spécifique
      const student = await prisma.student.findUnique({
        where: { id: parseInt(id) },
      });

      if (student) {
        const filePath = path.join(process.cwd(), 'app/uploads', path.basename(student.picture));

        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const mimeType = mime.lookup(path.extname(filePath)) || 'application/octet-stream';

          const studentData = {
            id: student.id,
            nom: student.nom,
            prenom: student.prenom,
            birthDate: student.birthDate,
            ecoleOrigine: student.ecoleOrigine,
            genre: student.genre,
            inscription: student.inscription,
            telephone: student.telephone,
            classId: student.classId,
            depart: student.depart,
            fileName: path.basename(student.picture),
            fileData: fileBuffer.toString('base64'),
            mimeType: mimeType,
            createdAt: student.createdAt,
          };

          return NextResponse.json(studentData);
        } else {
          return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
      }
    } else {
      // Si aucun 'id' n'est fourni, renvoyer tous les étudiants
      const students = await prisma.student.findMany({
        orderBy: {
          id: 'desc',
        },
      });

      // Construction des chemins complets et lecture des fichiers pour tous les étudiants
      const studentsData = students.map(student => {
        const filePath = path.join(process.cwd(), 'app/uploads', path.basename(student.picture));

        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const mimeType = mime.lookup(path.extname(filePath)) || 'application/octet-stream';

          return {
            id: student.id,
            nom: student.nom,
            prenom: student.prenom,
            birthDate: student.birthDate,
            ecoleOrigine: student.ecoleOrigine,
            genre: student.genre,
            inscription: student.inscription,
            telephone: student.telephone,
            classId: student.classId,
            depart: student.depart,
            fileName: path.basename(student.picture),
            fileData: fileBuffer.toString('base64'),
            mimeType: mimeType,
            createdAt: student.createdAt,
          };
        }
        return null;
      }).filter(student => student !== null);

      return NextResponse.json(studentsData);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données des étudiants:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des données des étudiants' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
