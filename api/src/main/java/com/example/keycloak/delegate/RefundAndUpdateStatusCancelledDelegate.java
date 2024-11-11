package com.example.keycloak.delegate;

import com.example.keycloak.service.OrderService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("refundAndUpdateStatusCancelledDelegate")
public class RefundAndUpdateStatusCancelledDelegate implements JavaDelegate {

    @Autowired
    private OrderService orderService;

    @Override
    public void execute(DelegateExecution execution) {
        Long orderId = (Long) execution.getVariable("orderId");

        orderService.updateOrderStatus(orderId, "CANCELLED");
        execution.setVariable("orderCancelled", true);
    }
}
