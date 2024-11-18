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

    public void exportReport(String format, Map<String, Object> parameters, OutputStream outputStream) throws Exception {
        try (InputStream templateStream = new ClassPathResource("reports/product_report.jasper").getInputStream()) {
            byte[] reportBytes = JasperUtil.exportReport(templateStream, format, parameters, dataSource);
            outputStream.write(reportBytes);
            outputStream.flush();
        }
    }
}
