import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StruttureUnificateComponent } from './strutture-unificate.component';

describe('StruttureUnificateComponent', () => {
  let component: StruttureUnificateComponent;
  let fixture: ComponentFixture<StruttureUnificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StruttureUnificateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StruttureUnificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
