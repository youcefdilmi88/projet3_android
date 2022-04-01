import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-modify-drawing',
  templateUrl: './modify-drawing.component.html',
  styleUrls: ['./modify-drawing.component.scss']
})
export class ModifyDrawingComponent implements OnInit {

  private readonly BASE_URL: string = "https://projet3-3990-207.herokuapp.com/";
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

    if(this.drawingNAME == '') {
      // changer la visibilité
      this.http.post<any>(link,{useremail: this.socketService.email, drawing: drawingObj}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          if(data.message == "success") {
            console.log("CHANGED VISIBILITY");
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
          }
        });
    }
  }

}
