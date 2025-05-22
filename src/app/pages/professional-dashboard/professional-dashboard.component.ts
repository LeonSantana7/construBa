import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequest, ServiceRequestService } from '../../services/service-request.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface PortfolioItem {
  title: string;
  imageUrl: string;
}

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professional-dashboard.component.html',
  styleUrls: ['./professional-dashboard.component.css']
})
export class ProfessionalDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'solicitacoes' | 'portfolio' = 'solicitacoes';
  serviceRequests: ServiceRequest[] = [];
  portfolio: PortfolioItem[] = [];
  subscription!: Subscription;

  newPortfolioTitle: string = '';
  newPortfolioImageUrl: string = '';

  constructor(private serviceRequestService: ServiceRequestService) {}

  ngOnInit(): void {
    this.subscription = this.serviceRequestService.getRequests().subscribe(requests => {
      this.serviceRequests = requests.filter(r => r.status === 'Pendente');
    });

    this.portfolio = [];
  }

  setActiveTab(tab: 'solicitacoes' | 'portfolio'): void {
    this.activeTab = tab;
  }

  aceitarSolicitacao(id: string | undefined): void {
    if (!id) return;

    const request = this.serviceRequests.find(r => r.id === id);
    if (request && request.status === 'Pendente') {
      // Atualiza o objeto com status literal correto
      const updated: ServiceRequest = {
        ...request,
        status: 'Aprovado',           // <-- Aqui status é literal do tipo permitido
        profissional: 'Profissional Teste'
      };
      this.serviceRequestService.updateRequest(updated)
        .then(() => alert(`Solicitação ID ${id} aceita com sucesso!`))
        .catch(err => alert('Erro ao aceitar solicitação: ' + err));
    }
  }

  addPortfolioItem(): void {
    if (this.newPortfolioTitle && this.newPortfolioImageUrl) {
      this.portfolio.push({
        title: this.newPortfolioTitle,
        imageUrl: this.newPortfolioImageUrl
      });
      this.newPortfolioTitle = '';
      this.newPortfolioImageUrl = '';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
