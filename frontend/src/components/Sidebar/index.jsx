import React, { useState, useEffect, useMemo } from "react";
import "../../styles/sidebar.css";
import { getCookie } from "../../helpers/getCookie";

// Importa as imagens diretamente
import whiteLogo from "../../images/white_logo.png";
import smallLogo from "../../images/small_logo.png";

// Hook para buscar dados da API
function useFetchSectors() {
  const [sectors, setSectors] = useState({});

  const fetchData = () => {
    // Adiciona um timestamp para evitar cache da API
    const url = `/api/dashboards/sectors/?t=${new Date().getTime()}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setSectors(data);
      })
      .catch((error) => console.error("Erro ao buscar setores:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { sectors, refetchSectors: fetchData };
}

// Componente do Emblema de Status
function StatusBadge({ status }) {
  if (status === "D") {
    return <span className="dev-badge">EM DESENVOLVIMENTO</span>;
  }
  if (status === "M") {
    return (
      <span
        className="dev-badge"
        style={{ backgroundColor: "#ffc107", color: "#000" }}
      >
        EM MANUTENÇÃO
      </span>
    );
  }
  return null;
}

// Componente principal da Sidebar
function Sidebar({ onSelectDashboard, currentUser }) {
  const { sectors, refetchSectors } = useFetchSectors();
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [activeSubmenus, setActiveSubmenus] = useState({ Favoritos: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDashboardId, setActiveDashboardId] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Estado para controlar o dropdown de setor (quando colapsado)
  const [openDropdownSector, setOpenDropdownSector] = useState(null);

  // Guarda o estado dos submenus antes da pesquisa
  const [preSearchActiveSubmenus, setPreSearchActiveSubmenus] = useState(null);

  // Verifica se há dashboards disponíveis
  const hasDashboards = Object.keys(sectors).length > 0;

  const handleLogout = (e) => {
    e.preventDefault();
    
    const csrftoken = getCookie('csrftoken');

    fetch('/api/auth/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = '/?logout=true';
        } else {
          console.error('Erro ao fazer logout');
        }
      })
      .catch((error) => console.error("Erro ao fazer logout:", error));
  };

  const handleToggleSidebar = () => {
    const collapsed = !isCollapsed;
    setIsCollapsed(collapsed);
    localStorage.setItem("sidebar-collapsed", collapsed);
    // Fecha menus pop-out abertos ao colapsar/expandir
    setOpenDropdownSector(null);
    setIsUserMenuOpen(false);
  };

  // Decide se abre o acordeão (expandido) ou o dropdown (colapsado)
  const handleToggleSubmenu = (sectorName) => {
    if (isCollapsed) {
      // Se estiver colapsado, age como dropdown
      setOpenDropdownSector((prev) =>
        prev === sectorName ? null : sectorName
      );
      setIsUserMenuOpen(false); // Fecha o menu do usuário
    } else {
      // Se estiver expandido, age como acordeão
      setActiveSubmenus((prev) => ({
        ...prev,
        [sectorName]: !prev[sectorName],
      }));
    }
  };

  const handleToggleUserMenu = (e) => {
    e.preventDefault();
    setIsUserMenuOpen((prev) => !prev);
    setOpenDropdownSector(null); // Fecha o dropdown do setor
  };

  const handleDashboardClick = (e, dashboard) => {
    e.preventDefault();
    if (dashboard.url) {
      if (dashboard.id === activeDashboardId) {
        onSelectDashboard(null);
        setTimeout(() => {
          onSelectDashboard(dashboard.url);
        }, 0);
      } else {
        onSelectDashboard(dashboard.url);
      }
      setActiveDashboardId(dashboard.id);
      setIsUserMenuOpen(false);
      setOpenDropdownSector(null); // Fecha o dropdown do setor ao clicar
    }
  };

  const handleFavoriteToggle = (e, dashboardId) => {
    e.preventDefault();
    e.stopPropagation();

    const csrftoken = getCookie('csrftoken');

    fetch(`/api/dashboards/${dashboardId}/favorite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao favoritar');
        }
        return response.json();
      })
      .then(() => {
        refetchSectors();
      })
      .catch((error) => console.error("Erro ao favoritar:", error));
  };

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getLevenshteinDistance = (source, target) => {
  if (!source.length) return target.length;
  if (!target.length) return source.length;

  const rows = target.length + 1;
  const cols = source.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = target[i - 1] === source[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
};

const hasFuzzyMatch = (text, normalizedTerm) => {
  if (!normalizedTerm) return true;

  const normalizedText = normalizeText(text);
  if (normalizedText.includes(normalizedTerm)) return true;

  const distance = getLevenshteinDistance(normalizedText, normalizedTerm);
  const allowedError = Math.max(1, Math.floor(normalizedTerm.length * 0.4));
  return distance <= allowedError;
};

  const filteredSectors = useMemo(() => {
    if (!searchTerm) {
      return sectors;
    }

    const normalizedTerm = normalizeText(searchTerm);
    const newFilteredSectors = {};

    Object.entries(sectors).forEach(([sectorName, dashboards]) => {
      const filteredDashboards = dashboards.filter((dashboard) =>
        hasFuzzyMatch(dashboard.title, normalizedTerm)
      );

      if (filteredDashboards.length > 0) {
        newFilteredSectors[sectorName] = filteredDashboards;
      }
    });
    return newFilteredSectors;
  }, [sectors, searchTerm]);

  // Expande/recolhe acordeões ao pesquisar
  useEffect(() => {
    // Inicia uma pesquisa
    if (searchTerm && preSearchActiveSubmenus === null) {
      setPreSearchActiveSubmenus(activeSubmenus);
    }

    if (searchTerm) {
      const allSectors = Object.keys(filteredSectors).reduce((acc, sector) => {
        acc[sector] = true;
        return acc;
      }, {});
      setActiveSubmenus(allSectors);
    } else {
      // Restaura o estado anterior se ele existir
      if (preSearchActiveSubmenus !== null) {
        setActiveSubmenus(preSearchActiveSubmenus);
        setPreSearchActiveSubmenus(null); // Limpa o estado guardado
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filteredSectors]);

  // Fecha menus dropdown (usuário E setor) ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fecha menu do usuário
      if (isUserMenuOpen && !event.target.closest(".user-menu")) {
        setIsUserMenuOpen(false);
      }
      // Fecha menu de setor
      if (openDropdownSector && !event.target.closest(".menu-item")) {
        setOpenDropdownSector(null);
      }
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setOpenDropdownSector(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isUserMenuOpen, openDropdownSector]);

  // Função para formatar o nome do usuário
  const getUserDisplayName = () => {
    if (!currentUser) return "Carregando...";
    
    // Prioridade: first_name + last_name > username > email
    if (currentUser.first_name || currentUser.last_name) {
      return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    
    return currentUser.username || currentUser.email || "Usuário";
  };

  return (
    <aside id="sidebar" className={isCollapsed ? "collapsed" : ""}>
      <div className="logo">
        <a href="/" title="Recarregar a Página">
          <img
            src={isCollapsed ? smallLogo : whiteLogo}
            alt="Logo"
            id="logo-img"
            data-full-logo={whiteLogo}
            data-icon-logo={smallLogo}
          />
        </a>
      </div>

      <nav className="menu">
        {hasDashboards && (
        <div className="search-indicadores-container">
          <input
            type="text"
            id="search-indicadores"
            placeholder="Pesquise por dashboards aqui..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              type="button"
              title="Limpar pesquisa"
              onClick={() => setSearchTerm("")}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        )}

        <ul className="menu-list">
          {Object.keys(filteredSectors).length === 0 ? (
            <li className="alert">
              <p>Nenhum dashboard disponível!</p>
            </li>
          ) : (
            Object.entries(filteredSectors).map(([sectorName, dashboards]) => {
              const isFavoriteSection = sectorName === "Favoritos";

              // Define se o submenu está ativo (acordeão ou dropdown)
              const isAccordionActive =
                !isCollapsed && !!activeSubmenus[sectorName];
              const isDropdownActive =
                isCollapsed && openDropdownSector === sectorName;

              if (isFavoriteSection && dashboards.length === 0 && !searchTerm) {
                return null;
              }

              return (
                // .menu-item agora precisa de position: relative (definido no CSS)
                <li className="menu-item" key={sectorName}>
                  <div
                    className={`sector-header ${
                      isAccordionActive || isDropdownActive ? "active" : ""
                    }`}
                    title={sectorName}
                    onClick={() => handleToggleSubmenu(sectorName)}
                  >
                    <i
                      className={`fas ${
                        isFavoriteSection ? "fa-star" : "fa-box-archive"
                      }`}
                    ></i>
                    <span className="text">{sectorName}</span>
                    <i className="fas fa-chevron-right toggle-icon"></i>
                  </div>
                  <ul
                    // Aplica .active (acordeão) OU .show (dropdown)
                    className={`submenu ${isAccordionActive ? "active" : ""} ${
                      isDropdownActive ? "show" : ""
                    }`}
                    id={isFavoriteSection ? "favorites-list" : undefined}
                  >
                    {dashboards.map((dashboard) => (
                      <li key={dashboard.id} data-id={dashboard.id}>
                        <a
                          href="#"
                          className={`dashboard-link ${
                            dashboard.id === activeDashboardId ? "active" : ""
                          }`}
                          data-url={dashboard.url}
                          title={
                            dashboard.status === "D"
                              ? "Em Desenvolvimento"
                              : dashboard.title
                          }
                          onClick={(e) => handleDashboardClick(e, dashboard)}
                        >
                          {!dashboard.url ? (
                            <i
                              className="fas fa-exclamation-triangle"
                              title="Sem conteúdo configurado"
                            ></i>
                          ) : (
                            <i className="fas fa-chart-line"></i>
                          )}
                          <span className="text">
                            {dashboard.title}
                            <StatusBadge status={dashboard.status} />
                          </span>
                          <i
                            className={`fas fa-thumbtack pin-icon ${
                              isFavoriteSection ||
                              sectors.Favoritos?.some(
                                (d) => d.id === dashboard.id
                              )
                                ? "favorited"
                                : ""
                            }`}
                            data-id={dashboard.id}
                            title={
                              isFavoriteSection
                                ? "Desafixar dos favoritos"
                                : "Fixar nos favoritos"
                            }
                            onClick={(e) => handleFavoriteToggle(e, dashboard.id)}
                          ></i>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })
          )}
        </ul>
      </nav>

      <div className="bottom">
        <div className="user-menu" title={getUserDisplayName()}>
          <a
            href="#"
            className={`user-toggle ${isUserMenuOpen ? "active" : ""}`}
            id="user-toggle"
            onClick={handleToggleUserMenu}
          >
            <i className="fas fa-user-tie"></i>
            <span className="text">{getUserDisplayName()}</span>
            <i className="fas fa-chevron-down dropdown-icon"></i>
          </a>

          <div
            className={`user-dropdown ${isUserMenuOpen ? "show" : ""}`}
            id="user-dropdown"
          >
            {currentUser && currentUser.is_staff && (
              <>
                <a href="/admin/" title="Acessar Portal de Administração do Site">
                  <i className="fa-solid fa-screwdriver-wrench"></i>
                  <span>Portal de Administração</span>
                </a>
                <a href="/api/" title="Acessar Portal da API do Site">
                  <i className="fa-solid fa-gears"></i>
                  <span>Portal API</span>
                </a>
              </>
            )}
            <a href="#" title="Fazer Logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Sair</span>
            </a>
          </div>
        </div>

        <button
          id="toggle"
          title="Minimizar Menu"
          onClick={handleToggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
