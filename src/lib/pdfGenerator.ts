import { jsPDF } from "jspdf";
import { CertificateConfig, ProcessedStudent } from "@/types/certificate";

export async function generateCertificatePDF(
  student: ProcessedStudent,
  certificateImage: string,
  config: CertificateConfig
): Promise<string> {
  // Load the image to get dimensions
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = certificateImage;
  });

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Create PDF with the same dimensions as the image (in points, 1 point = 1/72 inch)
  // We'll use a scale factor to convert pixels to a reasonable PDF size
  const scaleFactor = 0.75; // Adjust for reasonable PDF size
  const pdfWidth = imgWidth * scaleFactor;
  const pdfHeight = imgHeight * scaleFactor;

  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pdfWidth, pdfHeight],
  });

  // Add the certificate image as background
  pdf.addImage(certificateImage, "PNG", 0, 0, pdfWidth, pdfHeight);

  // Configure text style
  pdf.setFontSize(config.fontSize * scaleFactor);
  pdf.setTextColor(config.fontColor);

  // Map font family to jsPDF compatible fonts
  let fontName = "helvetica";
  if (config.fontFamily.toLowerCase().includes("times")) {
    fontName = "times";
  } else if (config.fontFamily.toLowerCase().includes("courier")) {
    fontName = "courier";
  }
  pdf.setFont(fontName, "bold");

  // Calculate text position (scale from original image coordinates)
  const textX = (config.posX / 100) * pdfWidth;
  const textY = (config.posY / 100) * pdfHeight;

  // Add the student name centered at the configured position
  pdf.text(student.nome, textX, textY, { align: "center" });

  // Return PDF as base64
  const pdfBase64 = pdf.output("datauristring");
  return pdfBase64;
}
