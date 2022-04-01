import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { URL } from '../../../../constants';
import { French, English} from '@app/interfaces/Langues';
// import { SettingsComponent } from '../settings/settings.component';
import { MatDialog } from '@angular/material/dialog';
// import { SettingsComponent } from '../settings/settings.component';
// import { catchError } from 'rxjs/operators';
import { LightGrey, DarkGrey } from '@app/interfaces/Themes';
import { RouterOutlet } from '@angular/router';
import { fader } from '@assets/animations';



@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'], 
  animations: [fader],
})

export class MainPageComponent implements OnInit{


  private readonly BASE_URL: string = URL;
  //"https://projet3-3990-207.herokuapp.com/";
  socket:Socket;
  public rejoindre: string;
  public creer: string;
  public emai: string;
  public pass: string;
  public connection: string;
  public options: string;
  public error1: string;
  public error2: string;
  public error3: string;
  public error4: string;

  constructor(
    public dialog: MatDialog,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    private ref:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // setTimeout(() => { this.ngOnInit() }, 100);
    this.ref.detectChanges();
    if(this.socketService.language == "french") 
    {
      this.rejoindre = French.join;
      this.creer = French.create;
      this.emai = French.email;
      this.pass = French.pass;
      this.connection = French.connection;
      this.options = French.options;
      this.error1 = French.error1;
      this.error2 = French.error2;
      this.error3 = French.error3;
      this.error4 = French.error4;
    }
    else {
      this.rejoindre = English.join;
      this.creer = English.create;
      this.emai = English.email;
      this.pass = English.pass;
      this.connection = English.connection;
      this.options = English.options;
      this.error1 = English.error1;
      this.error2 = English.error2;
      this.error3 = English.error3;
      this.error4 = English.error4;
    }

  console.log(this.socketService.theme);
    if(this.socketService.theme == "light grey"){
      const collection = document.getElementsByTagName("button");
      for (let i = 0; i < collection.length; i++) {
      collection[i].style.backgroundColor = LightGrey.main;
      collection[i].style.color = LightGrey.text;
      //aussi pour le title
      }
    }
    else if(this.socketService.theme == "dark grey"){
      const collection = document.getElementsByTagName("button");
      for (let i = 0; i < collection.length; i++) {
      collection[i].style.backgroundColor = DarkGrey.main;
      collection[i].style.color = DarkGrey.text;
      //aussi pour le title
      }
    }

  }

  password: string;
  email: string;
  conditionValid: boolean;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  closeClick(): void {
    if (this.email == "" || this.email == null ||
        this.password == "" || this.password == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = this.error1;
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
          this.playAudio();
        }
      },
      (error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if(error.error.message=="password does not match") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error2;
        }
        else if(error.error.message=="user already connected") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error3;
          return;
        }
        else if(error.error.message=="user not found !") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error4;
        }
      }
      );
    }

  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/notif.wav";
    audio.load();
    audio.play();
  }
  
  //("../../../assets/avatar_1.png");

  openSettings(): void {
    // this.dialog.open(SettingsComponent);
    this.router.navigate(['/', 'settings']);
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
  }

  avatar():void {
    this.router.navigate(['/','avatar']);
  }
}
