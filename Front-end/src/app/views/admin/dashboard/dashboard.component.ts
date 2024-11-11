import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DashboardComponent implements OnInit {
  productCount: number = 0;
  categoryCount: number = 0;
  income: number = 0;
  animatedProductCount = 0;
  animatedCategoryCount = 0;
  animatedIncome = 0;
  orderCountByStatus = { PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };

  @ViewChild('myChart') myChart!: ElementRef;
  chart: any;

  viewType: string = 'year';
  selectedMonth: string = 'January';
  selectedQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q1';

  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadChartData();
  }

  loadStatistics(): void {
    this.dashboardService.getStatistics().subscribe((data) => {
      this.productCount = data.productCount;
      this.categoryCount = data.categoryCount;
      this.income = data.income;
      this.orderCountByStatus = {
        PENDING: data.pendingOrders,
        SHIPPED: data.shippedOrders,
        DELIVERED: data.deliveredOrders,
        CANCELLED: data.cancelledOrders,
      };
      this.animateValue('animatedProductCount', this.productCount);
      this.animateValue('animatedCategoryCount', this.categoryCount);
      this.animateValue('animatedIncome', this.income);
    });
  }

  convertMonthToNumber(monthName: string): number {
    return this.monthNames.indexOf(monthName) + 1;
  }

  onViewTypeChange(): void {
    if (this.viewType === 'year') {
      this.selectedMonth = 'January';
      this.selectedQuarter = 'Q1';
    } else if (this.viewType === 'quarter') {
      this.selectedQuarter = 'Q1';
    } else if (this.viewType === 'month') {
      this.selectedMonth = 'January';
    }
    this.loadChartData();
  }

  loadChartData(): void {
    const viewType = this.viewType;
    let month: string | undefined;
    let quarter: string | undefined;
    if (viewType === 'month') {
      month = this.convertMonthToNumber(this.selectedMonth).toString();
    } else if (viewType === 'quarter') {
      quarter = this.selectedQuarter;
    }

    this.dashboardService.getCharts(viewType, month, quarter).subscribe((data) => {

      if (viewType === 'year') {
        const monthlyIncome = this.monthNames.map(month =>
          data.monthlyIncome && data.monthlyIncome[month] ? data.monthlyIncome[month] : 0
        );
        this.renderChart(this.monthNames.map(m => m.substring(0, 3)), monthlyIncome);
      } else if (viewType === 'quarter') {
        const quarterlyData = this.formatQuarterlyData(data);
        this.renderChart(this.getQuarterMonths(this.selectedQuarter), quarterlyData);
      } else if (viewType === 'month') {
        const dailyData = this.formatDailyData(data);
        this.renderChart(Object.keys(dailyData), Object.values(dailyData));
      }
    });
  }

  renderChart(labels: string[], data: number[]): void {
    if (this.chart) {
      this.chart.destroy();
    }

    // Create gradient color for bars
    const ctx = this.myChart.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');

    this.chart = new Chart(this.myChart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: data,
            backgroundColor: gradient,
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: { topLeft: 12, topRight: 12 },
            barThickness: 20,
            hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
            hoverBorderColor: 'rgba(99, 102, 241, 1)',
            hoverBorderWidth: 1,
            borderSkipped: 'bottom',
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          onComplete: () => {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
          },
          delay: (context) => context.dataIndex * 100,
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50,
              font: {
                size: 12,
                family: 'Arial, sans-serif',
                weight: 'normal',
              },
              color: '#666',
            },
            grid: {
              color: '#e5e5e5',
            },
          },
          x: {
            ticks: {
              font: {
                size: 14,
                family: 'Arial, sans-serif',
                weight: 'normal',
              },
              color: '#666',
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(99, 102, 241, 0.9)',
            titleFont: {
              size: 14,
              family: 'Arial, sans-serif',
              weight: 'bold',
            },
            bodyFont: {
              size: 14,
              family: 'Arial, sans-serif',
            },
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
              },
            },
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    });
  }


  formatDailyData(data: any): { [key: string]: number } {
    const dailyIncome = data.dailyIncome || {};
    const formattedData: { [key: string]: number } = {};
    const days = this.getDaysInMonth(this.selectedMonth);
    days.forEach(day => {
      formattedData[day] = dailyIncome[day] ? (dailyIncome[day] as number) : 0;
    });

    return formattedData;
  }

  getDaysInMonth(month: string): string[] {
    const monthIndex = this.convertMonthToNumber(month) - 1;
    const date = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    const days = Array.from({ length: date.getDate() }, (_, i) => `Day ${i + 1}`);
    return days;
  }


  formatYearlyData(data: any): number[] {
    return this.monthNames.map((month) => (data.monthlyIncome[month] || 0));
  }

  formatQuarterlyData(data: any): number[] {
    const quarters: { Q1: number[]; Q2: number[]; Q3: number[]; Q4: number[] } = {
      Q1: [0, 1, 2],
      Q2: [3, 4, 5],
      Q3: [6, 7, 8],
      Q4: [9, 10, 11]
    };
    const months = quarters[this.selectedQuarter] || [];
    return months.map((index) => data.monthlyIncome ? data.monthlyIncome[this.monthNames[index]] : 0);
  }
  getQuarterMonths(quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'): string[] {
    const quarters = {
      Q1: ['Jan', 'Feb', 'Mar'],
      Q2: ['Apr', 'May', 'Jun'],
      Q3: ['Jul', 'Aug', 'Sep'],
      Q4: ['Oct', 'Nov', 'Dec']
    };
    return quarters[quarter];
  }

  animateValue(property: keyof this, endValue: number): void {
    const startValue = 0;
    const duration = 1500;
    const tween = new Tween({ value: startValue })
      .to({ value: endValue }, duration)
      .easing(Easing.Quadratic.Out)
      .onUpdate((object) => {
        (this as any)[property] = Math.floor(object.value);
      })
      .start();

    function animate(time: number) {
      requestAnimationFrame(animate);
      tween.update(time);
    }

    requestAnimationFrame(animate);
  }
}
