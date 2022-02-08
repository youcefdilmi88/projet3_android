import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { MainPageComponent } from './main-page/main-page.component';
import { NewAccountComponent } from './new-account/new-account.component';

const routes: Routes = [
  {
    path: 'main', component: MainPageComponent
  },
  {
    path: 'chat', component: ChatComponent
  },
  {
    path: 'register', component: NewAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
