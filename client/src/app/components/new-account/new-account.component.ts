import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { URL } from '../../../../constants';
import { French, English } from '@app/interfaces/Langues';
import { SocketService } from '@app/services/socket/socket.service';
import { RouterOutlet } from '@angular/router';
import { fader } from '@assets/animations';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';


@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss'],
  animations: [fader],
})

export class NewAccountComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  public emai: string;
  public password: string;
  public repeatPass: string;
  public cancel: string;
  public confirm: string;
  public createTitle: string;
  public error1: string
  public error5: string;
  public error6: string;


  constructor(
    private socketService: SocketService,
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.socketService.language == "french") 
    {
      this.emai = French.email;
      this.password = French.pass;
      this.repeatPass = French.repeat;
      this.cancel = French.cancel;
      this.confirm = French.create;
      this.createTitle = French.createTitle;
      this.error1 = French.error1;
      this.error5 = French.error5;
      this.error6 = French.error6;
    }
    else {
      this.emai = English.email;
      this.password = English.pass;
      this.repeatPass = English.repeat;
      this.cancel = English.cancel;
      this.confirm = English.create;
      this.createTitle = English.createTitle;
      this.error1 = English.error1;
      this.error5 = English.error5;
      this.error6 = English.error6;
    }
    if(this.socketService.theme == "light grey"){
      document.getElementById("buttonMain5")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain5")!.style.color = LightGrey.text;
      document.getElementById("buttonMain6")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain6")!.style.color = LightGrey.text;
      document.getElementById("buttonMain7")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain7")!.style.color = LightGrey.text;
      document.getElementById("title2")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title2")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("buttonMain5")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain5")!.style.color = DarkGrey.text;
      document.getElementById("buttonMain6")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain6")!.style.color = DarkGrey.text;
      document.getElementById("buttonMain7")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain7")!.style.color = DarkGrey.text;
      document.getElementById("title2")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title2")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {      
      document.getElementById("buttonMain5")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain5")!.style.color = DeepPurple.text;
      document.getElementById("buttonMain6")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain6")!.style.color = DeepPurple.text;
      document.getElementById("buttonMain7")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain7")!.style.color = DeepPurple.text;
      document.getElementById("title2")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title2")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") {
      document.getElementById("buttonMain5")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain5")!.style.color = LightBlue.text;
      document.getElementById("buttonMain6")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain6")!.style.color = LightBlue.text;
      document.getElementById("buttonMain7")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain7")!.style.color = LightBlue.text;
      document.getElementById("title2")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title2")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {
      document.getElementById("buttonMain5")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain5")!.style.color = LightPink.text;
      document.getElementById("buttonMain6")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain6")!.style.color = LightPink.text;
      document.getElementById("buttonMain7")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain7")!.style.color = LightPink.text;
      document.getElementById("title2")!.style.backgroundColor = LightPink.main;
      document.getElementById("title2")!.style.color = LightPink.text;
    }
  }

  pass: string;
  passRepeat: string;
  mail: string;
  name: string;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  closeClick(): boolean {
    if (this.passRepeat == "" || this.passRepeat == null ||
        this.pass == "" || this.pass == null ||
        this.name == "" || this.name == null ||
        this.mail == "" || this.mail == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = this.error1;
      this.playAudio("error.wav");
      let erreur= document.getElementById("buttonMain6")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
      return false;
    }

    else if (this.pass != this.passRepeat) {
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = this.error5;
      this.playAudio("error.wav");
      let erreur= document.getElementById("buttonMain6")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
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
          document.getElementById("error")!.innerHTML = this.error6;
          this.playAudio("error.wav");
          let erreur= document.getElementById("buttonMain6")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
          return;
        }
        else if (data.message == "success") {
          console.log("SUCC");
          this.router.navigate([""]);
          this.playAudio("notif.wav");
        }
      },(error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if( error.error.message == "404 (Not Found)" || error.error.message == "Http failure response for https://projet3-3990-207.herokuapp.com/user/registerUser: 404 Not Found" || error.error.message == "failed") {
          console.log("404");
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error6;
          this.playAudio("error.wav");
          let erreur= document.getElementById("buttonMain6")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
          return;
        }
      }
      );
      return true;
    }
  }

  playAudio(title: string){
    let audio = new Audio();
    audio.src = "../../../assets/" + title;
    audio.load();
    audio.play();
  }

  cancelClick(): void {
    this.router.navigate([""]);
    this.playAudio("ui2.wav");
  }

  openAvatar(): void {
    this.dialog.open(AvatarComponent, { disableClose: true });
    this.playAudio("ui2.wav");
  }

}
