import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AnagrafePecComponent } from "./anagrafe-pec.component";

describe("AnagrafePecComponent", () => {
  let component: AnagrafePecComponent;
  let fixture: ComponentFixture<AnagrafePecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnagrafePecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnagrafePecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
