import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var bootstrap: any; 

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  navigateTo(page: string, id?: string): void {
    if (id) {
      this.router.navigate([page, id]);
    } else {
      this.router.navigate([page]);
    }
  }

  ngOnInit(): void {
    let carousel = new bootstrap.Carousel(document.getElementById('heroCarousel'), {
      interval: 2000, 
      wrap: true
    });
    carousel.to(0);
  }
}
