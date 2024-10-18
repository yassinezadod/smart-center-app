"use client";

import { useState, useEffect } from 'react';
import { Layout } from "antd";
import Sidebar from '../../components/Sidebar';
import NavBar from "./Navbar";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';

const { Content } = Layout;

export default function FormationPage() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ niveauClasse: '', group: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchClasses() {
      const response = await fetch('/api/classes/getclasses');
      const data = await response.json();
      const formationClasses = data.filter(cls => cls.niveauScolaire === 'Formation');
      setClasses(formationClasses);
    }
    fetchClasses();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/classes/postclasses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...newClass, niveauScolaire: 'Formation' }),
    });

    const data = await response.json();
    if (response.ok) {
      setClasses([...classes, data]);
      setNewClass({ niveauClasse: '', group: '' });
      setShowPopup(false);
    } else {
      console.error(data.message);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/classes/updateclasses/${selectedClass.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedClass),
    });

    const data = await response.json();
    if (response.ok) {
      setClasses(classes.map(cls => cls.id === selectedClass.id ? data : cls));
      setSelectedClass(null);
      setShowPopup(false);
    } else {
      console.error(data.message);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const response = await fetch(`/api/classes/deleteclasses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        setClasses(classes.filter(cls => cls.id !== id));
      } else {
        console.error(data.message);
      }
    }
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
              <h1 className="text-3xl font-bold mb-4 text-gray-900">Gestion des classes de Formation</h1>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setShowPopup(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
              >
                Ajouter une classe
              </button>

              {showPopup && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto relative">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes size={20} />
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">
                      {selectedClass ? 'Modifier la Classe' : 'Ajouter une Nouvelle Classe'}
                    </h2>
                    <form onSubmit={selectedClass ? handleUpdateClass : handleAddClass}>
                      <input
                        type="text"
                        placeholder="Nom de Formation"
                        value={selectedClass ? selectedClass.niveauClasse : newClass.niveauClasse}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedClass) {
                            setSelectedClass({ ...selectedClass, niveauClasse: value });
                          } else {
                            setNewClass({ ...newClass, niveauClasse: value });
                          }
                        }}
                        className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Group"
                        value={selectedClass ? selectedClass.group : newClass.group}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedClass) {
                            setSelectedClass({ ...selectedClass, group: value });
                          } else {
                            setNewClass({ ...newClass, group: value });
                          }
                        }}
                        className="border border-gray-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                        required
                      />
                      <div className="flex justify-between">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          {selectedClass ? 'Modifier' : 'Ajouter'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Classes Table */}
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Classe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentClasses.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun classe ajoutée
                        </td>
                      </tr>
                    ) : (
                      currentClasses.map((cls, index) => (
                        <tr key={cls.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"> {index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.niveauClasse}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.group}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedClass(cls);
                                setShowPopup(true);
                              }}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
                    Précédent
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
                    Suivant
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
