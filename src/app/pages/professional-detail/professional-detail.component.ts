import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Project {
  title: string;
  description: string;
  imageUrl: string;
}

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professional-detail.component.html',
  styleUrls: ['./professional-detail.component.css']
})
export class ProfessionalDetailComponent {
  
  activeTab: 'portfolio' | 'chat' = 'portfolio';


  professional = {
    name: 'Pedro Silva',
    bio: 'Mestre de obras com 15 anos de experiência, especializado em alvenaria estrutural e acabamentos finos.',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    contactEmail: 'pedrosilva@default.com',
    portfolio: [
      { title: 'Projeto de Muro Residencial', description: 'Construção de muro com acabamento em pedra natural.', imageUrl: 'https://via.placeholder.com/400x300?text=Muro' },
      { title: 'Fachada Modernizada', description: 'Reforma completa com revestimentos modernos.', imageUrl: 'https://via.placeholder.com/400x300?text=Fachada' },
      { title: 'Construção de Paredes', description: 'Paredes estruturais com design inovador.', imageUrl: 'https://via.placeholder.com/400x300?text=Paredes' }
    ]
  };


  chatMessages: ChatMessage[] = [
    { sender: 'Cliente Teste', content: 'Olá, gostaria de saber mais sobre seu portfólio.', timestamp: new Date() },
    { sender: this.professional.name, content: 'Claro, posso lhe mostrar os detalhes. Qual projeto lhe chamou atenção?', timestamp: new Date() }
  ];
  newChatMessage: string = '';

 
  setActiveTab(tab: 'portfolio' | 'chat'): void {
    this.activeTab = tab;
  }

 
  sendMessage(): void {
    if (this.newChatMessage.trim()) {
      this.chatMessages.push({
        sender: 'Cliente Teste',
        content: this.newChatMessage.trim(),
        timestamp: new Date()
      });
      this.newChatMessage = '';
    }
  }

 
  contratar(): void {
    alert(`Você está contratando ${this.professional.name}. Um representante entrará em contato em breve!`);
  }

  
  getProfessionalEmail(): string {
    return this.professional.name.replace(/\s+/g, '').toLowerCase() + '@default.com';
  }
}
