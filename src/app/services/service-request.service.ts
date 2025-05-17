import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type RequestStatus = 'Pendente' | 'Aprovado' | 'Em Andamento' | 'Cancelado' | 'Concluído';

export interface ServiceRequest {
  id: number;
  serviceType: string;
  details: string;
  date: string;
  status: RequestStatus;
  cliente: string;
  profissional?: string; // Nome do profissional que aceitou/concluiu
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private requestsSubject = new BehaviorSubject<ServiceRequest[]>([
    { id: 1, serviceType: 'Alvenaria', details: 'Construção de muro', date: '2025-05-20', status: 'Pendente', cliente: 'Cliente Teste' },
    { id: 2, serviceType: 'Elétrica', details: 'Instalação de iluminação', date: '2025-06-15', status: 'Aprovado', cliente: 'Cliente Teste', profissional: 'Carlos Oliveira' },
    { id: 3, serviceType: 'Hidráulica', details: 'Manutenção de encanamento', date: '2025-07-10', status: 'Concluído', cliente: 'Cliente Teste', profissional: 'Luana Mendes' }
  ]);

  getRequests(): Observable<ServiceRequest[]> {
    return this.requestsSubject.asObservable();
  }

  addRequest(request: ServiceRequest): void {
    const current = this.requestsSubject.getValue();
    current.push(request);
    this.requestsSubject.next(current);
  }

  updateRequest(updatedRequest: ServiceRequest): void {
    const current = this.requestsSubject.getValue();
    const index = current.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      current[index] = updatedRequest;
      this.requestsSubject.next(current);
    }
  }
}
