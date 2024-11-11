package com.example.keycloak.delegate;

import com.example.keycloak.dto.CartItem;
import jakarta.servlet.http.HttpSession;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("addToCartDelegate")
public class AddToCartDelegate implements JavaDelegate {

    private final HttpSession session;

    public AddToCartDelegate(HttpSession session) {
        this.session = session;
    }

    @Override
    public void execute(DelegateExecution execution) {
        Long productId = (Long) execution.getVariable("productId");
        int quantity = (Integer) execution.getVariable("quantity");
        double price = (Double) execution.getVariable("price");

        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");
        if (cartItems == null) {
            cartItems = new ArrayList<>();
        }
        cartItems.add(new CartItem(productId, quantity, price));
        session.setAttribute("cartItems", cartItems);
        execution.setVariable("cartUpdated", true);
    }
}
