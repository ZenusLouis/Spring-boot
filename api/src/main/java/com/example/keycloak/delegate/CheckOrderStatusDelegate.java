package com.example.keycloak.delegate;

import com.example.keycloak.service.OrderService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("checkOrderStatusDelegate")
public class CheckOrderStatusDelegate implements JavaDelegate {

    @Autowired
    private OrderService orderService;

    @Override
    public void execute(DelegateExecution execution) {
        Long orderId = (Long) execution.getVariable("orderId");
        String status = orderService.getOrderById(orderId).getStatus();
        execution.setVariable("orderStatus", status);
    }
}
