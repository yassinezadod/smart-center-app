"use client";

import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTrash, FaEdit } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import NavBar from "../components/Navbar";
import { Layout} from "antd";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FaTimes } from 'react-icons/fa';

const { Content } = Layout;

export default function ClassesPage() {
    const [image, setImage] = useState(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [ecoleOrigine, setEcoleOrigine] = useState('');
    const [genre, setGenre] = useState('');
    const [inscription, setInscription] = useState('');
    const [telephone, setTelephone] = useState('');
    const [images, setImages] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [depart, setDepart] = useState('Actif'); // Default value
    const [departureDate, setDepartureDate] = useState(''); // Track departure date
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchInscription, setSearchInscription] = useState('');
  const [searchNomPrenom, setSearchNomPrenom] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [fileName, setFileName] = useState('');

  const [niveauxScolaires, setNiveauxScolaires] = useState([]);
  const [niveauxClasses, setNiveauxClasses] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedNiveauScolaire, setSelectedNiveauScolaire] = useState('');
  const [selectedNiveauClasse, setSelectedNiveauClasse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const itemsPerPage = 8;

  const fetchImages = async () => {
  try {
    const response = await fetch('/api/student/getstudent');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des élèves');
    }
    const data = await response.json();
    const imagesUrls = data.map(image => ({
      id: image.id,
      nom: image.nom,
      prenom: image.prenom,
      birthDate: new Date(image.birthDate).toLocaleDateString(),
      ecoleOrigine: image.ecoleOrigine,
      genre: image.genre,
      inscription: image.inscription,
      telephone: image.telephone,
      depart: image.depart,
      createdAt: new Date(image.createdAt).toLocaleDateString(),
      classId: image.classId,
      url: `data:${image.mimeType};base64,${image.fileData}`
    }));
    setImages(imagesUrls);
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
  }
};



// Utilisation de `fetchImages` dans `useEffect`
useEffect(() => {
  fetchImages();

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes/getclasses');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des classes');
      }
      const data = await response.json();
      setClasses(data);

      // Extract niveaux scolaires from the fetched classes
      const uniqueNiveauxScolaires = Array.from(new Set(data.map(cls => cls.niveauScolaire)))
        .map(niveau => ({ id: niveau, nom: niveau }));
      setNiveauxScolaires(uniqueNiveauxScolaires);
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
    }
  };
  fetchClasses();
}, []);

  // Fetch niveaux de classe basé sur le niveau scolaire sélectionné
  useEffect(() => {
    if (selectedNiveauScolaire) {
      const fetchNiveauxClasses = async () => {
        try {
          const response = await fetch(`/api/classes/getclasses?niveauScolaire=${selectedNiveauScolaire}`);
          const data = await response.json();
          const uniqueNiveauxClasses = Array.from(new Set(data.map(cls => cls.niveauClasse)))
            .map(niveau => ({ id: niveau, nom: niveau }));
          setNiveauxClasses(uniqueNiveauxClasses);
          
        } catch (error) {
          console.error('Erreur lors de la récupération des niveaux de classe:', error);
        }
      };

      fetchNiveauxClasses();
    } else {
      setNiveauxClasses([]);
      setGroups([]);
    }
  }, [selectedNiveauScolaire]);


   // Fetch groupes basé sur le niveau de classe sélectionné
   useEffect(() => {
    if (selectedNiveauClasse) {
      const fetchGroups = async () => {
        try {
          const response = await fetch(`/api/classes/getclasses?niveauClasse=${selectedNiveauClasse}`);
          const data = await response.json();
          const uniqueGroups = Array.from(new Set(data.map(cls => cls.group)))
            .map(group => ({ id: group, nom: group }));
            console.log(uniqueGroups)
          setGroups(uniqueGroups);
        } catch (error) {
          console.error('Erreur lors de la récupération des groupes:', error);
        }
      };

      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [selectedNiveauClasse]);


  // Trouver le niveau de classe basé sur l'id
  const getScolaireName = (classId) => {
    const cls = classes.find(cls => cls.id === classId);
    return cls ? cls.niveauScolaire : 'Non spécifiée';
  };

  const getClassName = (classId) => {
    const cls = classes.find(cls => cls.id === classId);
    return cls ? cls.niveauClasse : 'Non spécifiée';
  };

  const getGroupName = (classId) => {
    const cls = classes.find(cls => cls.id === classId);
    return cls ? cls.group : 'Non spécifiée';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
     // Encode departure status and date
     const departValue = depart === 'Non Actif' && departureDate ? `${depart}|${departureDate}` : depart;

     // Handle group change and display the ID of the selected class
     const selectedClass = classes.find(cls => cls.group === selectedGroup && cls.niveauClasse === selectedNiveauClasse);
     if (selectedClass) {
       console.log('ID de la classe sélectionnée:', selectedClass.id);
     }


    if (!image || !nom || !prenom || !birthDate || !ecoleOrigine || !genre || !inscription || !telephone || !selectedClass.id || !departValue) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('birthDate', birthDate);
      formData.append('ecoleOrigine', ecoleOrigine);
      formData.append('genre', genre);
      formData.append('inscription', inscription);
      formData.append('telephone', telephone);
      formData.append('classId', selectedClass.id);
      formData.append('depart', departValue);  // Append depart with departure date if applicable

      const url = isEditing ? `/api/student/putStudent/${currentImageId}` : '/api/student/poststudent';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        alert(`${isEditing ? 'Modification' : 'Ajout'} réussie ! URL: ${url}`);
        fetchImages();
        setShowForm(false);
        setIsEditing(false);
        setCurrentImageId(null);
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l${isEditing ? 'a modification' : 'ajout de l\'eleve'}: ${errorData.message}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l${isEditing ? 'a modification' : 'ajout de l\'eleve'}`, error);
      alert('Une erreur s\'est produite. Veuillez réessayer plus tard.');
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        const response = await fetch(`/api/student/deleteStudent/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setImages(images.filter(img => img.id !== id));
          alert('Eleve supprimée avec succès');
        } else {
          const errorData = await response.json();
          console.error(errorData.message);
          alert('Erreur lors de la suppression de l\'Eleve.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'Eleve:', error);
        alert('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      }
    }
  };

  // Function to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  // Fonction pour ouvrir le formulaire d'édition avec les informations de l'élève
  const handleEdit = (img) => {
    setNom(img.nom);
    setPrenom(img.prenom);
    setBirthDate(formatDate(img.birthDate));
    setEcoleOrigine(img.ecoleOrigine);
    setGenre(img.genre);
    setInscription(img.inscription);
    setTelephone(img.telephone);
    setSelectedClass(img.classId);
    setDepart(img.depart);
    setImage(null); // Ne pas préremplir l'image
    setCurrentImageId(img.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleView = (img) => {
    setSelectedStudent(img);
  };

  const filteredImages = images.filter((img) => {
    const matchesInscription = img.inscription.toLowerCase().includes(searchInscription.toLowerCase());
    const matchesNomPrenom = (img.nom + ' ' + img.prenom).toLowerCase().includes(searchNomPrenom.toLowerCase());
    const matchesStatus = searchStatus === '' || (img.depart === searchStatus || (img.depart.startsWith('Non Actif') && searchStatus === 'Non Actif'));
    const matchesGenre = searchGenre ? img.genre === searchGenre : true;

    return matchesInscription && matchesNomPrenom && matchesGenre && matchesStatus;
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredImages.map(img => ({
      Inscription: img.inscription,
      date_inscription: img.createdAt,
      Nom: img.nom,
      Prénom: img.prenom,
      DateDeNaissance: img.birthDate,
      EcoleDorigine: img.ecoleOrigine,
      Genre: img.genre,
      Téléphone: img.telephone,
      Ecole: getScolaireName(img.classId),
      Classe: getClassName(img.classId),
      Group: getGroupName(img.classId),
      Status: img.depart,
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Élèves');

    const fileName = 'eleves.xlsx';
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };


 
  const indexOfLastClass = currentPage * itemsPerPage;
  const indexOfFirstClass = indexOfLastClass - itemsPerPage;
  const currentClasses = filteredImages.slice(indexOfFirstClass, indexOfLastClass);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);


  // Decode departure status and date
  const [departStatus, departureDateValue] = depart.includes('|') ? depart.split('|') : [depart, ''];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 156 }}>
        <NavBar />
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
   
      <div className="flex-1 p-6 overflow-auto">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Gestion des Eleves</h1>
          <button
  onClick={() => setShowForm(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 mr-[700px]"
>
  {isEditing ? 'Modifier un élève' : 'Ajouter un élève'}
</button>
<button
  onClick={exportToExcel}
  className="bg-green-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-gray-400 transition duration-300"
>
  <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline-block align-middle" />
  Exporter
</button>


          {/* Form Popup */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto relative overflow-y-auto">
              <button
        onClick={() => {
          setShowForm(false);
          setIsEditing(false);
          setCurrentImageId(null);
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <FaTimes size={20} />
      </button>
              <h2 className="text-3xl font-semibold mb-6">{isEditing ? 'Modifier un élève' : 'Ajouter un élève'}</h2>
                <form  onSubmit={handleSubmit}>
                  <input
                     type="text"
                  placeholder="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                   <input
                     type="text"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                   <input
                     type="text"
                  placeholder="École d'origine"
                  value={ecoleOrigine}
                  onChange={(e) => setEcoleOrigine(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  >
                     <option value="">Sélectionner</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                  </select>
                  <input
                     type="text"
                  placeholder="Numéro d'inscription"
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                   <input
                     type="tel"
                   placeholder="Téléphone"
                   value={telephone}
                   onChange={(e) => setTelephone(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    required
                  />
                  
                   {/* Niveau Scolaire */}
      <select
        value={selectedNiveauScolaire}
        onChange={(e) => setSelectedNiveauScolaire(e.target.value)}
        className="border border-gray-300 p-2 mb-4 w-full rounded-lg"
        required
      >
        <option value="">Sélectionner un niveau scolaire</option>
        {niveauxScolaires.map(niveau => (
          <option key={niveau.id} value={niveau.id}>
            {niveau.nom}
          </option>
        ))}
      </select>

      {/* Niveau Classe */}
      <select
        value={selectedNiveauClasse}
        onChange={(e) => setSelectedNiveauClasse(e.target.value)}
        className="border border-gray-300 p-2 mb-4 w-full rounded-lg"
        required
      >
        <option value="">Sélectionner un niveau de classe</option>
        {niveauxClasses.map(niveau => (
          <option key={niveau.id} value={niveau.id}>
            {niveau.nom}
          </option>
        ))}
      </select>

      {/* Groupe */}
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        className="border border-gray-300 p-2 mb-4 w-full rounded-lg"
        required
      >
        <option value="">Sélectionner un groupe</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>
            {group.nom}
          </option>
        ))}
      </select>
                   {/* Depart Select Field */}
      <select
        value={departStatus}
        onChange={(e) => setDepart(e.target.value)}
        className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        required
      >
        <option value="Actif" className="text-green-500">Active</option>
        <option value="Non Actif" className="text-red-500">Non Active</option>
      </select>

      {/* Conditionally Render Departure Date Field */}
      {departStatus === 'Non Actif' && (
        <div className="mb-4">
    <label 
      htmlFor="departureDate" 
      className="block text-gray-700 text-sm font-medium mb-2"
    >
      Sélectionnez la date de départ
    </label>
    <input
      id="departureDate"
      type="date"
      placeholder="date de départ"
      value={departureDate}
      onChange={(e) => setDepartureDate(e.target.value)}
      className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      required
    />
  </div>

      )}

        {/* File Upload Section */}
        <div className="flex items-center justify-center w-full mb-4">
  <label
    htmlFor="dropzone-file"
    className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer ${
      uploadStatus ? 'border-green-500 bg-green-100' : 'border-blue-300 gray-600 hover:bg-blue-100'
    }`}
  >
    <div className="flex flex-col items-center justify-center pt-3 pb-4">
      <svg
        className={`w-6 h-6 mb-2 ${uploadStatus ? 'text-green-500' : 'text-gray-500'}`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      {fileName ? (
        <p className="mb-1 text-sm text-gray-500">
          Fichier sélectionné : <span className="font-semibold">{fileName}</span>
        </p>
      ) : (
        <>
          <p className="mb-1 text-sm text-gray-500">
            <span className="font-semibold">Cliquez pour téléverser</span> ou faites glisser et déposez
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG (MAX. 800x400px)
          </p>
        </>
      )}
    </div>
    <input
      id="dropzone-file"
      type="file"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setImage(file);
          setFileName(file.name); // Met à jour le nom du fichier
          setUploadStatus(true); // Met à jour le statut du téléchargement
        } else {
          setUploadStatus(false); // Réinitialise le statut si aucun fichier n'est sélectionné
          setFileName(''); // Réinitialise le nom du fichier
        }
      }}
      className="hidden"
      required
    />
  </label>
</div>

        <br />
                  <div className="flex justify-between">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                       {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par inscription"
          value={searchInscription}
          onChange={(e) => setSearchInscription(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <input
          type="text"
          placeholder="Rechercher par nom et prénom"
          value={searchNomPrenom}
          onChange={(e) => setSearchNomPrenom(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <select
          value={searchGenre}
          onChange={(e) => setSearchGenre(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="">Tous les genres</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
        </select>

        <select
    value={searchStatus}
    onChange={(e) => setSearchStatus(e.target.value)}
    className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
  >
    <option value="">Tous les statuts</option>
    <option value="Actif">Active</option>
    <option value="Non Actif">Non Active</option>
  </select>
      </div>

          {/* Classes Table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°inscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Naissance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">École d'origine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ecole</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {currentClasses.map(img => (
                    <tr key={img.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{img.inscription}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.birthDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.ecoleOrigine}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.genre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{img.telephone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getScolaireName(img.classId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClassName(img.classId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{getGroupName(img.classId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <img
                    src={img.url}
                    alt={`Image ${img.id}`}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                    </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm">
        {img.depart === 'Actif' ? (
          <div className="flex items-center space-x-2">
            <span className="block w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-500">Active</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="block w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-red-500">
              {img.depart.split('|')[1].trim()}
            </span>
          </div>
        )}
      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => handleView(img)} className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600">
                          <FaEye />
                        </button>
                      <button
                         onClick={() => handleEdit(img)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                          onClick={() => handleDeleteImage(img.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                         <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Précédente
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
                Suivante
              </button>
            </nav>
          </div>
        </div>
      </div>

       {/* Card Popup for Student Details */}
       {selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
          <h2 className="text-2xl font-bold mb-4 text-center">Détails de l'élève</h2>
          
          <div className="flex flex-col items-center mb-4">
            <img src={selectedStudent.url} alt={selectedStudent.nom} className="w-32 h-32 object-cover rounded-full mb-4" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Nom:</strong> {selectedStudent.nom}</p>
              <p><strong>DateBirth:</strong> {selectedStudent.birthDate}</p>
              <p><strong>Genre:</strong> {selectedStudent.genre}</p>
              <p><strong>Téléphone:</strong> {selectedStudent.telephone}</p>
            </div>
            <div>
              <p><strong>Prénom:</strong> {selectedStudent.prenom}</p>
              <p><strong>École d'origine:</strong> {selectedStudent.ecoleOrigine}</p>
              <p><strong>N° Inscription:</strong> {selectedStudent.inscription}</p>
              <p><strong>Ecole:</strong> {getScolaireName(selectedStudent.classId)} {getClassName(selectedStudent.classId)} G({getGroupName(selectedStudent.classId)})</p>
            </div>
          </div>

          {/* Close Button with FontAwesome Icon */}
          <button
            onClick={() => setSelectedStudent(null)}
            className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>
      </div>
          )}

      </Content>
      </Layout>
       </Layout>
  );
}
