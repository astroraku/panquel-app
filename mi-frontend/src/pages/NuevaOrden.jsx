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

  // 🔹 PRODUCTOS (MOCK POR AHORA)
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Manzana", proveedor: "Frutas SA", cantidad: 0 },
    { id: 2, nombre: "Pan Bimbo", proveedor: "Panificados MX", cantidad: 0 },
    { id: 3, nombre: "Refresco Cola", proveedor: "Bebidas del Norte", cantidad: 0 },
  ]);

  /* ======================================================
     🔗 FUTURO: CARGAR PRODUCTOS DESDE DJANGO
     ====================================================== */
  /*
  useEffect(() => {
    async function cargarProductos() {
      try {
        const res = await fetch(`${API_URL}/productos/`);
        const data = await res.json();
        setProductos(
          data.map(p => ({ ...p, cantidad: 0 }))
        );
      } catch (err) {
        console.error("Error cargando productos", err);
      }
    }
    cargarProductos();
  }, []);
  */

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

  /* ======================================================
     🔗 FUTURO: ENVIAR ORDEN A DJANGO
     ====================================================== */

  function confirmarFinalizar() {
    // 1️⃣ PDF
    generarPDF();

    // 2️⃣ BACKEND (LISTO PARA ACTIVAR)
    /*
    fetch(`${API_URL}/ordenes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proveedor,
        productos: productos.filter(p => p.cantidad > 0),
        fecha: new Date().toISOString(),
      }),
    });
    */

    // 3️⃣ UI
    setOrdenIniciada(false);
    setMostrarModal(false);
    setMostrarAviso(true);

    setTimeout(() => setMostrarAviso(false), 2500);
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="layout">

      {/* ---- SIDEBAR ---- */}
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      {/* ---- PANEL ---- */}
      <main className={`contenido ${sidebarAbierto ? "con-sidebar" : "sin-sidebar"}`}>

        <div className="barra-superiorNO">
          <input
            type="text"
            placeholder="Proveedor"
            className="input-proveedorNO"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
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
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.proveedor}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="input-tablaNO"
                      value={p.cantidad}
                      onChange={(e) =>
                        setProductos(
                          productos.map((prod) =>
                            prod.id === p.id
                              ? { ...prod, cantidad: Number(e.target.value) }
                              : prod
                          )
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* ---- AVISO ---- */}
      {mostrarAviso && (
        <div className="avisoNO">
          <p>✔ Orden Finalizada y PDF generado</p>
        </div>
      )}

    </div>
  );
}
