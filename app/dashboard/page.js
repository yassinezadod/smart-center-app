"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Layout, Card, Typography, Spin, Alert } from "antd";
import clsx from 'clsx';
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/Navbar";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const { Content } = Layout;
const { Title: AntTitle } = Typography;


export default function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0); // Nombre d'utilisateurs
  const [classesCount, setClassesCount] = useState(0); // Nombre de classes
  const [studentCount, setStudentCount] = useState(0); // Nombre d'étudiants
  const [paymentCount, setPaymentCount] = useState(0);
  const [classData, setClassData] = useState([]); // Données des classes avec le nombre d'étudiants
  const [genderData, setGenderData] = useState({}); 
  const router = useRouter();


  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const getMonthName = () => {
    const currentDate = new Date().getMonth(); // La méthode getMonth() renvoie un index de 0 à 11
    return months[currentDate];
  };
  
  console.log(getMonthName()); 

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

    // Récupérer le nombre d'utilisateurs
    axios.get("/api/getUser")
      .then((response) => {
        setUserCount(response.data.length); // Met à jour le nombre d'utilisateurs
      })
      .catch((error) => {
        console.error("Error fetching user count", error);
        setError("Error fetching user count");
      });

    // Récupérer le nombre de classes
    axios.get("/api/classes/getClassesWithStudentCount")
      .then((response) => {
        setClassesCount(response.data.length); // Met à jour le nombre de classes
      })
      .catch((error) => {
        console.error("Error fetching classes count", error);
        setError("Error fetching classes count");
      });

    // Récupérer le nombre d'étudiants
    axios.get("/api/student/getstudent")
      .then((response) => {
        const activeStudents = response.data.filter(student => student.depart === "Actif");
        setStudentCount(activeStudents.length); // Met à jour le nombre d'étudiants

        // Traitement des données de genre
        const genderCounts = activeStudents.reduce((counts, student) => {
          counts[student.genre] = (counts[student.genre] || 0) + 1;
          return counts;
        }, {});
        setGenderData(genderCounts); // Met à jour les données des genres
      })
      .catch((error) => {
        console.error("Error fetching student count", error);
        setError("Error fetching student count");
      });

    // Récupérer les données des classes avec le nombre d'étudiants
    axios.get("/api/classes/getClassesWithStudentCount")
      .then((response) => {
        setClassData(response.data); // Met à jour les données des classes
      })
      .catch((error) => {
        console.error("Error fetching class data", error);
        setError("Error fetching class data");
      });

      axios.get("/api/paiement/getPaiements")
      .then((response) => {
        const paiementRetarde = response.data.filter(payment => payment[getMonthName()] === 'UNPAID');
        setPaymentCount(paiementRetarde.length);
        setPayments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching payment count", error);
        setError("Error fetching payment count");
      });

  }, [router]);



  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  if (!user)
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message="Unauthorized" type="error" showIcon />
      </div>
    );

  const cardData = [
    { title: "Utilisateurs", count: userCount },
    { title: "Total Niveaux Éducation", count: classesCount },
    { title: "Eleves", count: studentCount },
    {
      title: "Paiements retardé",
      count: paymentCount,
      description: "Ce Mois",  // Ajout de la description pour Paiements retardé
    },
  ];

  const maxStudentCount = Math.max(...classData.map(cls => cls.studentCount), 0);
  const chartData = {
    responsive: true,
    maintainAspectRatio: false,
    labels: classData.map(cls => cls.niveau), // Les labels sont les noms des classes
    datasets: [
      {
        label: "Nombre d'éleves",
        data: classData.map(cls => cls.studentCount), // Les données sont les nombres d'étudiants
        backgroundColor: "rgba(135, 206, 235, 0.6)",
        borderColor: "rgba(135, 206, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
  const totalGenderCount = Object.values(genderData).reduce((sum, count) => sum + count, 0);
  const pieChartData = {
    labels: Object.keys(genderData),
    datasets: [
      {
        label: "Répartition des Genres",
        data: Object.keys(genderData).map(gender => (genderData[gender] / totalGenderCount * 100).toFixed(2)), // Pourcentage
        backgroundColor: ["#FF69B4", "#1E90FF"],    //#1E90FF[masc, fem] #FF69B4                   
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(0); // Affiche le nombre sans décimales
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return Number.isInteger(value) ? value.toString() : ''; // Affiche uniquement les entiers
          }
        },
        beginAtZero: true, // Assure que l'axe commence à 0
        suggestedMax: maxStudentCount + 1 // Ajuste la valeur maximale affichée
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(2) + '%'; // Affiche le pourcentage
            }
            return label;
          }
        }
      }
    }
  };



  const lastSixPayments = payments.slice(-6); // Extrait les six dernières lignes

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout style={{ marginLeft: 156 }}>
        <NavBar />
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <div className="site-layout-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {cardData.map((card, index) => (
                <Card key={index} title={card.title} style={{ width: '92%', margin:"20px", textAlign: "center" }}>
                  <p className="text-2xl md:text-3xl font-bold">{card.count}</p>
                  {card.description && ( // Si la carte a une description
                    <p className="text-red-500 text-right" style={{ fontSize: "90%", marginTop: "-25px" ,marginRight: "-7px" ,fontFamily: "serif" }}>{card.description}</p> 
                  )}
                </Card>
              ))}
            </div>
            <div className="flex flex-col gap-4 mt-8 md:flex-row">
              <div className="p-4 bg-white rounded-lg shadow-md" style={{ width: '700px', maxWidth: '100%' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md" style={{ width: '350px', maxWidth: '100%' }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>

               {/*****************************************************/}
            <div className="flex flex-col gap-4 mt-8 md:flex-row">
              <div className="p-4 bg-white rounded-lg shadow-md overflow-x-auto" style={{ width: '700px', maxWidth: '100%' }}>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                      <th scope="col" className="px-6 py-3">N°inscription</th>
                      <th scope="col" className="px-6 py-3">Nom complete</th>
                      <th scope="col" className="px-6 py-3">Montant</th>
                      <th scope="col" className="px-6 py-3 text-blue-600">{getMonthName()}</th>
                     
                  </tr>
              </thead>
              <tbody>
              {lastSixPayments.map((payment, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{payment.studentInscription}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{payment.studentNom} {payment.studentPrenom}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{payment.amount} DH</td>
                <td
  className={clsx(
    "px-6 py-4 font-semibold",
    {
      "text-red-600": payment[getMonthName()] === 'UNPAID',
      "text-green-600": payment[getMonthName()] === 'PAID',
      "text-blue-600": payment[getMonthName()] === 'PENDING',
    }
  )}
>
  {payment[getMonthName()] === 'PENDING' ? 'En attente' : payment[getMonthName()] === 'PAID' ? 'Payé' : 'Non payé'}
</td>


                </tr>
              ))}
               


              </tbody>
              </table>
              <br />
              {!loading && user?.role === "SUPER_ADMIN" && (
              <center>
              <button   onClick={() => router.push("/Paiement/PO0653P")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
               Voir plus
              </button>
              </center>
            )}

              </div>
              
            </div>
            


          </div>
          
        </Content>
      </Layout>
    </Layout>
  );
}
