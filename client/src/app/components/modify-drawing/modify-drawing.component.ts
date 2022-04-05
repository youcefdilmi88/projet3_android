import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  private isPublic: boolean;
  private visibility: string; 
  public drawingNAME: string;

  constructor(
    public dialogRef: MatDialogRef<ModifyDrawingComponent>,
    private socketService: SocketService,
    private http: HttpClient,
  ) { }
 
  ngOnInit(): void {
    
  }

  toggleEditable(event: any) {
    if ( event.target.checked ) {
        this.isPublic = true; 
   }
} 

  updateDrawing() {
    let link = this.BASE_URL + "drawing/updateDrawing";
    let link2 = this.BASE_URL + "album/addDrawing";

    
    console.log(this.socketService.drawingName);

    if(this.isPublic) {
      this.visibility = "public";
    }
    else {
      this.visibility = "private";
    }

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
              this.http.post<any>(link2, {drawingName: this.socketService.drawingName, useremail: this.socketService.email, albumName: "a" }).subscribe((data:any) => {
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
