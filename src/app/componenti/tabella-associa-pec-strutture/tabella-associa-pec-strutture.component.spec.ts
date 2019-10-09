import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaAssociaPecStruttureComponent } from './tabella-associa-pec-strutture.component';

describe('TabellaAssociaPecStruttureComponent', () => {
  let component: TabellaAssociaPecStruttureComponent;
  let fixture: ComponentFixture<TabellaAssociaPecStruttureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabellaAssociaPecStruttureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaAssociaPecStruttureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
