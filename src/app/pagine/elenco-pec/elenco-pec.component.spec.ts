import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ElencoPecComponent } from "./elenco-pec.component";

describe("ElencoPecComponent", () => {
  let component: ElencoPecComponent;
  let fixture: ComponentFixture<ElencoPecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElencoPecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElencoPecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
