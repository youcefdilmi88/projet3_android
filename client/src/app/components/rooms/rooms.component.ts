import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  constructor(private dialog: MatDialogRef<RoomsComponent>) {}

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialog.close();
}

}
