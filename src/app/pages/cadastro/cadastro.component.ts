import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.cadastroForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
      role: new FormControl('cliente', Validators.required)  
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.cadastroForm.valid) {
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
  }

  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
