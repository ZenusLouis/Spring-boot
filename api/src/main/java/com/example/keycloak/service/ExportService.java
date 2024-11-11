package com.example.keycloak.service;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimplePdfReportConfiguration;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ExportService {

    @Autowired
    private DataSource dataSource;  // Autowired DataSource to access PostgreSQL directly

    public void exportReportToPdf(OutputStream outputStream) throws JRException, IOException, SQLException {
        JasperReport jasperReport = JasperCompileManager.compileReport(
                new ClassPathResource("reports/product_report.jrxml").getInputStream()
        );

        Map<String, Object> parameters = new HashMap<>();
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource.getConnection());

        JRPdfExporter exporter = new JRPdfExporter();
        exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
        exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
        SimplePdfReportConfiguration config = new SimplePdfReportConfiguration();
        exporter.setConfiguration(config);
        exporter.exportReport();
    }

    public void exportReportToExcel(OutputStream outputStream) throws JRException, IOException, SQLException {
        JasperReport jasperReport = JasperCompileManager.compileReport(
                new ClassPathResource("reports/product_report.jrxml").getInputStream()
        );

        Map<String, Object> parameters = new HashMap<>();
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource.getConnection());

        JRXlsxExporter exporter = new JRXlsxExporter();
        exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
        exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
        SimpleXlsxReportConfiguration config = new SimpleXlsxReportConfiguration();
        exporter.setConfiguration(config);
        exporter.exportReport();
    }
}
