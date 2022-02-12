import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';


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
  conditionValid: boolean;

  closeClick(): void {
    if (this.email == "" || this.email == null ||
        this.password == "" || this.password == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
      return;
    }

    else {
      let link = this.BASE_URL + "user/loginUser";

      this.http.post<any>(link, { useremail:this.email, password:this.password }).pipe(
        catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
        if (data.message == "success") {
          this.socketService.useremail = this.email;
          this.socketService.initSocket();
          this.conditionValid = true;
          this.router.navigate(['/', 'chat']);
          return;
        }

        if (data.message == "user already connected") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Ce compte est déjà connecté";
          return;
        }
        /*else {
          //this.conditionValid = false;
        }*/
      });
      
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Email ou mot de passe invalide";
    }
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }
}
