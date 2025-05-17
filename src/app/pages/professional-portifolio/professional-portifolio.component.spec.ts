import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalPortifolioComponent } from './professional-portifolio.component';

describe('ProfessionalPortifolioComponent', () => {
  let component: ProfessionalPortifolioComponent;
  let fixture: ComponentFixture<ProfessionalPortifolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalPortifolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalPortifolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
