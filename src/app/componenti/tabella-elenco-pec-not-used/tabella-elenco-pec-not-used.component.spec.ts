import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaElencoPecTestComponent } from './tabella-elenco-pec-test.component';

describe('TabellaElencoPecTestComponent', () => {
  let component: TabellaElencoPecTestComponent;
  let fixture: ComponentFixture<TabellaElencoPecTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabellaElencoPecTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaElencoPecTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
