import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  
  constructor(private router: Router, private authService: AuthService) {}
  
  ngOnInit(): void {
 
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
   
      let role: 'cliente' | 'profissional' = email === 'profissional@default.com' ? 'profissional' : 'cliente';
      if (this.authService.login(email, password, role)) {
        if (role === 'cliente') {
          this.router.navigate(['/cliente-dashboard']);
        } else {
          this.router.navigate(['/professional-dashboard']);
        }
      } else {
        alert('Credenciais incorretas. Verifique seu email e senha.');
      }
    }
  }
  
  navigateTo(page: string): void {
    this.router.navigate([page]);
  }
}
