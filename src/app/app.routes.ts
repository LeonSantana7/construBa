import { Routes } from '@angular/router';


export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'professionals',
    loadComponent: () =>
      import('./pages/professionals/professionals.component').then(m => m.ProfessionalsComponent),
  },
  {
    path: 'professionals/:id',
    loadComponent: () =>
      import('./pages/professional-detail/professional-detail.component').then(m => m.ProfessionalDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent),
  },
  {
    path: 'servicos',
    loadComponent: () =>
      import('./pages/services/services.component').then(m => m.ServicesComponent),
  },
  {
    path: 'cliente-dashboard',

    loadComponent: () =>
      import('./pages/cliente-dashboard/cliente-dashboard.component').then(m => m.ClienteDashboardComponent),
  },
  {
    path: 'professional-dashboard',

    loadComponent: () =>
      import('./pages/professional-dashboard/professional-dashboard.component').then(m => m.ProfessionalDashboardComponent),
  },
  {
    path: 'professional-portfolio/:id',
    loadComponent: () =>
      import('./pages/professional-portifolio/professional-portifolio.component').then(m => m.ProfessionalPortfolioComponent),
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
