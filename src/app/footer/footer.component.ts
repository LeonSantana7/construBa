import { AfterViewInit, Component } from '@angular/core';
import feather from 'feather-icons';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements AfterViewInit {
  
  ngAfterViewInit(): void {
    feather.replace();
  }
}
