"use client";

import { useState, useEffect } from 'react';
import axios from 'axios'; // Ajout d'importation d'axios
import {FaTrash, FaEdit } from 'react-icons/fa';
import { Layout } from "antd";
import Sidebar from '../../components/Sidebar';
import NavBar from "./Navbar";
import { FaTimes } from 'react-icons/fa';
import clsx from 'clsx'; // Ajout d'importation de clsx


const { Content } = Layout;

const PaymentStatusColor = {
  PAID: 'bg-green-500',
  UNPAID: 'bg-red-500',
  PENDING: 'bg-blue-500',
};

const statusLabels = {
  Tous: 'Tous',
  PAID: 'Payé',
  UNPAID: 'Non payé', 
};

export default function ClassesPage() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pas encore");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    frais_ins: '',
    septembre: 'PENDING',
    octobre: 'PENDING',
    novembre: 'PENDING',
    decembre: 'PENDING',
    janvier: 'PENDING',
    fevrier: 'PENDING',
    mars: 'PENDING',
    avril: 'PENDING',
    mai: 'PENDING',
    juin: 'PENDING',
    juillet: 'PENDING',
    aout: 'PENDING',
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(''); // Ajout de l'état pour le mois sélectionné
  const [searchTerm, setSearchTerm] = useState(''); // Ajout de l'état pour le terme de recherche
  const itemsPerPage = 8;

  const months = ['septembre', 'octobre', 'novembre', 'decembre', 'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet','aout'];

  const statuses = ["PENDING", "UNPAID"];

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await axios.get('/api/paiement/getPaiements');
        setPayments(response.data);
        setFilteredPayments(response.data);
      } catch (error) {
        setError('Erreur lors de la récupération des paiements.');
      }
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get('/api/student/getstudent');
        setStudents(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des étudiants.');
      }
    };

    fetchPayments();
    fetchStudents();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      studentId: formData.studentId,
      amount: formData.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      frais_ins: formData.frais_ins,
      septembre: formData.septembre,
      octobre: formData.octobre,
      novembre: formData.novembre,
      decembre: formData.decembre,
      janvier: formData.janvier,
      fevrier: formData.feveir,
      mars: formData.mars,
      avril: formData.avril,
      mai: formData.mai,
      juin: formData.juin,
      juillet: formData.juillet,
      aout: formData.aout,
    };

    try {
      const response = await axios.put(`/api/paiement/updatePaiement/${selectedClass.id}`, payload);
      const updatedPayment = response.data;
      setPayments(payments.map(pay => (pay.id === selectedClass.id ? updatedPayment : pay)));
      setFilteredPayments(filteredPayments.map(pay => (pay.id === selectedClass.id ? updatedPayment : pay)));
      setSelectedClass(null);
      const updatedPayments = await axios.get('/api/paiement/getPaiements');
      setPayments(updatedPayments.data);
      setFilteredPayments(updatedPayments.data);
      setShowPopup(false);
      resetForm();
          // Alerte de succès
    alert('Mise à jour réussie !');

    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      setError('Une erreur est survenue lors de la mise à jour du paiement.');
    }
  };



// Supprimer un paiement
const handleDelete = async (id) => {
  const confirmation = window.confirm('Voulez-vous vraiment supprimer ce paiement ?');
  if (!confirmation) return;

  try {
    await axios.delete(`/api/paiement/deletePaiement/${id}`);
        // Refresh payments after adding
        const updatedPayments = await axios.get('/api/paiement/getPaiements');
        setPayments(updatedPayments.data);
        setFilteredPayments(updatedPayments.data);
    
  } catch (error) {
    console.error('Erreur lors de la suppression du paiement:', error);
    setError('Erreur lors de la suppression du paiement.');
  }
  
};


   // Validation avancée du formulaire
   const validateForm = () => {
    const { studentId, amount, paymentDate } = formData;

    if (!studentId) {
      setError("Veuillez sélectionner un étudiant.");
      return false;
    }
    if (amount <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return false;
    }
    if (!paymentDate) {
      setError("Veuillez entrer une date de paiement valide.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (selectedClass) {
      await handleUpdate(e);
    } else {
      try {
        await axios.post('/api/paiement/postPaiement', formData);
        setShowPopup(false);
        const updatedPayments = await axios.get('/api/paiement/getPaiements');
        setPayments(updatedPayments.data);
        setFilteredPayments(updatedPayments.data);
        resetForm();
      } catch (error) {
        setError('Erreur lors de l\'ajout du paiement.');
      }
    }
  };

   // Réinitialiser le formulaire
   const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      frais_ins: '',
      septembre: 'PENDING',
      octobre: 'PENDING',
      novembre: 'PENDING',
      decembre: 'PENDING',
      janvier: 'PENDING',
      fevrier: 'PENDING',
      mars: 'PENDING',
      avril: 'PENDING',
      mai: 'PENDING',
      juin: 'PENDING',
      juillet: 'PENDING',
      aout: 'PENDING',
    });
  };

  const getStudentDepart = (studentDepart) => {
    if (studentDepart && studentDepart.includes('|')) {
      return studentDepart.split('|')[1].trim();
    }
    return 'Inconnu'; // Ou une autre valeur par défaut appropriée
  };
  

  
  // Filtrer les paiements par mois et par statut
  useEffect(() => {
    const filtered = payments.filter(payment => {
      const status = payment[selectedMonth] || 'PENDING';
      const matchesStatus = (filterStatus === "Tous" || status === filterStatus);
      const studentName = `${payment.studentNom} ${payment.studentPrenom}`.toLowerCase();
      const matchesSearch = studentName.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setFilteredPayments(filtered);
  }, [selectedMonth, filterStatus, searchTerm, payments]);



  const indexOfLastClass = currentPage * itemsPerPage;
  const indexOfFirstClass = indexOfLastClass - itemsPerPage;
  const currentClasses = filteredPayments.slice(indexOfFirstClass, indexOfLastClass);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 156 }}>
        <NavBar />
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <div className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">Gestion des Paiements</h1>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setShowPopup(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
              >
                Ajouter un Paiement
              </button>

              {/* Form Popup */}
              {showPopup && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center z-50 overflow-y-auto">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto relative overflow-y-auto">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes size={20} />
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">{selectedClass ? 'Mettre à jour le paiement' : 'Ajouter un paiement'}</h2>
                    <form onSubmit={handleSubmit}>
                    <label className="block mb-1">Étudiant:</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
               className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            >
                <option value="">--Sélectionner un étudiant--</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.nom} {student.prenom}
                            </option>
                          ))}
            </select>
                      
            <label className="block mb-1">Montant</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />

<label className="block mb-1">Frais d'inscription</label>
            <input
              type="number"
              name="frais_ins"
              value={formData.frais_ins}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
             {/* Champs pour les mois */}
          {Object.keys(formData).filter(key => key !== 'studentId' && key !== 'amount' && key !=='paymentDate' && key !== 'frais_ins').map(month => (
            <div className="mb-4" key={month}>
              <label className="block mb-1">{month.charAt(0).toUpperCase() + month.slice(1)}</label>
              <select
                name={month}
                value={formData[month]}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              >
                <option value="PAID">Payé</option>
                <option value="UNPAID">Non payé</option>
                <option value="PENDING">En attente</option>
              </select>
            </div>
          ))}
                      <div className="flex justify-between">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          {selectedClass ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

               {/*le champ de recherchez */}

              <div className="mb-6">
              <input
                  type="text"
                  placeholder="Rechercher par nom ou prénom"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  <option value="">--Sélectionner un mois--</option>
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </option>
                  ))}
                </select>
              
                <select
                  value={filterStatus}
                  onChange={handleFilterStatusChange}
                  className="p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  {Object.keys(statusLabels).map(status => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>

              </div>

              {/* Classes Table */}
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°inscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complete</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Inscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frais d'inscription</th>
                      {months.map(month => (
                      <th key={month} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{month}</th>
                    ))}
                 
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.length > 0 ? (
                    currentClasses.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.studentInscription}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.studentNom} {payment.studentPrenom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount} DH</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.studentCreatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.studentDepart === 'Actif' ? (
          
          <div className="flex items-center justify-center w-full h-full">
          <span className="block w-3 h-3 bg-green-500 rounded-full"></span>
          </div>

) : (
<div className="flex items-center space-x-2">
<span className="block w-3 h-3 bg-red-500 rounded-full"></span>
<span className="text-red-500">
<td className="border px-4 py-2">{getStudentDepart(payment.studentDepart)}</td>
</span>
</div>
)}
                        </td>

                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.frais_ins} DH</td>    
                        {months.map(month => (
                          <td key={month} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span  className={clsx(
                      'px-2 py-1 text-white rounded',
                      PaymentStatusColor[payment[month]] || 'bg-gray-500'
                    )}>
                            {payment[month] === 'PENDING' ? 'En attente' : payment[month] === 'PAID' ? 'Payé' : 'Non payé'}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button onClick={() => {
                            setSelectedClass(payment);
                            setFormData({
                              studentId: payment.studentId,
                              amount: payment.amount,
                              paymentDate: payment.paymentDate.slice(0, 10),
                              frais_ins: payment.frais_ins,
                              septembre: payment.septembre,
                              octobre: payment.octobre,
                              novembre: payment.novembre,
                              decembre: payment.decembre,
                              janvier: payment.janvier,
                              fevrier: payment.fevrier,
                              mars: payment.mars,
                              avril: payment.avril,
                              mai: payment.mai,
                              juin: payment.juin,
                              juillet: payment.juillet,
                              aout: payment.aout,
                            });
                            setShowPopup(true);
                          }}   className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600">
                          <FaEdit />
                          </button>

                          <button
                             onClick={() => handleDelete(payment.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={months.length + 5} className="px-6 py-4 text-center text-gray-500">
                        Aucun paiement trouvé
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
