import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Login from "../../pages/Login";
import "../../styles/home.css";

function Home() {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Verifica se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    fetch("/api/users/me/", {
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Not authenticated");
        }
      })
      .then((userData) => {
        setIsAuthenticated(true);
        setCurrentUser(userData);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const handleSelectDashboard = (url) => {
    setSelectedDashboard(url);
  };

  const handleLoginSuccess = () => {
    // Recarrega os dados do usuário após login
    fetch("/api/users/me/", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((userData) => {
        setIsAuthenticated(true);
        setCurrentUser(userData);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
      });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedDashboard(null);
  };

  // Evita mostrar a tela de login ao atualizar a página
  if (isCheckingAuth) {
    return (
      <div></div>
    );
  }

  // Se não estiver autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Se estiver autenticado, mostra a aplicação normal
  return (
    <>
      <Sidebar 
        onSelectDashboard={handleSelectDashboard} 
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      {selectedDashboard ? (
        <iframe
          id="dashboard"
          src={selectedDashboard}
          title="Dashboard"
          allowFullScreen
        />
      ) : (
        <div id="dashboard-placeholder">
          <h1>Bem-vindo a Vyzio!</h1>
          <p>Selecione algum dashboard no menu lateral para visualizá-lo</p>
        </div>
      )}
    </>
  );
}

export default Home;
