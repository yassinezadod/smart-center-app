"use client";

import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTrash, FaEdit } from 'react-icons/fa';
import { Layout} from "antd";
import Sidebar from "../../components/Sidebar";
import NavBar from "../../components/Navbar";
import { FaTimes } from 'react-icons/fa';


const { Content } = Layout;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch("/api/getUser");
      const data = await response.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...newUser, role: "ADMIN" }),
    });

    const data = await response.json();
    if (response.ok) {
      setUsers([...users, { ...newUser, role: "ADMIN" }]);
      setNewUser({ nom: "", prenom: "", email: "", password: "" });
      setShowPopup(false); // Fermer le popup après l'ajout
    } else {
      console.error(data.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const updatedUser = { ...selectedUser };
    if (updatedUser.password === "") {
      delete updatedUser.password; // Ne pas inclure le mot de passe s'il est vide
    }

    const response = await fetch(`/api/updateUser/${selectedUser.email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    const data = await response.json();
    if (response.ok) {
      setUsers(
        users.map((user) =>
          user.email === selectedUser.email ? updatedUser : user
        )
      );
      setSelectedUser(null);
      setShowPopup(false); // Fermer le popup après la mise à jour
    } else {
      console.error(data.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const response = await fetch(`/api/deleteUser/${email}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.email !== email));
      } else {
        console.error(data.message);
      }
    }
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users
    .filter((user) => user.role === "ADMIN")
    .slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(
    users.filter((user) => user.role === "ADMIN").length / itemsPerPage
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
<Sidebar />
      <Layout style={{ marginLeft: 156 }}>
        <NavBar />
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
   
        <div className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              Gestion Utilisateurs{" "}
            </h1>
            <button
              onClick={() => {
                setSelectedUser(null);
                setShowPopup(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
            >
              Ajouter un utilisateur
            </button>
            {showPopup && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg max-w-md w-full mx-auto relative">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes size={20} />
                    </button>
                    <h2 className="text-xl font-bold mb-4">
                      {selectedUser ? "Modifier un utilisateur" : "Ajouter un utilisateur"}
                    </h2>
                    <form onSubmit={selectedUser ? handleUpdateUser : handleAddUser}>
                      <input
                        type="text"
                        placeholder="Nom"
                        value={selectedUser ? selectedUser.nom : newUser.nom}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedUser) {
                            setSelectedUser({ ...selectedUser, nom: value });
                          } else {
                            setNewUser({ ...newUser, nom: value });
                          }
                        }}
                        className="border border-gray-300 p-2 mb-2 w-full rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Prenom"
                        value={selectedUser ? selectedUser.prenom : newUser.prenom}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedUser) {
                            setSelectedUser({ ...selectedUser, prenom: value });
                          } else {
                            setNewUser({ ...newUser, prenom: value });
                          }
                        }}
                        className="border border-gray-300 p-2 mb-2 w-full rounded"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={selectedUser ? selectedUser.email : newUser.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (selectedUser) {
                            setSelectedUser({ ...selectedUser, email: value });
                          } else {
                            setNewUser({ ...newUser, email: value });
                          }
                        }}
                        className="border border-gray-300 p-2 mb-2 w-full rounded"
                        required
                      />
                      <div className="relative mb-4">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={selectedUser ? selectedUser.password : newUser.password}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (selectedUser) {
                              setSelectedUser({ ...selectedUser, password: value });
                            } else {
                              setNewUser({ ...newUser, password: value });
                            }
                          }}
                          className="border border-gray-300 p-2 w-full rounded"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-6 flex items-center px-2"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
          type="button"
          onClick={() => {
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, password: "" });
      } else {
        setNewUser({ ...newUser, password: "" });
      }
    }}
          className="absolute inset-y-0 right-0 flex items-center px-2"
        >
          <FaTimes className="text-blue-800" />
        </button>
      
      
                      </div>
                      <div className="flex justify-between">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          {selectedUser ? "Modifier un utilisateur" : "Ajouter un utilisateur"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prenom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.email}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.prenom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPopup(true);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
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
