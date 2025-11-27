import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate monthly statistics report
export const generateMonthlyReport = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `monthly-report-${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .fillColor('#4F46E5')
         .text('Smart Village Management System', { align: 'center' });

      doc.fontSize(18)
         .fillColor('#6B7280')
         .text('Monthly Statistics Report', { align: 'center' });

      doc.moveDown();
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`Report Period: ${data.period}`, { align: 'center' });

      doc.moveDown(2);

      // Summary Section
      doc.fontSize(16)
         .fillColor('#4F46E5')
         .text('Executive Summary');

      doc.moveDown();

      doc.fontSize(12)
         .fillColor('#000000');

      // Complaints Summary
      doc.text('Complaints Overview:', { underline: true });
      doc.moveDown(0.5);
      doc.text(`Total Complaints: ${data.complaints.total}`);
      doc.text(`Pending: ${data.complaints.pending}`);
      doc.text(`In Progress: ${data.complaints.inProgress}`);
      doc.text(`Resolved: ${data.complaints.resolved}`);
      doc.text(`Resolution Rate: ${data.complaints.resolutionRate}%`);

      doc.moveDown();

      // Resource Usage Summary
      doc.text('Resource Usage:', { underline: true });
      doc.moveDown(0.5);
      doc.text(`Water Usage: ${data.resources.water.total} ${data.resources.water.unit}`);
      doc.text(`Electricity Usage: ${data.resources.electricity.total} ${data.resources.electricity.unit}`);
      doc.text(`Waste Collected: ${data.resources.waste.total} ${data.resources.waste.unit}`);

      doc.moveDown();

      // Category Breakdown
      doc.text('Complaints by Category:', { underline: true });
      doc.moveDown(0.5);
      Object.entries(data.complaintsByCategory).forEach(([category, count]) => {
        doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${count}`);
      });

      doc.moveDown(2);

      // Top Issues Section
      if (data.topIssues && data.topIssues.length > 0) {
        doc.addPage();
        doc.fontSize(16)
           .fillColor('#4F46E5')
           .text('Top Issues');

        doc.moveDown();
        doc.fontSize(12).fillColor('#000000');

        data.topIssues.forEach((issue, index) => {
          doc.text(`${index + 1}. ${issue.title}`, { underline: true });
          doc.moveDown(0.3);
          doc.fontSize(10);
          doc.text(`Category: ${issue.category} | Status: ${issue.status} | Priority: ${issue.priority}`);
          doc.fontSize(12);
          doc.moveDown();
        });
      }

      // Footer
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text(
           `Generated on ${new Date().toLocaleString()}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          relativePath: `/reports/${fileName}`
        });
      });

      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

// Generate complaint report
export const generateComplaintReport = async (complaint) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `complaint-${complaint._id}-${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20)
         .fillColor('#4F46E5')
         .text('Complaint Report', { align: 'center' });

      doc.moveDown(2);

      // Complaint Details
      doc.fontSize(14)
         .fillColor('#000000')
         .text('Complaint Details:', { underline: true });

      doc.moveDown();
      doc.fontSize(12);

      doc.text(`ID: ${complaint._id}`);
      doc.text(`Title: ${complaint.title}`);
      doc.text(`Category: ${complaint.category}`);
      doc.text(`Priority: ${complaint.priority}`);
      doc.text(`Status: ${complaint.status}`);
      doc.text(`Location: ${complaint.location.address}`);
      doc.text(`Reported On: ${new Date(complaint.createdAt).toLocaleString()}`);

      doc.moveDown();
      doc.text('Description:');
      doc.fontSize(11)
         .text(complaint.description, { align: 'justify' });

      doc.fontSize(12);
      doc.moveDown();

      // Status History
      if (complaint.statusHistory && complaint.statusHistory.length > 0) {
        doc.addPage();
        doc.fontSize(14)
           .text('Status History:', { underline: true });

        doc.moveDown();
        doc.fontSize(11);

        complaint.statusHistory.forEach((history, index) => {
          doc.text(`${index + 1}. ${history.status.toUpperCase()} - ${new Date(history.timestamp).toLocaleString()}`);
          if (history.comment) {
            doc.text(`   Comment: ${history.comment}`);
          }
          doc.moveDown(0.5);
        });
      }

      // Resolution
      if (complaint.resolution && complaint.resolution.description) {
        doc.moveDown();
        doc.fontSize(14)
           .text('Resolution:', { underline: true });

        doc.moveDown();
        doc.fontSize(11);
        doc.text(complaint.resolution.description);
        doc.text(`Resolved On: ${new Date(complaint.resolution.resolvedAt).toLocaleString()}`);
      }

      // Footer
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text(
           `Generated on ${new Date().toLocaleString()}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          relativePath: `/reports/${fileName}`
        });
      });

      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};
