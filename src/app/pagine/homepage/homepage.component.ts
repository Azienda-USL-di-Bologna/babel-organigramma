import { Component, OnInit, AfterViewInit } from "@angular/core";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { CODICI_RUOLO } from "@bds/ng-internauta-model";

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"]
})
export class HomepageComponent implements OnInit {
  public CODICI_RUOLO: any;

  constructor( public loginService: NtJwtLoginService) {
  }

  ngOnInit() {
    this.CODICI_RUOLO = CODICI_RUOLO;
  }

}
