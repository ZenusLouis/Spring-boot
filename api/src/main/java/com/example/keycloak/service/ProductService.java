package com.example.keycloak.service;

import com.example.keycloak.entity.Category;
import com.example.keycloak.entity.Product;
import com.example.keycloak.exception.ResourceNotFoundException;
import com.example.keycloak.repository.CategoryRepository;
import com.example.keycloak.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ImportService importService;

    private static final String UPLOAD_DIR = "uploads/products/";

    // Fetch products sorted by creation date
    public List<Product> getProductsSortedByCreatedDate() {
        return productRepository.findAllByOrderByCreatedAtAsc();
    }

    // Fetch a product by ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found for this id :: " + id));
    }

    // Create a new product
    public Product createProduct(Product product) {
        Category category = validateCategory(product.getCategory().getCate_id());
        product.setCategory(category);
        return productRepository.save(product);
    }

    // Update a product
    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = getProductById(id);

        if (productDetails.getPro_name() != null) existingProduct.setPro_name(productDetails.getPro_name());
        if (productDetails.getPro_des() != null) existingProduct.setPro_des(productDetails.getPro_des());
        if (productDetails.getPro_price() != null) existingProduct.setPro_price(productDetails.getPro_price());
        if (productDetails.getPro_stock() != null) existingProduct.setPro_stock(productDetails.getPro_stock());
        if (productDetails.getPro_status() != null) existingProduct.setPro_status(productDetails.getPro_status());

        // Handle image update and delete old image
        if (productDetails.getPro_image() != null && !productDetails.getPro_image().isEmpty()) {
            String oldImagePath = existingProduct.getPro_image();
            existingProduct.setPro_image(productDetails.getPro_image());

            if (oldImagePath != null && !oldImagePath.isEmpty()) {
                deleteFile(UPLOAD_DIR + oldImagePath);
            }
        }

        // Validate category and update
        Category category = validateCategory(productDetails.getCategory().getCate_id());
        existingProduct.setCategory(category);

        return productRepository.save(existingProduct);
    }

    // Handle file upload
    public String handleFileUpload(MultipartFile file, String uploadDir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        return fileName;
    }

    // Delete a file
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                System.out.println("Deleted file: " + filePath);
            } else {
                System.err.println("File not found: " + filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }

    // Delete a product
    public void deleteProduct(Long id, String uploadDir) {
        Product product = getProductById(id);
        if (product.getPro_image() != null && !product.getPro_image().isEmpty()) {
            deleteFile(uploadDir + product.getPro_image());
        }
        productRepository.delete(product);
    }

    // Import products from Excel file
    public void importProducts(MultipartFile file) throws IOException {
        importService.importProductsFromExcel(file);
    }

    // Validate category existence
    private Category validateCategory(Long cateId) {
        return categoryRepository.findById(cateId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this id :: " + cateId));
    }
}
