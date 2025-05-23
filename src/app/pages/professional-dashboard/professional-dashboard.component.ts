// src/app/pages/professional-dashboard/professional-dashboard.component.ts

import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequest, ServiceRequestService, PortfolioItem } from '../../services/service-request.service';
import { AuthService } from '../../services/auth.service.service';
import { User as FirebaseUser } from '@angular/fire/auth';
import { Subscription, of, combineLatest } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators'; // Adicionado 'map'
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Modal } from 'bootstrap';
import { Timestamp } from '@angular/fire/firestore';

type ProfessionalUpdatableStatus = 'Em Andamento' | 'Concluído' | 'Rejeitado' | 'Cancelado';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './professional-dashboard.component.html',
  styleUrls: ['./professional-dashboard.component.css']
})
export class ProfessionalDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  activeTab: 'servicos' | 'portfolio' = 'servicos';

  allServiceRequests: ServiceRequest[] = [];
  filteredServiceRequests: ServiceRequest[] = [];
  currentServiceFilter: string = 'Todos';

  portfolioItems: PortfolioItem[] = [];
  portfolioForm!: FormGroup;
  editingPortfolioItem: PortfolioItem | null = null;

  updateStatusForm!: FormGroup;
  requestToUpdate: ServiceRequest | null = null;

  private availabilityModalInstance: Modal | null = null;
  private updateStatusModalInstance: Modal | null = null;
  private portfolioModalInstance: Modal | null = null;
  private chatModalInstance: Modal | null = null;

  chatTargetRequest: ServiceRequest | null = null;
  newMessageProf: string = '';
  @ViewChild('chatMessagesContainerProf') private chatMessagesContainerProf!: ElementRef;

  private subscriptions = new Subscription();
  currentProfessionalUid: string | null = null;
  currentProfessionalName: string = 'Profissional';
  feedbackMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    this.initializeModal('availabilityModal', 'availabilityModalInstance');
    this.initializeModal('updateStatusModal', 'updateStatusModalInstance');
    this.initializeModal('portfolioModal', 'portfolioModalInstance');
    this.initializeModal('chatModalProf', 'chatModalInstance');
  }

  private initializeModal(elementId: string, instancePropertyName: string): void {
    try {
        const modalElement = document.getElementById(elementId);
        if (modalElement) {
            (this as any)[instancePropertyName] = new Modal(modalElement);
        } else {
            console.warn(`ProfessionalDashboard: Modal element with ID '${elementId}' not found.`);
        }
    } catch (e) {
      console.error(`ProfessionalDashboard: Error initializing modal ${elementId}:`, e);
    }
  }

  private initForms(): void {
    this.portfolioForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      imageUrl: new FormControl('', [ Validators.required, Validators.pattern(/^(ftp|http|https):[^ "]+$/)]),
      serviceType: new FormControl('', Validators.required),
      location: new FormControl('')
    });
    this.updateStatusForm = new FormGroup({
        newStatus: new FormControl('', Validators.required),
        progress: new FormControl(0),
        statusDetails: new FormControl('')
    });
  }

  private loadInitialData(): void {
    const authSub = this.authService.getAuthState().pipe(
      tap(user => console.log('ProfessionalDashboard: Auth State UID:', user ? user.uid : 'null')),
      switchMap((user: FirebaseUser | null) => {
        if (user && user.uid) {
          this.currentProfessionalUid = user.uid;
          this.authService.getUserDataFromFirestore(user.uid).then(userData => {
            this.currentProfessionalName = userData?.name || user.displayName || 'Profissional S/ Nome';
            console.log('ProfessionalDashboard: Nome do Profissional definido:', this.currentProfessionalName);
          });
          console.log('ProfessionalDashboard: Professional UID:', this.currentProfessionalUid);

          // ALTERADO: Filtragem local após buscar TODOS os pendentes
          const pendingRequests$ = this.serviceRequestService.getAllPendingRequests().pipe(
            map(requests => {
              // Filtra os serviços pendentes para remover aqueles que o profissional atual já recusou
              return requests.filter(req => {
                // Verifica se 'profissionaisQueRecusaram' existe e se o UID atual NÃO está nele
                return !req.profissionaisQueRecusaram?.includes(this.currentProfessionalUid!);
              });
            }),
            tap(data => console.log('ProfessionalDashboard: Dados recebidos de getAllPendingRequests (FILTRADOS POR RECUSA):', data)),
            catchError(err => {
              console.error('ProfessionalDashboard: ERRO DETALHADO em getAllPendingRequests:', err);
              this.showFeedbackMessage('error', 'Erro ao buscar serviços pendentes.');
              return of([] as ServiceRequest[]);
            })
          );

          const assignedRequests$ = this.serviceRequestService.getRequestsAssignedToProfessional(this.currentProfessionalUid).pipe(
            tap(data => console.log('ProfessionalDashboard: Dados recebidos de getRequestsAssignedToProfessional:', data)),
            catchError(err => {
              console.error('ProfessionalDashboard: ERRO DETALHADO em getRequestsAssignedToProfessional:', err);
              this.showFeedbackMessage('error', 'Erro ao buscar serviços atribuídos.');
              return of([] as ServiceRequest[]);
            })
          );

          console.log('ProfessionalDashboard: Preparando combineLatest...');
          return combineLatest([pendingRequests$, assignedRequests$]);
        } else {
          this.currentProfessionalUid = null;
          this.allServiceRequests = [];
          this.filteredServiceRequests = [];
          this.portfolioItems = [];
          console.warn('ProfessionalDashboard: Nenhum profissional logado detectado em loadInitialData.');
          return of([[] as ServiceRequest[], [] as ServiceRequest[]]);
        }
      }),
      catchError(error => {
        console.error("ProfessionalDashboard: Erro GERAL em loadInitialData (capturado pelo catchError principal):", error);
        this.showFeedbackMessage('error', 'Erro crítico ao carregar dados do dashboard.');
        this.allServiceRequests = [];
        this.filteredServiceRequests = [];
        return of([[] as ServiceRequest[], [] as ServiceRequest[]]);
      })
    ).subscribe(([pendingRequests, assignedRequests]) => {
      console.log('ProfessionalDashboard (subscribe): DADOS BRUTOS de pendingRequests:', pendingRequests);
      console.log('ProfessionalDashboard (subscribe): DADOS BRUTOS de assignedRequests:', assignedRequests);

      const allRequestsMap = new Map<string, ServiceRequest>();
      assignedRequests.forEach(req => {
          if(req.id) allRequestsMap.set(req.id, req);
      });
      pendingRequests.forEach(req => {
          if(req.id && !allRequestsMap.has(req.id)) {
              allRequestsMap.set(req.id, req);
          }
      });

      this.allServiceRequests = Array.from(allRequestsMap.values())
                                   .sort((a,b) => (b.createdAt?.toDate().getTime() || 0) - (a.createdAt?.toDate().getTime() || 0));
      console.log('ProfessionalDashboard: allServiceRequests APÓS COMBINAÇÃO e sort:', this.allServiceRequests);
      this.allServiceRequests.forEach(req => console.log('Service Request Status (from allServiceRequests for debugging):', req.status));

      this.applyServiceFilter();
      this.cdr.detectChanges();

      if(this.currentProfessionalUid) {
        this.loadPortfolioItems(this.currentProfessionalUid);
      } else {
        this.portfolioItems = [];
      }
    });
    this.subscriptions.add(authSub);
  }

  setActiveTab(tab: 'servicos' | 'portfolio'): void {
    this.activeTab = tab;
    if (tab === 'portfolio' && this.currentProfessionalUid && this.portfolioItems.length === 0) {
        this.loadPortfolioItems(this.currentProfessionalUid);
    }
  }

  setServiceFilter(filter: string): void {
    this.currentServiceFilter = filter;
    this.applyServiceFilter();
    this.cdr.detectChanges();
    console.log('Filtro definido:', filter, 'Resultados:', this.filteredServiceRequests.length);
  }

  applyServiceFilter(): void {
    console.log('applyServiceFilter() called. currentServiceFilter:', this.currentServiceFilter);
    if (!this.allServiceRequests || this.allServiceRequests.length === 0) {
        this.filteredServiceRequests = [];
        return;
    }

    if (this.currentServiceFilter === 'Todos') {
        this.filteredServiceRequests = [...this.allServiceRequests];
    } else {
        this.filteredServiceRequests = this.allServiceRequests.filter(req =>
            req.status === this.currentServiceFilter
        );
    }

    console.log('Filtro aplicado:', {
        filtroAtual: this.currentServiceFilter,
        totalServicos: this.allServiceRequests.length,
        servicosFiltrados: this.filteredServiceRequests.length
    });
  }

  getRequestsByStatusCount(status: string): number {
    return this.allServiceRequests.filter(req => req.status === status).length;
  }

  aceitarSolicitacao(request: ServiceRequest): void {
    if (!request.id || !this.currentProfessionalUid) { this.showFeedbackMessage('error', 'Não foi possível aceitar. ID do serviço ou profissional não encontrado.'); return; }
    this.serviceRequestService.acceptRequestByProfessional(request.id, this.currentProfessionalUid, this.currentProfessionalName)
      .then(() => {
        this.showFeedbackMessage('success', `Solicitação #${request.id?.substring(0,8)} aceita!`);
        this.loadInitialData(); // Reload data to reflect status change
      })
      .catch(err => { console.error("Erro ao aceitar solicitação:", err); this.showFeedbackMessage('error', 'Erro ao aceitar solicitação.'); });
  }

  // ALTERADO: Agora chama o novo método de serviço para apenas marcar a recusa
  recusarSolicitacao(request: ServiceRequest): void {
    if (!request.id || !this.currentProfessionalUid) {
      this.showFeedbackMessage('error', 'Não foi possível recusar. ID do serviço ou profissional não encontrado.');
      return;
    }
    if (confirm(`Tem certeza que deseja recusar este serviço #${request.id?.substring(0,8)} (${request.serviceType})? Ele não aparecerá mais para você.`)) {
      this.serviceRequestService.recusarSolicitacaoApenasParaProfissional(request.id, this.currentProfessionalUid)
        .then(() => {
          this.showFeedbackMessage('success', 'Solicitação recusada por você.');

          // Remova o serviço LOCALMENTE das listas para o profissional atual
          this.allServiceRequests = this.allServiceRequests.filter(
            (req) => req.id !== request.id
          );
          this.filteredServiceRequests = this.filteredServiceRequests.filter(
            (req) => req.id !== request.id
          );
          this.cdr.detectChanges(); // Forçar a atualização da interface
        })
        .catch((err) => {
          console.error('Erro ao recusar solicitação:', err);
          this.showFeedbackMessage('error', 'Erro ao recusar solicitação.');
        });
    }
  }

  openUpdateStatusModal(request: ServiceRequest): void {
    this.requestToUpdate = request;
    let initialStatus = ''; let progress = 0;
    if (request.status === 'Aprovado') { initialStatus = 'Em Andamento'; progress = 10; }
    else if (request.status === 'Em Andamento') { initialStatus = 'Concluído'; progress = this.getProgressValue(request.status) || 50 ; }
    this.updateStatusForm.reset({ newStatus: initialStatus, progress: progress, statusDetails: '' });
    if (this.updateStatusModalInstance) this.updateStatusModalInstance.show(); else console.error("Update status modal instance not found");
  }

  submitUpdateStatus(): void {
    if (!this.updateStatusForm.valid || !this.requestToUpdate || !this.requestToUpdate.id) { this.showFeedbackMessage('error', 'Formulário inválido. Selecione um status.'); return; }
    const { newStatus } = this.updateStatusForm.value;
    this.serviceRequestService.updateServiceStatusByProfessional(this.requestToUpdate.id, newStatus as ProfessionalUpdatableStatus)
        .then(() => {
            this.showFeedbackMessage('success', `Status atualizado para ${newStatus}.`);
            if (this.updateStatusModalInstance) this.updateStatusModalInstance.hide();
            this.requestToUpdate = null;
            this.loadInitialData(); // Reload data to reflect status change
        })
        .catch(err => { console.error("Erro ao atualizar status:", err); this.showFeedbackMessage('error', 'Erro ao atualizar status.'); });
  }

  cancelarServicoPeloProfissional(request: ServiceRequest): void {
      if (!request.id || ['Concluído', 'Cancelado', 'Rejeitado'].includes(request.status)) {
        this.showFeedbackMessage('error', 'Este serviço não pode ser cancelado neste estado.'); return;
      }
      if (confirm(`Tem certeza que deseja cancelar o serviço #${request.id?.substring(0,8)} (${request.serviceType})? O cliente será notificado.`)) {
          this.serviceRequestService.updateServiceStatusByProfessional(request.id, 'Cancelado')
            .then(() => {
              this.showFeedbackMessage('success', 'Serviço cancelado.');
              this.loadInitialData(); // Reload data to reflect status change
            })
            .catch(err => { console.error("Erro ao cancelar serviço:", err); this.showFeedbackMessage('error', 'Erro ao cancelar serviço.'); });
      }
  }

  loadPortfolioItems(professionalUid: string): void {
    console.log("ProfessionalDashboard: Tentando carregar portfólio para UID:", professionalUid);
    this.serviceRequestService.getPortfolioForProfessional(professionalUid).subscribe({
        next: (items) => { this.portfolioItems = items; console.log('ProfessionalDashboard: Portfólio carregado:', items); },
        error: (err) => {
            console.error('DETALHE DO ERRO AO CARREGAR PORTFÓLIO (ProfessionalDashboard):', err);
            this.showFeedbackMessage('error', 'Erro ao carregar portfólio. Verifique o console.');
        }
    });
  }

  openAddPortfolioModal(): void {
    this.editingPortfolioItem = null;
    this.portfolioForm.reset();
    if(this.portfolioModalInstance) this.portfolioModalInstance.show();
  }

  openEditPortfolioModal(item: PortfolioItem): void {
    this.editingPortfolioItem = item;
    this.portfolioForm.patchValue(item);
    if(this.portfolioModalInstance) this.portfolioModalInstance.show();
  }

  submitPortfolioItem(): void {
    if (!this.portfolioForm.valid || !this.currentProfessionalUid) {
      this.showFeedbackMessage('error', 'Preencha todos os campos obrigatórios do projeto.');
      return;
    }
    const formValue = this.portfolioForm.value;
    const portfolioData: Omit<PortfolioItem, 'id' | 'createdAt'> = {
        professionalUid: this.currentProfessionalUid,
        title: formValue.title,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        serviceType: formValue.serviceType,
        location: formValue.location
    };
    let operation: Promise<any>;
    if (this.editingPortfolioItem && this.editingPortfolioItem.id) {
      operation = this.serviceRequestService.updatePortfolioItem(this.editingPortfolioItem.id, portfolioData);
    } else {
      operation = this.serviceRequestService.addPortfolioItem(portfolioData);
    }
    operation.then(() => {
      this.showFeedbackMessage('success', `Projeto ${this.editingPortfolioItem ? 'atualizado' : 'adicionado'} com sucesso!`);
      if(this.portfolioModalInstance) this.portfolioModalInstance.hide();
      this.editingPortfolioItem = null;
      if (this.currentProfessionalUid) this.loadPortfolioItems(this.currentProfessionalUid);
    }).catch(err => {
      console.error('Erro ao salvar item do portfólio:', err);
      this.showFeedbackMessage('error', 'Erro ao salvar projeto. Tente novamente.');
    });
  }

  deletePortfolioItem(itemId: string): void {
    if (!itemId) {
      this.showFeedbackMessage('error', 'ID do item do portfólio não encontrado.');
      return;
    }
    if (confirm('Tem certeza que deseja remover este item do portfólio? Esta ação não pode ser desfeita.')) {
      this.serviceRequestService.deletePortfolioItem(itemId)
        .then(() => {
            this.showFeedbackMessage('success', 'Item do portfólio removido com sucesso!');
            if (this.currentProfessionalUid) this.loadPortfolioItems(this.currentProfessionalUid);
        })
        .catch(err => {
          console.error('Erro ao remover item do portfólio:', err);
          this.showFeedbackMessage('error', 'Erro ao remover item do portfólio.');
        });
    }
  }

  openChatModal(request: ServiceRequest): void {
    this.chatTargetRequest = request;
    if (this.chatModalInstance) this.chatModalInstance.show();
    else console.error("Instância do chatModal não encontrada");
  }

  sendMessageProf(): void {
    if (!this.newMessageProf.trim() || !this.chatTargetRequest || !this.currentProfessionalUid) return;
    console.log(`Prof ${this.currentProfessionalUid} enviando msg sobre ${this.chatTargetRequest.id}: ${this.newMessageProf}`);
    // TODO: Implement actual message sending logic here using a chat service
    this.newMessageProf = '';
  }

  // --- UI Helper Functions ---

  getServiceIcon(serviceType: string): string {
    switch(serviceType) {
      case 'Alvenaria': return 'fa-home';
      case 'Hidráulica': return 'fa-tint';
      case 'Elétrica': return 'fa-bolt';
      case 'Reformas': return 'fa-paint-roller';
      case 'Pintura': return 'fa-paint-brush';
      case 'Outro': return 'fa-cog';
      default: return 'fa-tools';
    }
  }

  getServiceClass(serviceType: string): string {
    return serviceType?.toLowerCase().replace(' ', '-') || '';
  }

  getStatusBadgeClass(status: string): string {
    const s = status?.toLowerCase().replace(/\s+/g, '-');
    switch(s) {
      case 'pendente': return 'bg-warning text-dark';
      case 'aprovado': return 'bg-success text-white';
      case 'em-andamento': return 'bg-primary text-white';
      case 'concluido': return 'bg-info text-dark';
      case 'cancelado': return 'bg-danger text-white';
      case 'rejeitado': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }

  getStatusDotClass(status: string): string {
    const s = status?.toLowerCase().replace(/\s+/g, '-');
    switch(s) {
      case 'pendente': return 'dot-yellow';
      case 'aprovado': return 'dot-green';
      case 'em-andamento': return 'dot-blue';
      case 'concluido': return 'dot-purple';
      case 'cancelado': return 'dot-red';
      case 'rejeitado': return 'dot-orange';
      default: return 'dot-grey';
    }
  }

  getProgressBarClass(status: string): string {
    return status === 'Em Andamento' ? 'bg-primary' : status === 'Concluído' ? 'bg-success' : 'bg-light';
  }

  getProgressWidth(status: string): string {
    const progress = this.getProgressValue(status);
    return `${progress}%`;
  }

  getProgressValue(status: string | undefined): number {
    if (status === 'Em Andamento') return 65;
    if (status === 'Concluído') return 100;
    return 0;
  }

  showFeedbackMessage(type: 'success' | 'error', text: string): void {
    this.feedbackMessage = { type, text };
    setTimeout(() => this.feedbackMessage = null, 4000);
  }

  closeCurrentModal(): void {
    const ids = ['availabilityModal', 'updateStatusModal', 'portfolioModal', 'chatModalProf'];
    ids.forEach(id => {
      const modalElement = document.getElementById(id);
      if (modalElement?.classList.contains('show')) {
        const instance = Modal.getInstance(modalElement);
        instance?.hide();
      }
    });
    this.requestToUpdate = null;
    this.editingPortfolioItem = null;
    this.chatTargetRequest = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.availabilityModalInstance) this.availabilityModalInstance.dispose();
    if (this.updateStatusModalInstance) this.updateStatusModalInstance.dispose();
    if (this.portfolioModalInstance) this.portfolioModalInstance.dispose();
    if (this.chatModalInstance) this.chatModalInstance.dispose();
  }
}