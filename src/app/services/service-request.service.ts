import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceRequest {
  id: string;
  serviceType: string;
  details: string;
  date: string; // ISO string
  cliente: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado' | 'Concluído' | 'Em Andamento';
  profissional?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {

  private requestsSubject = new BehaviorSubject<ServiceRequest[]>([
    {
      id: '1',
      serviceType: 'Eletricista',
      details: 'Trocar lâmpada',
      date: new Date().toISOString(),
      cliente: 'leon@example.com',
      status: 'Pendente',
      profissional: undefined
    }
    // Você pode adicionar mais dados iniciais aqui
  ]);

  constructor() {}

  // Observable geral de todas as solicitações
  getRequests(): Observable<ServiceRequest[]> {
    return this.requestsSubject.asObservable();
  }

  // Filtra solicitações por cliente (atualizado em tempo real)
  getRequestsByCliente(email: string): Observable<ServiceRequest[]> {
    return this.requestsSubject.asObservable().pipe(
      map(requests => requests.filter(req => req.cliente === email))
    );
  }

  // Filtra solicitações por profissional e status Pendente
  getRequestsByProfissional(email: string): Observable<ServiceRequest[]> {
    return this.requestsSubject.asObservable().pipe(
      map(requests => requests.filter(req => req.profissional === email && req.status === 'Pendente'))
    );
  }

  // Adiciona nova solicitação
  addRequest(newRequest: ServiceRequest): Promise<void> {
    return new Promise(resolve => {
      const updated = [...this.requestsSubject.value, newRequest];
      this.requestsSubject.next(updated);
      resolve();
    });
  }

  // Atualiza uma solicitação existente
  updateRequest(updated: ServiceRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      const requests = this.requestsSubject.value;
      const index = requests.findIndex(r => r.id === updated.id);
      if (index === -1) {
        reject('Solicitação não encontrada');
        return;
      }
      requests[index] = updated;
      this.requestsSubject.next([...requests]);
      resolve();
    });
  }

  // Remove uma solicitação (opcional)
  removeRequest(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const filtered = this.requestsSubject.value.filter(r => r.id !== id);
      if (filtered.length === this.requestsSubject.value.length) {
        reject('Solicitação não encontrada para remoção');
        return;
      }
      this.requestsSubject.next(filtered);
      resolve();
    });
  }
}
