import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AlbumsComponent } from './albums/albums.component';
import { ChatComponent } from './chat/chat.component';
import { MainPageComponent } from './main-page/main-page.component';
import { NewAccountComponent } from './new-account/new-account.component';
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
    path: 'sidenav', component: SidenavComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
