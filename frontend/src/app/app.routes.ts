import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FriendsListComponent } from './components/friends-list/friends-list.component';
import { SendFriendRequestComponent } from './components/send-friend-request/send-friend-request.component';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { ChatRoomsComponent } from './components/chat-rooms/chat-rooms.component';
import {AuthGuard, GuestGuard} from './auth/auth.guard';
import {ChatWindowComponent} from './components/chat-window/chat-window.component';

export const routes: Routes = [
    { path: 'friends', component: FriendsListComponent, canActivate: [AuthGuard] },
    { path: 'friend-requests', component: FriendRequestsComponent, canActivate: [AuthGuard] },
    { path: 'send-friend-request', component: SendFriendRequestComponent, canActivate: [AuthGuard] },
    { path: 'chat-rooms', component: ChatRoomsComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
    { path: 'chat-rooms', component: ChatRoomsComponent, canActivate: [AuthGuard] },
    { path: 'chat/:roomId', component: ChatWindowComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/chat-rooms' }
];
