import { HttpClient } from '@angular/common/http';

import { AfterViewInit, Component, ViewChild} from '@angular/core';



//import { io } from 'socket.io-client';

@Component({
  selector: 'app-chattest',
  templateUrl: './chattest.component.html',
  styleUrls: ['./chattest.component.scss']
})
export class ChattestComponent implements AfterViewInit {

  @ViewChild('chatinput') chatinput:HTMLElement;
  private readonly BASE_URL: string ="http://localhost:8080/";
  //"https://projet3-3990-207.herokuapp.com/";
  //"http://localhost:8080/";


  constructor(private http: HttpClient) { }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngAfterInit() {
    console.log("chat page !")
  }

  sendchatinput(text:String) {
     console.log("string to send "+text);
     this.userDataCall();
  
    
      
    
/*
    const socket=io('http://localhost:8080/')

    socket.on("connection",()=>{
      console.log("connected")
    })
    socket.open()
    socket.emit("msg",text)
    */
  }



  public userDataCall() {
    let link=this.BASE_URL+"userData/msg";

    this.http.post<any>(link,{msg:"sjdakjsd",user:"admin"}).subscribe((data: any) => {
      console.log(data);
    });

    
  
  }

  


}

