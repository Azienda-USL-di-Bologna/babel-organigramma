import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlberoOrganigrammaComponent } from './albero-organigramma.component';

describe('AlberoOrganigrammaComponent', () => {
  let component: AlberoOrganigrammaComponent;
  let fixture: ComponentFixture<AlberoOrganigrammaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlberoOrganigrammaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlberoOrganigrammaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
