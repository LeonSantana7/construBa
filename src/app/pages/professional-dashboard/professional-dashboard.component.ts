import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequest, ServiceRequestService } from '../../services/service-request.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface PortfolioItem {
  title: string;
  imageUrl: string;
}

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professional-dashboard.component.html',
  styleUrls: ['./professional-dashboard.component.css']
})
export class ProfessionalDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'solicitacoes' | 'portifolio' = 'solicitacoes';
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

    this.portfolio = [
      
      
    ];
  }

  setActiveTab(tab: 'solicitacoes' | 'portifolio'): void {
    this.activeTab = tab;
  }

  aceitarSolicitacao(id: number): void {
    const request = this.serviceRequests.find(r => r.id === id);
    if (request && request.status === 'Pendente') {
      request.status = 'Aprovado';
      request.profissional = 'Profissional Teste';
      this.serviceRequestService.updateRequest(request);
      alert(`Solicitação ID ${id} aceita com sucesso!`);
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
