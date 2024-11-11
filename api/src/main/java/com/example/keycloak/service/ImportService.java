package com.example.keycloak.service;

import com.example.keycloak.entity.Category;
import com.example.keycloak.entity.Product;
import com.example.keycloak.repository.CategoryRepository;
import com.example.keycloak.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Iterator;
import java.util.Optional;

@Service
public class ImportService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public void importProductsFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0); // Get the first sheet
            Iterator<Row> rows = sheet.iterator();

            // Skip the header row
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row row = rows.next();

                Product product = new Product();
                product.setPro_name(row.getCell(0).getStringCellValue());
                product.setPro_des(row.getCell(1).getStringCellValue());
                product.setPro_image(row.getCell(2).getStringCellValue());
                product.setPro_stock((int) row.getCell(3).getNumericCellValue());
                product.setPro_price(row.getCell(4).getNumericCellValue());
                product.setPro_status((int) row.getCell(5).getNumericCellValue());

                // Fetch Category by ID (in column 6)
                Long categoryId = (long) row.getCell(6).getNumericCellValue();
                Optional<Category> category = categoryRepository.findById(categoryId);
                category.ifPresent(product::setCategory);

                productRepository.save(product);
            }
        }
    }
}
