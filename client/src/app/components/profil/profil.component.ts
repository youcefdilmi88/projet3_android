import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  public useremail: string;
  public nickname: string;
  public lastLoggedIn: string;
  public lastLoggedOut: string;
  public friends: Array<string>;

  constructor(
    private socketService: SocketService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    if(this.socketService.theme == "light grey"){
      document.getElementById("title100")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title100")!.style.color = LightGrey.text;    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title100")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title100")!.style.color = DarkGrey.text;    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title100")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title100")!.style.color = DeepPurple.text;    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title100")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title100")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title100")!.style.backgroundColor = LightPink.main;
      document.getElementById("title100")!.style.color = LightPink.text;
    }

    const loggedIn: DatePipe = new DatePipe('en-CA');
    let formattedDate1 = loggedIn.transform(this.socketService.userObj.lastLoggedIn, 'dd-MM-yyyy HH:mm:ss') as string;

    const loggedOut: DatePipe = new DatePipe('en-CA');
    let formattedDate2 = loggedOut.transform(this.socketService.userObj.lastLoggedOut, 'dd-MM-yyyy HH:mm:ss') as string;

    this.useremail = this.socketService.userObj.useremail;
    this.nickname = this.socketService.userObj.nickname;
    this.lastLoggedIn = formattedDate1;
    this.lastLoggedOut = formattedDate2;
    
  }


  playAudio(){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/ui1.wav";
      audio.load();
      audio.play();
    }
  }

  
  logout() {
    let link = this.BASE_URL + "user/logoutUser";

    this.playAudio();
    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });
  }

  

}
