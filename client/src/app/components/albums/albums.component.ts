import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})

export class AlbumsComponent implements OnInit {

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
  ) { this.hotkeyService.hotkeysListener();}

  ngOnInit(): void {
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

}
