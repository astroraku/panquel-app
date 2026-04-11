import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/UltimaOrden.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function UltimaOrden() {

  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  
  const [ultimaOrden, setUltimaOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ⭐ PAGINACIÓN
  const [productosPorPagina, setProductosPorPagina] = useState(5);
  const tablaRef = useRef(null);
  const [paginaActual, setPaginaActual] = useState(1);

  async function fetchUltimaOrden() {
    try {

      const res = await fetch(`${API_URL}/ultima-orden/`);

      if (!res.ok) {
        throw new Error("Error al obtener la última orden");
      }

      const data = await res.json();

      setUltimaOrden(data);

    } catch (err) {

      console.error(err);
      setError("No se pudo cargar la última orden");

    } finally {

      setCargando(false);

    }
  }

  useEffect(() => {
    fetchUltimaOrden();
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  useEffect(() => {
  const calcularFilas = () => {
    if (!tablaRef.current) return;

    const contenedor = tablaRef.current;

    const top = contenedor.getBoundingClientRect().top;

    const alturaDisponible = window.innerHeight - top - 30;

    let alturaFila = 50;

    const fila = contenedor.querySelector("tbody tr");
    if (fila) {
      alturaFila = fila.offsetHeight;
    }

    // 🔥 considerar header
    const header = contenedor.querySelector("thead");
    let alturaHeader = header ? header.offsetHeight : 0;

    const filas = Math.floor(
      (alturaDisponible - alturaHeader) / alturaFila
    );

    setProductosPorPagina(filas > 3 ? filas -2: 3);
  };

  calcularFilas();

  window.addEventListener("resize", calcularFilas);
  return () => window.removeEventListener("resize", calcularFilas);
}, [ultimaOrden]);
  // ================= PAGINACIÓN =================

  let productosPagina = [];
  let totalPaginas = 1;

if (ultimaOrden?.items) {

  // 🔽 ORDENAR POR PROVEEDOR (A-Z)
  const itemsOrdenados = [...ultimaOrden.items].sort((a, b) =>
    a.proveedor_id.localeCompare(b.proveedor)
  );

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

  productosPagina = itemsOrdenados.slice(
    indicePrimero,
    indiceUltimo
  );

  totalPaginas = Math.ceil(
    itemsOrdenados.length / productosPorPagina
  );
}

  return (
    <div className="layout">

      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      <main
        className={`contenido ${
          sidebarAbierto ? "con-sidebar" : "sin-sidebar"
        }`}
      >

        {cargando && (
          <p className="estadoUO">
            Cargando última orden...
          </p>
        )}

        {error && (
          <p className="errorUO">
            ⚠ {error}
          </p>
        )}

        {ultimaOrden && (

          <div className="orden-contenedorUO">

            <div className="info-generalUO">

              <p>
                <strong>ID de Orden:</strong> {ultimaOrden.id}
              </p>

              <p>
               <strong>Proveedores:</strong>{" "}{ultimaOrden.proveedores?.join(", ")}
              </p>

              <p>
                <strong>Fecha:</strong> {ultimaOrden.fecha}
              </p>

            </div>

            <div className="tabla-contenedorNO" ref={tablaRef}>
            <table className="tabla-estandar">

              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Proveedor</th>
                  <th>Cantidad Pedida</th>
                </tr>
              </thead>

              <tbody>

                {productosPagina.length === 0 ? (
                  <tr>
                    <td colSpan="3">No hay productos</td>
                  </tr>
                ) : (

                  productosPagina.map((item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{item.proveedor_nombre}</td>
                      <td>{item.cantidad}</td>
                    </tr>
                  ))

                )}

              </tbody>

            </table>
            </div>

            {/* ⭐ PAGINACIÓN */}

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

          </div>

        )}

      </main>

    </div>
  );
}