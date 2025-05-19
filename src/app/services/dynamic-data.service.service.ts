import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  estimatedDays?: {
    min: number;
    max: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DynamicDataService {
  private serviceItems: ServiceItem[] = [
    {
      id: 1,
      name: 'Alvenaria',
      description: 'Construção e reformas em alvenaria com qualidade e segurança.',
      imageUrl: 'https://img.freepik.com/fotos-gratis/alvenaria-trabalhador-da-construcao-que-constroi-uma-parede-de-tijolo_1150-14756.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740',
      estimatedDays: { min: 1, max: 10 }
    },
    {
      id: 2,
      name: 'Elétrica',
      description: 'Instalação e manutenção de sistemas elétricos residenciais e comerciais.',
      imageUrl: 'https://img.freepik.com/fotos-gratis/tiro-de-angulo-baixo-de-eletricistas-trabalhando-no-mastro_181624-46993.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740',
      estimatedDays: { min: 2, max: 5 }
    },
    {
      id: 3,
      name: 'Hidráulica',
      description: 'Serviços de encanamento, reparos e manutenção de sistemas hidráulicos.',
      imageUrl: 'https://img.freepik.com/fotos-premium/projeto-de-abastecimento-de-agua-no-canteiro-de-obras-trabalhando-para-soldar-a-conexao-do-tubo-hdpe_33835-437.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740',
      estimatedDays: { min: 2, max: 8 }
    },
    {
      id: 4,
      name: 'Reformas',
      description: 'Projetos completos de reformas e modernizações.',
      imageUrl: 'https://img.freepik.com/fotos-gratis/trabalhador-manual-em-um-canteiro-de-obras-no-processo-de-perfuracao-de-uma-parede-com-um-perfurador_169016-12114.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740',
      estimatedDays: { min: 5, max: 10 }
    }
  ];

  private serviceItemsSubject = new BehaviorSubject<ServiceItem[]>(this.serviceItems);
  getServices(): Observable<ServiceItem[]> {
    return this.serviceItemsSubject.asObservable();
  }

  
}
