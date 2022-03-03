import { Component, AfterViewInit, Output, EventEmitter} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})

export class RoomsComponent implements AfterViewInit {
  
  @Output() callFunction = new EventEmitter();
  
  private readonly BASE_URL: string =//"http://localhost:8080/";
  "https://projet3-3990-207.herokuapp.com/";


  public list = new Array<string>(); 
  public numberOfRooms: number ;
  public buttonsTexts:Array<string> = ['Default'];

  constructor(
    private dialog: MatDialogRef<RoomsComponent>,
    private http: HttpClient,
    //private socketService: SocketService,    
    ) {}

  ngAfterViewInit(): void {
    let link = this.BASE_URL+"room/getAllRooms";
    this.http.get<any>(link).subscribe((data: any) => {
      let length = Object.keys(data).length;
      this.numberOfRooms = length;

      for(var i = 1; i <= length; i++) { 
        this.list.push(data[i].roomName);
        console.log(data[i].roomName);
        this.buttonsTexts = [...this.buttonsTexts, `Salle: ${data[i].roomName}`];
      }


    });


    

    // for(var i = 0; i <= this.numberOfRooms - 1; i++){
    //   this.buttonsTexts = [...this.buttonsTexts, `button ${length}`];
    //   console.log("HAAAAAAAAAAAA");
    //   console.log(this.numberOfRooms);
    // }

  }


  changeRoom(): void {
    console.log("test");
  }


  // public addButton(index:number):void {
  //   for(var i = 0; i <= this.numberOfRooms - 1; i++){
  //     this.buttonsTexts = [...this.buttonsTexts, `button ${index}`];
  //     console.log(this.numberOfRooms);
  //   }
  // }

  cancel(): void {
    this.dialog.close();
}

}
