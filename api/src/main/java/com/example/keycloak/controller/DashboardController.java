package com.example.keycloak.controller;

import com.example.keycloak.repository.OrderRepository;
import com.example.keycloak.service.DashboardService;
import com.example.keycloak.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderService orderService;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStatistics() {
        return dashboardService.getDashboardStatistics();
    }

    @GetMapping("/chart")
    public Map<String, Object> getDashboardCharts(
            @RequestParam String viewType,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String quarter
    ) {
        Map<String, Object> stats = new HashMap<>();

        switch (viewType) {
            case "year":
                stats.put("monthlyIncome", getMonthlyIncome());
                break;
            case "quarter":
                if (quarter != null) {
                    Integer quarterNumber = convertQuarterToNumber(quarter);
                    if (quarterNumber != null) {
                        stats.put("monthlyIncome", getMonthlyIncomeByQuarter(quarterNumber));
                    } else {
                        throw new IllegalArgumentException("Invalid quarter");
                    }
                }
                break;
            case "month":
                if (month != null) {
                    System.out.println("Calling getDailyIncomeInMonth with month: " + month);
                    stats.put("dailyIncome", getDailyIncomeInMonth(month));
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid viewType");
        }

        return stats;
    }

    private Integer convertMonthToNumber(String monthName) {
        Map<String, Integer> monthMap = new HashMap<>();
        monthMap.put("January", 1);
        monthMap.put("February", 2);
        monthMap.put("March", 3);
        monthMap.put("April", 4);
        monthMap.put("May", 5);
        monthMap.put("June", 6);
        monthMap.put("July", 7);
        monthMap.put("August", 8);
        monthMap.put("September", 9);
        monthMap.put("October", 10);
        monthMap.put("November", 11);
        monthMap.put("December", 12);

        return monthMap.getOrDefault(monthName, null);
    }

    private Integer convertQuarterToNumber(String quarter) {
        Map<String, Integer> quarterMap = new HashMap<>();
        quarterMap.put("Q1", 1);
        quarterMap.put("Q2", 2);
        quarterMap.put("Q3", 3);
        quarterMap.put("Q4", 4);
        return quarterMap.getOrDefault(quarter, null);
    }

    private Map<String, Integer> getMonthlyIncome() {
        List<Map<String, Object>> monthlyIncomeData = orderRepository.calculateMonthlyIncome();
        Map<String, Integer> monthlyIncome = new HashMap<>();
        String[] monthNames = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Map<String, Object> row : monthlyIncomeData) {
            int month = ((Number) row.get("month")).intValue() - 1;
            BigDecimal income = (BigDecimal) row.get("totalIncome");
            monthlyIncome.put(monthNames[month], income != null ? income.intValue() : 0);
        }

        return monthlyIncome;
    }

    private Map<String, Integer> getMonthlyIncomeByQuarter(int quarter) {
        List<Map<String, Object>> monthlyIncomeData = orderRepository.calculateMonthlyIncome();
        Map<String, Integer> monthlyIncome = new HashMap<>();

        int startMonth = (quarter - 1) * 3 + 1;
        int endMonth = startMonth + 2;

        String[] monthNames = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Map<String, Object> row : monthlyIncomeData) {
            int month = ((Number) row.get("month")).intValue();
            if (month >= startMonth && month <= endMonth) {
                BigDecimal income = (BigDecimal) row.get("totalIncome");
                monthlyIncome.put(monthNames[month - 1], income != null ? income.intValue() : 0);
            }
        }
        return monthlyIncome;
    }

    private Map<String, Integer> getDailyIncomeInMonth(int month) {
        List<Map<String, Object>> dailyIncomeData = orderRepository.calculateDailyIncomeInMonth(month);
        Map<String, Integer> dailyIncome = new HashMap<>();

        for (Map<String, Object> row : dailyIncomeData) {
            String day = "Day " + row.get("day").toString();
            BigDecimal income = (BigDecimal) row.get("totalIncome");
            dailyIncome.put(day, income != null ? income.intValue() : 0);
        }

        return dailyIncome;
    }


    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProductsByOrderCount() {
        List<Map<String, Object>> topProducts = orderService.getTopProductsByOrderCount();
        return ResponseEntity.ok(topProducts);
    }
}
