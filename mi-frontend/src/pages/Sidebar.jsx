import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Window } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";

import panquelLogo from "../img/logofondo.png";
import "../styles/Sidebar.css";
import { getCurrentWindow } from "@tauri-apps/api/window";


export default function Sidebar({ sidebarAbierto, toggleSidebar }) {
    useEffect(() => {
    if (!window.__TAURI__) return;

    const appWindow = getCurrentWindow();
    let unlisten;

    const cerrar = async (event) => {
      event.preventDefault();
      try {
        await fetch("http://127.0.0.1:8000/api/cerrar-backend/");
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error("Error cerrando backend:", error);
      }
      await appWindow.close();
    };

    const setupListener = async () => {
      unlisten = await appWindow.onCloseRequested(cerrar);
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);


  const navigate = useNavigate();
  const location = useLocation();
  const ruta = location.pathname.toLowerCase();
  const rol = localStorage.getItem("rol");
  const [prediccionActiva, setPrediccionActiva] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const cerrarSesion = async () => {
    try {
      const win = Window.getCurrent();
      await win.setSize(new LogicalSize(490, 440));
      await win.center();
    } catch (err) {
      console.warn("No se pudo cambiar tamaño (no Tauri)", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  const cargarPrediccionActiva = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/prediccion/actual/");
      const data = await res.json();
      setPrediccionActiva(data);
    } catch (error) {
      console.error("Error predicción activa:", error);
    }
  };

  useEffect(() => {
    cargarPrediccionActiva();
  }, [ruta]);

  return (
    <>
      <div className={`sidebar ${sidebarAbierto ? "abierto" : "cerrado"}`}>
        {/* Botón expandir */}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {sidebarAbierto ? "◀" : "▶"}
        </button>

        {/* 1. Logo Container */}
        <div className="logo-container-sidebar">
          <img
            src={panquelLogo}
            alt="Logo"
            className="logo-img"
            onClick={() => navigate("/app")}
          />
        </div>

        {/* 2. INFO DE ORDEN ACTIVA (Justo debajo del logo) */}
        {sidebarAbierto && prediccionActiva?.activa && (
          <div className="info-orden-sidebar">
            <div className="status-badge">
              <span className="dot-parpadeo"></span>
              <span>Orden en curso</span>
            </div>
            <p className="fecha-sidebar">
              {new Date(prediccionActiva.fecha).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="menu">
          <button
            onClick={() => navigate("/ultima-orden")}
            className={`menu-item ${ruta === "/ultima-orden" ? "activo" : ""}`}
          >
            🕒 {sidebarAbierto && "Última Orden"}
          </button>

          <button
            onClick={() => navigate("/nueva-orden")}
            className={`menu-item ${ruta === "/nueva-orden" ? "activo" : ""}`}
          >
            🧾 {sidebarAbierto && "Generar Orden"}
          </button>

          <button
            onClick={() => navigate("/productos")}
            className={`menu-item ${ruta === "/productos" ? "activo" : ""}`}
          >
            📦 {sidebarAbierto && "Productos"}
          </button>

          <hr />

          <button
            onClick={() => navigate("/historial")}
            className={`menu-item ${ruta === "/historial" ? "activo" : ""}`}
          >
            📚 {sidebarAbierto && "Historial"}
          </button>

          <button
            onClick={() => navigate("/proveedores")}
            className={`menu-item ${ruta === "/proveedores" ? "activo" : ""}`}
          >
            🏪 {sidebarAbierto && "Proveedores"}
          </button>

          {rol === "admin" && (
            <>
              <hr />
              <button
                onClick={() => navigate("/admin/perfiles")}
                className={`menu-item ${ruta === "/admin/perfiles" ? "activo" : ""}`}
              >
                🛠 {sidebarAbierto && "Administrar"}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMostrarConfirmacion(true)}
          className="menu-item salir"
        >
          🚪 {sidebarAbierto && "Cerrar sesión"}
        </button>
        <hr />
      </div>

      {/* Modal de confirmación (Se mantiene igual) */}
      {mostrarConfirmacion && (
        <div className="modal-overlayNO" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modalNO" onClick={(e) => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p className="pNO">¿Estás seguro de que deseas salir?</p>
            <div className="modal-buttonsNO">
              <button className="btn-cancelarNO" onClick={() => setMostrarConfirmacion(false)}>
                Cancelar
              </button>
              <button className="btn-confirmarNO" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}