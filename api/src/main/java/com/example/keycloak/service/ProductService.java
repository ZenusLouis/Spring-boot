package com.example.keycloak.service;

import com.example.keycloak.entity.Category;
import com.example.keycloak.entity.Product;
import com.example.keycloak.exception.ResourceNotFoundException;
import com.example.keycloak.repository.CategoryRepository;
import com.example.keycloak.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ImportService importService;

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

    // Update product details
    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = getProductById(id);

        if (productDetails.getPro_name() != null) existingProduct.setPro_name(productDetails.getPro_name());
        if (productDetails.getPro_des() != null) existingProduct.setPro_des(productDetails.getPro_des());
        if (productDetails.getPro_price() != null) existingProduct.setPro_price(productDetails.getPro_price());
        if (productDetails.getPro_stock() != null) existingProduct.setPro_stock(productDetails.getPro_stock());
        if (productDetails.getPro_status() != null) existingProduct.setPro_status(productDetails.getPro_status());

        if (productDetails.getPro_image() != null) {
            deleteFile(existingProduct.getPro_image());
            existingProduct.setPro_image(productDetails.getPro_image());
        }

        Category category = validateCategory(productDetails.getCategory().getCate_id());
        existingProduct.setCategory(category);
        return productRepository.save(existingProduct);
    }

    // Delete a product and its associated image
    public void deleteProduct(Long id, String uploadDir) {
        Product product = getProductById(id);
        if (product.getPro_image() != null) {
            deleteFile(Paths.get(uploadDir, product.getPro_image()).toString());
        }
        productRepository.delete(product);
    }

    // Import products from Excel file
    public void importProducts(MultipartFile file) throws IOException {
        importService.importProductsFromExcel(file);
    }

    // Handle file upload
    public String handleFileUpload(MultipartFile file, String uploadDir) throws IOException {
        if (!file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir, fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            return fileName;
        }
        return null;
    }

    // Validate category existence
    private Category validateCategory(Long cateId) {
        return categoryRepository.findById(cateId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for this id :: " + cateId));
    }

    // Utility to delete a file
    private void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }
}
