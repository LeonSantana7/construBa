import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service.service';
import { firstValueFrom } from 'rxjs';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

 async onSubmit(): Promise<void> {
  if (!this.loginForm.valid) return;

  this.errorMessage = '';
  const { email, password } = this.loginForm.value;

  const success = await this.authService.login(email, password);

  if (!success) {
    this.errorMessage = 'E-mail ou senha incorretos.';
    return;
  }

  try {
    const auth = getAuth();
    const fbUser = auth.currentUser;

    if (!fbUser) {
      this.errorMessage = 'Usuário não encontrado após login.';
      return;
    }

    const ref = doc(this.authService['firestore'], 'users', fbUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      this.errorMessage = 'Dados de usuário não encontrados no Firestore.';
      return;
    }

    const userData = snap.data() as { role: 'cliente' | 'profissional' };

    if (userData.role === 'profissional') {
      this.router.navigate(['/professional-dashboard']);
    } else {
      this.router.navigate(['/cliente-dashboard']);
    }

  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
    this.errorMessage = 'Erro ao recuperar dados do usuário.';
  }
}

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
