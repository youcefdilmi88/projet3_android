import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Album } from '@app/classes/Album';
import { AlbumInterface } from '@app/interfaces/AlbumInterface';
import { AlbumTempService } from '@app/services/albumTempService';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';

@Component({
  selector: 'app-modify-drawing',
  templateUrl: './modify-drawing.component.html',
  styleUrls: ['./modify-drawing.component.scss']
})
export class ModifyDrawingComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  // private isPublic: boolean;
  private visibility: string; 
  public drawingNAME: string;
  public visibility2: string

  public AlbumsNamesPriv:Array<string> = [];
  public moveAlbumName: string;

  constructor(
    public dialogRef: MatDialogRef<ModifyDrawingComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    public albumTempSerivce: AlbumTempService,
  ) { }
 
  ngOnInit(): void {
    let link = this.BASE_URL + "album/getAlbums";
    this.http.get<any>(link).subscribe((data: any) => {
      this.albumTempSerivce.albums.clear();
      this.AlbumsNamesPriv = [];
      data.forEach((albums:any)=>{
        let albumObj:Album = new Album(albums as AlbumInterface);
        this.albumTempSerivce.albums.set(albumObj.getName() as string, albumObj);
        if(this.albumTempSerivce.albums.get(albums.albumName)!.getMembers().includes(this.socketService.email)) {
          if(albums.visibility == "private") {
            this.AlbumsNamesPriv.push(albums.albumName);
          }
        }
      });
      // this.AlbumsNames.sort().reverse();
    });
  }

//   toggleEditable(event: any) {
//     if ( event.target.checked ) {
//         this.isPublic = true; 
//         console.log("nice");
//    }
// } 

  autoRenew = new FormControl();
  onChange() {
    console.log(this.autoRenew.value);
  } 

  changeVisib(value: any) {
    console.log(value);
    this.visibility = value;
    this.visibility2 = value;
  }

  changeAlbumsNames(value: any) {
    console.log("WISSS", value);
    this.moveAlbumName = value;
  }

  updateDrawing() {
    let link = this.BASE_URL + "drawing/updateDrawing";
    let link2 = this.BASE_URL + "album/addDrawing";

    const drawingObj = {
    drawingName: this.socketService.drawingName,
    visibility: this.visibility,
    }

    if(this.drawingNAME == undefined) {
      // changer la visibilité
      this.http.post<any>(link,{useremail: this.socketService.email, drawing: drawingObj}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          if(data.message == "success") {
            console.log("CHANGED VISIBILITY");

            if(this.visibility == "public") {
              this.http.post<any>(link2, {drawingName: this.socketService.drawingName, useremail: this.socketService.email, albumName: "PUBLIC" }).subscribe((data:any) => {
                if (data.message == "success") {
                  console.log("dessin ajoute a album " + this.socketService.albumName);
                }
              });
            }
            else if(this.visibility == "private") {
              console.log("ARRIVE ICI?");
              this.http.post<any>(link2, {drawingName: this.socketService.drawingName, useremail: this.socketService.email, albumName:  this.moveAlbumName}).subscribe((data:any) => {
                if (data.message == "success") {
                  console.log("dessin ajoute a album " + this.socketService.albumName);
                }
              });
            }


          }
      });
    }
    else {
      //changer le nom et la visibilité
      this.http.post<any>(link,{newName: this.drawingNAME, useremail: this.socketService.email, drawing: drawingObj}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          if(data.message == "success") {
            console.log("CHANGED NAME AND VISIBLITY");

            if(this.visibility == "public") {
              this.http.post<any>(link2, {drawingName: this.socketService.drawingName, useremail: this.socketService.email, albumName: "a" }).subscribe((data:any) => {
                if (data.message == "success") {
                  console.log("dessin ajoute a album " + this.socketService.albumName);
                }
              });
            }

          }
        });
    }
    this.dialogRef.close();

  }

  cancelUpdate() {
    this.dialogRef.close();
  }

}
