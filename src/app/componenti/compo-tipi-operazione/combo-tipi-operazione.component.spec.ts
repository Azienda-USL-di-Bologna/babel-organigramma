import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboTipiOperazioneComponent } from './combo-tipi-operazione.component';

describe('CompoTipiOperazioneComponent', () => {
  let component: ComboTipiOperazioneComponent;
  let fixture: ComponentFixture<ComboTipiOperazioneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboTipiOperazioneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboTipiOperazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
