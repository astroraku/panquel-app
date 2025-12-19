import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/Productos.css";

// 🔹 URL DEL BACKEND DJANGO (FUTURO)
const API_URL = "http://127.0.0.1:8000/api";

export default function Producto() {
  const navigate = useNavigate();

  // ================== PRODUCTOS MOCK (TEMPORAL) ==================
  const productosIniciales = [
    {
      id: 1,
      nombre: "Manzana",
      stock: 20,
      descripcion: "Fruta fresca roja",
      tipoStock: "unidad",
      fechaAgregado: "2025-10-10",
      vidaUtil: "7 días",
      proveedor: "Frutas del Valle",
      sugerenciaPedido: 15,
      pedidoPendiente: 0,
    },
    {
      id: 2,
      nombre: "Pan Bimbo",
      stock: 12,
      descripcion: "Pan blanco para sándwich",
      tipoStock: "unidad",
      fechaAgregado: "2025-10-15",
      vidaUtil: "10 días",
      proveedor: "Bimbo México",
      sugerenciaPedido: 8,
      pedidoPendiente: 0,
    },
  ];

  // ================== STATES ==================
  const [productos, setProductos] = useState(productosIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarPedir, setMostrarPedir] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadPedir, setCantidadPedir] = useState(0);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipoStock: "unidad",
    vidaUtil: "",
    proveedor: "",
    sugerenciaPedido: "",
    stock: 0,
  });

  // ================== SIDEBAR ==================
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  // ================== FUTURO: CARGAR PRODUCTOS DESDE DJANGO ==================
  /*
  useEffect(() => {
    async function cargarProductos() {
      try {
        const response = await fetch(`${API_URL}/productos/`);
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    }

    cargarProductos();
  }, []);
  */

  // ================== MODALES ==================
  const abrirModalNuevo = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipoStock: "unidad",
      vidaUtil: "",
      proveedor: "",
      sugerenciaPedido: "",
      stock: 0,
    });
    setProductoSeleccionado(null);
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setFormData(producto);
    setProductoSeleccionado(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const abrirModalPedir = (producto) => {
    setProductoSeleccionado(producto);
    setCantidadPedir(1);
    setMostrarPedir(true);
  };

  const cerrarModal = () => setMostrarModal(false);
  const cerrarPedir = () => setMostrarPedir(false);

  // ================== GUARDAR PRODUCTO ==================
  const guardarProducto = (e) => {
    e.preventDefault();

    // 🔹 FUTURO DJANGO
    /*
    if (modoEdicion) {
      await fetch(`${API_URL}/productos/${productoSeleccionado.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch(`${API_URL}/productos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    */

    // 🔹 MOCK ACTUAL
    if (modoEdicion) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoSeleccionado.id ? { ...formData } : p
        )
      );
    } else {
      setProductos((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
          fechaAgregado: new Date().toISOString().slice(0, 10),
          pedidoPendiente: 0,
        },
      ]);
    }

    setMostrarModal(false);
  };

  // ================== CONFIRMAR LLEGADA ==================
  const confirmarLlegada = (producto) => {
    // 🔹 FUTURO DJANGO
    /*
    fetch(`${API_URL}/productos/${producto.id}/confirmar-llegada/`, {
      method: "POST",
    });
    */

    setProductos((prev) =>
      prev.map((p) =>
        p.id === producto.id
          ? { ...p, stock: p.stock + p.pedidoPendiente, pedidoPendiente: 0 }
          : p
      )
    );
  };

  // ================== RENDER ==================
  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      <div className="contenido">
        <h1 className="titulo">Pantalla de Productos</h1>

        <button className="boton-agregar" onClick={abrirModalNuevo}>
          ➕ Agregar Producto
        </button>

        <div className="productos-lista">
          {productos.map((producto) => (
            <div key={producto.id} className="producto-fila">
              {/* TARJETA 1 */}
              <div className="tarjeta info-basica">
                <h2>{producto.nombre}</h2>
                <p><strong>Descripción:</strong> {producto.descripcion}</p>
                <p>
                  <strong>Stock actual:</strong> {producto.stock}{" "}
                  {producto.tipoStock === "unidad"
                    ? "unidades"
                    : producto.tipoStock === "peso"
                    ? "kg"
                    : "litros"}
                </p>

                {producto.pedidoPendiente > 0 && (
                  <button
                    className="boton-confirmar"
                    onClick={() => confirmarLlegada(producto)}
                  >
                    ✔ Confirmar llegada ({producto.pedidoPendiente})
                  </button>
                )}
              </div>

              {/* TARJETA 2 */}
              <div className="tarjeta info-adicional">
                <p><strong>Fecha agregado:</strong> {producto.fechaAgregado}</p>
                <p><strong>Vida útil:</strong> {producto.vidaUtil}</p>
                <p><strong>Proveedor:</strong> {producto.proveedor}</p>
              </div>

              {/* TARJETA 3 */}
              <div className="tarjeta acciones">
                <p>
                  <strong>Tipo de stock:</strong>{" "}
                  {producto.tipoStock === "unidad"
                    ? "Por unidad"
                    : producto.tipoStock === "peso"
                    ? "Por peso"
                    : "Por litros"}
                </p>

                <p>
                  <strong>Sugerencia pedido:</strong>{" "}
                  {producto.sugerenciaPedido}
                </p>

                <div className="botones-acciones">
                  <button
                    className="boton-pedir"
                    onClick={() => abrirModalPedir(producto)}
                  >
                    📦 Pedir más
                  </button>

                  <button
                    className="boton-modificar"
                    onClick={() => abrirModalEditar(producto)}
                  >
                    ✏️ Modificar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================== MODAL PEDIR ================== */}
        {mostrarPedir && productoSeleccionado && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h2>Pedir más de {productoSeleccionado.nombre}</h2>

              <label>Cantidad a pedir:</label>
              <input
                type="number"
                min="1"
                value={cantidadPedir}
                onChange={(e) =>
                  setCantidadPedir(Math.max(1, Number(e.target.value)))
                }
              />

              <div className="modal-botones">
                <button
                  className="boton-guardar"
                  onClick={() => {
                    setProductos((prev) =>
                      prev.map((p) =>
                        p.id === productoSeleccionado.id
                          ? { ...p, pedidoPendiente: cantidadPedir }
                          : p
                      )
                    );
                    cerrarPedir();
                  }}
                >
                  Registrar pedido
                </button>

                <button className="boton-cancelar" onClick={cerrarPedir}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================== MODAL NUEVO / EDITAR ================== */}
        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-contenido">
              <h2>
                {modoEdicion ? "Editar producto" : "Agregar nuevo producto"}
              </h2>

              <form onSubmit={guardarProducto}>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />

                <label>Descripción:</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                />

                <label>Tipo de stock:</label>
                <select
                  value={formData.tipoStock}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoStock: e.target.value })
                  }
                >
                  <option value="unidad">Por unidad</option>
                  <option value="peso">Por peso</option>
                  <option value="litros">Por litros</option>
                </select>

                <label>Vida útil:</label>
                <input
                  type="text"
                  value={formData.vidaUtil}
                  onChange={(e) =>
                    setFormData({ ...formData, vidaUtil: e.target.value })
                  }
                />

                <label>Proveedor:</label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) =>
                    setFormData({ ...formData, proveedor: e.target.value })
                  }
                />

                <label>Sugerencia de pedido:</label>
                <input
                  type="number"
                  value={formData.sugerenciaPedido}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sugerenciaPedido: Number(e.target.value),
                    })
                  }
                />

                <label>Stock:</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: Number(e.target.value),
                    })
                  }
                />

                <div className="modal-botones">
                  <button type="submit" className="boton-guardar">
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="boton-cancelar"
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
