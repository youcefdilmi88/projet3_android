import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  private readonly BASE_URL: string ="http://localhost:8080/";
  //"https://projet3-3990-207.herokuapp.com/";
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
  conditionValid: boolean;

  closeClick(): void {
    if (this.email == "" || this.email == null ||
        this.password == "" || this.password == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
      return;
    }
    else { 
      let link=this.BASE_URL+"user/loginUser";
    
      this.http.post<any>(link,{useremail:this.email,password:this.password}).subscribe((data: any) => {
        console.log("message:"+data.message);
        console.log("first:"+data.currentRoom);
        if(data.message=="success") {
          this.socketService.email = this.email;
          this.socketService.nickname = data.user.nickname;
          this.socketService.currentRoom=data.currentRoom;
          this.socketService.initSocket();
          this.router.navigate(['/', 'albums']);
        }
      },
      (error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if(error.error.message=="password does not match") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Email ou mot de passe invalide";
        }
        else if(error.error.message=="user already connected") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Ce compte est déjà connecté";
          return;
        }
        else if(error.error.message=="user not found !") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Ce compte n'existe pas";
        }
      }
      );
    }

  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }
}
