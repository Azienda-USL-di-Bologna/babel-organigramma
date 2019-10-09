import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlberoStruttureComponent } from './albero-strutture.component';

describe('AlberoStruttureComponent', () => {
  let component: AlberoStruttureComponent;
  let fixture: ComponentFixture<AlberoStruttureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlberoStruttureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlberoStruttureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
