import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import panquelLogo from "../img/panquel.gif";
import "../styles/Sidebar.css";


export default function Sidebar({ sidebarAbierto, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ruta = location.pathname.toLowerCase();

  // 🔴 Modal cerrar sesión
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // 🟢 Órdenes activas desde backend
  const [ordenesActivas, setOrdenesActivas] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [errorOrdenes, setErrorOrdenes] = useState(null);

  // 🔹 Cargar órdenes activas SOLO en nueva orden
  useEffect(() => {
    if (ruta === "/nueva-orden") {
      cargarOrdenesActivas();
    }
  }, [ruta]);

  const cargarOrdenesActivas = async () => {
    setCargandoOrdenes(true);
    setErrorOrdenes(null);

    try {
      // 🔧 ENDPOINT DJANGO (ajústalo luego)
      const res = await fetch("http://localhost:8000/api/ordenes-activas/");
      if (!res.ok) throw new Error("Error al cargar órdenes");

      const data = await res.json();
      setOrdenesActivas(data);
    } catch (err) {
      console.error(err);
      setErrorOrdenes("No se pudieron cargar");
    } finally {
      setCargandoOrdenes(false);
    }
  };

  const cerrarSesion = () => {
    navigate("/login");
  };

  return (
    <>
      <div className={`sidebar ${sidebarAbierto ? "abierto" : "cerrado"}`}>

        {/* Botón expandir */}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {sidebarAbierto ? "◀" : "▶"}
        </button>

        {/* Logo */}
        {ruta !== "/app" && (
          <div className="logo-container-sidebar">
            <img
              src={panquelLogo}
              alt="Logo"
              className="logo-img"
              onClick={() => navigate("/app")}
            />
          </div>
        )}

        <div className="menu">

          {ruta !== "/ultima-orden" && (
            <button onClick={() => navigate("/ultima-orden")} className="menu-item">
              🕒 {sidebarAbierto && "Última Orden"}
            </button>
          )}

          {ruta !== "/nueva-orden" && (
            <button onClick={() => navigate("/nueva-orden")} className="menu-item">
              🧾 {sidebarAbierto && "Generar Orden"}
            </button>
          )}

          {ruta !== "/productos" && (
            <button onClick={() => navigate("/productos")} className="menu-item">
              📦 {sidebarAbierto && "Productos"}
            </button>
          )}

          <hr />

          {ruta !== "/historial" && (
            <button onClick={() => navigate("/historial")} className="menu-item">
              📚 {sidebarAbierto && "Historial"}
            </button>
          )}

          {ruta !== "/proveedores" && (
            <button onClick={() => navigate("/proveedores")} className="menu-item">
              🏪 {sidebarAbierto && "Proveedores"}
            </button>
          )}

          {/* ================= ÓRDENES ACTIVAS ================= */}
          {ruta === "/nueva-orden" && sidebarAbierto && (
            <div className="seccion-extra-nueva-orden">
              <h2 className="titulo-menuNO">Órdenes Activas</h2>

              <div className="lista-activosNO">
                {cargandoOrdenes && <p>Cargando...</p>}
                {errorOrdenes && <p>{errorOrdenes}</p>}

                {!cargandoOrdenes && !errorOrdenes && ordenesActivas.length === 0 && (
                  <p>No hay órdenes activas</p>
                )}

                {ordenesActivas.map((orden) => (
                  <p key={orden.id}>
                    {orden.proveedor}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="espaciador"></div>

          {/* Cerrar sesión */}
          <button
            onClick={() => setMostrarConfirmacion(true)}
            className="menu-item salir"
          >
            🚪 {sidebarAbierto && "Cerrar sesión"}
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {mostrarConfirmacion && (
        <div className="modal-overlayNO" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modalNO" onClick={(e) => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro de que deseas salir?</p>

            <div className="modal-buttonsNO">
              <button
                className="btn-cancelarNO"
                onClick={() => setMostrarConfirmacion(false)}
              >
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
