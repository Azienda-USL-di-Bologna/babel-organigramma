import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaPecStruttureComponent } from './associa-pec-strutture.component';

describe('AssociaPecStruttureComponent', () => {
  let component: AssociaPecStruttureComponent;
  let fixture: ComponentFixture<AssociaPecStruttureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociaPecStruttureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociaPecStruttureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
