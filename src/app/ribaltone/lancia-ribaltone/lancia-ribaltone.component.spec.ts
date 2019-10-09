import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanciaRibaltoneComponent } from './lancia-ribaltone.component';

describe('LanciaRibaltoneComponent', () => {
  let component: LanciaRibaltoneComponent;
  let fixture: ComponentFixture<LanciaRibaltoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanciaRibaltoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanciaRibaltoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
