import { Component, OnInit } from "@angular/core";
import { NtJwtLoginService, UtenteUtilities, UtilityFunctions } from "@bds/nt-jwt-login";
import { Utente, getInternautaUrl, BaseUrlType } from "@bds/ng-internauta-model";
import { IntimusClientService } from "@bds/nt-communicator";
import { PopupMessaggiService } from "@bds/common-components";
import { HeaderFeaturesConfig } from "@bds/primeng-plugin";
import { Params, ActivatedRoute, Router } from "@angular/router";
import { BABORG_ROUTE, LOGIN_ROUTE, APPLICATION } from "src/environments/app-constants";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "app";
  loggedUtenteUtilites: UtenteUtilities;
  debugMode = true; // se true vedo informazioni su utente loggato e ruoli nella parte destra dell'header

  public headerFeaturesConfig: HeaderFeaturesConfig;

  private subscriptions: Subscription[] = [];
  public utenteConnesso: UtenteUtilities;

  /*public headerFeaturesParams: HeaderFeaturesParams = {
    showCambioUtente: false,
    showLogOut: true,
    showUserFullName: true,
    showUserMenu: true,
    showManuale: true,
    showProfilo: true,
    logoutRedirectRoute: BABORG_ROUTE
  };*/

  constructor(public loginService: NtJwtLoginService,
              private route: ActivatedRoute,
              private router: Router,
              private intimusClient: IntimusClientService,
              private popupMessaggiService: PopupMessaggiService) { }

  ngOnInit() {

    this.headerFeaturesConfig = new HeaderFeaturesConfig();
    this.headerFeaturesConfig.showCambioUtente = true;
    this.headerFeaturesConfig.showLogOut = true;
    this.headerFeaturesConfig.showUserFullName = true;
    this.headerFeaturesConfig.showUserMenu = true;
    this.headerFeaturesConfig.showManuale = true;
    this.headerFeaturesConfig.showProfilo = true;
    this.headerFeaturesConfig.logoutRedirectRoute = BABORG_ROUTE;
    this.headerFeaturesConfig.logoutIconPath = "assets/images/signout.svg";

    this.loginService.setloginUrl(getInternautaUrl(BaseUrlType.Login));
    this.loginService.setImpostazioniApplicazioniUrl(getInternautaUrl(BaseUrlType.ConfigurazioneImpostazioniApplicazioni));

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
        const intimusUrl = getInternautaUrl(BaseUrlType.Intimus);
        this.intimusClient.start(intimusUrl, APPLICATION, this.utenteConnesso.getUtente().idPersona.id, this.utenteConnesso.getUtente().aziendaLogin.id);
        // if (!this.onTimeOutWarningSubscribbed) {
        // this.subscriptions.push(this.sessionManager.onTimeOutWarning.subscribe(
        //   (countdown: number) => {
        //     this.logoutCountdown = countdown;
        //     this.messageService.clear("logoutWarning");
        //     this.messageService.add({
        //       severity: "warn",
        //       summary: "Attenzione",
        //       detail: `Uscita tra ${this.logoutCountdown} secondi...`,
        //       key: "logoutWarning",
        //       sticky: true,
        //       closable: true
        //     });
        //   }));
        //   this.subscriptions.push(this.sessionManager.onIdleEnd.subscribe(
        //     () => {
        //       this.messageService.clear("logoutWarning");
        //   }));
        //   this.onTimeOutWarningSubscribbed = true;
        // }
      }
    }));

    this.route.queryParams.subscribe((params: Params) => UtilityFunctions.manageChangeUserLogin(params, this.loginService, this.router, LOGIN_ROUTE));
    /* this.route.queryParams.subscribe((params: Params) => {
      this.loginService.loggedUser.subscribe(user => {
        if(params.hasOwnProperty('impersonatedUser'))
        {
          this.loginService.login(LoginType.Sso, params['impersonatedUser']).then(result => {
            if(result)
            {
              this.router.navigate([HOME_ROUTE]);
            }
            else
              window.close();
          });
        }
      });
    }); */
  }
}
