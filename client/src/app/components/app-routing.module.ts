import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AlbumsComponent } from './albums/albums.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ChatComponent } from './chat/chat.component';
import { ClavardageComponent } from './clavardage/clavardage.component';
import { DessinsComponent } from './dessins/dessins.component';
import { MainPageComponent } from './main-page/main-page.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { RoomsComponent } from './rooms/rooms.component';
import { SidenavComponent } from './sidenav/sidenav.component';

const routes: Routes = [
  {
    path: '', component: MainPageComponent
  },
  {
    path: 'chat', component: ChatComponent
  },
  {
    path: 'register', component: NewAccountComponent
  },
  {
    path: 'albums', component: AlbumsComponent
  },
  {
    path: 'rooms', component: RoomsComponent
  },
  {
    path: 'sidenav', component: SidenavComponent
  },
  {
    path: 'dessins', component: DessinsComponent
  },
  {
    path: 'clavardage', component: ClavardageComponent
  },
  {
    path:'avatar',component:AvatarComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
