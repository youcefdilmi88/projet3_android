import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  private readonly BASE_URL: string = URL;


  public activeUsers:Array<string> = [];


  constructor(
    public dialogRef: MatDialogRef<UsersComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    public drawingTempSerivce: DrawingTempService,
  ) { }

  ngOnInit(): void {
    console.log("album name", this.socketService.albumName);
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;

    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.activeUsers = [];

      data.forEach((drawing:any)=>{
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        console.log("obj", drawingObj);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        
        this.activeUsers.push(drawing.members);
        console.log( this.activeUsers);
      });
    });

    this.roomListener();
  }

  roomListener() {
    this.socketService.getSocket().on("FMODIFIED", (data) => {
      data=JSON.parse(data);
    });

  }

  addFriend(element: any) {
    let link = this.BASE_URL + "user/addFriend";

    console.log("FRIEND", element.textContent.trim().slice(18));
    this.http.post<any>(link, {newFriend: this.socketService.email, targetUser: element.textContent.trim().slice(18)}).subscribe((data:any) => { 
      if(data.message == "success") {
        console.log("added friend");
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

}
