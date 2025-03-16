import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-register',
    imports: [
        RouterLink,
        NgIf,
        FormsModule
    ],
    templateUrl: './register.component.html'
})
export class RegisterComponent {
    username = '';
    password = '';
    message = '';
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) {}

    register() {
        this.authService.register(this.username, this.password).subscribe({
            next: (response) => {
                this.message = response.message;
                setTimeout(() => this.router.navigate(['/login']), 2000); // Redirect to login
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Registration failed';
            }
        });
    }
}
