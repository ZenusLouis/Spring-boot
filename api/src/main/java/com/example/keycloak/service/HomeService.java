package com.example.keycloak.service;

import com.example.keycloak.dto.ProductDTO;
import com.example.keycloak.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HomeService {

    @Autowired
    private ProductRepository productRepository;

    public List<ProductDTO> getNewestProducts() {
        return productRepository.findTop4ByOrderByCreatedAtDesc().stream().map(product ->
                new ProductDTO(
                        product.getPro_id(),
                        product.getPro_name(),
                        product.getPro_des(),
                        product.getPro_image(),
                        product.getPro_price(),
                        product.getCategory().getCate_name()
                )).collect(Collectors.toList());
    }

    public List<ProductDTO> getBestSellers() {
        return productRepository.findTopBestSellers(PageRequest.of(0, 4)).stream().map(product ->
                new ProductDTO(
                        product.getPro_id(),
                        product.getPro_name(),
                        product.getPro_des(),
                        product.getPro_image(),
                        product.getPro_price(),
                        product.getCategory().getCate_name()
                )).collect(Collectors.toList());
    }
}

