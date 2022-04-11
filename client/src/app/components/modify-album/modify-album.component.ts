import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';

@Component({
  selector: 'app-modify-album',
  templateUrl: './modify-album.component.html',
  styleUrls: ['./modify-album.component.scss']
})
export class ModifyAlbumComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  albumNAME: string;
  albumDESCRIPTION: string;

  constructor(
    public dialogRef: MatDialogRef<ModifyAlbumComponent>,
    private socketService: SocketService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  updateAlbum() : void {
    let link = this.BASE_URL + "album/updateAlbum";

    console.log("TODAY:", this.socketService.albumName);

    const albumObj = {
      albumName : this.socketService.albumName,
      description : this.albumDESCRIPTION,
    }

    console.log("DA");
    console.log("AD", this.albumNAME);
    if(this.albumNAME == undefined && this.albumDESCRIPTION == undefined) {
      document.getElementById("errorAlbum")!.style.visibility= "visible";
      // this.playAudio("error.wav");
    }
    else {
    // change seulement la description de l'album
    if(this.albumNAME == undefined || this.albumNAME == "") {
      this.http.post<any>(link,{useremail: this.socketService.email, album: albumObj}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          if(data.message == "success") {
            console.log("CHANGED DESCRIPTION");
          }
        });
    }
    else {
      this.http.post<any>(link,{newName: this.albumNAME, useremail: this.socketService.email, album: albumObj}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          if(data.message == "success") {
            console.log("CHANGED ALBUM NAME AND DESCRIPTION");
          }
        });
    }
    this.dialogRef.close();
    }

  }

  close() {
    this.dialogRef.close();
  }

}
