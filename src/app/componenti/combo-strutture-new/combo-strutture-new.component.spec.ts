import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboStruttureNewComponent } from './combo-strutture-new.component';

describe('ComboStruttureNewComponent', () => {
  let component: ComboStruttureNewComponent;
  let fixture: ComponentFixture<ComboStruttureNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboStruttureNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboStruttureNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
