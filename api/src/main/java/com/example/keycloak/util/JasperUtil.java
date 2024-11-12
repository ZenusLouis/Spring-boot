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

    /**
     * Xuất báo cáo với định dạng động (PDF, XLSX, DOCX).
     *
     * @param templateStream InputStream của template Jasper (.jasper).
     * @param format Định dạng đầu ra của báo cáo (pdf, xlsx, docx).
     * @param parameters Tham số cho báo cáo.
     * @param dataSource DataSource kết nối với cơ sở dữ liệu.
     * @return Mảng byte chứa dữ liệu báo cáo xuất ra theo định dạng yêu cầu.
     * @throws Exception Khi có lỗi trong quá trình tạo báo cáo.
     */
    public static byte[] exportReport(InputStream templateStream, String format, Map<String, Object> parameters, DataSource dataSource) throws Exception {
        // Nạp template .jasper từ InputStream
        JasperReport jasperReport = (JasperReport) JRLoader.loadObject(templateStream);

        // Kết nối tới cơ sở dữ liệu và thực thi báo cáo với tham số truyền vào
        try (Connection connection = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, connection);
            return exportToFormat(jasperPrint, format);
        }
    }

    /**
     * Xuất báo cáo ra định dạng cụ thể.
     *
     * @param jasperPrint Đối tượng JasperPrint chứa nội dung báo cáo.
     * @param format Định dạng đầu ra (pdf, xlsx, docx).
     * @return Mảng byte chứa dữ liệu báo cáo theo định dạng.
     * @throws Exception Khi có lỗi trong quá trình xuất báo cáo.
     */
    private static byte[] exportToFormat(JasperPrint jasperPrint, String format) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Exporter<ExporterInput, ?, ?, ?> exporter;

        switch (format.toLowerCase()) {
            case "pdf":
                exporter = new JRPdfExporter();
                ((JRPdfExporter) exporter).setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                break;
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
