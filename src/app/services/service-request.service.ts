// src/app/services/service-request.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  orderBy,
  DocumentReference,
  arrayUnion // IMPORT NECESSÁRIO para adicionar a um array
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface ServiceRequest {
  id?: string;
  serviceType: string;
  details: string;
  date: Timestamp;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado' | 'Concluído' | 'Em Andamento';
  clienteUid: string;
  profissionalUid?: string | null;
  profissional?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  profissionaisQueRecusaram?: string[]; // NOVO CAMPO
}


export interface PortfolioItem {
  id?: string;
  professionalUid: string;
  title: string;
  description: string;
  imageUrl: string;
  serviceType: string;
  location?: string;
  createdAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private serviceRequestsCollectionRef;
  private portfolioItemsCollectionRef;

  constructor(private firestore: Firestore) {
    this.serviceRequestsCollectionRef = collection(this.firestore, 'serviceRequests');
    this.portfolioItemsCollectionRef = collection(this.firestore, 'portfolioItems');
  }


  getRequestsForClient(clienteUid: string): Observable<ServiceRequest[]> {
    console.log('SR_Service (Cliente): Buscando pedidos para clienteUid:', clienteUid);
    const q = query(
      this.serviceRequestsCollectionRef,
      where('clienteUid', '==', clienteUid),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ServiceRequest[]>;
  }

  // NOVO: Adicionado 'profissionaisQueRecusaram' no tipo e inicializado
  addRequest(requestData: Omit<ServiceRequest, 'id'|'createdAt'|'updatedAt'|'status'|'profissionalUid'|'profissional'|'profissionaisQueRecusaram'>): Promise<DocumentReference> {
    const newRequest = { ...requestData, status: 'Pendente' as const, profissionalUid: null, profissional: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), profissionaisQueRecusaram: [] };
    return addDoc(this.serviceRequestsCollectionRef, newRequest);
  }

  updateRequestByClient(requestId: string, dataToUpdate: Partial<Pick<ServiceRequest, 'serviceType'|'details'|'date'>>): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return updateDoc(requestDocRef, { ...dataToUpdate, updatedAt: serverTimestamp() });
  }

  updateStatusToCanceled(requestId: string): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return updateDoc(requestDocRef, { status: 'Cancelado' as const, updatedAt: serverTimestamp() });
  }

  deleteRequest(requestId: string): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return deleteDoc(requestDocRef);
  }

  // ALTERADO: Este método agora busca TODOS os pendentes. A filtragem por 'profissionaisQueRecusaram' será feita no componente.
  getAllPendingRequests(): Observable<ServiceRequest[]> {
    console.log('SR_Service (Prof): Buscando TODOS os pedidos PENDENTES para filtragem local (ordenado por createdAt DESC)');
    const q = query(
      this.serviceRequestsCollectionRef,
      where('status', '==', 'Pendente'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ServiceRequest[]>;
  }

  getRequestsAssignedToProfessional(professionalUid: string): Observable<ServiceRequest[]> {
    console.log('SR_Service (Prof): Buscando pedidos ATRIBUÍDOS para professionalUid:', professionalUid);
    const q = query(
      this.serviceRequestsCollectionRef,
      where('profissionalUid', '==', professionalUid),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ServiceRequest[]>;
  }

  // ALTERADO: Ao aceitar, o array de recusas é limpo para este profissional
  acceptRequestByProfessional(requestId: string, professionalUid: string, professionalName: string): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return updateDoc(requestDocRef, { status: 'Aprovado' as const, profissionalUid: professionalUid, profissional: professionalName, updatedAt: serverTimestamp(), profissionaisQueRecusaram: [] });
  }

  // NOVO MÉTODO: Para um profissional recusar um serviço sem mudar seu status geral
  recusarSolicitacaoApenasParaProfissional(requestId: string, professionalUid: string): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    // Usa arrayUnion para adicionar o UID ao array 'profissionaisQueRecusaram'
    return updateDoc(requestDocRef, {
      profissionaisQueRecusaram: arrayUnion(professionalUid),
      updatedAt: serverTimestamp()
    });
  }

  // Mantém este método para mudanças de status que afetam todos (e.g., Concluído, Cancelado, Rejeitado permanentemente)
  updateServiceStatusByProfessional(requestId: string, newStatus: ServiceRequest['status']): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return updateDoc(requestDocRef, { status: newStatus, updatedAt: serverTimestamp() });
  }

  // --- MÉTODOS PARA PORTFÓLIO ---
  addPortfolioItem(itemData: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<DocumentReference> {
    const newItem = { ...itemData, createdAt: serverTimestamp() };
    return addDoc(this.portfolioItemsCollectionRef, newItem);
  }

  getPortfolioForProfessional(professionalUid: string): Observable<PortfolioItem[]> {
    console.log('SR_Service (Prof): Buscando portfólio para professionalUid:', professionalUid);
    const q = query(
      this.portfolioItemsCollectionRef,
      where('professionalUid', '==', professionalUid),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<PortfolioItem[]>;
  }

  updatePortfolioItem(itemId: string, itemData: Partial<Omit<PortfolioItem, 'id' | 'professionalUid' | 'createdAt'>>): Promise<void> {
    const itemDocRef = doc(this.firestore, `portfolioItems/${itemId}`);
    return updateDoc(itemDocRef, itemData);
  }

  deletePortfolioItem(itemId: string): Promise<void> {
    const itemDocRef = doc(this.firestore, `portfolioItems/${itemId}`);
    return deleteDoc(itemDocRef);
  }
}