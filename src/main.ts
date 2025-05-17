import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    importProvidersFrom(ReactiveFormsModule)
  ]
}).catch(err => console.error(err));
