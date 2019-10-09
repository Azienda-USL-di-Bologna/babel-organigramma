import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboStruttureComponent } from './combo-strutture.component';

describe('ComboStruttureComponent', () => {
  let component: ComboStruttureComponent;
  let fixture: ComponentFixture<ComboStruttureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboStruttureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboStruttureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
