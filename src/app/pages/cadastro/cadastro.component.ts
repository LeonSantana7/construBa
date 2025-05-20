import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;
  showTermsModal = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.cadastroForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required),
      role: new FormControl('cliente', Validators.required),
      termos: new FormControl(false, Validators.requiredTrue)
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  };

  onSubmit(): void {
    if (!this.cadastroForm.valid) return;

    const newUser: User = {
      email: this.cadastroForm.value.email,
      role: this.cadastroForm.value.role,
      name: this.cadastroForm.value.nome
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    this.authService.login(newUser.email, this.cadastroForm.value.password, newUser.role);

    if (newUser.role === 'cliente') {
      this.router.navigate(['/cliente-dashboard']);
    } else {
      this.router.navigate(['/professional-dashboard']);
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }

  openTermsModal(event: Event): void {
    event.preventDefault();
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }
}
