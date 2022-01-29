/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChattestComponent } from './chattest.component';

describe('ChattestComponent', () => {
  let component: ChattestComponent;
  let fixture: ComponentFixture<ChattestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChattestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChattestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
