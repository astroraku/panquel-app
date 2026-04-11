import { useState, useEffect } from "react";
import "../styles/AdminPerfiles.css";
import Sidebar from "./Sidebar";

export default function AdminPerfiles() {

  // -------- SIDEBAR --------
  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // -------- USUARIO ACTUAL --------
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/usuario-actual/", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        console.log("Usuario actual:", data);

        setUsuarioActual(data.username);

      })
      .catch((err) => {
        console.error("Error al obtener usuario actual:", err);
      });

  }, []);

  // -------- USUARIOS DE LA BD --------
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/usuarios/", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Usuarios:", data);
        setUsuarios(data);
      })
      .catch(err => console.error(err));

  }, []);

  // -------- MODALES --------
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    rol: "usuario"
  });

  // -------- CREAR USUARIO --------
const crearUsuario = () => {

  if (!nuevoUsuario.username || !nuevoUsuario.password) return;

  fetch("http://127.0.0.1:8000/api/usuarios/crear/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nuevoUsuario)
  })
    .then(res => res.json())
    .then((data) => {

      // agregar el usuario nuevo al estado
      setUsuarios([...usuarios, data]);

      // cerrar modal
      setModalCrear(false);

      // limpiar formulario
      setNuevoUsuario({
        username: "",
        password: "",
        rol: "usuario"
      });

    })
    .catch(err => console.error(err));
};


  // -------- HACER ADMIN --------
  const hacerAdmin = (id) => {

    fetch(`http://127.0.0.1:8000/api/usuarios/admin/${id}/`, {
      method: "POST",
      credentials: "include"
    })
      .then(() => window.location.reload())
      .catch(err => console.error(err));
  };

  // -------- QUITAR ADMIN --------
  const bajarAdmin = (id) => {

    fetch(`http://127.0.0.1:8000/api/usuarios/quitar-admin/${id}/`, {
      method: "POST",
      credentials: "include"
    })
      .then(() => window.location.reload())
      .catch(err => console.error(err));
  };

  // -------- ELIMINAR --------
const confirmarEliminar = () => {

  if (!modalEliminar) return;

  fetch(`http://127.0.0.1:8000/api/usuarios/eliminar/${modalEliminar.id}/`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(() => {
      setModalEliminar(null);
        setUsuarios(usuarios.filter(u => u.id !== modalEliminar.id));
        setModalEliminar(null);
    })
    .catch(err => console.error(err));

};

  return (
    <div className="layout">

      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">
        <div className="header">
        <button
          className="btn-agregar"
          onClick={() => setModalCrear(true)}
        >
          ➕ Crear usuario
        </button>
        </div>
        {modalCrear && (

        <div
          className="modal-overlay"
          onClick={() => setModalCrear(false)}
        >

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
                  username: e.target.value
                })
              }
            />

            <p className="modalp"><strong>Contraseña:</strong></p>

            <input
              type="password"
              onChange={(e) =>
                setNuevoUsuario({
                  ...nuevoUsuario,
                  password: e.target.value
                })
              }
            />

            <p className="modalp"><strong>Rol:</strong></p>

            <select
              value={nuevoUsuario.rol}
              onChange={(e) =>
                setNuevoUsuario({
                  ...nuevoUsuario,
                  rol: e.target.value
                })
              }
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>

            <div className="modal-buttonsNO">

              <button
                className="btn-guardar"
                onClick={crearUsuario}
              >
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

        <div className="tabla-contenedorNO">

          <table className="tabla-estandar">

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
                    {user.rol === "admin"
                      ? "Administrador"
                      : "Usuario"}
                  </td>

                  <td className="acciones">

                    <div className="acciones-contenido">

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

                      <button
                        className="bton-acciones"
                        onClick={() => setModalEliminar(user)}
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

      </div>

      {/* MODAL CONFIRMAR ELIMINACIÓN */}

      {modalEliminar && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>Eliminar usuario</h3>

            <p>
              ¿Seguro que deseas eliminar a <b>{modalEliminar.username}</b>?
            </p>

            <div className="modal-botones">

              <button
                className="btn-cancelar"
                onClick={() => setModalEliminar(null)}
              >
                Cancelar
              </button>

              <button
                className="btn-eliminar"
                onClick={confirmarEliminar}
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}