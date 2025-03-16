import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FriendsListComponent} from './components/friends-list/friends-list.component';

@Component({
  selector: 'app-root',
    imports: [FriendsListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
