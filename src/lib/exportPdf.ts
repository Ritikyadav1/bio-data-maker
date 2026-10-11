import { jsPDF } from 'jspdf';
import { captureSurface } from './capture';
import { downloadBlob } from './image';

/** A4 PDF made from a high-resolution render of the page, so the design is identical to the preview. */
export async function exportPdf(filename: string) {
  const canvas = await captureSurface();
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 595.28, 841.89, undefined, 'FAST');
  downloadBlob(pdf.output('blob'), filename);
}

export async function exportPng(filename: string) {
  const canvas = await captureSurface();
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'));
  downloadBlob(blob, filename);
}
