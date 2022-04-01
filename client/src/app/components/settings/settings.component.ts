import { Component, OnInit } from '@angular/core';
// import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';


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
