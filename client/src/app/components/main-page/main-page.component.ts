import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  socket:Socket;

  constructor(
    private socketService: SocketService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  password: string;
  email: string;

  closeClick(): void {
    if (this.email == "" || this.email == null ||
        this.password == "" || this.password == null) {

      document.getElementById("error")!.style.visibility= "visible";
    }
    else {
      this.router.navigate(['/', 'chat']);
      this.socketService.initSocket();
    }
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }
}
