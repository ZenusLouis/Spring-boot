import { Component, OnInit } from '@angular/core';
import { ProcessService } from '../../services/process.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-process-control',
  templateUrl: './process-control.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ProcessControlComponent implements OnInit {

  tasks: any[] = [];
  orderAmount!: number;

  constructor(private processService: ProcessService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  startProcess(): void {
    this.processService.startProcess(this.orderAmount).subscribe(response => {
      console.log('Process started:', response);
      this.loadTasks();
    });
  }

  loadTasks(): void {
    this.processService.getTasks().subscribe(data => {
      try {
        this.tasks = JSON.parse(data);
      } catch (e) {
        this.tasks = data;
      }
    });
  }

  completeTask(taskId: string): void {
    this.processService.completeTask(taskId, {}).subscribe(response => {
      console.log('Task completed:', response);
      this.loadTasks();
    });
  }
}
