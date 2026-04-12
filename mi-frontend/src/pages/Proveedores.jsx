import { useState, useEffect, useRef } from "react";
import "../styles/Proveedores.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

// ✔ IMPORT CORRECTO PARA TAURI 2
import { getCurrentWindow } from "@tauri-apps/api/window";
const API_URL = "http://127.0.0.1:8000/api";

export default function Proveedores() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    id: "",        // 👈 NUEVO
    nombre: "",
    telefono: "",
    email: "",
  });

  // 🔹 Modal agregar proveedor
  const [modalAgregar, setModalAgregar] = useState(false);

  // 🔹 Modal editar proveedor
  const [proveedorEditando, setProveedorEditando] = useState(null);

  // 🔹 PAGINACIÓN (DINÁMICA 🔥)
  const [proveedoresPorPagina, setProveedoresPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);

  // 🔥 REF PARA MEDIR
  const tablaRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/proveedores/`)
      .then((res) => res.json())
      .then((data) => {
        const proveedoresFormateados = data.map((p) => ({
          id: p.id,
          nombre: p.name,
          telefono: p.telephone,
          email: p.email,
        }));

        setProveedores(proveedoresFormateados);
      })
      .catch((err) => console.error("Error cargando proveedores:", err));
  }, []);

  // 🔥 CALCULAR FILAS AUTOMÁTICAMENTE
useEffect(() => {
  const calcularFilas = () => {
    if (!tablaRef.current) return;

    const alturaPantalla = window.innerHeight;
    const espacioExtra = 300;

    let alturaFila = 50;

    const fila = tablaRef.current.querySelector("tbody tr");
    if (fila) {
      alturaFila = fila.offsetHeight;
    }

    const filas = Math.floor((alturaPantalla - espacioExtra) / alturaFila);
    setProveedoresPorPagina(filas > 3 ? filas +1 : 3);
  };

  calcularFilas();

  window.addEventListener("resize", calcularFilas);
  return () => window.removeEventListener("resize", calcularFilas);
}, [proveedores]); // 🔥 AQUÍ

  // ================== SIDEBAR ==================
  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // 🔹 CÁLCULOS DE PAGINACIÓN
  const indiceUltimo = paginaActual * proveedoresPorPagina;
  const indicePrimero = indiceUltimo - proveedoresPorPagina;

  const proveedoresPagina = proveedores.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(
    proveedores.length / proveedoresPorPagina
  );

  // Agregar proveedor
  const agregarProveedor = async () => {
    if (!nuevoProveedor.nombre.trim()) return;

    try {
      const res = await fetch(`${API_URL}/proveedores/crear/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProveedor),
      });

      const data = await res.json();

      const nuevo = {
        id: data.id,
        nombre: data.name,
        telefono: data.telephone,
        email: data.email,
      };

      setProveedores([...proveedores, nuevo]);
      setPaginaActual(1);

      setNuevoProveedor({
        nombre: "",
        telefono: "",
        email: "",
      });

      setModalAgregar(false);

    } catch (error) {
      console.error("Error creando proveedor:", error);
    }
  };

  // Eliminar proveedor
  const eliminarProveedor = async (id) => {
    try {
      await fetch(`${API_URL}/proveedores/${id}/`, {
        method: "DELETE",
      });
      setProveedores(proveedores.filter((p) => p.id !== id));
      setPaginaActual(1);
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
    }
  };

  // Guardar cambios
  const guardarEdicion = async () => {
    try {
      await fetch(`${API_URL}/proveedores/${proveedorEditando.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: proveedorEditando.nombre,
          telefono: proveedorEditando.telefono,
          email: proveedorEditando.email,
        }),
      });

      const res = await fetch(`${API_URL}/proveedores/`);
      const data = await res.json();

      const formateados = data.map((p) => ({
        id: p.id,
        nombre: p.name,
        telefono: p.telephone,
        email: p.email,
      }));

      setProveedores(formateados);
      setProveedorEditando(null);

    } catch (error) {
      console.error("Error editando:", error);
    }
  };

  return (
    <div className="layout">
      <Sidebar sidebarAbierto={sidebarAbierto} toggleSidebar={toggleSidebar} />

      <div className="contenido">

        <button className="btn-agregar" onClick={() => setModalAgregar(true)}>
          ➕ Agregar proveedor
        </button>

        {/* TABLA */}
        <div className="tabla-contenedorNO" ref={tablaRef}>
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresPagina.map((prov) => (
                <tr key={prov.id}>
                  <td>{prov.nombre}</td>
                  <td>{prov.telefono}</td>
                  <td>{prov.email}</td>
                  <td className="acciones">
                    <div className="acciones-contenido">
                      <button
                        className="bton-acciones"
                        onClick={() => setProveedorEditando({ ...prov })}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        className="bton-acciones"
                        onClick={() => eliminarProveedor(prov.id)}
                      >
                        ❌ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
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

        {/* MODALES (sin cambios) */}
        {modalAgregar && (
          <div className="modal-overlay" onClick={() => setModalAgregar(false)}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <h2>Agregar proveedor</h2>

              <p className="modalp"><strong>Nombre:</strong></p>
              <input type="text" value={nuevoProveedor.nombre}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })} />

              <p className="modalp"><strong>Teléfono:</strong></p>
              <input type="text" value={nuevoProveedor.telefono}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })} />

              <p className="modalp"><strong>Email</strong></p>
              <input type="text" value={nuevoProveedor.email}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })} />
              <p className="modalp"><strong>ID:</strong></p>
              <input type="text" value={nuevoProveedor.id}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, id: e.target.value })} />

              <div className="modal-buttonsNO">
                <button className="btn-guardar" onClick={agregarProveedor}>💾 Agregar</button>
                <button className="btn-cerrar" onClick={() => setModalAgregar(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {proveedorEditando && (
          <div
            className="modal-overlay"
            onClick={() => setProveedorEditando(null)}
          >
            <div
              className="modal-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Editar proveedor</h2>

              <p className="modalp"><strong>Nombre:</strong></p>
              <input
                type="text"
                value={proveedorEditando.nombre}
                onChange={(e) =>
                  setProveedorEditando({
                    ...proveedorEditando,
                    nombre: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Teléfono:</strong></p>
              <input
                type="text"
                value={proveedorEditando.telefono}
                onChange={(e) =>
                  setProveedorEditando({
                    ...proveedorEditando,
                    telefono: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Email:</strong></p>
              <input
                type="text"
                value={proveedorEditando.email}
                onChange={(e) =>
                  setProveedorEditando({
                    ...proveedorEditando,
                    email: e.target.value,
                  })
                }
              />
                <p className="modalp"><strong>ID:</strong></p>  
              <input
                type="text"
                value={proveedorEditando.id}
                onChange={(e) =>
                  setProveedorEditando({
                    ...proveedorEditando,
                    id: e.target.value,
                  })
                }
              />
              {/* 🔥 CLASE CORRECTA */}
              <div className="modal-botones">
                <button className="btn-guardar" onClick={guardarEdicion}>
                  💾 Guardar cambios
                </button>

                <button
                  className="btn-cerrar"
                  onClick={() => setProveedorEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}