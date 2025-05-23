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
  DocumentReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';


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

  addRequest(requestData: Omit<ServiceRequest, 'id'|'createdAt'|'updatedAt'|'status'|'profissionalUid'|'profissional'>): Promise<DocumentReference> {
    const newRequest = { ...requestData, status: 'Pendente' as const, profissionalUid: null, profissional: '', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
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


  getAllPendingRequests(): Observable<ServiceRequest[]> {
    console.log('SR_Service (Prof): Buscando TODOS os pedidos PENDENTES (ordenado por createdAt DESC)');
    const q = query(
    this.serviceRequestsCollectionRef,
    where('status', '==', 'Pendente'),
    orderBy('createdAt', 'desc') // DEVE SER 'desc' para bater com o índice
);
    return collectionData(q, { idField: 'id' }) as Observable<ServiceRequest[]>;
  }

  getRequestsAssignedToProfessional(professionalUid: string): Observable<ServiceRequest[]> {
    console.log('SR_Service (Prof): Buscando pedidos ATRIBUÍDOS para professionalUid:', professionalUid);
    const q = query(
      this.serviceRequestsCollectionRef,
      where('profissionalUid', '==', professionalUid),
      orderBy('createdAt', 'desc') // Este índice (profissionalUid ASC, createdAt DESC) foi sugerido para criação
    );
    return collectionData(q, { idField: 'id' }) as Observable<ServiceRequest[]>;
  }

  acceptRequestByProfessional(requestId: string, professionalUid: string, professionalName: string): Promise<void> {
    const requestDocRef = doc(this.firestore, `serviceRequests/${requestId}`);
    return updateDoc(requestDocRef, { status: 'Aprovado' as const, profissionalUid: professionalUid, profissional: professionalName, updatedAt: serverTimestamp() });
  }

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
      orderBy('createdAt', 'desc') // Este índice (professionalUid ASC, createdAt DESC) está ATIVO para portfolioItems
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