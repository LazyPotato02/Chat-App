import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        NgIf,
        RouterLink
    ],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    username = '';
    password = '';
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) {}

    login() {
        this.authService.login(this.username, this.password).subscribe({
            next: (tokens) => {
                localStorage.setItem('access_token', tokens.access);
                localStorage.setItem('refresh_token', tokens.refresh);
                this.router.navigate(['/']);
            },
            error: () => {
                this.errorMessage = 'Invalid username or password';
            }
        });
    }
}
