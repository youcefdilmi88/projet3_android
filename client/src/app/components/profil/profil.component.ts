import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  constructor(
    private socketService: SocketService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
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
