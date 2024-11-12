package com.example.keycloak.service;

import com.example.keycloak.util.JasperUtil;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

@Service
public class ExportService {

    private final DataSource dataSource;

    public ExportService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Export report with specified format and parameters
     *
     * @param format Report format (pdf, xlsx, docx)
     * @param parameters Parameters to pass into the report
     * @param outputStream OutputStream to write the report
     * @throws Exception If an error occurs during report generation
     */
    public void exportReport(String format, Map<String, Object> parameters, OutputStream outputStream) throws Exception {
        // Lấy InputStream cho file .jasper từ classpath
        try (InputStream templateStream = new ClassPathResource("reports/product_report.jasper").getInputStream()) {
            byte[] reportBytes = JasperUtil.exportReport(templateStream, format, parameters, dataSource);
            outputStream.write(reportBytes);
            outputStream.flush();
        }
    }
}
