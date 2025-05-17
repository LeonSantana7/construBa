import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateTo(page: string, id?: string): void {
    if (id) {
      this.router.navigate([page, id]);
    } else {
      this.router.navigate([page]);
    }
  }
}
