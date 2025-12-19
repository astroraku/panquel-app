import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/Historial.css";
import { useNavigate } from "react-router-dom";


// ✔ TAURI 2 (se deja listo, aunque no se use aún)
import { getCurrentWindow } from "@tauri-apps/api/window";

// 🔹 URL FUTURA DEL BACKEND DJANGO
const API_URL = "http://127.0.0.1:8000/api";

export default function Historial() {
  const navigate = useNavigate();

  // ================== PEDIDOS MOCK (TEMPORAL) ==================
  const pedidosMock = [
    {
      id: 1,
      proveedor: "Bimbo México",
      codigo: "PED-001",
      fecha: "2025-10-20",
      productos: [
        { nombre: "Pan Blanco", cantidad: 10 },
        { nombre: "Pan Integral", cantidad: 5 },
      ],
    },
    {
      id: 2,
      proveedor: "Frutas del Valle",
      codigo: "PED-002",
      fecha: "2025-10-22",
      productos: [
        { nombre: "Manzana", cantidad: 20 },
        { nombre: "Plátano", cantidad: 15 },
      ],
    },
  ];

  // ================== STATES ==================
  const [pedidos, setPedidos] = useState(pedidosMock);
  const [filtro, setFiltro] = useState({
    proveedor: "",
    codigo: "",
    fecha: "",
  });
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // ================== FUTURO: CARGAR DESDE DJANGO ==================
  /*
  useEffect(() => {
    async function cargarPedidos() {
      try {
        const res = await fetch(`${API_URL}/pedidos/`);
        const data = await res.json();
        setPedidos(data);
      } catch (err) {
        console.error("Error cargando pedidos", err);
      }
    }
    cargarPedidos();
  }, []);
  */

  // ================== FILTROS ==================
  const pedidosFiltrados = pedidos.filter((p) => {
    return (
      (filtro.proveedor === "" ||
        p.proveedor
          .toLowerCase()
          .includes(filtro.proveedor.toLowerCase())) &&
      (filtro.codigo === "" ||
        p.codigo.toLowerCase().includes(filtro.codigo.toLowerCase())) &&
      (filtro.fecha === "" || p.fecha.includes(filtro.fecha))
    );
  });

  // ================== SIDEBAR ==================
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // ================== RENDER ==================
  return (
    <div className="layout">
      {/* --- SIDEBAR --- */}
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      {/* --- CONTENIDO --- */}
      <div className="contenido">
        <h1 className="titulo">Historial de Pedidos</h1>

        {/* --- FILTROS --- */}
        <div className="filtros">
          <input
            type="text"
            placeholder="Buscar por proveedor"
            value={filtro.proveedor}
            onChange={(e) =>
              setFiltro({ ...filtro, proveedor: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Buscar por código"
            value={filtro.codigo}
            onChange={(e) =>
              setFiltro({ ...filtro, codigo: e.target.value })
            }
          />
          <input
            type="date"
            value={filtro.fecha}
            onChange={(e) =>
              setFiltro({ ...filtro, fecha: e.target.value })
            }
          />
        </div>

        {/* --- TABLA --- */}
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Código</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((p) => (
              <tr key={p.id} onClick={() => setPedidoSeleccionado(p)}>
                <td>{p.proveedor}</td>
                <td>{p.codigo}</td>
                <td>{p.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- MODAL DETALLE --- */}
        {pedidoSeleccionado && (
          <div
            className="modal-overlay"
            onClick={() => setPedidoSeleccionado(null)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Detalle del Pedido</h2>

              <p>
                <strong>Proveedor:</strong>{" "}
                {pedidoSeleccionado.proveedor}
              </p>
              <p>
                <strong>Código:</strong> {pedidoSeleccionado.codigo}
              </p>
              <p>
                <strong>Fecha:</strong> {pedidoSeleccionado.fecha}
              </p>

              <h3>Productos</h3>

              <table className="tabla-productos">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoSeleccionado.productos?.map((prod, i) => (
                    <tr key={i}>
                      <td>{prod.nombre}</td>
                      <td>{prod.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="cerrar"
                onClick={() => setPedidoSeleccionado(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
