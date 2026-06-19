import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import "../styles/NuevaOrden.css";
import { generarPDFDesdeDatos } from "../utils/pdf";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes,
  FaSearch
} from "react-icons/fa";

// 🔗 URL BACKEND
const API_URL = "http://127.0.0.1:8000/api";

export default function NuevaOrden() {
  const navigate = useNavigate();

  /* =====================================================
     🔥 ESTADO BACKEND
  ===================================================== */
  const [diferenciasIA, setDiferenciasIA] = useState({});
  const [backendActivo, setBackendActivo] = useState(false);
  const [verificandoBackend, setVerificandoBackend] = useState(true);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [hayCambios, setHayCambios] = useState(false);
  const [ordenHoyRealizada, setOrdenHoyRealizada] = useState(false);
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
  const [ordenGeneradaIA, setOrdenGeneradaIA] = useState(false);
  const [productosIAOriginales, setProductosIAOriginales] = useState([]);
  const rol = localStorage.getItem("rol");
  const esAdmin = rol === "admin";
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  const verificarOrdenDelDia = async () => {
    try {
      const res = await fetch(`${API_URL}/historial/`);
      const ordenes = await res.json();

      // 🔥 MISMO FORMATO QUE DJANGO:
      // 14-May-26
      const hoy = new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit"
        })
        .replace(/ /g, "-");

      console.log("Fecha hoy:", hoy);

      const yaExiste = ordenes.some((orden) => {
        return (
          String(orden.fecha).trim().toLowerCase() ===
          hoy.trim().toLowerCase()
        );
      });

      setOrdenHoyRealizada(yaExiste);

    } catch (error) {
      console.error("Error verificando orden del día:", error);
    }
  };

    useEffect(() => {
      let intervalo;

      async function verificarBackend() {
        try {
          const response = await fetch(`${API_URL}/ia/wake/`);
          const data = await response.json();

          if (data.status === "ready") {
            setBackendActivo(true);
            setVerificandoBackend(false);
            clearInterval(intervalo);
          }
        } catch (error) {
          setBackendActivo(false);
          setVerificandoBackend(false);
        }
      }

      verificarBackend();
      verificarOrdenDelDia();

      intervalo = setInterval(() => {
        verificarBackend();
      }, 10000);

      return () => clearInterval(intervalo);

    }, []);



  /* =====================================================
     🤖 ESTADO IA NUEVO
  ===================================================== */

  const [cargandoIA, setCargandoIA] = useState(false);
  const audioCompletadoRef = useRef(null);
  const [mostrarModalIA, setMostrarModalIA] = useState(false);

  async function cargarPrediccionIA() {
    try {
      setCargandoIA(true);

      // 🔥 GUARDAR ESTADO ANTES DE IA
      const productosAntesIA = JSON.parse(JSON.stringify(productos));

      const response = await fetch(`${API_URL}/ia/predict/?epochs=20&top=0`);
      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {

        const nuevaListaIA = productos.map(p => {
          const pred = data.results.find(
            r =>
              r.Producto?.trim().toLowerCase() ===
              p.nombre?.trim().toLowerCase()
          );
          console.log({
            productoFrontend: p.nombre,
            prediccionEncontrada: pred
          });
          const historial = pred?.historial_registros || 0;

          const confianza =
            pred?.confianza_prediccion || "normal";

          // 🔥 si tiene poca data NO usar predicción
          const cantidadIA =
            confianza === "muy_baja" ||
            confianza === "baja"
              ? 0
              : parseInt(pred?.Pred_Sig_Semana) || 0;

          return pred
            ? {
                ...p,
                cantidad: cantidadIA,

                historial_registros: historial,
                confianza_prediccion: confianza
              }
            : p;
        });
        const nuevasDiferencias = {};

        nuevaListaIA.forEach((nuevoProd) => {
          const original = productosAntesIA.find(
            p => p.id === nuevoProd.id
          );

          if (original) {
            nuevasDiferencias[nuevoProd.id] =
              nuevoProd.cantidad - original.cantidad;
          }
        });

        setDiferenciasIA(nuevasDiferencias);
        setProductos(nuevaListaIA);

        //GUARDAR PRODUCTOS PRE-IA
        setProductosIAOriginales(productosAntesIA);

        setOrdenIniciada(true);
        setHayCambios(true);
        setOrdenGeneradaIA(true);
        // REPRODUCIR SONIDO
        if (audioCompletadoRef.current) {
          audioCompletadoRef.current
            ?.play()
            .catch((err) => {
              console.error("Error reproduciendo audio:", err);
            });
        }

        // MOSTRAR MODAL
        setMostrarModalIA(true);
      }

      setCargandoIA(false);

    } catch (error) {
      console.error("Error IA:", error);
      setCargandoIA(false);
    }
  }

  /* ===================================================== */

  const [sidebarAbierto, setSidebarAbierto] = useState(() => {
    const guardado = localStorage.getItem("sidebarAbierto");
    return guardado === null ? true : guardado === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarAbierto", sidebarAbierto);
  }, [sidebarAbierto]);

  const [ordenIniciada, setOrdenIniciada] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [avisoGuardado, setAvisoGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

const [productosPorPagina, setProductosPorPagina] = useState(5);
const tablaRef = useRef(null);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    setProductosFiltrados(productos);
  }, [productos]);

  useEffect(() => {
    const texto = busqueda.toLowerCase();

    const filtrados = productos.filter((p) => {
      const nombre = p.nombre || "";
      const proveedor = p.proveedor_nombre || "";
      return (
        nombre.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto)
      );
    });

    setProductosFiltrados(filtrados);
  }, [busqueda, productos]);

  useEffect(() => {
  setPaginaActual(1);
}, [busqueda]);

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

    const prioridadConfianza = {
      nuevo: 0,
      muy_baja: 1,
      baja: 2,
      normal: 999
    };

    const productosOrdenados = [...productosFiltrados].sort((a, b) => {

    const prioridadA =
      prioridadConfianza[a.confianza_prediccion] ?? 999;

    const prioridadB =
      prioridadConfianza[b.confianza_prediccion] ?? 999;

    // 🔥 primero productos con poca data
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }

    // 🔥 luego por proveedor
    return (a.proveedor_nombre || "").localeCompare(
      b.proveedor_nombre || ""
    );
  });

    const productosPagina = productosOrdenados.slice(
      indicePrimero,
      indiceUltimo
    );

    const totalPaginas = Math.ceil(
      productosOrdenados.length / productosPorPagina
    );



  /* ===================================================== */

 function handleGenerarOrden() {
    // 🚀 CAMBIO: Si ya se hizo una orden hoy, bloqueamos y mostramos modal
    if (ordenHoyRealizada) {
      setMostrarModalBloqueo(true);
      return;
    }

    if (!backendActivo) {
      alert("El servidor aún no está listo");
      return;
    }

    cargarPrediccionIA();
  }

  function handleFinalizar() {
      // 🚀 BLOQUEO: Si ya se hizo una orden hoy, no permitimos abrir el modal de finalizar
      if (ordenHoyRealizada) {
        setMostrarModalBloqueo(true);
        return;
      }
      setMostrarModal(true);
    }

  function cancelarFinalizar() {
    setMostrarModal(false);
  }


  useEffect(() => {
    const calcularFilas = () => {
      if (!tablaRef.current) return;

      const contenedor = tablaRef.current;
      const rect = contenedor.getBoundingClientRect();
      
      // 1. Calculamos altura disponible restando el margen inferior para los botones
      // Usamos -80 para dejar espacio a la barra de paginación
      const alturaDisponible = window.innerHeight - rect.top - 80;

      // 2. Valores estándar (deben coincidir con el CSS)
      const alturaHeader = 45; 
      const alturaFila = 61;

      // 3. Cálculo matemático de filas que caben
      const espacioParaFilas = alturaDisponible - alturaHeader;
      const filas = Math.floor(espacioParaFilas / alturaFila);

      // 4. Actualizar estado (mínimo 3 filas)
      setProductosPorPagina(filas > 3 ? filas -1: 3);
    };

    // Pequeño delay para asegurar que el DOM está listo tras el renderizado
    const timeout = setTimeout(calcularFilas, 60);

    window.addEventListener("resize", calcularFilas);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", calcularFilas);
    };
  }, [productosFiltrados, sidebarAbierto]); // Se dispara al filtrar o mover el sidebar


useEffect(() => {
  async function inicializarDatos() {
    try {
      console.log("Iniciando carga de datos...");

      // 1. Obtener catálogo base
      const resProductos = await fetch(`${API_URL}/producto/`);
      const todosLosProductos = await resProductos.json();
      const resUltima = await fetch(`${API_URL}/ultima-orden/`);
      const ultimaOrden = await resUltima.json();

      if (!Array.isArray(todosLosProductos)) {
        console.error("El catálogo no es un array:", todosLosProductos);
        return;
      }

      let listaBase = todosLosProductos.map((p, index) => {

        // buscar producto en última orden REAL
        const itemUltimaOrden = ultimaOrden?.items?.find(
          item =>
            item.nombre?.trim().toLowerCase() ===
            p.nombre?.trim().toLowerCase()
        );

        return {
          id: p.id || `prod-${index}`,
          nombre: p.nombre,
          proveedor_nombre: p.proveedor_nombre || "General",
          cantidad: 0,

          // usar datos reales
          ultima_cantidad: itemUltimaOrden?.cantidad || 0,

          // 🔥 NUEVO
          historial_registros: 0,
          confianza_prediccion: "normal"
        };
      });

      // 2. Obtener datos de la orden activa
      try {
        const resActual = await fetch(`${API_URL}/prediccion/actual/`);
        const dataActual = await resActual.json();

        if (dataActual && dataActual.activa && Array.isArray(dataActual.productos)) {
          console.log("Orden activa detectada:", dataActual.productos);
          setOrdenIniciada(true);
          setOrdenGeneradaIA(false);

          // Cruce de datos blindado (comparamos nombres ignorando espacios y mayúsculas)
          listaBase = listaBase.map(pBase => {
            const coincidencia = dataActual.productos.find(
              g => g.nombre.trim().toLowerCase() === pBase.nombre.trim().toLowerCase()
            );

            if (coincidencia) {
              // Extraemos el valor del backend
              const valor = coincidencia.valor_predicho ?? coincidencia.cantidad ?? 0;
              console.log(`✅ Asignando ${valor} a ${pBase.nombre}`);
              return { ...pBase, cantidad: Number(valor) };
            }
            return pBase;
          });
        } else {
          setOrdenIniciada(false);
          
        }
      } catch (err) { // 🔥 CORREGIDO: Aquí estaba el error del token
        console.warn("No se pudo recuperar la orden activa o no hay ninguna.");
      }

      // 3. ACTUALIZACIÓN DE ESTADOS
      setProductos(listaBase);
      setProductosOriginales(JSON.parse(JSON.stringify(listaBase)));
      setHayCambios(false);
      setOrdenGeneradaIA(false);

    } catch (error) {
      console.error("Error general en inicializarDatos:", error);
    }
  }

  inicializarDatos();
}, []);

  /* =====================================================
     🔥 NUEVO: GUARDAR EN BACKEND (COLUMNA)
  ===================================================== */

async function guardarOrdenBackend() {
  try {
    const productosFiltrados = productos.filter(p => p.cantidad > 0);

    if (productosFiltrados.length === 0) {
      alert("No hay productos con cantidad mayor a 0");
      return false;
    }
    // 🔥 NUEVO: calcular proveedores aquí
    const proveedoresUsados = [
      ...new Set(
        productosFiltrados.map(p => p.proveedor_nombre || "General")
      )
    ];

    const response = await fetch(`${API_URL}/prediccion/guardar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productos: productosFiltrados.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad
        })),
        proveedores: proveedoresUsados
      }),
    });

    let data = null;

    // 🔥 IMPORTANTE: intentar leer respuesta aunque falle
    try {
      data = await response.json();
    } catch (e) {
      console.warn("La respuesta no es JSON");
    }

    if (!response.ok) {
      console.error("❌ Error del backend:", data);

      // 🔥 Mensaje más claro
      const mensaje =
        data?.error ||
        data?.detail ||
        "Error desconocido al guardar la orden";

      alert(`Error: ${mensaje}`);
      return false;
    }
    console.log("✅ Orden guardada:", data);
    return true;

  } catch (error) {
    console.error("❌ Error de conexión:", error);

    alert("No se pudo conectar con el servidor");
    return false;
  }
}

  /* ===================================================== */

  async function guardarOrden() {
  const ok = await guardarOrdenBackend();
  if (ok) {
  setProductosOriginales([...productos]);
  setHayCambios(false);
  setErrorGuardado(false);
  setAvisoGuardado(true);

  setTimeout(() => {
    setAvisoGuardado(false);

    // 🔥 RECARGAR APP
    setSidebarRefreshKey(prev => prev + 1);

  }, 1200);
  }else {
      setErrorGuardado(true);
      setAvisoGuardado(true);

      setTimeout(() => setAvisoGuardado(false), 2500);
    }
  }

  async function resetearOrdenIA() {
    if (!backendActivo) {
      alert("El servidor no está disponible");
      return;
    }
    setDiferenciasIA({});
    // Limpia UI mientras carga
    setOrdenIniciada(false);
    setProductos(productosOriginales);
    setBusqueda("");
    setPaginaActual(1);

    // 🔥 IMPORTANTE: vuelve a llamar IA
    
    setHayCambios(false);
  }

  async function cancelarOrdenActual() {
    try {

      // 🔥 limpiar backend
      await fetch(`${API_URL}/prediccion/limpiar/`, {
        method: "POST"
      });

      // 🔥 reset productos
      const productosReset = productos.map(p => ({
        ...p,
        cantidad: 0
      }));

      setProductos(productosReset);
      setProductosOriginales(
        JSON.parse(JSON.stringify(productosReset))
      );

      // 🔥 reset estados
      setOrdenIniciada(false);
      setHayCambios(false);
      setBusqueda("");
      setPaginaActual(1);
      setOrdenGeneradaIA(false);

      // 🔥 cerrar modal
      setMostrarModalCancelar(false);

      // 🔥 aviso estilo guardado
      setErrorGuardado(false);
      setAvisoGuardado(true);

      setTimeout(() => {
        setAvisoGuardado(false);
      }, 2500);

      // 🔥 opcional: refrescar datos reales
      setSidebarRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error("Error cancelando orden:", error);

      setErrorGuardado(true);
      setAvisoGuardado(true);

      setTimeout(() => {
        setAvisoGuardado(false);
      }, 2500);
    }
  }

  async function finalizarOrdenBackend() {
    try {
      const productosFiltrados = productos.filter(p => p.cantidad > 0);

      const response = await fetch(`${API_URL}/orden/crear-columna/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productos: productosFiltrados.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad
          }))
        }),
      });

      if (!response.ok) {
        alert("Error al finalizar orden");
        return false;
      }

      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  }


async function confirmarFinalizar() {

  // 🔥 evitar doble click
  if (finalizando) return;

  setFinalizando(true);

  try {
    const ok = await finalizarOrdenBackend();

    if (!ok) {
      setFinalizando(false);
      return;
    }

    const proveedoresUsados = [
      ...new Set(
        productos
          .filter(p => p.cantidad > 0)
          .map(p => p.proveedor_nombre || "General")
      )
    ];

    await fetch(`${API_URL}/prediccion/limpiar/`, {
      method: "POST"
    });

    generarPDFDesdeDatos({
      productos: productos,
      proveedor: proveedoresUsados.join(", "),
      fecha: new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    });

    setOrdenHoyRealizada(true);
    setOrdenIniciada(false);
    setHayCambios(false);
    setMostrarModal(false);

    setMostrarAviso(true);
    setTimeout(() => setMostrarAviso(false), 2500);

    const productosReset = productos.map(p => ({
      ...p,
      cantidad: 0
    }));

    setProductos(productosReset);
    setProductosOriginales(
      JSON.parse(JSON.stringify(productosReset))
    );

    window.location.reload();

  } catch (error) {
    console.error("Error al finalizar:", error);

    // 🔥 volver a habilitar si falla
    setFinalizando(false);
  }
}

async function borrarOrdenDelDia() {
  try {

    const response = await fetch(`${API_URL}/orden/borrar-hoy/`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "No se pudo borrar la orden");
      return;
    }

    console.log("Orden eliminada:", data);

    // 🔥 limpiar estados
    setOrdenHoyRealizada(false);
    setOrdenIniciada(false);
    setHayCambios(false);
    setOrdenGeneradaIA(false);
    setDiferenciasIA({});

    // 🔥 reset productos
    const productosReset = productos.map(p => ({
      ...p,
      cantidad: 0
    }));

    setProductos(productosReset);
    setProductosOriginales(
      JSON.parse(JSON.stringify(productosReset))
    );

    // 🔥 refrescar pantalla
    setSidebarRefreshKey(prev => prev + 1);
    

  } catch (error) {
    console.error("Error borrando orden:", error);
    alert("Error al borrar la orden");
  }
}


  return (
      <>
    <audio
      ref={audioCompletadoRef}
      src="/notificacion.mp3"
      preload="auto"
    />
    
    <div className="layout">
      <Sidebar
        key={sidebarRefreshKey}
        sidebarAbierto={sidebarAbierto}
        toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
      />

      <main className={`contenido ${sidebarAbierto ? "con-sidebar" : "sin-sidebar"}`}>
        <div className="barra-superiorNO">

        {ordenHoyRealizada && esAdmin && (
          <button
            className="btn-normalNO btn-cancelarNO"
            onClick={borrarOrdenDelDia}
          >
            Borrar Orden del Día
          </button>
        )}

        {ordenHoyRealizada && (
          <div className="aviso-orden-dia">
            <FaTimes className="icono-btn" />

            <span>
              Ya existe una orden generada hoy.
              {esAdmin && (
                <>
                  {" "}
                  Para crear otra debes borrar la orden del día.
                </>
              )}
            </span>
          </div>
        )}

          <div className="header-contenido">
          <FaSearch className="icono-buscador" />

          <input
            type="text"
            placeholder="Buscar producto o proveedor"
            id="buscadorr"
            className="input-buscador"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

          {ordenHoyRealizada ? (
              <button
                className="btn-normalNO"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Generar Orden
              </button>
            ) : !ordenIniciada ? (
              <>
                <button
                  className="btn-normalNO"
                  onClick={handleGenerarOrden}
                  disabled={!backendActivo || cargandoIA}
                >
                  {verificandoBackend
                    ? "Conectando..."
                    : cargandoIA
                    ? "Generando con IA..."
                    : "Generar Orden"}
                </button>

                {hayCambios && (
                  <>
                    <button
                      className="btn-normalNO"
                      onClick={guardarOrden}
                    >
                      Guardar Borrador
                    </button>

                    <button
                      className="btn-normalNO"
                      onClick={handleFinalizar}
                    >
                      Finalizar
                    </button>
                  </>
                )}
              </>
            ) : (
            <>
              <button 
                className="btn-normalNO" 
                onClick={guardarOrden}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {hayCambios ? "Guardar Cambios" : "Guardado"}
              </button>
              <button 
                className="btn-normalNO" 
                onClick={resetearOrdenIA}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                Resetear Orden IA
              </button>

              {ordenIniciada && !ordenGeneradaIA && (
                <button
                  className="btn-normalNO btn-cancelarNO"
                  onClick={() => setMostrarModalCancelar(true)}
                  disabled={ordenHoyRealizada}
                  style={
                    ordenHoyRealizada
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  Cancelar Orden
                </button>
              )}
              <button 
                className="btn-normalNO" 
                onClick={handleFinalizar}
                disabled={ordenHoyRealizada}
                style={ordenHoyRealizada ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                Finalizar
              </button>
            </>
          )}
        </div>

      <div className="tabla-contenedorNO" ref={tablaRef}>
        <table className="tabla-estandar">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Último pedido</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.proveedor_nombre}</td>
                <td className="ultima-cantidad">{p.ultima_cantidad || 0}</td>
                {/* AQUÍ VA EL BLOQUE DEL INPUT */}
                  <td>
                    <div className="contenedor-cantidad">
                      <input
                        type="number"
                        min="0"
                        className="input-tablaNO"
                        value={p.cantidad}
                        onChange={(e) => {
                          const valor = Number(e.target.value);
                          const cantidadSegura = isNaN(valor) ? 0 : Math.max(0, valor);

                          const nuevosProductos = productos.map((prod) =>
                            prod.id === p.id
                              ? { ...prod, cantidad: cantidadSegura }
                              : prod
                          );

                          setProductos(nuevosProductos);

                          const existeCambio =
                            JSON.stringify(nuevosProductos) !==
                            JSON.stringify(productosOriginales);

                          setHayCambios(existeCambio);
                        }}
                      />

                      {(() => {
                      const diferencia = diferenciasIA[p.id] || 0;
                      const productoOriginalIA = productosIAOriginales.find(
                        prod => prod.id === p.id
                      );

                      const usuarioCambioValor =
                        productoOriginalIA &&
                        p.cantidad !== productoOriginalIA.cantidad;

                      const esImpreciso =
                        p.confianza_prediccion === "muy_baja" ||
                        p.confianza_prediccion === "baja";

                      return (
                        <div className="estado-prediccion">
                          
                          {/* 🔥 SOLO mostrar diferencia si SÍ hay data */}
                          {!esImpreciso &&
                          ordenGeneradaIA &&
                          usuarioCambioValor && (
                            diferencia === 0 ? (
                              <span className="dif-placeholder">---</span>
                            ) : (
                              <span
                                className={
                                  diferencia > 0
                                    ? "dif-verde"
                                    : "dif-roja"
                                }
                              >
                                {diferencia > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(diferencia)}
                              </span>
                            )
                          )}

                          {p.confianza_prediccion === "muy_baja" && (
                            <span className="aviso-impreciso rojo">
                              ⚠ Muy poca data ({p.historial_registros})
                            </span>
                          )}

                          {p.confianza_prediccion === "baja" && (
                            <span className="aviso-impreciso amarillo">
                              ⚠ Poca data ({p.historial_registros})
                            </span>
                          )}

                        </div>
                      );
                    })()}
                    </div>
                  </td>
                {/* FIN DEL BLOQUE */}
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              <FaChevronLeft className="icono-btn" />
              Anterior
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              Siguiente
              <FaChevronRight className="icono-btn" />
            </button>
          </div>
        )}
      </main>

    {/* 🚀 CAMBIO: Modal de bloqueo por orden ya realizada */}
          {mostrarModalBloqueo && (
            <div className="modal-overlay">
              <div className="modal">
                <h3 className="titulo-error-modal">
                  <FaTimes className="icono-btn" />
                  Acción denegada
                </h3>
                <p className="pNO">Ya se ha procesado una orden el día de hoy. No es posible generar una nueva hasta mañana.</p>
                <div className="modal-buttonsNO">
                  <button className="btn-normalNO" onClick={() => setMostrarModalBloqueo(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal modal-finalizar">
            <h3>¿Finalizar la orden?</h3>
            <p className="pNO">Se generará un PDF con esta orden.</p>

            <div className="modal-buttonsNO">
              <button className="btn-normalNO" onClick={cancelarFinalizar}>
                Cancelar
              </button>
              <button
              className="btn-normalNO"
              onClick={confirmarFinalizar}
              disabled={finalizando}
            >
              {finalizando ? "Finalizando..." : "Finalizar"}
            </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalCancelar && (
        <div className="modal-overlay">
          <div className="modal modal-finalizar">
            <h3>¿Cancelar orden actual?</h3>

            <p className="pNO">
              Se eliminará la orden en curso y los cambios no guardados.
            </p>

            <div className="modal-buttonsNO">
              <button
                className="btn-normalNO"
                onClick={() => setMostrarModalCancelar(false)}
              >
                Volver
              </button>

              <button
                className="btn-normalNO btn-cancelarNO"
                onClick={cancelarOrdenActual}
              >
                Cancelar Orden
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalIA && (
        <div className="modal-overlay">
          <div className="modal modal-finalizar">

            <h3>IA completada</h3>

            <p className="pNO">
              La generación de la orden terminó correctamente.
            </p>

            <div className="modal-buttonsNO">
              <button
                className="btn-normalNO"
                onClick={() => setMostrarModalIA(false)}
              >
                Cerrar
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

      {avisoGuardado && (
        <div className="avisoNO">
          <p>
            {errorGuardado
              ? "❌ Error al guardar"
              : "✔ Orden guardada correctamente"}
          </p>
        </div>
      )}
    </div>
    </>
  );
}