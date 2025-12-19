import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/UltimaOrden.css";

export default function UltimaOrden() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const [ultimaOrden, setUltimaOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 🔌 CUANDO ME DES LA URL REAL, SOLO CAMBIAS "http://localhost:8000/api/ultima-orden/"
  async function fetchUltimaOrden() {
    try {
      const res = await fetch("http://localhost:8000/api/ultima-orden/");
      if (!res.ok) throw new Error("Error al obtener la última orden");

      const data = await res.json();
      setUltimaOrden(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    fetchUltimaOrden();
  }, []);

  return (
    <div className="layout">
      
      {/* ---- SIDEBAR REAL ---- */}
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      {/* ---- PANEL PRINCIPAL ---- */}
      <main className={`contenido ${sidebarAbierto ? "con-sidebar" : "sin-sidebar"}`}>

        <h2 className="tituloUO">Última Orden Generada</h2>

        {cargando && <p className="estadoUO">Cargando última orden...</p>}

        {error && <p className="errorUO">⚠ {error}</p>}

        {ultimaOrden && (
          <div className="orden-contenedorUO">

            <div className="info-generalUO">
              <p><strong>ID de Orden:</strong> {ultimaOrden.id}</p>
              <p><strong>Proveedor:</strong> {ultimaOrden.proveedor}</p>
              <p><strong>Fecha:</strong> {ultimaOrden.fecha}</p>
            </div>

            {/* ---- TABLA ---- */}
            <table className="tablaUO">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th>Cantidad Pedida</th>
                </tr>
              </thead>

              <tbody>
                {ultimaOrden.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.proveedor}</td>
                    <td>{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </main>
    </div>
  );
}
