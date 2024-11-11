package com.example.keycloak.delegate;

import com.example.keycloak.dto.CartItem;
import com.example.keycloak.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("confirmCartAndCheckoutDelegate")
public class ConfirmCartAndCheckoutDelegate implements JavaDelegate {

    @Autowired
    private OrderService orderService;

    private final HttpSession session;

    public ConfirmCartAndCheckoutDelegate(HttpSession session) {
        this.session = session;
    }

    @Override
    public void execute(DelegateExecution execution) {
        Long userId = (Long) execution.getVariable("userId");
        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");

        boolean success = orderService.processOrder(userId, cartItems);

        if (success) {
            session.removeAttribute("cartItems");
            execution.setVariable("orderConfirmed", Boolean.TRUE);
        } else {
            execution.setVariable("orderConfirmed", Boolean.FALSE);
        }
        System.out.println("Order confirmed: " + (success ? "true" : "false"));
    }
}
