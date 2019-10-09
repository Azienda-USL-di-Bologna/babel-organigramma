import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestoriPecComponent } from './gestori-pec.component';

describe('GestoriPecComponent', () => {
  let component: GestoriPecComponent;
  let fixture: ComponentFixture<GestoriPecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestoriPecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestoriPecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
