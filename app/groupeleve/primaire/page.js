"use client";

import { useState, useEffect } from 'react';
import { Layout, Skeleton } from "antd";
import Sidebar from '../../components/Sidebar';
import NavBar from "../../components/Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'; 


const { Content } = Layout;

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes/getclasses?niveauScolaire=Primaire');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des classes');
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchFiles = async (classId) => {
    setLoadingFiles(true);
    try {
      const response = await fetch(`/api/ClasseEleve?classId=${classId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleShowFiles = async (classId) => {
    setSelectedClassId(classId);
    await fetchFiles(classId);
    setShowPopup(true);
  };

  // Fonction pour générer le PDF
  const generatePDF = (files, classId) => {
    const selectedClass = classes.find(cls => cls.id === classId)?.niveauScolaire || 'Niveau inconnue'; // Obtenez le niveau de la classe
    const selectedNiveau = classes.find(cls => cls.id === classId)?.niveauClasse || 'Classe inconnue';
    const selectedGroup = classes.find(cls => cls.id === classId)?.group || 'Group inconnue';
    
    
    const doc = new jsPDF();
    
    // Logo
    const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV-zBcBp7RunZYMDrtEFexGgjDHkVAieXc1Q&s";
    const logoWidth = 30; // Largeur du logo en mm
    const logoHeight = 30; // Hauteur du logo en mm
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoX = (pageWidth - logoWidth) / 2; // Centrer le logo horizontalement
    
    // Ajouter le logo
    doc.addImage(logoUrl, 'JPEG', logoX, 10, logoWidth, logoHeight);
  
      // Ajouter le titre dans un cadre
  const titleText = 'Liste des élèves';
  const titleWidth = doc.getTextWidth(titleText) + 20; // Largeur du texte + marge
  const titleX = (pageWidth - titleWidth) / 2; // Centrer le texte horizontalement
  const titleY = 50; // Position verticale du titre
  
  // Dessiner le cadre
  doc.setDrawColor(0, 0, 0); // Couleur du cadre (noir)
  doc.setLineWidth(1); // Épaisseur du cadre
  doc.rect(titleX - 1, titleY - 1, titleWidth, 10); // Cadre autour du titre
  
  // Ajouter le texte du titre
  doc.setFontSize(18);
  doc.text(titleText, titleX + 7, titleY + 6); // Position du texte à l'intérieur du cadre

   // Définir les positions X pour les informations
   const infoY = 80; // Position verticale commune pour toutes les informations
   const infoY1= 90;
   const infoX1 = 10; // Position X pour "Année scolaire"
   const infoX2 = 70; // Position X pour "Nom de l'école"
   const infoX3 = 120; // Position X pour "Niveau de la classe"
   const infoX4=160;
  
    // Ajouter l'année scolaire
  doc.setFontSize(12);
  doc.text(`Année scolaire : ${new Date().getFullYear()}/${new Date().getFullYear()+1}`, infoX1, infoY);
  
  // Ajouter le nom de l'école
  doc.text('Ecole : Smart Center', infoX2, infoY);
  
  // Ajouter le niveau de la classe
  doc.text(`Niveau : ${selectedClass}`, infoX3, infoY);
  doc.text(`Classe : ${selectedNiveau} année`, infoX4, infoY);
  doc.text(`Group : ${selectedGroup}`, infoX1, infoY1);
  doc.text(`Nombre éléves : ${files.length}`, infoX2, infoY1); // le nombre des éléves pour chaque classe 
  
  // Ajouter le tableau des élèves
  const tableData = files.map(file => [file.inscription, file.nom, file.prenom]);
  
  doc.autoTable({
    startY: 100, // Position du tableau
    head: [['N°Inscription', 'Nom', 'Prénom']],
    body: tableData,
    theme: 'striped',
    margin: { top: 10 },
    styles: {
      fontSize: 10,
    },
    headStyles: {
      fillColor: [169, 169, 169], // Couleur de fond de l'entête (gris)
      textColor: [0, 0, 0], // Couleur du texte de l'entête (noir)
    },
    bodyStyles: {
      fillColor: [255, 255, 255], // Couleur de fond des lignes (blanc)
    },
  });
  
  // Enregistrer le PDF
  doc.save('liste-des-eleves.pdf');
};


  const indexOfLastClass = currentPage * itemsPerPage;
  const indexOfFirstClass = indexOfLastClass - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirstClass, indexOfLastClass);

  const totalPages = Math.ceil(classes.length / itemsPerPage);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 156 }}>
        <NavBar />
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <div className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">Liste des group Primaire</h1>

              {/* Classes Table */}
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                {loadingClasses ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liste des élèves</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentClasses.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                            Aucune classe trouvée
                          </td>
                        </tr>
                      ) : (
                        currentClasses.map((cls) => (
                          <tr key={cls.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.niveauClasse}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.group}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleShowFiles(cls.id)}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600"
                              >
                                Liste des élèves
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-6">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>

            {/* Popup to Display Files */}
            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg relative overflow-y-auto" style={{ maxHeight: '80vh' }}>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Liste des élèves</h2>
                  {loadingFiles ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                  ) : (
                    files.length === 0 ? (
                      <p className="text-center text-gray-600">Aucun élève n'est inscrit dans cette classe</p>
                    ) : (
                      
                      <div className="overflow-x-auto">
                      <div className="flex justify-end mb-4">
                      <button
                onClick={() => generatePDF(files, selectedClassId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> {/* Ajoutez l'icône PDF ici */}
                Exporter en PDF
              </button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°Inscription</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {files.map((file) => (
                              <tr key={file.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.inscription}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.nom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.prenom}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
