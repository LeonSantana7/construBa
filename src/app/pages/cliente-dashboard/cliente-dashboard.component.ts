
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ServiceRequest, ServiceRequestService } from '../../services/service-request.service';
import { AuthService } from '../../services/auth.service.service';
import { User as FirebaseUser } from '@angular/fire/auth';
import { Modal } from 'bootstrap';
import { Timestamp } from '@angular/fire/firestore';

interface Professional {
  id: number;
  name: string;
  photoUrl: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  isUser: boolean;
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  requestForm!: FormGroup;
  editForm!: FormGroup;
  serviceRequests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  private subscriptions = new Subscription();
  newMessage: string = '';
  chatMessagesList: ChatMessage[] = [];
  selectedProfessional: Professional | null = null;
  

  currentModalInstance: Modal | null = null;

  private deleteConfirmModalInstance: Modal | null = null;
  private serviceToDeleteId: string | null = null;
  public feedbackMessage: { type: 'success' | 'error', text: string } | null = null;

  minDate!: string;
  currentUserUid: string | null = null;

  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;

  professionalList: Professional[] = [
    { id: 1, name: 'Carlos Oliveira', photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: 2, name: 'Luana Mendes', photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg' },
    { id: 3, name: 'Pedro Silva', photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 4, name: 'Ana Costa', photoUrl: 'https://randomuser.me/api/portraits/women/65.jpg' }
  ];

  constructor(
    private router: Router,
    private serviceRequestService: ServiceRequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.minDate = this.getFormattedToday();

    this.requestForm = new FormGroup({
      serviceType: new FormControl('', Validators.required),
      details: new FormControl('', Validators.required),
      date: new FormControl(this.getFormattedToday(), [Validators.required, this.dateNotInPastValidator.bind(this)])
    });

    this.editForm = new FormGroup({
      id: new FormControl(''),
      serviceType: new FormControl('', Validators.required),
      details: new FormControl('', Validators.required),
      date: new FormControl('', [Validators.required, this.dateNotInPastValidator.bind(this)])
    });

    
    const authSub = this.authService.getAuthState().pipe(
      switchMap((user: FirebaseUser | null) => {
        console.log('ClienteDashboard: Estado de autenticação recebido:', user);
        if (user && user.uid) {
          this.currentUserUid = user.uid;
          console.log('ClienteDashboard: currentUserUid definido:', this.currentUserUid);
          return this.serviceRequestService.getRequestsForClient(this.currentUserUid);
        } else {
          this.currentUserUid = null;
          this.serviceRequests = [];
          console.warn('ClienteDashboard: Nenhum usuário logado para carregar serviços.');
          return of([]);
        }
      }),
      catchError(error => {
        console.error("ClienteDashboard: Erro ao buscar UID do usuário ou serviços:", error);
        this.serviceRequests = [];
        return of([]);
      })
    ).subscribe((requests: ServiceRequest[]) => {
      console.log('ClienteDashboard: NOVOS DADOS DE SERVIÇOS RECEBIDOS:', requests);
      this.serviceRequests = requests;
    });
    this.subscriptions.add(authSub);

    this.chatMessagesList = [ /* ... seu mock de chat ... */ ];
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      this.deleteConfirmModalInstance = new Modal(modalElement);
    }
  }

  private formatTimestampToInputDate(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private getFormattedToday(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private dateNotInPastValidator(control: FormControl): ValidationErrors | null {
    if (!control.value) return null;
    const controlDate = new Date(control.value + "T00:00:00");
    const minDateObj = new Date(this.minDate + "T00:00:00");
    if (controlDate < minDateObj) return { 'dateInPast': true };
    return null;
  }

  getRequestsByStatus(status: string): ServiceRequest[] { return this.serviceRequests.filter(request => request.status === status); }
  getServiceClass(serviceType: string): string { switch(serviceType) { case 'Alvenaria': return 'alvenaria'; case 'Hidráulica': return 'hidraulica'; case 'Elétrica': return 'eletrica'; case 'Reformas': return 'reformas'; default: return ''; } }
  getServiceIcon(serviceType: string): string { switch(serviceType) { case 'Alvenaria': return 'fa-home'; case 'Hidráulica': return 'fa-tint'; case 'Elétrica': return 'fa-bolt'; case 'Reformas': return 'fa-paint-roller'; default: return 'fa-tools'; } }
  getServiceIconClass(serviceType: string): string { return `service-${this.getServiceClass(serviceType)}`; }
  getStatusBadgeClass(status: string): string { switch(status) { case 'Pendente': return 'status-pending'; case 'Aprovado': return 'status-approved'; case 'Em Andamento': return 'status-in-progress'; case 'Cancelado': return 'status-canceled'; case 'Rejeitado': return 'status-rejected'; case 'Concluído': return 'status-completed'; default: return ''; } }
  getStatusDotClass(status: string): string { switch(status) { case 'Pendente': return 'dot-blue'; case 'Aprovado': return 'dot-green'; case 'Em Andamento': return 'dot-yellow'; case 'Cancelado': return 'dot-red'; case 'Rejeitado': return 'dot-orange'; case 'Concluído': return 'dot-purple'; default: return 'dot-blue'; } }
  getProgressBarClass(status: string): string { switch(status) { case 'Pendente': return 'bg-secondary'; case 'Aprovado': return 'bg-success'; case 'Em Andamento': return 'bg-primary'; case 'Cancelado': return 'bg-danger'; case 'Rejeitado': return 'bg-warning'; case 'Concluído': return 'bg-info'; default: return 'bg-secondary'; } }
  getProgressWidth(status: string): string { switch(status) { case 'Pendente': return '10%'; case 'Aprovado': return '100%'; case 'Em Andamento': return '65%'; case 'Cancelado': return '100%'; case 'Rejeitado': return '100%'; case 'Concluído': return '100%'; default: return '0%'; } }

  private _openGenericModal(modalId: string): void {
    if (this.deleteConfirmModalInstance) { 
        const delModalElem = document.getElementById('deleteConfirmModal');
        if (delModalElem && Modal.getInstance(delModalElem)) {
            this.deleteConfirmModalInstance.hide();
        }
    }
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      if (this.currentModalInstance) { this.currentModalInstance.hide(); }
      this.currentModalInstance = new Modal(modalElement, { backdrop: 'static', keyboard: false });
      this.currentModalInstance.show();
    } else { console.error(`Modal com ID '${modalId}' não encontrado.`); }
  }

  closeGenericModal(): void {
    if (this.currentModalInstance) {
      this.currentModalInstance.hide();
      this.currentModalInstance = null;
    }
    this.selectedRequest = null;
    this.selectedProfessional = null;
    this.feedbackMessage = null;
  }

  openRequestModal(): void { this.requestForm.reset({ serviceType: '', date: this.getFormattedToday() }); this._openGenericModal('requestServiceModal'); }
  openEditModal(request: ServiceRequest): void {
    if (['Cancelado', 'Aprovado', 'Concluído'].includes(request.status)) return;
    this.selectedRequest = { ...request };
    const dateForForm = request.date instanceof Timestamp ? this.formatTimestampToInputDate(request.date) : this.getFormattedToday();
    this.editForm.setValue({ id: request.id || '', serviceType: request.serviceType, details: request.details, date: dateForForm });
    this._openGenericModal('editServiceModal');
  }
  openChatModal(request: ServiceRequest): void {
     if (!request.profissional || ['Cancelado', 'Concluído'].includes(request.status)) return;
     this.selectedRequest = request;
     this.selectedProfessional = this.professionalList.find(p => p.name === request.profissional) || null;
     this._openGenericModal('chatModal');
     setTimeout(() => this.scrollToBottomChat(), 0);
  }
  openProfessionalModal(professional: Professional): void { this.selectedProfessional = professional; this._openGenericModal('professionalModal'); }

  onSubmitRequest(): void {
    if (!this.requestForm.valid || !this.currentUserUid) {
      this.requestForm.markAllAsTouched();
      if (!this.currentUserUid) { console.error("UID não encontrado."); this.showFeedbackMessage('error', 'Erro: Usuário não autenticado.');}
      else { this.showFeedbackMessage('error', 'Por favor, corrija os erros no formulário.');}
      return;
    }
    const dateString = this.requestForm.value.date;
    const dateObject = new Date(dateString + "T00:00:00");
    if (isNaN(dateObject.getTime())) { this.showFeedbackMessage('error', 'Data inválida.'); return; }
    const firebaseTimestamp = Timestamp.fromDate(dateObject);
    const newServiceData: Omit<ServiceRequest, 'id'|'createdAt'|'updatedAt'|'status'|'profissionalUid'|'profissional'> = {
      serviceType: this.requestForm.value.serviceType, details: this.requestForm.value.details,
      date: firebaseTimestamp, clienteUid: this.currentUserUid,
    };
    this.serviceRequestService.addRequest(newServiceData)
      .then(() => { this.showFeedbackMessage('success', 'Serviço solicitado com sucesso!'); this.requestForm.reset({ serviceType: '', date: this.getFormattedToday() }); this.closeGenericModal(); })
      .catch((error: any) => { console.error("Erro ao adicionar:", error); this.showFeedbackMessage('error', 'Erro ao solicitar serviço.'); });
  }

  saveEdit(): void {
    if (!this.editForm.valid || !this.selectedRequest || !this.selectedRequest.id) {
      this.editForm.markAllAsTouched(); this.showFeedbackMessage('error', 'Formulário de edição inválido.'); return;
    }
    const dateString = this.editForm.value.date;
    const dateObject = new Date(dateString + "T00:00:00");
    if (isNaN(dateObject.getTime())) { this.showFeedbackMessage('error', 'Data inválida na edição.'); return; }
    const firebaseTimestamp = Timestamp.fromDate(dateObject);
    const dataToUpdate: Partial<Pick<ServiceRequest, 'serviceType'|'details'|'date'>> = {
      serviceType: this.editForm.value.serviceType, details: this.editForm.value.details, date: firebaseTimestamp
    };
    this.serviceRequestService.updateRequestByClient(this.selectedRequest.id, dataToUpdate)
      .then(() => { this.showFeedbackMessage('success', 'Serviço atualizado com sucesso!'); this.closeGenericModal(); })
      .catch((error: any) => { console.error("Erro ao atualizar:", error); this.showFeedbackMessage('error', 'Erro ao atualizar serviço.'); });
  }


  cancelServiceRequest(request: ServiceRequest | undefined | null): void {
    if (!request || !request.id) {
      this.showFeedbackMessage('error', 'Erro: Serviço não identificado para cancelamento.'); return;
    }
    if (['Cancelado', 'Concluído', 'Aprovado'].includes(request.status)) {
      this.showFeedbackMessage('error', `Serviço já ${request.status.toLowerCase()}, não pode ser cancelado.`); return;
    }
    this.serviceRequestService.updateStatusToCanceled(request.id)
      .then(() => this.showFeedbackMessage('success', 'Serviço cancelado com sucesso.'))
      .catch((error: any) => { console.error(error); this.showFeedbackMessage('error', 'Erro ao cancelar serviço.'); });
  }


  initiatePermanentDelete(request: ServiceRequest | undefined | null): void {
    if (!request || !request.id) {
      this.showFeedbackMessage('error', 'Erro: Serviço não identificado para exclusão.'); return;
    }
    if (request.status !== 'Cancelado') {
      this.showFeedbackMessage('error', 'Serviço precisa estar cancelado para ser apagado.'); return;
    }
    this.serviceToDeleteId = request.id;
    this.openDeleteConfirmationModal();
  }

  openDeleteConfirmationModal(): void {
    if (this.deleteConfirmModalInstance) { this.deleteConfirmModalInstance.show(); }
    else { console.error("Instância do modal de confirmação de exclusão não encontrada."); }
  }

  closeDeleteConfirmationModal(): void {
    if (this.deleteConfirmModalInstance) { this.deleteConfirmModalInstance.hide(); }
    this.serviceToDeleteId = null;
  }

  confirmPermanentDelete(): void {
    if (!this.serviceToDeleteId) {
      this.showFeedbackMessage('error', 'Erro: ID do serviço para apagar não encontrado.');
      this.closeDeleteConfirmationModal(); return;
    }
    const idToDelete = this.serviceToDeleteId;
    this.serviceRequestService.deleteRequest(idToDelete)
      .then(() => { this.showFeedbackMessage('success', 'Serviço apagado permanentemente.'); })
      .catch((error: any) => { console.error(error); this.showFeedbackMessage('error', 'Erro ao apagar serviço.'); })
      .finally(() => this.closeDeleteConfirmationModal());
  }
  
  showFeedbackMessage(type: 'success' | 'error', text: string): void {
    this.feedbackMessage = { type, text };
    setTimeout(() => this.feedbackMessage = null, 5000);
  }

  private scrollToBottomChat(): void {
    try { if (this.chatMessagesContainer?.nativeElement) this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight; }
    catch (err) { console.error(err); }
  }
  sendMessage(): void {  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.currentModalInstance) { this.currentModalInstance.dispose(); }
    if (this.deleteConfirmModalInstance) {
        const modalElement = document.getElementById('deleteConfirmModal');
        if (modalElement && Modal.getInstance(modalElement)) { 
             this.deleteConfirmModalInstance.dispose();
        }
    }
  }
}