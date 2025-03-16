import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, NgIf],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage = '';

    constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    login() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            this.authService.login(username, password).subscribe({
                next: (tokens) => {
                    localStorage.setItem('access_token', tokens.access);
                    localStorage.setItem('refresh_token', tokens.refresh);
                    this.router.navigate(['/friends']);
                },
                error: (error) => {
                    if (error.status === 401) {
                        this.errorMessage = 'Invalid username or password';
                    } else {
                        this.errorMessage = 'Login failed. Please try again.';
                    }
                }
            });
        } else {
            this.errorMessage = 'Please enter your username and password';
        }
    }
}
