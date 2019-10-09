import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnificazioniComponent } from './unificazioni.component';

describe('UnificazioniComponent', () => {
  let component: UnificazioniComponent;
  let fixture: ComponentFixture<UnificazioniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnificazioniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnificazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
