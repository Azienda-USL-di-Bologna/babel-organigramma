import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PecStruttureComponent } from "./pec-strutture.component";

describe("PecStruttureComponent", () => {
  let component: PecStruttureComponent;
  let fixture: ComponentFixture<PecStruttureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PecStruttureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PecStruttureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
