import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoricoAttivazioneRibaltoniComponent } from './storico-attivazione-ribaltoni.component';

describe('StoricoAttivazioneRibaltoniComponent', () => {
  let component: StoricoAttivazioneRibaltoniComponent;
  let fixture: ComponentFixture<StoricoAttivazioneRibaltoniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoricoAttivazioneRibaltoniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoricoAttivazioneRibaltoniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
