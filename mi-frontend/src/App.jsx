import { useNavigate } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import "./styles/App.css";
import panquelLogo from "./img/panquel.gif";
import { useState, useEffect } from "react";


export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
  const disableContextMenu = (e) => e.preventDefault();
  const blockKeys = (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
    ) {
      e.preventDefault();
    }
  };

  window.addEventListener("contextmenu", disableContextMenu);
  window.addEventListener("keydown", blockKeys);

  return () => {
    window.removeEventListener("contextmenu", disableContextMenu);
    window.removeEventListener("keydown", blockKeys);
  };
}, []);


  // --- PRODUCTOS INICIALES ---
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

  // --- STATES ---
  const [productos, setProductos] = useState(productosIniciales);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  // --- METRICAS ---
  const totalProductos = productos.length;
  const stockBajo = productos.filter((p) => p.stock < p.sugerenciaPedido).length;
  const pedidosPendientes = productos.filter((p) => p.pedidoPendiente > 0).length;
  const proveedoresUnicos = new Set(productos.map((p) => p.proveedor)).size;

  const fechaMasReciente = productos
    .map((p) => p.fechaAgregado)
    .sort()
    .reverse()[0];

  return (
    <div className="layout">

      {/* --- SIDEBAR REUSABLE --- */}
      <Sidebar
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={toggleSidebar}
      />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="contenido">
        
        <h1 className="titulo">Dashboard General</h1>

        <div className="logo-container">
          <img
            src={panquelLogo}
            alt="Logo Panquel"
            className="logo-img"
          />
        </div>

        <div className="dashboard-grid">

          <div className="tarjeta dashboard-box">
            <h2>Total de productos</h2>
            <p className="numero">{totalProductos}</p>
          </div>

          <div className="tarjeta dashboard-box alerta">
            <h2>Stock bajo</h2>
            <p className="numero">{stockBajo}</p>
          </div>

          <div className="tarjeta dashboard-box">
            <h2>Pedidos pendientes</h2>
            <p className="numero">{pedidosPendientes}</p>
          </div>

          <div className="tarjeta dashboard-box">
            <h2>Proveedores registrados</h2>
            <p className="numero">{proveedoresUnicos}</p>
          </div>

          <div className="tarjeta dashboard-box">
            <h2>Última actualización</h2>
            <p className="numero">{fechaMasReciente}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
