import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TabellaElencoPecComponent } from "./tabella-elenco-pec.component";

describe("TabellaElencoPecComponent", () => {
  let component: TabellaElencoPecComponent;
  let fixture: ComponentFixture<TabellaElencoPecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabellaElencoPecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaElencoPecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
