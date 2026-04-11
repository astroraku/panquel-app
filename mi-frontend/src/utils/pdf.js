import jsPDF from "jspdf";

export function generarPDFDesdeDatos({ proveedor, fecha, productos }) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Orden de Compra", 14, 20);

  doc.setFontSize(12);

  // 👇 ESTE ES EL CLAVE
  doc.text(`Proveedor: ${proveedor}`, 14, 35);

  doc.text(`Fecha: ${fecha}`, 14, 43);

  let y = 60;

  productos
    .filter(p => p.cantidad > 0)
    .forEach(p => {
      doc.text(`• ${p.nombre} - Cantidad: ${p.cantidad}`, 16, y);
      y += 8;
    });

  doc.save(`orden_${fecha}.pdf`);
}