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
    }
    else {
      let link = this.BASE_URL + "user/loginUser";

      this.http.post<any>(link, { useremail:this.email, password:this.password }).pipe(
        catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
        console.log("message");
        console.log(data);
        if (data.message == "success") {
          this.socketService.initSocket();
          this.socketService.useremail = this.email;
          this.conditionValid = true;
          console.log("first bool");
          console.log(this.conditionValid);
          console.log("second bool");
          console.log(this.socketService.isConnected);

          this.router.navigate(['/', 'chat']);
          console.log("both conditions gucci");
          console.log("yehaaa");
          return;

          /*if (this.socketService.isConnected == true && this.conditionValid == true) {
            this.router.navigate(['/', 'chat']);
            console.log("both conditions gucci");
            console.log("yehaaa");
          }*/
        }
        /*else {
          //this.conditionValid = false;
        }*/
      });
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Invalides mot de passe ou courriel.";
    }
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }
}
