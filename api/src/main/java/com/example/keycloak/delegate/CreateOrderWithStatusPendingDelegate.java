package com.example.keycloak.delegate;

import com.example.keycloak.service.OrderService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("createOrderWithStatusPendingDelegate")
public class CreateOrderWithStatusPendingDelegate implements JavaDelegate {

    @Autowired
    private OrderService orderService;

    @Override
    public void execute(DelegateExecution execution) {
        Long orderId = (Long) execution.getVariable("orderId");
        orderService.updateOrderStatus(orderId, "PENDING");
        execution.setVariable("orderStatusPending", true);
    }
}
