import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicDataService {
  // Lista de serviços oferecidos (todos realizados pelo "Profissional Teste")
  private serviceItems: ServiceItem[] = [
    {
      id: 1,
      name: 'Alvenaria',
      description: 'Construção e reformas em alvenaria com qualidade e segurança, executado pelo Profissional Teste.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Alvenaria'
    },
    {
      id: 2,
      name: 'Elétrica',
      description: 'Instalação e manutenção de sistemas elétricos residenciais e comerciais, executados pelo Profissional Teste.',
      imageUrl: 'https://via.placeholder.com/400x300?text=El%C3%A9trica'
    },
    {
      id: 3,
      name: 'Hidráulica',
      description: 'Serviços de encanamento, reparos e manutenção de sistemas hidráulicos, com a expertise do Profissional Teste.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Hidra%C3%BAlica'
    },
    {
      id: 4,
      name: 'Reformas',
      description: 'Projetos completos de reformas e modernizações, executados pelo Profissional Teste para transformar espaços.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Reformas'
    }
  ];

  private serviceItemsSubject = new BehaviorSubject<ServiceItem[]>(this.serviceItems);
  getServices(): Observable<ServiceItem[]> {
    return this.serviceItemsSubject.asObservable();
  }

  
}
