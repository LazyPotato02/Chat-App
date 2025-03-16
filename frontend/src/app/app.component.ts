import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        RouterLink,
        NgIf,
        RouterOutlet
    ],
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(private authService: AuthService, private router: Router) {}

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    logout(): void {
        this.authService.logout();
    }
}
