const PDFDocument = require("pdfkit");

/**
 * Generates a PDF receipt and returns it as a Buffer.
 * Now using Promises to ensure the stream is fully finalized before returning.
 */
module.exports = (amount, items = []) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const finalBuffer = Buffer.concat(buffers);
        resolve(finalBuffer);
      });
      doc.on("error", (err) => reject(err));

      // Header
      doc.fontSize(25).fillColor("#6366f1").text("Odoo Cafe", { align: "center" });
      doc.fontSize(12).fillColor("#000000").text("Premium Coffee & Artisan Goods", { align: "center" });
      doc.moveDown();
      doc.moveTo(50, 110).lineTo(550, 110).stroke("#e2e8f0");
      doc.moveDown(2);

      // Receipt Info
      doc.fontSize(20).text("Payment Receipt", { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
      doc.text(`Status: Successful`);
      doc.text(`Payment Method: UPI/Card`);
      doc.moveDown();

      // Order Details Header
      doc.fontSize(14).text("Order Details", { weight: "bold" });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
      doc.moveDown();

      // Items List
      if (items && items.length > 0) {
        items.forEach(item => {
          const startY = doc.y;
          doc.fontSize(12).text(`${item.name}`, 50, startY);
          doc.text(`x${item.quantity}`, 300, startY);
          doc.text(`₹${item.price * item.quantity}`, 400, startY, { align: "right", width: 150 });
          doc.moveDown(0.5);
        });
      } else {
        doc.text("No items listed.");
      }

      // Footer / Total
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e2e8f0");
      doc.moveDown();
      
      doc.fontSize(16).fillColor("#6366f1").text(`Total Amount Paid: ₹${amount}`, { align: "right" });
      
      doc.moveDown(4);
      doc.fontSize(10).fillColor("#94a3b8").text("Thank you for choosing Odoo Cafe!", { align: "center" });

      // Signal end of document
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
