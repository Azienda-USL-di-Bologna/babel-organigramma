import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoricoLancioRibaltoniComponent } from './storico-lancio-ribaltoni.component';

describe('StoricoLancioRibaltoniComponent', () => {
  let component: StoricoLancioRibaltoniComponent;
  let fixture: ComponentFixture<StoricoLancioRibaltoniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoricoLancioRibaltoniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoricoLancioRibaltoniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
