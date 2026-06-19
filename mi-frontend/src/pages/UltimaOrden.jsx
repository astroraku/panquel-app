import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/UltimaOrden.css";
import { generarPDFDesdeDatos } from "../utils/pdf";
import {
  FiEdit2,
  FiSave,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const API_URL = "http://127.0.0.1:8000/api";

export default function UltimaOrden() {

  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  const [ultimaOrden, setUltimaOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const rol = localStorage.getItem("rol");
  const esAdmin = rol === "admin";
  const [productosPorPagina, setProductosPorPagina] = useState(5);
  const tablaRef = useRef(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarAvisoPDF, setMostrarAvisoPDF] = useState(false);
  const [mostrarModalGuardado, setMostrarModalGuardado] = useState(false);

  const [mensajeModal, setMensajeModal] = useState("");

  const [guardandoCambios, setGuardandoCambios] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [itemsEditados, setItemsEditados] = useState([]);

  async function fetchUltimaOrden() {
    try {

      const res = await fetch(`${API_URL}/ultima-orden/`);

      if (!res.ok) {
        throw new Error("Error al obtener la última orden");
      }

      const data = await res.json();

      setUltimaOrden(data);
      setItemsEditados(data.items || []);

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

  // 🔥 MOVER AFUERA
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

  if (ultimaOrden?.items) {

    const itemsOrdenados = [...ultimaOrden.items].sort((a, b) =>
      a.proveedor_id.localeCompare(b.proveedor)
    );

    productosPagina = itemsOrdenados.slice(
      indicePrimero,
      indiceUltimo
    );

    totalPaginas = Math.ceil(
      itemsOrdenados.length / productosPorPagina
    );
  }

  async function guardarCambios() {

    // 🔥 evitar spam
    if (guardandoCambios) return;

    try {

      setGuardandoCambios(true);

      const res = await fetch(
        `${API_URL}/ultima-orden/editar/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fecha: ultimaOrden.fecha,
            productos: itemsEditados
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error");
      }

      setUltimaOrden({
        ...ultimaOrden,
        items: itemsEditados
      });

      setModoEdicion(false);


      setMensajeModal("✔ Orden actualizada correctamente");
      setMostrarModalGuardado(true);

      setTimeout(() => {
        setMostrarModalGuardado(false);
      }, 2200);

    } catch (error) {

      console.error(error);

      setMensajeModal("❌ Error guardando cambios");
      setMostrarModalGuardado(true);

      setTimeout(() => {
        setMostrarModalGuardado(false);
      }, 2200);

    } finally {

      setGuardandoCambios(false);

    }
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

              <div className="acciones-ultima-orden">

                {/* EDITAR SOLO ADMIN */}
                {esAdmin && (

                  !modoEdicion ? (

                    <button
                      className="btn-icono"
                      onClick={() => setModoEdicion(true)}
                    >
                      <FiEdit2 size={50} />
                    </button>

                  ) : (

                    <button
                      className="btn-icono"
                      onClick={guardarCambios}
                      disabled={guardandoCambios}
                      style={
                        guardandoCambios
                          ? {
                              opacity: 0.5,
                              cursor: "not-allowed"
                            }
                          : {}
                      }
                    >
                      {guardandoCambios ? "..." : <FiSave size={18} />}
                    </button>

                  )

                )}
                {/* PDF */}
                <button
                  className="btn-icono"
                  onClick={() => {

                    generarPDFDesdeDatos({
                      proveedor: ultimaOrden.proveedores,
                      fecha: ultimaOrden.fecha,
                      productos: ultimaOrden.items
                    });

                    setMostrarAvisoPDF(true);

                    setTimeout(() => {
                      setMostrarAvisoPDF(false);
                    }, 2500);

                  }}
                >
                  <FiDownload size={18} />
                </button>

              </div>



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

                  (modoEdicion
                    ? itemsEditados.slice(
                        indicePrimero,
                        indiceUltimo
                      )
                    : productosPagina
                  ).map((item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{item.proveedor_nombre}</td>
                      <td>

                        {modoEdicion ? (

                          <input
                            type="number"
                            min="0"
                            value={item.cantidad}
                            onChange={(e) => {

                              const nuevos = [...itemsEditados];

                              const indiceReal =
                                (paginaActual - 1) * productosPorPagina + i;

                              nuevos[indiceReal].cantidad =
                                Number(e.target.value);

                              setItemsEditados(nuevos);
                            }}
                            style={{
                              width: "70px"
                            }}
                          />

                        ) : (

                          item.cantidad

                        )}

                      </td>
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
                  <FiChevronLeft className="icono-btn" />
                  Anterior
                </button>

                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>

                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(paginaActual + 1)}
                >
                  Siguiente
                  <FiChevronRight className="icono-btn" />
                </button>

              </div>

            )}

          </div>

        )}
        {mostrarAvisoPDF && (
          <div className="avisoNO">
            <p>✔ PDF descargado correctamente</p>
          </div>
        )}
        {mostrarModalGuardado && (
          <div className="avisoNO">
            <p>{mensajeModal}</p>
          </div>
        )}
      </main>

    </div>
  );
}