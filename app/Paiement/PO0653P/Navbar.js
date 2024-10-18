"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaBell, FaSignOutAlt, FaCircle } from "react-icons/fa"; 
import axios from "axios";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [notifications, setNotifications] = useState([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .post("/api/auth/verify-token", { token })
        .then((response) => {
          setUser(response.data.user);
        })
        .catch((error) => {
          console.error("Invalid token or error verifying token", error);
          setError("Invalid token or error verifying token");
          localStorage.removeItem("token");
          router.push("/");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('/api/paiement/getPaiements');
        const currentDate = new Date();

        const monthNames = [
          'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
          'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ];

        const unpaidNotifications = data.flatMap(payment => {
          const paymentMonth = new Date(payment.paymentDate).getMonth() + 1;
          const status = getStatusForMonth(currentDate.getMonth() + 1, payment);

          if (status === 'UNPAID' && paymentMonth === currentDate.getMonth() + 1) {
            const paymentDate = new Date(payment.paymentDate);
            const timeDifference = Math.floor((currentDate - paymentDate) / (1000 * 60 * 60 * 24));
            
            // Vérification si la notification date de plus de 7 jours
            if (timeDifference <= 7) {
              return [{
                name: payment.studentNom,
                surname: payment.studentPrenom,
                mois : monthNames[currentDate.getMonth()],
                message: `${payment.studentNom} ${payment.studentPrenom} n'a pas payé pour le mois de ${monthNames[currentDate.getMonth()]}`
              }];
            }
          }
          return [];
        });

        setNotifications(unpaidNotifications);
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements", error);
        setError("Erreur lors de la récupération des paiements");
      }
    };

    fetchNotifications();
  }, []);

  const getStatusForMonth = (currentMonth, payment) => {
    switch (currentMonth) {
      case 1: return payment.janvier;
      case 2: return payment.fevrier;
      case 3: return payment.mars;
      case 4: return payment.avril;
      case 5: return payment.mai;
      case 6: return payment.juin;
      case 7: return payment.juillet;
      case 8: return payment.aout;
      case 9: return payment.septembre;
      case 10: return payment.octobre;
      case 11: return payment.novembre;
      case 12: return payment.decembre;
      default: return "UNKNOWN";
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Error logging out", error);
    } finally {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.map(name => name.charAt(0).toUpperCase()).join('');
  };

  const getColorFromInitials = (name) => {
    const colors = ['#FFEBEE', '#FFCDD2', '#F44336', '#E57373', '#4DB6AC',
                    '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C',
                    '#F1F8E9', '#DCE775', '#C0CA33', '#A4B42B', '#9E9D24',
                    '#F0F4C3', '#E6EE9C', '#DCE775', '#D0D80A', '#C6D600',
                    '#E0F2F1', '#B9FBC0', '#4DB6AC', '#26A69A', '#00796B'];
    const initials = getInitials(name);
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  };

  const avatarColor = user ? getColorFromInitials(`${user.nom} ${user.prenom}`) : '#F0F0F0';

  return (
    <nav className="bg-sky-600 text-white flex items-center justify-between px-6 py-3 shadow-md">
      <div className="text-2xl font-semibold">
        {/* Titre de l'application, si nécessaire */}
      </div>
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
            className="relative text-gray-300 hover:text-white focus:outline-none"
          >
            <FaBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {isNotificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded shadow-lg z-10">
              <ul className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <li key={index} className="flex items-center justify-between px-4 py-2 border-b border-gray-200 hover:bg-gray-100 transition duration-200">
  <div className="text-gray-800">
    <b className="text-blue-600">{notification.name} {notification.surname}</b> n'a pas payé pour le mois <span className="font-semibold text-yellow-500">{notification.mois}</span>
  </div>
  <span className="text-sm text-white bg-green-400 px-2 py-1 rounded-full">Rappel</span>
</li>


                  ))
                ) : (
                  <li className="px-4 py-2">Aucune notification</li>
                )}
              </ul>
            </div>
          )}
        </div>

    
        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center text-gray-300 hover:text-white focus:outline-none"
          >
            {/* Avatar avec bulle verte */}
            <div className="relative flex items-center">
              <div
                className="w-10 h-10 text-white rounded-full flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: avatarColor }}
              >
                {user ? getInitials(`${user.prenom}`) : '?'}
              </div>
              {user && (
                <FaCircle
                  className="absolute -bottom-1 -right-1 text-green-500"
                  style={{ fontSize: "0.8rem" }}
                />
              )}
            </div>

            <span className="ml-2"><b>{user ? `${user.nom}` : 'Profile'}</b></span>
          </button>
          {isProfileMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-10">
              <div className="px-4 py-2 border-b">
                <p className="font-bold">{`${user.nom} ${user.prenom}`}</p>
                {/* Role en bleu */}
                <p className="text-sm text-blue-600">{user.role}</p>
              </div>
              <ul>
                <li className="px-4 py-2 border-b">
                  <Link href="/profile" className="hover:text-sky-600">Profile</Link>
                </li>
                <li className="px-4 py-2 border-b">
                  <Link href="/settings" className="hover:text-sky-600">Settings</Link>
                </li>
                <li className="px-4 py-2">
                  <button  onClick={handleLogout}  className="flex items-center text-red-500 hover:text-red-700">
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
