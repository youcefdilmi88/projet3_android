import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MaterialModules } from '../../app-material.module';
import { ApplierToolParameterComponent } from './applier-tool-parameter/applier-tool-parameter.component';
import { EllipseToolParameterComponent } from './ellipse-tool-parameter/ellipse-tool-parameter.component';
import { EraserToolParameterComponent } from './eraser-tool-parameter/eraser-tool-parameter.component';
import { LineToolParameterComponent } from './line-tool-parameter/line-tool-parameter.component';
import { PencilToolParameterComponent } from './pencil-tool-parameter/pencil-tool-parameter.component';
import { PolygonToolParameterComponent } from './polygon-tool-parameter/polygon-tool-parameter.component';
import { RectangleToolParameterComponent } from './rectangle-tool-parameter/rectangle-tool-parameter.component';
import { SelectionToolParameterComponent } from './selection-tool-parameter/selection-tool-parameter.component';
import { StampToolParameterComponent } from './stamp-tool-parameter/stamp-tool-parameter.component';

@NgModule({
    declarations: [
        PencilToolParameterComponent,
        RectangleToolParameterComponent,
        ApplierToolParameterComponent,
        EllipseToolParameterComponent,
        StampToolParameterComponent,
        PolygonToolParameterComponent,
        LineToolParameterComponent,
        SelectionToolParameterComponent,
        EraserToolParameterComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModules,
        FontAwesomeModule,
    ],
    exports: []
})
export class 
ToolParameterModule { }
