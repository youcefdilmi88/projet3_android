import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  constructor(private dialog: MatDialogRef<AvatarComponent>) {}

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialog.close();
}

}
