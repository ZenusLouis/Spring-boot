package com.example.keycloak.controller;

import com.example.keycloak.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ExportController {

    @Autowired
    private ExportService exportService;

    /**
     * Export product report in various formats (pdf, xlsx, docx)
     *
     * @param format   Report format requested by the user (pdf, xlsx, docx)
     * @param category (Optional) Filter products by category
     * @param response HttpServletResponse to write the report output stream
     * @throws Exception In case of export failure
     */
    @GetMapping("/products/{format}")
    public void exportProductsReport(
            @PathVariable String format,
            @RequestParam(required = false) String category,
            HttpServletResponse response) throws Exception {

        // Set response content type based on format
        switch (format.toLowerCase()) {
            case "pdf":
                response.setContentType("application/pdf");
                response.setHeader("Content-Disposition", "attachment; filename=products.pdf");
                break;
            case "xlsx":
            case "excel": // Thêm dòng này
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
                break;
            case "docx":
                response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                response.setHeader("Content-Disposition", "attachment; filename=products.docx");
                break;
            default:
                throw new IllegalArgumentException("Unsupported format: " + format);
        }

        // Prepare parameters for the report
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("createdBy", "Your Company");
        if (category != null && !category.isEmpty()) {
            parameters.put("category", category);
        }

        // Export report using the specified format
        exportService.exportReport(format, parameters, response.getOutputStream());
    }
}
