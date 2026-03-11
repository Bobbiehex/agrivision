
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { AIAnalysisResult, CropData, Report } from "../types";
import { dbService } from "./db";

export const ExportService = {
  // ... existing exportToCSV ...
  exportToCSV: (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => headers.map(fieldName => {
        const value = row[fieldName];
        // Handle strings with commas, arrays, objects to prevent CSV breakage
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        if (Array.isArray(value)) return `"${value.join(';')}"`;
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Generates a PDF report including the analyzed image and AI results.
   */
  generateAnalysisPDF: async (analysis: AIAnalysisResult, imageBase64: string, title: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Header / Title
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text("AgriVision AI Report", margin, margin);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(title, margin, margin + 10);
    
    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 16);
    
    let yPos = margin + 25;

    // Image Section
    if (imageBase64) {
      try {
        const imgProps = doc.getImageProperties(imageBase64);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Ensure image doesn't take up too much space, cap height at 100
        const finalHeight = Math.min(imgHeight, 100);
        
        doc.addImage(imageBase64, 'JPEG', margin, yPos, imgWidth, finalHeight);
        yPos += finalHeight + 10;
      } catch (e) {
        console.error("Error adding image to PDF", e);
        doc.setFontSize(10);
        doc.text("[Image could not be processed]", margin, yPos);
        yPos += 10;
      }
    }

    // Analysis Results Section
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Subject: ${analysis.detectedSubject}`, margin + 5, yPos + 8);
    doc.text(`Condition: ${analysis.condition}`, margin + 5, yPos + 16);
    
    // Confidence Score
    doc.text(`Confidence: ${analysis.confidence}%`, pageWidth - margin - 35, yPos + 12);
    
    yPos += 35;

    // Issues
    if (analysis.issues && analysis.issues.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(185, 28, 28); // red-700
      doc.text("Detected Issues:", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      analysis.issues.forEach(issue => {
        doc.text(`• ${issue}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text("AI Recommendations:", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      analysis.recommendations.forEach(rec => {
        // Handle text wrapping
        const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - (margin * 2) - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += (lines.length * 6);
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text("AgriVision AI Platform - Automated Analysis Report", margin, pageHeight - 10);

    // Save to DB
    const report: Report = {
      id: `report-${Date.now()}`,
      type: 'CROP_ANALYSIS',
      title: title,
      summary: `${analysis.detectedSubject} - ${analysis.condition}`,
      details: analysis,
      imageBase64: imageBase64,
      timestamp: Date.now()
    };
    await dbService.saveReport(report);

    doc.save(`AgriVision_Report_${Date.now()}.pdf`);
    return report;
  },

  /**
   * Generates a comprehensive field report PDF.
   */
  generateFieldReportPDF: async (crop: CropData, mapElement: HTMLElement | null, chartElement: HTMLElement | null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text("Field Health Summary", margin, margin);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`${crop.name} (${crop.type})`, margin, margin + 10);
    doc.text(`Field ID: ${crop.fieldId}`, margin, margin + 18);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 26);
    
    let yPos = margin + 35;

    // Stats Section
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(margin, yPos, pageWidth - (margin * 2), 30, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Current NDVI: ${crop.ndvi}`, margin + 10, yPos + 10);
    doc.text(`Soil Moisture: ${crop.soilMoisture}%`, margin + 10, yPos + 20);
    doc.text(`Health Status: ${crop.status}`, pageWidth / 2, yPos + 10);
    doc.text(`Planting Date: ${new Date(crop.plantingDate).toLocaleDateString()}`, pageWidth / 2, yPos + 20);
    
    yPos += 40;

    // Capture Map
    if (mapElement) {
      try {
        const canvas = await html2canvas(mapElement);
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(14);
        doc.text("Drone Field Map Analysis", margin, yPos);
        yPos += 5;
        
        const finalHeight = Math.min(imgHeight, 80);
        doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, finalHeight);
        yPos += finalHeight + 15;
      } catch (e) {
        console.error("Map capture failed", e);
      }
    }

    // Capture Chart
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(14);
        doc.text("NDVI Growth Trends", margin, yPos);
        yPos += 5;
        
        const finalHeight = Math.min(imgHeight, 60);
        doc.addImage(imgData, 'JPEG', margin, yPos, imgWidth, finalHeight);
        yPos += finalHeight + 15;
      } catch (e) {
        console.error("Chart capture failed", e);
      }
    }

    // Insights
    if (crop.insights) {
      doc.addPage();
      yPos = margin;
      doc.setFontSize(18);
      doc.text("Key Insights & Metrics", margin, yPos);
      yPos += 15;
      
      doc.setFontSize(11);
      const insightData = [
        `NDRE Index: ${crop.insights.ndre ?? 'N/A'}`,
        `VARI Index: ${crop.insights.vari ?? 'N/A'}`,
        `Growth Stage: ${crop.insights.growthStage ?? 'N/A'}`,
        `Water Stress: ${crop.insights.waterStress ?? 'N/A'}%`,
        `Thermal Stress: ${crop.insights.thermalStress ?? 'N/A'}%`,
        `Weed Density: ${crop.insights.weedDensity ?? 'N/A'}%`,
        `Canopy Cover: ${crop.insights.canopyCover ?? 'N/A'}%`,
        `Pest Pressure: ${crop.insights.pestPressure ?? 'N/A'}`,
        `Disease Risk: ${crop.insights.diseaseRisk ?? 'N/A'}`
      ];
      
      insightData.forEach(item => {
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 8;
      });
    }

    // Save to DB
    const report: Report = {
      id: `field-report-${Date.now()}`,
      type: 'FIELD_SUMMARY',
      title: `Field Summary: ${crop.name}`,
      summary: `Health: ${crop.status} | NDVI: ${crop.ndvi}`,
      details: crop,
      timestamp: Date.now()
    };
    await dbService.saveReport(report);

    doc.save(`Field_Report_${crop.name}_${Date.now()}.pdf`);
    return report;
  }
};
