import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        RouterOutlet,
        RouterLink,
        NgIf
    ],
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    username: string | null = null;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.updateUsername();
    }

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    logout(): void {
        this.authService.logout();
    }

    private updateUsername(): void {
        const user = this.authService.getUser();
        this.username = user ? user.username : null;
    }
}
