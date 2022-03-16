import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})

export class NewAccountComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
  }

  pass: string;
  passRepeat: string;
  mail: string;
  name: string;

  closeClick(): boolean {
    if (this.passRepeat == "" || this.passRepeat == null ||
        this.pass == "" || this.pass == null ||
        this.name == "" || this.name == null ||
        this.mail == "" || this.mail == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
      return false;
    }

    else if (this.pass != this.passRepeat) {
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Les mots de passes ne correspondent pas";
      return false;
    }
    
    else {

      let link=this.BASE_URL+"user/registerUser";

      let email = (<HTMLInputElement>document.getElementById("mail")).value;
      let username = (<HTMLInputElement>document.getElementById("name")).value;
      let pass = (<HTMLInputElement>document.getElementById("pass")).value;
      this.http.post<any>(link,{useremail: email, password: pass, nickname: username}).subscribe((data: any) => {
        console.log(data);
        if (data == 404) {
          console.log("404");
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Ce courriel est déjà pris.";
        }
        else if (data.message == "success") {
          console.log("SUCC");
          this.router.navigate([""]);
        }
      },(error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if( error.error.message == "404 (Not Found)" || error.error.message == "Http failure response for https://projet3-3990-207.herokuapp.com/user/registerUser: 404 Not Found" || error.error.message == "failed") {
          console.log("404");
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = "Ce courriel est déjà pris.";
        }
      }
      );
      return true;
    }
  }

  cancelClick(): void {
    this.router.navigate([""]);
  }

  openAvatar(): void {
    this.dialog.open(AvatarComponent, { disableClose: true });
  }

}
