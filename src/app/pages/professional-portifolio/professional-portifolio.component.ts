// src/app/pages/professional-portifolio/professional-portifolio.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { PortfolioItem, ServiceRequestService } from '../../services/service-request.service';
import { AuthService } from '../../services/auth.service.service';
import { take, switchMap, catchError } from 'rxjs/operators'; // Adicionado catchError
import { ActivatedRoute } from '@angular/router'; // Para obter o ID da rota

@Component({
  selector: 'app-professional-portifolio', // Mantido com 'i'
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // Necessário para o formulário de contato
  ],
  templateUrl: './professional-portifolio.component.html', // Mantido com 'i'
  styleUrls: ['./professional-portifolio.component.css'] // Mantido com 'i'
})
export class ProfessionalPortifolioComponent implements OnInit { // Nome da classe mantido com 'i'
  portfolioItems$: Observable<PortfolioItem[]> | null = null;
  contactForm!: FormGroup;
  professionalId: string | null = null; // Para armazenar o ID do profissional da rota

  constructor(
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService,
    private route: ActivatedRoute // Injeta ActivatedRoute para ler parâmetros da URL
  ) {}

  ngOnInit(): void {
    this.initContactForm();
    // Obtém o ID do profissional da URL (por exemplo, professional-portfolio/SEU_ID_AQUI)
    this.professionalId = this.route.snapshot.paramMap.get('id');
    this.loadPortfolioItems();
  }

  private initContactForm(): void {
    this.contactForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
    });
  }

  private loadPortfolioItems(): void {
    if (this.professionalId) {
      // Carrega os itens do portfólio para o ID do profissional obtido da rota
      this.portfolioItems$ = this.serviceRequestService.getPortfolioForProfessional(this.professionalId).pipe(
        catchError(err => {
          console.error('Erro ao carregar portfólio do profissional:', err);
          // Você pode adicionar uma mensagem de feedback na UI aqui, se desejar
          return of([]); // Retorna um Observable vazio em caso de erro
        })
      );
    } else {
      console.warn('ID do profissional não encontrado na rota para carregar o portfólio.');
      this.portfolioItems$ = of([]); // Retorna um Observable vazio se o ID for nulo
    }
  }

  sendContactMessage(): void {
    if (this.contactForm.valid) {
      console.log('Mensagem de contato enviada:', this.contactForm.value);
      // **AQUI você implementaria a lógica para enviar a mensagem**,
      // por exemplo, chamando um método no serviceRequestService
      // this.serviceRequestService.enviarMensagemContato(this.professionalId, this.contactForm.value);
      this.contactForm.reset();
      alert('Mensagem enviada com sucesso!'); // Feedback simples. Melhore com um modal ou toast!
    } else {
      console.warn('Formulário de contato inválido.');
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }
}