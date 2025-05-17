import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professionals',
  standalone: true,
  templateUrl: './professionals.component.html',
  styleUrls: ['./professionals.component.css']
})
export class ProfessionalsComponent {
  constructor(private router: Router) {}

  navigateTo(page: string, id?: string): void {
    if (id) {
      this.router.navigate([page, id]);
    } else {
      this.router.navigate([page]);
    }
  }
}
