import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {
  features = [
    {
      icon: '📅',
      title: 'Génération Automatique',
      description: 'Générez votre emploi du temps de révision automatiquement à partir de votre emploi du temps scolaire'
    },
    {
      icon: '🎯',
      title: 'Personnalisé',
      description: 'Adaptez votre planning selon vos préférences et votre temps de préparation'
    },
    {
      icon: '📊',
      title: 'Suivi des Progrès',
      description: 'Suivez votre progression avec des statistiques détaillées et des quiz interactifs'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Recevez des rappels pour ne jamais manquer une session de révision'
    }
  ];

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
