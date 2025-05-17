import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  email: string;
  role: 'cliente' | 'profissional';
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  user$ = this.userSubject.asObservable();

  login(email: string, password: string, role: 'cliente' | 'profissional'): boolean {
    // Para simplificar, usamos as credenciais padrão se não houver usuário salvo
    // Em produção, você faria uma chamada ao backend
    let user: User | null = null;
    if (role === 'cliente' && email === 'cliente@default.com' && password === '123456') {
      user = { email, role, name: 'Cliente Teste' };
    } else if (role === 'profissional' && email === 'profissional@default.com' && password === '123456') {
      user = { email, role, name: 'Profissional Teste' };
    } else {
      // Se o usuário foi cadastrado, recupere do localStorage
      user = this.getUserFromLocalStorage();
      if (user && user.email === email && password === '123456') {
        // Para teste, usamos senha fixa 123456 para usuários cadastrados
      } else {
        user = null;
      }
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
