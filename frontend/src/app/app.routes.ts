import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FriendsListComponent } from './components/friends-list/friends-list.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'friends', component: FriendsListComponent},
    { path: '**', redirectTo: '/login' }
];
