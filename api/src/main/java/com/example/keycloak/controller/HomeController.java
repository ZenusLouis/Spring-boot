package com.example.keycloak.controller;

import com.example.keycloak.dto.ProductDTO;
import com.example.keycloak.service.HomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class HomeController {
    @Autowired
    private HomeService homeService;

    @GetMapping("/newest")
    public List<ProductDTO> getNewestProducts() {
        return homeService.getNewestProducts();
    }

    @GetMapping("/best-sellers")
    public List<ProductDTO> getBestSellers() {
        return homeService.getBestSellers();
    }
}
