import { useState } from "react";
import "../styles/AdminPerfiles.css";
import Sidebar from "./Sidebar";

export default function AdminPerfiles() {
  // --- SIDEBAR STATE ---
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // 🔹 Usuario logueado (temporal)
  const usuarioActual = "admin";

  // 🔹 Datos temporales
  const [usuarios, setUsuarios] = useState([
    { id: 1, username: "admin", rol: "admin" },
    { id: 2, username: "usuario1", rol: "usuario" },
    { id: 3, username: "empleado", rol: "usuario" },
  ]);

  // 🔹 MODALES
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    rol: "usuario",
  });

  // ================= ACCIONES =================

  const crearUsuario = () => {
    if (!nuevoUsuario.username || !nuevoUsuario.password) return;

    setUsuarios([
      ...usuarios,
      {
        id: usuarios.length + 1,
        username: nuevoUsuario.username,
        rol: nuevoUsuario.rol,
      },
    ]);

    setNuevoUsuario({ username: "", password: "", rol: "usuario" });
    setModalCrear(false);
  };

  const hacerAdmin = (id) => {
    setUsuarios(
      usuarios.map((u) =>
        u.id === id ? { ...u, rol: "admin" } : u
      )
    );
  };

  const bajarAdmin = (id) => {
    setUsuarios(
      usuarios.map((u) =>
        u.id === id ? { ...u, rol: "usuario" } : u
      )
    );
  };

  const confirmarEliminar = () => {
    setUsuarios(
      usuarios.filter((u) => u.id !== modalEliminar.id)
    );
    setModalEliminar(null);
  };

  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">
        <h1 className="admin-title">Administrar perfiles</h1>

        {/* ➕ CREAR USUARIO */}
        <button className="btn-agregar" onClick={() => setModalCrear(true)}>
          ➕ Crear usuario
        </button>

        {/* TABLA */}
        <div className="tabla-contenedorNO">
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    {user.rol === "admin" ? "Administrador" : "Usuario"}
                  </td>

                  <td className="acciones">
                    <div className="acciones-contenido">

                    {/* HACER / BAJAR ADMIN */}
                    {user.rol !== "admin" && (
                      <button
                        className="bton-acciones"
                        onClick={() => hacerAdmin(user.id)}
                      >
                        👑 Admin
                      </button>
                    )}

                    {user.rol === "admin" &&
                      user.username !== usuarioActual && (
                        <button
                          className="bton-acciones"
                          onClick={() => bajarAdmin(user.id)}
                        >
                          🔽 Quitar admin
                        </button>
                      )}

                    {/* ELIMINAR */}
                    
                    
                    
                    
                    
                    
                    <button
                      className="bton-acciones"
                      onClick={() =>
                        setModalEliminar(user)
                      }
                      disabled={user.username === usuarioActual}
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

        {/* 🟢 MODAL CREAR */}
        {modalCrear && (
          <div className="modal-overlay" onClick={() => setModalCrear(false)}>
            <div
              className="modal-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Crear usuario</h2>

              <p className="modalp"><strong>Usuario:</strong></p>
              <input
                type="text"
                value={nuevoUsuario.username}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    username: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Contraseña:</strong></p>
              <input
                type="password"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    password: e.target.value,
                  })
                }
              />

              <p className="modalp"><strong>Rol:</strong></p>
              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    rol: e.target.value,
                  })
                }
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>

              <div className="modal-buttonsNO">
                <button className="btn-guardar" onClick={crearUsuario}>
                  💾 Crear
                </button>

                <button
                  className="btn-cerrar"
                  onClick={() => setModalCrear(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔴 MODAL CONFIRMAR ELIMINAR */}
        {modalEliminar && (
          <div
            className="modal-overlay"
            onClick={() => setModalEliminar(null)}
          >
            <div
              className="modalNO"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>¿Eliminar usuario?</h3>
              <p className="pNO">
                ¿Seguro que deseas eliminar a{" "}
                <strong>{modalEliminar.username}</strong>?
              </p>

              <div className="modal-buttonsNO">
                <button
                  className="btn-cancelarNO"
                  onClick={() => setModalEliminar(null)}
                >
                  Cancelar
                </button>

                <button
                  className="btn-confirmarNO"
                  onClick={confirmarEliminar}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
