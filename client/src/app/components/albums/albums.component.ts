import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { URL } from '../../../../constants';
import { Router } from '@angular/router';
import { SelectionToolService } from '@app/services/tools/selection-tool/selection-tool.service';
import { NewAlbumComponent } from '../new-album/new-album.component';
import { Album } from '@app/classes/Album';
import { AlbumInterface } from '@app/interfaces/AlbumInterface';
import { French, English} from '@app/interfaces/Langues';
import { AlbumTempService } from '@app/services/albumTempService';
import { SidenavService } from '@app/services/sidenav/sidenav.service';
// import { RouterOutlet } from '@angular/router';
// import { fader } from '@assets/animations';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  // animations: [fader],
})

export class AlbumsComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  public AlbumsNames:Array<string> = [];
  public AlbumsVisibilite:Array<string> = [];
  public compteur:number = 0;
  public numberOfAlbums: number;

  public albumTitle: string;
  public creaAlbum: string;
  public accoutMenu: string;
  public open: string;
  public delete: string;
  public goChat: string;
  
 
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private hotkeyService: HotkeysService,
    private pencilService:PencilToolService,
    private rectangleService:ToolRectangleService,
    private ellipseService:ToolEllipseService,
    private selectionService: SelectionToolService,
    public albumTempSerivce: AlbumTempService,
    public sidenavService: SidenavService,
  ) { 
      this.hotkeyService.hotkeysListener();
    }

  ngOnInit(): void {
    this.pencilService.setUpPencil();
    this.rectangleService.setUpRectangle();
    this.ellipseService.setUpEllipse();
    this.selectionService.setUpSelection();
    this.sidenavService.reset();
    this.getAllAlbums();
    this.roomListener();

    if(this.socketService.language == "french") {
     this.albumTitle =  French.chooseAlbum;
     this.creaAlbum = French.createAlbum;
     this.accoutMenu = French.menuCompte;
     this.open = French.open;
     this.delete = French.delete;
     this.goChat = French.goChat;
    }
    else {
      this.albumTitle =  English.chooseAlbum;
      this.creaAlbum = English.createAlbum;
      this.accoutMenu = English.menuCompte;
      this.open = English.open;
      this.delete = English.delete;
      this.goChat = English.goChat;
    }
  }

//   newDrawing() {
//     this.dialog.open(NewDrawingComponent);
// }

  roomListener() {
    this.socketService.getSocket().on("ALBUMCREATED", (data) => {
      this.getAllAlbums();
    });

    this.socketService.getSocket().on("ALBUMDELETED", (data) => {
      this.getAllAlbums();
    });
  }

  getAllAlbums() {
    let link = this.BASE_URL + "album/getAlbums";
    this.http.get<any>(link).subscribe((data: any) => {
      this.albumTempSerivce.albums.clear();
      let length = Object.keys(data).length;
      this.numberOfAlbums = length;
      this.AlbumsNames = [];
      this.AlbumsVisibilite = [];
      data.forEach((albums:any)=>{
        let albumObj:Album = new Album(albums as AlbumInterface);
        this.albumTempSerivce.albums.set(albumObj.getName() as string, albumObj);
        this.AlbumsNames.push(albums.albumName);
        this.AlbumsVisibilite.push(albums.visibility);
        console.log(albums.description);
      });
    });
  }

  createAlbum() {
    this.dialog.open(NewAlbumComponent, { disableClose: false });
    this.playAudio("ui2.wav")
  }

  // prepareRoute(outlet: RouterOutlet) {
  //   return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  // }

  defaultRoom() {
    this.socketService.joinRoom('DEFAULT');
    this.socketService.currentRoom = 'DEFAULT';
    let link2 = this.BASE_URL + "room/joinRoom";

    const userObj={
      useremail:this.socketService.email,
      nickname:this.socketService.nickname,
    }

    this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {
  
      if(data.message == "success") {
        this.socketService.currentRoom = 'DEFAULT';
        console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
      }
    });
  }


  openAlbum(element: any) {
    let link = this.BASE_URL + "album/joinAlbum";

    this.http.post<any>(link, {albumName: element.textContent.trim().slice(7), useremail: this.socketService.email}).subscribe((data:any) => { 
      if(data.message == "success") {
        this.router.navigate(['/', 'dessins']);
        this.playAudio("ui2.wav");
        this.socketService.albumName = element.textContent.trim().slice(7);
        console.log("album name", this.socketService.albumName);
      }
      else {
        this.playAudio("error.wav");
        console.log("response", data);
      }
    });
  }


  // let link2 = this.BASE_URL + "drawing/deleteDrawing";

  // this.http.post<any>(link2, {drawingName: element.textContent.trim().slice(10)}).subscribe((data:any) => {
  //   if (data.message == "success") {
  //     console.log("DELETE DRAWING IS " + data);
  //   }
  // });

  deleteAlbum(element: any) : void {
    let link = this.BASE_URL + "album/deleteAlbum";
    let link2 = this.BASE_URL + "album/getDrawings/" + element.textContent.trim().slice(10);
    let link3 = this.BASE_URL + "drawing/deleteDrawing";
    
    this.http.post<any>(link, {albumName: element.textContent.trim().slice(10), useremail: this.socketService.email}).subscribe((data:any) => {
      if(data.message == "success") {
        this.playAudio("bin.wav");
        console.log("ALBUM DELETED");
        this.http.get<any>(link2, {}).subscribe((data:any) => {
          let length = Object.keys(data).length;
          console.log("pp size", length);
          for (let i = 0; i < length; i++) {
            this.http.post<any>(link3, {drawingName: data[i].drawingName }).subscribe((data:any) => {
              console.log("i", data[i].drawingName);
            });
          }
        });
      }
      else {
        console.log("YOU ARE NOT THE CREATOR DUMBASS");
      }
    });
  }  

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  logout() {
    let link = this.BASE_URL + "user/logoutUser";
    this.playAudio("ui1.wav");
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
