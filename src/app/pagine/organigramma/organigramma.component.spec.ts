import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganigrammaComponent } from './organigramma.component';

describe('OrganigrammaComponent', () => {
  let component: OrganigrammaComponent;
  let fixture: ComponentFixture<OrganigrammaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganigrammaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganigrammaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
