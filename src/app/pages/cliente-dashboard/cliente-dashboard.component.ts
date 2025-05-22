import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ServiceRequest, ServiceRequestService } from '../../services/service-request.service';

interface Professional {
  id: number;
  name: string;
  photoUrl: string;
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit, OnDestroy {
  requestForm!: FormGroup;
  editForm!: FormGroup;
  serviceRequests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  showModal = false;
  subscription!: Subscription;

  professionalList: Professional[] = [
    { id: 1, name: 'Carlos Oliveira', photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: 2, name: 'Luana Mendes', photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg' },
    { id: 3, name: 'Pedro Silva', photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg' }
  ];

  constructor(
    private router: Router,
    private serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    this.requestForm = new FormGroup({
      serviceType: new FormControl('', Validators.required),
      details: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    });

    this.editForm = new FormGroup({
      serviceType: new FormControl('', Validators.required),
      details: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    });

    this.subscription = this.serviceRequestService.getRequests().subscribe((requests) => {
      // filtro pelo cliente — aqui ajusta conforme seu contexto real
      this.serviceRequests = requests.filter(r => r.cliente === 'Cliente Teste');
    });
  }

  onSubmitRequest(): void {
    if (this.requestForm.valid) {
      // Gera um id string único simples (aqui só incrementa)
      const newId = (this.serviceRequests.length + 1).toString();

      const newRequest: ServiceRequest = {
        id: newId,
        serviceType: this.requestForm.value.serviceType,
        details: this.requestForm.value.details,
        date: this.requestForm.value.date,
        status: 'Pendente',
        cliente: 'Cliente Teste'
      };

      this.serviceRequestService.addRequest(newRequest);
      this.requestForm.reset();
    }
  }

  cancelRequest(id: string): void {
    const request = this.serviceRequests.find(r => r.id === id);
    if (request && request.status !== 'Cancelado' && request.status !== 'Aprovado') {
      request.status = 'Cancelado';
      this.serviceRequestService.updateRequest(request);
    }
  }

  openEditModal(request: ServiceRequest): void {
    if (request.status === 'Cancelado' || request.status === 'Aprovado') {
      return;
    }
    this.selectedRequest = request;
    this.editForm.setValue({
      serviceType: request.serviceType,
      details: request.details,
      date: request.date
    });
    this.showModal = true;
  }

  saveEdit(): void {
    if (this.selectedRequest && this.editForm.valid) {
      this.selectedRequest.serviceType = this.editForm.value.serviceType;
      this.selectedRequest.details = this.editForm.value.details;
      this.selectedRequest.date = this.editForm.value.date;
      this.serviceRequestService.updateRequest(this.selectedRequest);
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pendente': return 'status-dot dot-blue';
      case 'Aprovado': return 'status-dot dot-green';
      case 'Em Andamento': return 'status-dot dot-yellow';
      case 'Cancelado': return 'status-dot dot-red';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
