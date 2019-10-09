import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RibaltorgComponent } from './ribaltorg.component';

describe('RibaltorgComponent', () => {
  let component: RibaltorgComponent;
  let fixture: ComponentFixture<RibaltorgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RibaltorgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RibaltorgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
