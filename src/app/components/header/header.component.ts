import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router'; 
import { CommonModule, Location } from '@angular/common';
import * as feather from 'feather-icons';
import { AuthService, User } from '../../services/auth.service.service'; 
import { NotificationService, Notification } from '../../services/notification.service.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports:[CommonModule, RouterModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  user: User | null = null; 
  notifications: Notification[] = [];
  headerTitle = 'ConstruBA';
  isDashboard = false;  

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe( 
      takeUntil(this.destroy$)
    ).subscribe((currentUser: User | null) => { 
      this.user = currentUser;
    });

    this.notificationService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(n => (this.notifications = n));

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => { 
      const typedEvent = event as NavigationEnd;
      const url = typedEvent.urlAfterRedirects;
      this.isDashboard = url.includes('dashboard') || url.includes('detail');
    });
  }

  navigateTo(page: string, id?: string): void {
    if (id) { this.router.navigate([page, id]); }
    else { this.router.navigate([page]); }
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }

  goBack(): void { this.location.back(); }
  clearNotifications(): void { this.notificationService.clearNotifications(); }
  ngAfterViewInit(): void { feather.replace(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}