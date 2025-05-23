import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service.service';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  errorMessage = '';
  showPassword = false;
  private loginErrorModal: Modal | null = null;

  @ViewChild('errorModal') errorModalElementRef!: ElementRef;

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

    // Removido o cálculo da força da senha
  }

  ngAfterViewInit(): void {
    if (this.errorModalElementRef) {
      this.loginErrorModal = new Modal(this.errorModalElementRef.nativeElement);
    } else {
      console.warn('LoginComponent: Modal element with ID "errorModal" not found.');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) return;

    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    try {
      const success = await this.authService.login(email, password);

      if (!success) {
        this.errorMessage = 'E-mail ou senha incorretos.';
        this.showErrorModal();
        return;
      }

      const auth = getAuth();
      const fbUser = auth.currentUser;

      if (!fbUser) {
        this.errorMessage = 'Usuário não encontrado após login.';
        this.showErrorModal();
        return;
      }

      const ref = doc(this.authService['firestore'], 'users', fbUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        this.errorMessage = 'Sua conta de usuário não foi encontrada no banco de dados. Contate o suporte.';
        this.showErrorModal();
        await this.authService.logout();
        return;
      }

      const userData = snap.data() as { role: 'cliente' | 'profissional' };

      if (userData.role === 'profissional') {
        this.router.navigate(['/professional-dashboard']);
      } else {
        this.router.navigate(['/cliente-dashboard']);
      }

    } catch (error: any) {
      console.error('Erro durante o login:', error);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        this.errorMessage = 'E-mail ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Formato de e-mail inválido.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Muitas tentativas. Tente mais tarde.';
      } else {
        this.errorMessage = 'Erro inesperado. Tente novamente.';
      }
      this.showErrorModal();
    }
  }

  showErrorModal(): void {
    if (this.loginErrorModal) {
      this.loginErrorModal.show();
    } else {
      alert(this.errorMessage);
    }
  }

  hideErrorModal(): void {
    if (this.loginErrorModal) {
      this.loginErrorModal.hide();
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
