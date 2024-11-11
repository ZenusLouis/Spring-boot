package com.example.keycloak.delegate;

import com.example.keycloak.service.OrderService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("userConfirmStatusDeliveredDelegate")
public class UserConfirmStatusDeliveredDelegate implements JavaDelegate {

    @Autowired
    private OrderService orderService;

    @Override
    public void execute(DelegateExecution execution) {
        Long orderId = (Long) execution.getVariable("orderId");
        try {
            orderService.updateOrderStatus(orderId, "DELIVERED");
            execution.setVariable("orderDeliveredConfirmed", true);
            System.out.println("Order ID " + orderId + " has been updated to Delivered.");
        } catch (Exception e) {
            execution.setVariable("orderDeliveredConfirmed", false);
            System.err.println("Failed to update order ID " + orderId + " to Delivered.");
            e.printStackTrace();
        }
    }
}
