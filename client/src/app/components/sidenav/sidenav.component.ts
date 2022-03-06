import { Component } from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { Tools } from 'src/app/interfaces/tools.interface';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { NewDrawingComponent } from '../../components/new-drawing/new-drawing.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})

export class SidenavComponent {

  constructor(private dialog: MatDialog, private sideNavService: SidenavService, private toolService: ToolsService) { }

  get currentToolId(): number {
    return this.toolService.selectedToolId;
  }

  get toolList(): Map<number, Tools> {
    return this.sideNavService.toolList;
  }

  get isOpened(): boolean {
    return this.sideNavService.isOpened;
  }

  /// Choisit un parametre
  get selectedParameter(): number {
    return this.sideNavService.selectedParameter;
  }

  // Reinitialisation du dessin
  openNewDrawing(): void {
    this.dialog.open(NewDrawingComponent, {});
  }

  /// Ouvre le sidenav
  open(): void {
    this.sideNavService.open();
  }

  /// Ferme le sidenav
  close(): void {
    this.sideNavService.close();
  }

  /// Changer la selection avec un toggle button
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    this.sideNavService.selectionChanged(selectedItem);
  }

  /// Ouvre le menu control
  openControlMenu(): void {
    this.sideNavService.openControlMenu();
  }

}
