import { Injectable } from '@angular/core';
import { ToggleDrawerService } from '../toggle-drawer/toggle-drawer.service';
import { Tools } from '../../interfaces/tools.interface';
import { ToolsService } from '../tools/tools.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

/// Service permettant au sidenav de bien interagir avec les hotkeys et de bien gerer
/// sa selection d'outil. Vérifie aussi s'il s'agit du menu fichier ou d'outil
const ID_CONTROL_MENU = 17;

@Injectable({
  providedIn: 'root',
})

export class SidenavService {

  isControlMenu = false;

  constructor(
    private toggleDrawerService: ToggleDrawerService,
    private toolService: ToolsService,
  ) {
  }

  /// Retourne la liste d'outils
  get toolList(): Map<number, Tools> {
    return this.toolService.tools;
  }

  /// Retourne si le drawer est ouvert
  get isOpened(): boolean {
    return this.toggleDrawerService.isOpened;
  }

  /// Retourne un index detourner pour le numero d'outil choisi
  get selectedParameter(): number {
    if (this.isControlMenu) {
      return ID_CONTROL_MENU;
    }
    return this.toolService.selectedToolId;
  }

  /// Ouvre le drawer de paramètre
  open(): void {
    this.toggleDrawerService.open();
  }

  /// Ferme le drawer de paramètre
  close(): void {
    this.toggleDrawerService.close();
    this.isControlMenu = false;
  }

  /// Change la selection d'outil
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    this.toolService.selectTool(selectedItem.value);
    this.isControlMenu = false;
  }

  /// Définit une ouverture de menu d'option fichier
  openControlMenu(): void {
    this.isControlMenu = true;
    this.open();
  }

}
