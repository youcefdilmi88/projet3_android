import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})

export class NewAccountComponent implements OnInit {

  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";

  constructor(
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
      return false;
    }
    else if (this.pass != this.passRepeat) {
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Les mots de passes ne correspondent pas dumbass.";
      return false;
    }
    else {
      this.router.navigate([""]);

      let link=this.BASE_URL+"user/createUser";

      let email = (<HTMLInputElement>document.getElementById("mail")).value;
      let username = (<HTMLInputElement>document.getElementById("name")).value;
      let pass = (<HTMLInputElement>document.getElementById("pass")).value;
      this.http.post<any>(link,{useremail: email, password: pass, nickname: username}).subscribe((data: any) => {
        console.log(data);
      });
      return true;
    }
  }

  cancelClick(): void {
    this.router.navigate([""]);
  }
}
