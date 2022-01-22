import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewDrawingComponent } from 'src/app/components/new-drawing/new-drawing.component';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { ExportDialogService } from '../export-dialog/export-dialog.service';
import { OpenDrawingDialogService } from '../open-drawing-dialog/open-drawing-dialog.service';
import { SaveDrawingDialogService } from '../save-drawing-dialog/save-drawing-dialog.service';
import { SidenavService } from '../sidenav/sidenav.service';
import { CopyPasteToolService } from '../tools/copy-paste-tool/copy-paste-tool.service';
import { DeletingToolService } from '../tools/selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { ToolIdConstants } from '../tools/tool-id-constants';
import { ToolsService } from '../tools/tools.service';
import { EmitReturn } from './hotkeys-constants';
import { HotkeysEmitterService } from './hotkeys-emitter/hotkeys-emitter.service';
import { HotkeysEnablerService } from './hotkeys-enabler.service';

@Injectable({
  providedIn: 'root',
})
export class HotkeysService {

  private toolSelectorList: Map<string, number> = new Map<string, number>();
  hotkey: Map<string, any> = new Map<string, any>();

  constructor(
    private dialog: MatDialog,
    private sideNavService: SidenavService,
    private toolsService: ToolsService,
    private saveDrawingDialogService: SaveDrawingDialogService,
    private exportDialogService: ExportDialogService,
    private copyPasteService: CopyPasteToolService,
    private selectionTool: SelectionToolService,
    private deletingTool: DeletingToolService,
    private commandInvoker: CommandInvokerService,
    private openDrawingService: OpenDrawingDialogService,

    private hotkeysEmitterService: HotkeysEmitterService,

    private hotkeysEnablerService: HotkeysEnablerService,
  ) {
    this.subscribeToHotkeys();

    this.toolSelectorList.set(EmitReturn.APPLICATEUR, ToolIdConstants.APPLIER_ID);
    this.toolSelectorList.set(EmitReturn.RECTANGLE, ToolIdConstants.RECTANGLE_ID);
    this.toolSelectorList.set(EmitReturn.ELLIPSE, ToolIdConstants.ELLIPSE_ID);
    this.toolSelectorList.set(EmitReturn.LINE, ToolIdConstants.LINE_ID);
    this.toolSelectorList.set(EmitReturn.SELECTION, ToolIdConstants.SELECTION_ID);
    this.toolSelectorList.set(EmitReturn.POLYGON, ToolIdConstants.POLYGON_ID);
    this.toolSelectorList.set(EmitReturn.ERASER, ToolIdConstants.ERASER_ID);
    this.dialog.afterOpened.subscribe(() => {
      this.hotkeysEnablerService.disableHotkeys();
      this.hotkeysEnablerService.canClick = false;
    });
    this.dialog.afterAllClosed.subscribe(() => {
      this.hotkeysEnablerService.enableHotkeys();
      this.hotkeysEnablerService.canClick = true;
    });
  }

  /// Dispatch l'evenement de key down vers les services de hotkeys
  hotkeysListener(): void {
    window.addEventListener('keydown', (event) => {
      this.hotkeysEmitterService.handleKeyboardEvent(event);
    });
  }

  /// Subscribe au hotkeys pour effectuer l'action associé
  private subscribeToHotkeys(): void {
    this.hotkeysEmitterService.hotkeyEmitter.subscribe((value: EmitReturn) => {
      const toolId: number | undefined = this.toolSelectorList.get(value);
      if (toolId || toolId === ToolIdConstants.SELECTION_ID) {
        this.sideNavService.open();
        this.sideNavService.isControlMenu = false;
        this.toolsService.selectTool(toolId);
      } else {
        switch (value) {
          case EmitReturn.NEW_DRAWING:
            this.dialog.open(NewDrawingComponent, {});
            break;
          case EmitReturn.SAVE_DRAWING:
            this.saveDrawingDialogService.openDialog();
            break;
          case EmitReturn.EXPORT_DRAWING:
            this.exportDialogService.openDialog();
            break;
          case EmitReturn.OPEN_DRAWING:
            this.openDrawingService.openDialog();
            break;
          case EmitReturn.COPY:
            this.copyPasteService.copy();
            break;
          case EmitReturn.CUT:
            this.copyPasteService.cut();
            break;
          case EmitReturn.PASTE:
            this.copyPasteService.paste();
            break;
          case EmitReturn.DUPLICATE:
            this.copyPasteService.duplicate();
            break;
          case EmitReturn.DELETE:
            this.deletingTool.deleteSelection();
            break;
          case EmitReturn.SELECTALL:
            this.selectionTool.selectAll();
            break;
          case EmitReturn.UNDO:
            this.commandInvoker.undo();
            break;
          case EmitReturn.REDO:
            this.commandInvoker.redo();
            break;
          default:
            console.log('Warning : Hotkey callBack not implemented !');
            break;
        }
      }
    });
  }
}
