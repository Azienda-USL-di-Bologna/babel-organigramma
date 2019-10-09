import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatoAttivazioneRibaltoniComponent } from './stato-attivazione-ribaltoni.component';

describe('StatoAttivazioneRibaltoniComponent', () => {
  let component: StatoAttivazioneRibaltoniComponent;
  let fixture: ComponentFixture<StatoAttivazioneRibaltoniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatoAttivazioneRibaltoniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatoAttivazioneRibaltoniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
