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
import { AuthService } from '../../services/auth.service.service';
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

  async onSubmit(): Promise<void> {
    if (!this.cadastroForm.valid) return;

    const { nome, email, password, role } = this.cadastroForm.value;

    // Chama signup com 4 argumentos
    const success = await this.authService.signup(email, password, nome, role);

    if (success) {
      this.router.navigate([role === 'cliente' ? '/cliente-dashboard' : '/professional-dashboard']);
    } else {
      alert('Erro ao criar conta. Tente novamente.');
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
