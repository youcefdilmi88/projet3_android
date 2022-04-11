import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-create-canal',
  templateUrl: './create-canal.component.html',
  styleUrls: ['./create-canal.component.scss']
})
export class CreateCanalComponent implements OnInit {
  @ViewChild('roomname') input: any;
  private readonly BASE_URL=URL;
  room: string;

  constructor(
    public dialogRef: MatDialogRef<CreateCanalComponent>,
    public dialog: MatDialog,
    private socketService: SocketService,
    private http: HttpClient,
    // private router: Router,
    // public drawingTempSerivce: DrawingTempService,
  ) { }

  ngOnInit(): void {
  }


  create(text: string) {
    let link = this.BASE_URL+"room/createRoom";
    let link2 = this.BASE_URL+"room/getAllRooms";

    text.trim();
    if (text.trim() != '') {
      this.http.get<any>(link2).subscribe((data: any) => {
        
            document.getElementById("error")!.style.visibility= "hidden";
            this.http.post<any>(link, { roomName: this.room.trim(), creator: this.socketService.email }).subscribe((data: any) => {
              if (data.message == "success") {
                console.log(data.message);
              }
            },(error:HttpErrorResponse)=>{
              console.error(error);
              console.log(error.status);
              console.log(error.error.message);
              if( error.error.message == "404 (Not Found)" || data == 404 || error.error.message == "Http failure response for "+this.BASE_URL+"/room/createRoom: 404 Not Found" || error.error.message == "failed") {
                document.getElementById("error")!.style.visibility = "visible";
                document.getElementById("error")!.innerHTML = "La salle " + text.trim() + " existe déjà";
              }
            }
            );
      });
    }

      // if c'est vide
      if (text.trim().length == 0) {
        this.input.nativeElement.value = ' ';
      }
      if (text.trim() == "" || text.trim() == null) {
        document.getElementById("error")!.style.visibility= "visible";
        document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
      }
      
      this.input.nativeElement.focus();

    this.dialogRef.close();
  }


}
