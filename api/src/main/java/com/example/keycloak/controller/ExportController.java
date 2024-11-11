package com.example.keycloak.controller;

import com.example.keycloak.service.ExportService;
import net.sf.jasperreports.engine.JRException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

@RestController
@RequestMapping("/api/reports")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @GetMapping("/products/pdf")
    public void exportProductsToPdf(HttpServletResponse response) throws JRException, IOException, SQLException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=products.pdf");
        exportService.exportReportToPdf(response.getOutputStream());
    }

    @GetMapping("/products/excel")
    public void exportProductsToExcel(HttpServletResponse response) throws JRException, IOException, SQLException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=products.xlsx");// Default for file name
        exportService.exportReportToExcel(response.getOutputStream());
    }
}
