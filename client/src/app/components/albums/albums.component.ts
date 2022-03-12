import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';


@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})

export class AlbumsComponent implements OnInit {

  private readonly BASE_URL: string ="http://localhost:8080/";
  //"https://projet3-3990-207.herokuapp.com/";

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private hotkeyService: HotkeysService,
    private pencilService:PencilToolService,
  ) { this.hotkeyService.hotkeysListener();}

  ngOnInit(): void {
    this.pencilService.setUpPencil();
  }

  newDrawing() {
    this.welcomeDialogRef = this.dialog.open(WelcomeDialogComponent, {
      hasBackdrop: true,
      panelClass: 'filter-popup',
      autoFocus: false,
      disableClose: true,
      maxHeight: 500,
      maxWidth: 500,
    });
    this.welcomeDialogSub = this.welcomeDialogRef.afterClosed().subscribe(() => {
      this.dialog.open(NewDrawingComponent);
    });
  }

  logout() {
    let link = this.BASE_URL + "user/logoutUser";

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
