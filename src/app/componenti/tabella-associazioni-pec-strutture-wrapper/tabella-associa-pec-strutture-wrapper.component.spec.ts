import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaAssociazioniPecStruttureWrapperComponent } from './tabella-associa-pec-strutture-wrapper.component';

describe('TabellaAssociazioniPecStruttureWrapperComponent', () => {
  let component: TabellaAssociazioniPecStruttureWrapperComponent;
  let fixture: ComponentFixture<TabellaAssociazioniPecStruttureWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabellaAssociazioniPecStruttureWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaAssociazioniPecStruttureWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
