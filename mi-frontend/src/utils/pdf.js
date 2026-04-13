import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generarPDFDesdeDatos({ proveedor, fecha, productos }) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("Orden de Compra", 14, 20);

  doc.setFontSize(12);
  doc.text(`Proveedor: ${proveedor}`, 14, 35);
  doc.text(`Fecha: ${fecha}`, 14, 43);

  // Filtrar productos con cantidad
  const productosFiltrados = productos.filter(p => p.cantidad > 0);

  // Convertir a filas
  const rows = productosFiltrados.map(p => [
    p.nombre,
    p.cantidad
  ]);

  // Tabla automática
  autoTable(doc, {
    startY: 55,
    head: [["Producto", "Cantidad"]],
    body: rows,

    styles: {
      fontSize: 10,
    },

    headStyles: {
      fillColor: [139, 94, 52], // cafecito
    },

    columnStyles: {
      1: { halign: "right" } // 👈 alinea cantidad a la derecha
    },

    didDrawPage: (data) => {
      // Footer opcional
      doc.setFontSize(10);
      doc.text(
        `Página ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    }
  });

  doc.save(`orden_${fecha}.pdf`);
}