package com.example.keycloak.util;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.export.*;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.util.Map;

public class JasperUtil {

    public static byte[] exportReport(InputStream templateStream, String format, Map<String, Object> parameters, DataSource dataSource) throws Exception {
        JasperReport jasperReport = (JasperReport) JRLoader.loadObject(templateStream);

        try (Connection connection = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, connection);
            return exportToFormat(jasperPrint, format);
        }
    }

    private static byte[] exportToFormat(JasperPrint jasperPrint, String format) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Exporter<ExporterInput, ?, ?, ?> exporter;

        switch (format.toLowerCase()) {
            case "pdf":
                exporter = new JRPdfExporter();
                ((JRPdfExporter) exporter).setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                SimplePdfExporterConfiguration pdfConfig = new SimplePdfExporterConfiguration();
                pdfConfig.setCompressed(true);
                pdfConfig.setTagged(true);
                ((JRPdfExporter) exporter).setConfiguration(pdfConfig);

                break;
            case "excel":
            case "xlsx":
                exporter = new JRXlsxExporter();
                ((JRXlsxExporter) exporter).setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                SimpleXlsxReportConfiguration xlsxConfig = new SimpleXlsxReportConfiguration();
                xlsxConfig.setOnePagePerSheet(true);
                xlsxConfig.setDetectCellType(true);
                ((JRXlsxExporter) exporter).setConfiguration(xlsxConfig);
                break;
            case "docx":
                exporter = new JRDocxExporter();
                ((JRDocxExporter) exporter).setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                SimpleDocxReportConfiguration docxConfig = new SimpleDocxReportConfiguration();
                docxConfig.setFramesAsNestedTables(true);
                ((JRDocxExporter) exporter).setConfiguration(docxConfig);
                break;
            default:
                throw new IllegalArgumentException("Unsupported format: " + format);
        }

        exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
        exporter.exportReport();

        return outputStream.toByteArray();
    }
}
