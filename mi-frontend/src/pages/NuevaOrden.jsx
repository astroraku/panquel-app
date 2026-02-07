import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/NuevaOrden.css";

// 📄 PDF
import jsPDF from "jspdf";

// 🔗 URL BACKEND (LISTA PARA DJANGO)
const API_URL = "http://127.0.0.1:8000/api";

export default function NuevaOrden() {
  const navigate = useNavigate();

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [ordenIniciada, setOrdenIniciada] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  const [proveedor, setProveedor] = useState("");

  // 🔎 BUSCADOR
  const [busqueda, setBusqueda] = useState("");

  // 🔹 PRODUCTOS (MOCK)
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Manzana", proveedor: "Frutas SA", cantidad: 0 },
    { id: 2, nombre: "Pan Bimbo", proveedor: "Panificados MX", cantidad: 0 },
    { id: 3, nombre: "Refresco Cola", proveedor: "Bebidas del Norte", cantidad: 0 },
    { id: 4, nombre: "Leche", proveedor: "Lala", cantidad: 0 },
    { id: 5, nombre: "Galletas", proveedor: "Gamesa", cantidad: 0 },
    { id: 6, nombre: "Aceite", proveedor: "Nutrioli", cantidad: 0 },
    { id: 7, nombre: "Azúcar", proveedor: "Zulka", cantidad: 0 },
    { id: 8, nombre: "Sal", proveedor: "La Fina", cantidad: 0 },
    { id: 9, nombre: "Arroz", proveedor: "Verde Valle", cantidad: 0 },
    { id: 10, nombre: "Frijol", proveedor: "Isadora", cantidad: 0 },
    { id: 11, nombre: "Café", proveedor: "Nescafé", cantidad: 0 },
  ]);

  // 🔹 PRODUCTOS FILTRADOS
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  /* ---------------- PAGINACIÓN ---------------- */
  const productosPorPagina = 10;
  const [paginaActual, setPaginaActual] = useState(1);

  /* ---------------- SINCRONIZAR FILTRADOS ---------------- */
  useEffect(() => {
    setProductosFiltrados(productos);
  }, [productos]);

  /* ---------------- FILTRO BUSCADOR ---------------- */
  useEffect(() => {
    const texto = busqueda.toLowerCase();

    const filtrados = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.proveedor.toLowerCase().includes(texto)
    );

    setProductosFiltrados(filtrados);
    setPaginaActual(1); // 🔁 volver a página 1 al buscar
  }, [busqueda, productos]);

  /* ---------------- CÁLCULOS PAGINACIÓN ---------------- */
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

  const productosPagina = productosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  /* ---------------- FUNCIONES UI ---------------- */

  function handleGenerarOrden() {
    setOrdenIniciada(true);
  }

  function handleFinalizar() {
    setMostrarModal(true);
  }

  function cancelarFinalizar() {
    setMostrarModal(false);
  }

  function guardarOrden() {
    console.log("Orden guardada (mock)");
  }

  function resetearOrdenIA() {
    setProductos(productos.map((p) => ({ ...p, cantidad: 0 })));
  }

  /* ---------------- PDF ---------------- */

  function generarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Orden de Compra", 14, 20);

    doc.setFontSize(12);
    doc.text(`Proveedor: ${proveedor || "No especificado"}`, 14, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 43);

    let y = 60;

    doc.text("Productos:", 14, y);
    y += 8;

    productos
      .filter((p) => p.cantidad > 0)
      .forEach((p) => {
        doc.text(`• ${p.nombre} - Cantidad: ${p.cantidad}`, 16, y);
        y += 8;
      });

    doc.save("orden_compra.pdf");
  }

  function confirmarFinalizar() {
    generarPDF();
    setOrdenIniciada(false);
    setMostrarModal(false);
    setMostrarAviso(true);
    setTimeout(() => setMostrarAviso(false), 2500);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="layout">
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      <main className={`contenido ${sidebarAbierto ? "con-sidebar" : "sin-sidebar"}`}>
        <div className="barra-superiorNO">
          <input
            type="text"
            placeholder="Buscar producto o proveedor"
            className="input-proveedorNO"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {!ordenIniciada && (
            <button className="btn-normalNO" onClick={handleGenerarOrden}>
              Generar Orden
            </button>
          )}

          {ordenIniciada && (
            <>
              <button className="btn-normalNO" onClick={guardarOrden}>
                Guardar
              </button>
              <button className="btn-normalNO" onClick={resetearOrdenIA}>
                Resetear Orden IA
              </button>
              <button className="btn-normalNO" onClick={handleFinalizar}>
                Finalizar
              </button>
            </>
          )}
        </div>

        {/* ---- TABLA ---- */}
        <div className="tabla-contenedorNO">
          <table className="tabla-ordenNO">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productosPagina.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.proveedor}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="input-tablaNO"
                      value={p.cantidad}
                      onChange={(e) => {
                        const valor = Number(e.target.value);
                        const cantidadSegura = isNaN(valor) ? 0 : Math.max(0, valor);

                        setProductos(
                          productos.map((prod) =>
                            prod.id === p.id
                              ? { ...prod, cantidad: cantidadSegura }
                              : prod
                          )
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 PAGINACIÓN */}
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
      </main>

      {/* ---- MODAL ---- */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Finalizar la orden?</h3>
            <p className="pNO">Se generará un PDF con esta orden.</p>

            <div className="modal-buttonsNO">
              <button className="btn-normalNO" onClick={cancelarFinalizar}>
                Cancelar
              </button>
              <button className="btn-normalNO" onClick={confirmarFinalizar}>
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarAviso && (
        <div className="avisoNO">
          <p>✔ Orden Finalizada y PDF generado</p>
        </div>
      )}
    </div>
  );
}
