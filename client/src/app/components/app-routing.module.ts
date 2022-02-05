import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { MainPageComponent } from './main-page/main-page.component';

const routes: Routes = [
  {
    path: '', component: MainPageComponent
  },
  {
    path: 'chat', component: ChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
