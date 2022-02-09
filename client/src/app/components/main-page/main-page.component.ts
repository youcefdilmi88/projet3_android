import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";
  socket:Socket;

  constructor(
    private socketService: SocketService,
    private http: HttpClient,
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
      let link=this.BASE_URL+"user/loginUser";

      this.http.post<any>(link,{useremail:this.email, password:this.password}).subscribe((data: any) => {
        if (data.message == "success") {
          console.log("yehaaa");
        }
        else {
          console.log("POUReE");
        }
      });

      this.router.navigate(['/', 'chat']);
      this.socketService.initSocket();
    }
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }
}
