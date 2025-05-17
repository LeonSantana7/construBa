import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  addNotification(message: string): void {
    const current = this.notificationsSubject.getValue();
    current.push({ message, timestamp: new Date() });
    this.notificationsSubject.next(current);
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }
}
