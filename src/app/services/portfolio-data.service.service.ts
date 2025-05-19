import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {
  private portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: 'Projeto Residencial Moderno',
      description: 'Reforma completa de residência com acabamento premium, executado pelo Profissional Teste.',
      imageUrl: 'https://img.freepik.com/fotos-gratis/3d-rendem-de-um-interior-contemporaneo-com-a-metade-em-fase-de-esboco_1048-4703.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740'
    },
    {
      id: 2,
      title: 'Fachada Comercial Inovadora',
      description: 'Modernização de fachada para ambientes comerciais, elevando a estética com soluções inovadoras.',
      imageUrl: 'https://img.freepik.com/fotos-premium/um-desenho-de-um-edificio-com-linhas-azuis-e-a-palavra-on-it_689904-110571.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740'
    },
    {
      id: 3,
      title: 'Reformas em Hidráulica',
      description: 'Manutenção e reparos de sistemas hidráulicos para garantir eficiência.',
      imageUrl: 'https://img.freepik.com/fotos-gratis/um-homem-instala-um-sistema-de-aquecimento-em-uma-casa-e-verifica-os-tubos-com-uma-chave-inglesa_169016-55834.jpg?ga=GA1.1.645385131.1746643099&semt=ais_hybrid&w=740'
    }
  ];

  private portfolioSubject = new BehaviorSubject<PortfolioItem[]>(this.portfolioItems);

  getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.portfolioSubject.asObservable();
  }

  addPortfolioItem(item: PortfolioItem): void {
    this.portfolioItems.push(item);
    this.portfolioSubject.next(this.portfolioItems);
  }
}
