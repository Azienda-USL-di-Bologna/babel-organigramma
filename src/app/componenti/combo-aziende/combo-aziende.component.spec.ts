import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboAziendeComponent } from './combo-aziende.component';

describe('ComboAziendeComponent', () => {
  let component: ComboAziendeComponent;
  let fixture: ComponentFixture<ComboAziendeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboAziendeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboAziendeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
