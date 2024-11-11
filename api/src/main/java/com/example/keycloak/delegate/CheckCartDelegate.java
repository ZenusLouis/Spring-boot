package com.example.keycloak.delegate;

import com.example.keycloak.dto.CartItem;
import com.example.keycloak.service.CartService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("checkCartDelegate")
public class CheckCartDelegate implements JavaDelegate {

    @Autowired
    private CartService cartService;

    @Override
    public void execute(DelegateExecution execution) {
        List<CartItem> cartItems = (List<CartItem>) execution.getVariable("cartItems");
        boolean isValid = cartService.validateCart(cartItems);
        execution.setVariable("isCartValid", isValid);
    }
}
