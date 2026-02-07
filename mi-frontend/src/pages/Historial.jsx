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
    {
      id: 3,
      proveedor: "Lala",
      codigo: "PED-003",
      fecha: "2025-10-25",
      productos: [{ nombre: "Leche", cantidad: 30 }],
    },
    {
      id: 4,
      proveedor: "Gamesa",
      codigo: "PED-004",
      fecha: "2025-10-28",
      productos: [{ nombre: "Galletas", cantidad: 40 }],
    },
    {
      id: 5,
      proveedor: "Pepsi",
      codigo: "PED-005",
      fecha: "2025-10-29",
      productos: [{ nombre: "Refresco", cantidad: 25 }],
    },
    {
      id: 6,
      proveedor: "Coca Cola",
      codigo: "PED-006",
      fecha: "2025-10-30",
      productos: [{ nombre: "Refresco", cantidad: 50 }],
    },
    {
      id: 7,
      proveedor: "Sabritas",
      codigo: "PED-007",
      fecha: "2025-11-01",
      productos: [{ nombre: "Papas", cantidad: 60 }],
    },
    {
      id: 8,
      proveedor: "Zulka",
      codigo: "PED-008",
      fecha: "2025-11-02",
      productos: [{ nombre: "Azúcar", cantidad: 20 }],
    },
    {
      id: 9,
      proveedor: "Verde Valle",
      codigo: "PED-009",
      fecha: "2025-11-03",
      productos: [{ nombre: "Arroz", cantidad: 35 }],
    },
    {
      id: 10,
      proveedor: "Isadora",
      codigo: "PED-010",
      fecha: "2025-11-04",
      productos: [{ nombre: "Frijol", cantidad: 45 }],
    },
    {
      id: 11,
      proveedor: "Nescafé",
      codigo: "PED-011",
      fecha: "2025-11-05",
      productos: [{ nombre: "Café", cantidad: 15 }],
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

  // ================== PAGINACIÓN ==================
  const pedidosPorPagina = 10;
  const [paginaActual, setPaginaActual] = useState(1);

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

  // 🔁 Volver a página 1 al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  // ================== CÁLCULOS PAGINACIÓN ==================
  const indiceUltimo = paginaActual * pedidosPorPagina;
  const indicePrimero = indiceUltimo - pedidosPorPagina;

  const pedidosPagina = pedidosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(
    pedidosFiltrados.length / pedidosPorPagina
  );

  // ================== SIDEBAR ==================
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // ================== RENDER ==================
  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">

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
        <div className="tabla-contenedorNO">
          <table className="tabla-pedidos">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Código</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPagina.map((p) => (
                <tr key={p.id} onClick={() => setPedidoSeleccionado(p)}>
                  <td>{p.proveedor}</td>
                  <td>{p.codigo}</td>
                  <td>{p.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- PAGINACIÓN --- */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              ◀ Anterior
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente ▶
            </button>
          </div>
        )}

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

              <div className="modal-botones">
                <button
                  className="btn-normalNO"
                  onClick={() => setPedidoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
