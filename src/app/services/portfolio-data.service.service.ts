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
      imageUrl: 'https://via.placeholder.com/400x300?text=Residencial'
    },
    {
      id: 2,
      title: 'Fachada Comercial Inovadora',
      description: 'Modernização de fachada para ambientes comerciais, elevando a estética com soluções inovadoras.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Comercial'
    },
    {
      id: 3,
      title: 'Reformas em Hidráulica',
      description: 'Manutenção e reparos de sistemas hidráulicos para garantir eficiência.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Hidráulica'
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
