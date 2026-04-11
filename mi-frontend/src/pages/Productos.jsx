import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/Productos.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function Producto() {
  const navigate = useNavigate();

  const productosIniciales = [];

  const [productos, setProductos] = useState(productosIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  // ================= CARGAR PRODUCTOS (CORREGIDO) =================
  async function cargarProductos() {
    try {
      const response = await fetch(`${API_URL}/producto/`);
      const data = await response.json();

      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  }

async function cargarProveedores() {
  try {
    const response = await fetch(`${API_URL}/proveedores/`);
    const data = await response.json();
    setProveedores(data);
  } catch (error) {
    console.error("Error cargando proveedores:", error);
  }
}

  useEffect(() => {
    cargarProductos();
    cargarProveedores(); // 👈 FALTABA ESTO
  }, []);

  // 🔎 BUSCADOR
  const [busqueda, setBusqueda] = useState("");

  // 🔢 PAGINACIÓN
  const [productosPorPagina, setProductosPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const tablaRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: "",
    tipoStock: "unidad",
    proveedor_id: ""
  });

  // ================= SIDEBAR =================
  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // ================== BACKEND ==================

  async function eliminarProductoBackend(id) {
    try {
      await fetch(`${API_URL}/producto/${id}/`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error eliminando producto:", error);
    }
  }

  // ================= FILTRADO (BUSCADOR) =================
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase();

    return (
      (producto.nombre || "").toLowerCase().includes(texto) ||
      (producto.proveedor_nombre || "").toLowerCase().includes(texto)
    );
  });

  // Reiniciar página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // ================= PAGINACIÓN =================
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

  const productosPagina = productosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  // ================= MODALES =================
  const abrirModalNuevo = () => {
    setFormData({
      nombre: "",
      tipoStock: "unidad",
      proveedor_id: "",
    });
    setProductoSeleccionado(null);
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setFormData({...producto,proveedor_id: producto.proveedor_id});
    setProductoSeleccionado(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const abrirModalEliminar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarEliminar(true);
  };

  const cerrarModal = () => setMostrarModal(false);

  const cerrarEliminar = () => {
    setMostrarEliminar(false);
    setProductoSeleccionado(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        // ✏️ EDITAR
        await fetch(`${API_URL}/producto/${productoSeleccionado.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

      } else {
        // ➕ CREAR
        await fetch(`${API_URL}/producto/crear/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      }

      await cargarProductos();
      setMostrarModal(false);

    } catch (error) {
      console.error("Error guardando producto:", error);
    }
  };

  const confirmarEliminar = async () => {
    if (!productoSeleccionado) return;

    try {
      await fetch(`${API_URL}/producto/${productoSeleccionado.id}/`, {
        method: "DELETE"
      });

      await cargarProductos();
      setMostrarEliminar(false);

    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

useEffect(() => {
  const calcularFilas = () => {
    if (!tablaRef.current) return;

    const contenedor = tablaRef.current;

    // 📏 posición real de la tabla
    const top = contenedor.getBoundingClientRect().top;

    // 📏 espacio disponible real
    const alturaDisponible = window.innerHeight - top - 20;

    // 🔥 ALTURA HEADER
    let alturaHeader = 0;
    const header = contenedor.querySelector("thead");
    if (header) {
      alturaHeader = header.offsetHeight;
    }

    // 🔥 ALTURA FILA
    let alturaFila = 50;
    const fila = contenedor.querySelector("tbody tr");
    if (fila) {
      alturaFila = fila.offsetHeight;
    }

    // 🔥 CALCULO REAL
    const filas = Math.floor(
      (alturaDisponible - alturaHeader) / alturaFila
    );

    // 🔥 AJUSTE DINÁMICO (anti scroll fantasma)
    const hayScroll =
      contenedor.scrollHeight > contenedor.clientHeight;

    setProductosPorPagina(
      filas > 3 ? (hayScroll ? filas -1 : filas) : 3
    );
  };

  calcularFilas();

  window.addEventListener("resize", calcularFilas);
  return () => window.removeEventListener("resize", calcularFilas);
}, [productos]);

  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">

        <div className="header-contenido">

          <input
            type="text"
            placeholder="Buscar producto o proveedor"
            id="buscadorr"
            className="input-buscador"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button className="btn-agregar" onClick={abrirModalNuevo}>
            ➕ Agregar Producto
          </button>
        </div>

        <div className="tabla-contenedor" ref={tablaRef}>
          <table className="tabla-proveedores">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Proveedor</th>
                <th>Prov. Alias</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosPagina.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.cantidad}</td>
                  <td>{producto.proveedor_nombre}</td>
                  <td>{producto.proveedor_id}</td>

                  <td className="acciones">
                    <div className="acciones-contenido">
                      <button
                        className="bton-acciones"
                        onClick={() => abrirModalEditar(producto)}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        className="bton-acciones eliminar"
                        onClick={() => abrirModalEliminar(producto)}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </td>
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

        {/* 🔴 MODAL ELIMINAR */}
        {mostrarEliminar && productoSeleccionado && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h2>Confirmar eliminación</h2>
              <p>
                ¿Estás seguro de eliminar el producto{" "}
                <strong>{productoSeleccionado.nombre}</strong>?
              </p>
              <div className="modal-botones">
                <button
                  className="boton-cancelar"
                  onClick={cerrarEliminar}
                >
                  Cancelar
                </button>
                <button
                  className="boton-eliminar"
                  onClick={confirmarEliminar}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔵 MODAL AGREGAR / EDITAR */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-contenido">

              <h2>{modoEdicion ? "Editar" : "Agregar"} producto</h2>

              <form onSubmit={guardarProducto}>

                <input
                  placeholder="Nombre"
                  id="modal"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />


                <input
                  type="number"
                  placeholder="Cantidad"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad: e.target.value
                    })
                  }
                />

                <select
                  value={formData.proveedor_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proveedor_id: e.target.value
                    })
                  }
                >
                  <option value="">Selecciona proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>

                <button type="submit">Guardar</button>
                <button type="button" onClick={cerrarModal}>
                  Cancelar
                </button>

              </form>
            </div>
          </div>
        )}

        {/* ELIMINAR (NO SE TOCA) */}
        {mostrarEliminar && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h2>¿Eliminar producto?</h2>

              <button onClick={confirmarEliminar}>Sí</button>
              <button onClick={() => setMostrarEliminar(false)}>No</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}