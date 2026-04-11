import Sidebar from "./Sidebar";
import "../styles/Historial.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { generarPDFDesdeDatos } from "../utils/pdf";
const API_URL = "http://127.0.0.1:8000/api";

function parseFecha(fechaStr) {
  const meses = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  if (!fechaStr) return new Date(); // seguridad

  const partes = fechaStr.split("-");
  if (partes.length !== 3) return new Date(); // evita crash

  const [dia, mes, anio] = partes;
  return new Date(`20${anio}`, meses[mes], dia);
}

export default function Historial() {

  const navigate = useNavigate();

  const [catalogo, setCatalogo] = useState([]);

  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // 🔥 FILTRO UNIFICADO
  const [filtro, setFiltro] = useState({
    busqueda: "",
    fecha: "",
  });

  const [pedidosPorPagina, setPedidosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const tablaRef = useRef(null);

  // ⭐ PAGINACIÓN PRODUCTOS MODAL
  const [paginaProductos, setPaginaProductos] = useState(1);
  const productosPorPagina = 5;
  


  // ================== CARGAR HISTORIAL ==================
  useEffect(() => {
    fetch(`${API_URL}/historial/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPedidos(data);
        } else if (data.pedidos) {
          setPedidos(data.pedidos);
        } else {
          setPedidos([]);
        }
      })
      .catch((err) => {
        console.error("Error cargando historial:", err);
      });
  }, []);


useEffect(() => {
  async function cargarCatalogo() {
    try {
      const res = await fetch(`${API_URL}/producto/`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setCatalogo(data);
      } else {
        console.warn("Catálogo no válido:", data);
        setCatalogo([]);
      }

    } catch (error) {
      console.error("Error cargando catálogo:", error);
      setCatalogo([]);
    }
  }

  cargarCatalogo();
}, []);

useEffect(() => {
  const calcularFilas = () => {
    if (!tablaRef.current) return;

    const contenedor = tablaRef.current;
    const rect = contenedor.getBoundingClientRect();
    
    // 1. Calculamos el espacio desde el inicio de la tabla hasta el fondo de la pantalla
    // Restamos unos 80px extra para dejar espacio a los botones de paginación
    const alturaDisponible = window.innerHeight - rect.top - 80;

    // 2. Definimos alturas fijas (deben coincidir con tu CSS)
    const alturaHeader = 45; 
    const alturaFila = 61;

    // 3. Calculamos cuántas filas caben en el espacio restante tras quitar el header
    const espacioParaFilas = alturaDisponible - alturaHeader;
    const filas = Math.floor(espacioParaFilas / alturaFila);

    // 4. Aplicamos el resultado (mínimo 3 filas para que no se vea vacío)
    setPedidosPorPagina(filas > 3 ? filas : 3);
  };

  // Ejecutar al cargar
  calcularFilas();

  // Escuchar cambios de tamaño
  window.addEventListener("resize", calcularFilas);
  return () => window.removeEventListener("resize", calcularFilas);
}, [pedidos]); // Se recalcula si llegan nuevos pedidos

  // ================== FILTROS ==================
  const pedidosFiltrados = pedidos.filter((p) => {

    const texto = (filtro.busqueda || "").toLowerCase().trim();
    const fechaPedido = parseFecha(p.fecha);

    return (
      (
        texto === "" ||
        (p.proveedores  || []).join(", ").toLowerCase().includes(texto) ||
        (p.codigo || "").toLowerCase().includes(texto)
      ) &&
      (
        filtro.fecha === "" ||
        `${fechaPedido.getFullYear()}-${String(fechaPedido.getMonth() + 1).padStart(2, "0")}` === filtro.fecha
      )
    );
  });

  // 👉 resetear página al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro.busqueda, filtro.fecha]);

  // ================== PAGINACIÓN ==================
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
  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  // ================== PRODUCTOS MODAL ==================
  let productosPagina = [];
  let totalPaginasProductos = 1;

  if (pedidoSeleccionado?.productos) {

    const indiceUltimoProd = paginaProductos * productosPorPagina;
    const indicePrimeroProd = indiceUltimoProd - productosPorPagina;

    productosPagina = pedidoSeleccionado.productos.slice(
      indicePrimeroProd,
      indiceUltimoProd
    );

    totalPaginasProductos = Math.ceil(
      pedidoSeleccionado.productos.length / productosPorPagina
    );
  }
console.log(pedidos);
  // ================== RENDER ==================
  return (
    <div className="layout">

      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">

        {/* 🔍 FILTROS */}
        <div className="filtros">

          <input
            type="text"
            placeholder="Buscar por código"
            value={filtro.busqueda}
            onChange={(e) =>
              setFiltro({ ...filtro, busqueda: e.target.value })
            }
          />

          <input
            type="month"
            value={filtro.fecha}
            onChange={(e) =>
              setFiltro({ ...filtro, fecha: e.target.value })
            }
          />

        </div>

        {/* 📊 TABLA */}
        <div className="tabla-contenedorNO" ref={tablaRef}>

          <table className="tabla-estandar">
            <thead>
              <tr>
                <th>Proveedor(es)</th>
                <th>Código</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {pedidosPagina.map((p) => (
                <tr
                  key={`${p.codigo}-${p.fecha}`}
                  onClick={() => {
                    setPedidoSeleccionado(p);
                    setPaginaProductos(1);
                  }}
                >
                  <td>{p.proveedores?.join(", ")}</td>
                  <td>{p.codigo}</td>
                  <td>{p.fecha}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* 🔢 PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="paginacion">

            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              ◀
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              ▶
            </button>

          </div>
        )}

        {/* 📦 MODAL */}
        {pedidoSeleccionado && (
          <div
            className="modal-overlay"
            onClick={() => setPedidoSeleccionado(null)}
          >
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
            >

              <h2>Detalle del Pedido</h2>

              <p><strong>Proveedor(es):</strong>{" "}{pedidoSeleccionado.proveedores?.join(", ")}</p>
              <p><strong>Código:</strong> {pedidoSeleccionado.codigo}</p>
              <p><strong>Fecha:</strong> {pedidoSeleccionado.fecha}</p>

              <h3>Productos</h3>

              <table className="tabla-productos">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>

                <tbody>
                  {productosPagina.map((prod, i) => (
                    <tr key={`${prod.nombre}-${i}`}>
                      <td>{prod.nombre}</td>
                      <td>{prod.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINACIÓN PRODUCTOS */}
              <div className="footer-modal">

                {/* CENTRO REAL */}
                {totalPaginasProductos > 1 && (
                  <div className="paginacion-centro">
                    <button
                      disabled={paginaProductos === 1}
                      onClick={() => setPaginaProductos(paginaProductos - 1)}
                    >
                      ◀
                    </button>

                    <span>
                      {paginaProductos} / {totalPaginasProductos}
                    </span>

                    <button
                      disabled={paginaProductos === totalPaginasProductos}
                      onClick={() => setPaginaProductos(paginaProductos + 1)}
                    >
                      ▶
                    </button>
                  </div>
                )}

                {/* DERECHA */}
                <div className="acciones">
                  <button
                    className="btn-icono"
                    onClick={() => {
                      generarPDFDesdeDatos({
                        proveedor: pedidoSeleccionado.proveedores,
                        fecha: pedidoSeleccionado.fecha,
                        productos: pedidoSeleccionado.productos
                      });
                    }}
                  >
                    📥
                  </button>

                
                </div>

              </div>
                <div className="cerrarbtn">  
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