package com.example.keycloak.controller;

import com.example.keycloak.entity.Product;
import com.example.keycloak.service.ProductService;
import com.example.keycloak.util.FileTypeValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    private static final String UPLOAD_DIR = "uploads/products/";

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getProductsSortedByCreatedDate();
    }

    // Get a product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // Create a new product with an image
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestPart("product") String productJson,
                                                 @RequestPart("file") MultipartFile file) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = objectMapper.readValue(productJson, Product.class);
        String fileName = productService.handleFileUpload(file, UPLOAD_DIR);
        product.setPro_image(fileName);

        Product newProduct = productService.createProduct(product);
        return ResponseEntity.ok(newProduct);
    }

    // Update an existing product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @RequestPart("product") String productJson,
                                                 @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product productDetails = objectMapper.readValue(productJson, Product.class);

        if (file != null && !file.isEmpty()) {
            String fileName = productService.handleFileUpload(file, UPLOAD_DIR);
            productDetails.setPro_image(fileName);
        }

        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }

    // Delete a product
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteProduct(@PathVariable Long id) throws IOException {
        productService.deleteProduct(id, UPLOAD_DIR);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    // Import products from an Excel file
    @PostMapping("/import")
    public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            FileTypeValidator.validateExcelOrSvgFile(file);
            productService.importProducts(file);
            return ResponseEntity.ok("Products imported successfully.");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error importing products", e);
        }
    }
}
