import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownUtentiComponent } from './dropdown-utenti.component';

describe('ComboUtentiComponent', () => {
  let component: DropDownUtentiComponent;
  let fixture: ComponentFixture<DropDownUtentiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropDownUtentiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownUtentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
