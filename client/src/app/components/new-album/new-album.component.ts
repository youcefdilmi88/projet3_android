import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';

@Component({
  selector: 'app-new-album',
  templateUrl: './new-album.component.html',
  styleUrls: ['./new-album.component.scss']
})
export class NewAlbumComponent implements OnInit {

  private readonly BASE_URL=URL;
  public numberOfAlbums: number;
  public AlbumsNames:Array<string> = [];
  public AlbumsVisibilite:Array<string> = [];
  name: string;
  description: string;


  constructor(
    public dialogRef: MatDialogRef<NewAlbumComponent>,
    private socketService: SocketService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  createAlbum() : void  {
    console.log("name", this.name);
    console.log("description", this.description);

    let link = this.BASE_URL + "album/createAlbum";
    
    this.http.post<any>(link, {albumName: this.name.trim(), creator: this.socketService.email, visibility:"public", description: this.description}).subscribe((data:any) => {
      if(data.message == "success") {
        console.log("ALBUM CREATED");
      }
    });
    this.dialogRef.close();
  }    

}
