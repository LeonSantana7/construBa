import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // Define role para navegação
      const role: 'cliente' | 'profissional' = email === 'profissional@default.com' ? 'profissional' : 'cliente';

      // Chama login só com email e password
      const success = await this.authService.login(email, password);

      if (success) {
        this.router.navigate([role === 'cliente' ? '/cliente-dashboard' : '/professional-dashboard']);
      } else {
        alert('Credenciais incorretas. Verifique seu email e senha.');
      }
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
