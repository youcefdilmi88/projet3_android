import { Component, OnInit } from '@angular/core';
// import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  langue: string = '';


  constructor(
    // public dialogRef: MatDialogRef<SettingsComponent>,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    if(this.socketService.theme == "light grey"){
      document.getElementById("title0")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title0")!.style.color = LightGrey.text;
      document.getElementById("conf")!.style.backgroundColor = LightGrey.main;
      document.getElementById("conf")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title0")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title0")!.style.color = DarkGrey.text;
      document.getElementById("conf")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("conf")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title0")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title0")!.style.color = DeepPurple.text;
      document.getElementById("conf")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("conf")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title0")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title0")!.style.color = LightBlue.text;
      document.getElementById("conf")!.style.backgroundColor = LightBlue.main;
      document.getElementById("conf")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title0")!.style.backgroundColor = LightPink.main;
      document.getElementById("title0")!.style.color = LightPink.text;
      document.getElementById("conf")!.style.backgroundColor = LightPink.main;
      document.getElementById("conf")!.style.color = LightPink.text;
    }
  }

  language(event: any) {
    this.langue = event.target.value;
    console.log(this.langue);
    if (this.langue == "1") {
      this.socketService.language = "french";  
    }
    else {
      this.socketService.language = "english";
    }
    console.log(this.socketService.language);
    
  }
  
  onValChange(value: any){
    this.socketService.language = value;
  }

  onChange(value: any) {
    this.socketService.theme = value;
    console.log(this.socketService.theme);
  }


}
