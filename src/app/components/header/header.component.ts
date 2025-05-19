import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import * as feather from 'feather-icons';
import { AuthService, User } from '../../services/auth.service.service';
import { NotificationService, Notification } from '../../services/notification.service.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  user: User | null = null;
  notifications: Notification[] = [];
  headerTitle = 'ConstruBA';
  isDashboard = false;  

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.authService.user$.subscribe(u => (this.user = u));
    this.notificationService.notifications$.subscribe(n => (this.notifications = n));
  }

  ngOnInit(): void {

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url.includes('dashboard') || url.includes('detail')) {
        this.isDashboard = true;
      } else {
        this.isDashboard = false;
      }
    });
  }

  navigateTo(page: string, id?: string): void {
    if (id) {
      this.router.navigate([page, id]);
    } else {
      this.router.navigate([page]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.location.back();
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
  }

  ngAfterViewInit(): void {
    feather.replace();
  }
}