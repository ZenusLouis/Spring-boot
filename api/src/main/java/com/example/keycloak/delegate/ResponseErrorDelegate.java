package com.example.keycloak.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Service;

@Service("responseErrorDelegate")
public class ResponseErrorDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        String errorMessage = "Lỗi trong quá trình thanh toán. Vui lòng thử lại sau.";

        // Đặt thông tin lỗi vào biến quy trình để xử lý sau hoặc ghi log
        execution.setVariable("error", true);
        execution.setVariable("errorMessage", errorMessage);

        // Bạn cũng có thể ghi log hoặc thông báo lỗi tại đây nếu cần thiết
        System.out.println("Error occurred during checkout process: " + errorMessage);
    }
}
