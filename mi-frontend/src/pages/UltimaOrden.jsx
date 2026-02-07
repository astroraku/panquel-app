import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/UltimaOrden.css";

export default function UltimaOrden() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const [ultimaOrden, setUltimaOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 🧪 DATOS DE EJEMPLO (MOCK)
  const ultimaOrdenMock = {
    id: 128,
    proveedor: "Distribuidora La Central",
    fecha: "2026-01-30",
    items: [
      {
        id: 1,
        nombre: "Harina de trigo 1kg",
        proveedor: "Distribuidora La Central",
        cantidad: 10,
      },
      {
        id: 2,
        nombre: "Azúcar refinada 1kg",
        proveedor: "Distribuidora La Central",
        cantidad: 8,
      },
      {
        id: 3,
        nombre: "Levadura seca 500g",
        proveedor: "Distribuidora La Central",
        cantidad: 5,
      },
    ],
  };

  // 🔌 CONEXIÓN REAL A BACKEND (SE DEJA LISTA, PERO COMENTADA)
  /*
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
  */

  useEffect(() => {
    // 🔹 MODO MOCK (para pruebas visuales)
    setTimeout(() => {
      setUltimaOrden(ultimaOrdenMock);
      setCargando(false);
    }, 600);

    // 🔹 CUANDO ACTIVES EL BACKEND, DESCOMENTA ESTO
    // fetchUltimaOrden();
  }, []);

  return (
    <div className="layout">
      
      {/* ---- SIDEBAR REAL ---- */}
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      {/* ---- PANEL PRINCIPAL ---- */}
      <main
        className={`contenido ${
          sidebarAbierto ? "con-sidebar" : "sin-sidebar"
        }`}
      >
        <h2 className="tituloUO">Última Orden Generada</h2>

        {cargando && <p className="estadoUO">Cargando última orden...</p>}

        {error && <p className="errorUO">⚠ {error}</p>}

        {ultimaOrden && (
          <div className="orden-contenedorUO">
            <div className="info-generalUO">
              <p>
                <strong>ID de Orden:</strong> {ultimaOrden.id}
              </p>
              <p>
                <strong>Proveedor:</strong> {ultimaOrden.proveedor}
              </p>
              <p>
                <strong>Fecha:</strong> {ultimaOrden.fecha}
              </p>
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
