import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService, PortfolioItem } from '../../services/portfolio-data.service.service';
import { Observable } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-professional-portfolio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './professional-portifolio.component.html',
  styleUrls: ['./professional-portifolio.component.css']
})
export class ProfessionalPortfolioComponent implements OnInit {
  portfolioItems$!: Observable<PortfolioItem[]>;
  

  contactForm!: FormGroup;

  constructor(private portfolioDataService: PortfolioDataService) {}

  ngOnInit(): void {
    this.portfolioItems$ = this.portfolioDataService.getPortfolioItems();


    this.contactForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
    });
  }

  sendContactMessage(): void {
    if (this.contactForm.valid) {
      // Simulação do envio
      console.log('Mensagem recebida:', this.contactForm.value);
      alert('Sua mensagem foi enviada! Em breve, o Profissional Teste entrará em contato.');
      this.contactForm.reset();
    }
  }
}
