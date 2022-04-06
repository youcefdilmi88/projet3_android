import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-accept-request',
  templateUrl: './accept-request.component.html',
  styleUrls: ['./accept-request.component.scss']
})
export class AcceptRequestComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  public memReq: string;

  constructor(
    public dialogRef: MatDialogRef<AcceptRequestComponent>,
    private http: HttpClient,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.roomListener();
    this.memReq = this.socketService.memberRequest;
  }

  roomListener() {
    this.socketService.getSocket().on("ALBUMMODIFIED", (data) => {
      data=JSON.parse(data);
      console.log(data.album);
      this.dialogRef.close();
    });
  }

  acceptRequest() {
    let link = this.BASE_URL + "album/acceptRequest";

    console.log("useremail", this.socketService.email);
    console.log("request", this.socketService.memberRequest);
    console.log("albumName", this.socketService.albumName);
    this.http.post<any>(link, {useremail: this.socketService.email, request: this.socketService.memberRequest, albumName: this.socketService.albumName}).subscribe((data:any) => { 
      if(data.message == "success") {
          console.log("ACCEPTED");
        }
    });
      this.dialogRef.close();
  }

}
