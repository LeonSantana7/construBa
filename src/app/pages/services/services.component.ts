import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDataService, ServiceItem } from '../../services/dynamic-data.service.service';
import { Observable } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  services$!: Observable<ServiceItem[]>;
  selectedService?: ServiceItem;

  serviceForm!: FormGroup;

  pricing = [
    { service: 'Serviço 1', price: 'R$ 80-120/m²' },
    { service: 'Serviço 2', price: 'R$ 150-200/m²' },
    { service: 'Serviço 3', price: 'R$ 50-100/m²' }
  ];

  constructor(private dynamicDataService: DynamicDataService) {}

  ngOnInit(): void {
    this.services$ = this.dynamicDataService.getServices();
    this.serviceForm = new FormGroup({
      serviceType: new FormControl('', Validators.required),
      serviceDetails: new FormControl('', Validators.required),
      serviceLocation: new FormControl('', Validators.required),
      serviceDate: new FormControl('', Validators.required)
    });
  }

  showDetails(service: ServiceItem): void {
    this.selectedService = service;
    this.serviceForm.patchValue({ serviceType: service.name });
  }

  closeDetails(): void {
    this.selectedService = undefined;
    this.serviceForm.reset();
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      console.log('Orçamento solicitado:', this.serviceForm.value);
      alert('Orçamento solicitado com sucesso!');
      this.closeDetails();
    }
  }
}
