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

  // Estado del proveedor que se está editando
  const [proveedorEditando, setProveedorEditando] = useState(null);

  useEffect(() => {
    async function cargarProveedores() {
      try {
        const res = await fetch("http://localhost:8000/api/proveedores/");
        const data = await res.json();
        setProveedores(data);
      } catch (err) {
        console.error("Error cargando proveedores:", err);
      }
    }

    // cargarProveedores();

    // Datos temporales
    setProveedores([
      { id: 1, nombre: "Coca Cola", telefono: "3312345678", productos: 12 },
      { id: 2, nombre: "Sabritas", telefono: "3322334455", productos: 7 },
      { id: 3, nombre: "Bimbo", telefono: "3311223344", productos: 15 },
    ]);
  }, []);

  // --- SIDEBAR STATE ---
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // Agregar proveedor
  const agregarProveedor = () => {
    if (!nuevoProveedor.nombre.trim()) return;

    const nuevo = {
      id: proveedores.length + 1,
      ...nuevoProveedor,
    };

    setProveedores([...proveedores, nuevo]);

    setNuevoProveedor({
      nombre: "",
      telefono: "",
      productos: 0,
    });
  };

  // Eliminar proveedor
  const eliminarProveedor = (id) => {
    setProveedores(proveedores.filter((p) => p.id !== id));
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
        <h1 className="titulo">Proveedores</h1>

        {/* Formulario para agregar proveedor */}
        <div className="form-proveedor">
          <input
            type="text"
            placeholder="Nombre del proveedor"
            value={nuevoProveedor.nombre}
            onChange={(e) =>
              setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={nuevoProveedor.telefono}
            onChange={(e) =>
              setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Cantidad de productos"
            value={nuevoProveedor.productos}
            onChange={(e) =>
              setNuevoProveedor({
                ...nuevoProveedor,
                productos: Number(e.target.value),
              })
            }
          />

          <button className="btn-agregar" onClick={agregarProveedor}>
            ➕ Agregar proveedor
          </button>
        </div>

        {/* TABLA */}
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
            {proveedores.map((prov) => (
              <tr key={prov.id}>
                <td>{prov.nombre}</td>
                <td>{prov.telefono}</td>
                <td>{prov.productos}</td>
                <td className="acciones">
                  <button
                    className="btn-editar"
                    onClick={() => setProveedorEditando({ ...prov })}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarProveedor(prov.id)}
                  >
                    ❌ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL EDITAR */}
        {proveedorEditando && (
          <div className="modal-overlay" onClick={() => setProveedorEditando(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Editar proveedor</h2>

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

              <div className="modal-buttons">
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
