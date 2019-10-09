import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ComboUtentiComponent } from "./combo-utenti.component";

describe("ComboUtentiComponent", () => {
  let component: ComboUtentiComponent;
  let fixture: ComponentFixture<ComboUtentiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboUtentiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboUtentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
