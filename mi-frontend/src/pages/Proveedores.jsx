import { useState, useEffect } from "react";
import "../styles/Proveedores.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

// ✔ IMPORT CORRECTO PARA TAURI 2
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Proveedores() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    telefono: "",
    productos: 0,
  });

  // 🔹 Modal agregar proveedor
  const [modalAgregar, setModalAgregar] = useState(false);

  // 🔹 Modal editar proveedor
  const [proveedorEditando, setProveedorEditando] = useState(null);

  // 🔹 PAGINACIÓN
  const proveedoresPorPagina = 5;
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    // Datos temporales
    setProveedores([
      { id: 1, nombre: "Coca Cola", telefono: "3312345678", productos: 12 },
      { id: 2, nombre: "Sabritas", telefono: "3322334455", productos: 7 },
      { id: 3, nombre: "Bimbo", telefono: "3311223344", productos: 15 },
      { id: 4, nombre: "Pepsi", telefono: "3399887766", productos: 10 },
      { id: 5, nombre: "Lala", telefono: "3311112222", productos: 6 },
      { id: 6, nombre: "Gamesa", telefono: "3377778888", productos: 9 },
    ]);
  }, []);

  // --- SIDEBAR STATE ---
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
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
  const agregarProveedor = () => {
    if (!nuevoProveedor.nombre.trim()) return;

    const nuevo = {
      id: proveedores.length + 1,
      ...nuevoProveedor,
    };

    setProveedores([...proveedores, nuevo]);
    setPaginaActual(1); // 🔹 volver a la primera página

    setNuevoProveedor({
      nombre: "",
      telefono: "",
      productos: 0,
    });

    setModalAgregar(false);
  };

  // Eliminar proveedor
  const eliminarProveedor = (id) => {
    setProveedores(proveedores.filter((p) => p.id !== id));
    setPaginaActual(1);
  };

  // Guardar cambios del proveedor editado
  const guardarEdicion = () => {
    setProveedores(
      proveedores.map((p) =>
        p.id === proveedorEditando.id ? proveedorEditando : p
      )
    );
    setProveedorEditando(null);
  };

  return (
    <div className="layout">
      <Sidebar sidebarAbierto={sidebarAbierto} toggleSidebar={toggleSidebar} />

      <div className="contenido">
        

        <button className="btn-agregar" onClick={() => setModalAgregar(true)}>
          ➕ Agregar proveedor
        </button>

        {/* TABLA */}
        <div className="tabla-contenedorNO">
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Teléfono</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresPagina.map((prov) => (
                <tr key={prov.id}>
                  <td>{prov.nombre}</td>
                  <td>{prov.telefono}</td>
                  <td>{prov.productos}</td>
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

        {/* 🔹 CONTROLES DE PAGINACIÓN */}
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

        {/* 🟢 MODAL AGREGAR */}
        {modalAgregar && (
          <div className="modal-overlay" onClick={() => setModalAgregar(false)}>
            <div
              className="modal-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Agregar proveedor</h2>

              <p className="modalp"><strong>Nombre:</strong></p>
              <input
                type="text"
                value={nuevoProveedor.nombre}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    nombre: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Teléfono:</strong></p>
              <input
                type="text"
                value={nuevoProveedor.telefono}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    telefono: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Cantidad de productos:</strong></p>
              <input
                type="number"
                value={nuevoProveedor.productos}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    productos: Number(e.target.value),
                  })
                }
              />

              <div className="modal-buttonsNO">
                <button className="btn-guardar" onClick={agregarProveedor}>
                  💾 Agregar
                </button>

                <button
                  className="btn-cerrar"
                  onClick={() => setModalAgregar(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔵 MODAL EDITAR */}
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

              <p className="modalp"><strong>Cantidad de productos:</strong></p>
              <input
                type="number"
                value={proveedorEditando.productos}
                onChange={(e) =>
                  setProveedorEditando({
                    ...proveedorEditando,
                    productos: Number(e.target.value),
                  })
                }
              />

              <div className="modal-buttonsNO">
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
