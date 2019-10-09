import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Azienda, RibaltoneDaLanciare, Utente, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { RibaltoneDaLanciareService } from "src/app/services/ribaltone-da-lanciare.service";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";

@Component({
  selector: "app-ribaltorg",
  templateUrl: "./ribaltorg.component.html",
  styleUrls: ["./ribaltorg.component.css"],
  providers: [MessageService]
})
export class RibaltorgComponent implements OnInit {

  public popupLanciaRibaltorgVisible: boolean = false;
  public _aziendaSelezionata: Azienda;
  public ribaltamento: RibaltoneDaLanciare = new RibaltoneDaLanciare();
  private loggedUser;
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;

  public refreshStoricoLanci = null;
  public refreshStatoAttivazioni = null;

  constructor(
    private ribaltoneDaLanciareService: RibaltoneDaLanciareService,
    private loginService: NtJwtLoginService,
    private messageService: MessageService) {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
    })
    );
    this.loginService.loggedUser$.subscribe(
      utente => {
        this.loggedUser = utente;
        console.log("loggeduser", this.loggedUser);
      }); }

  ngOnInit() {
  }

  public aziendaSelezionataRecived(event: Azienda) {
    this._aziendaSelezionata = event;
    this.ribaltamento.idAzienda = event;
    this.ribaltamento.codiceAzienda = event.codice;
  }

  public startRibaltamento() {
    this._aziendaSelezionata = null;
    this.ribaltamento = new RibaltoneDaLanciare();
    const utenteObj = new Utente();
    utenteObj.id = this.loggedUser.utente.id;
    this.ribaltamento.idUtente = utenteObj;
    this.popupLanciaRibaltorgVisible = true;
    this.ribaltamento.stato = "DA_LANCIARE";
    this.ribaltamento.ribaltaInternauta = true;
    this.ribaltamento.ribaltaArgo = true;
    this.ribaltamento.ribaltaRubriche = false;
    if (!this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA) && this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA].length === 1) {
        console.log(this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA], this.loggedUser);
        if (this.loggedUser.utente.idAzienda.codice === this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA][0]) {
          this.aziendaSelezionataRecived(this.loggedUser.utente.idAzienda);
        }
      }
    }
  }

  public lanciaRibaltone() {
    if (!this.isDataRibaltoneOk()) return;
    const aziendaObj = new Azienda();
    aziendaObj.id = this.ribaltamento.idAzienda.id;
    this.ribaltamento.idAzienda = aziendaObj;
    this.ribaltamento.dataInserimentoRiga = new Date();
    this.ribaltoneDaLanciareService.postHttpCall(this.ribaltamento)
      .subscribe((ribaltoneDalanciare: RibaltoneDaLanciare) => {
        console.log("ribaltoneDalanciare", ribaltoneDalanciare);
        this.messageService.add({ severity: "success", summary: "Ok", detail: "Attivazione del ribaltone editata con successo" });
        this.refreshStoricoLanci = {};
      });
    this.popupLanciaRibaltorgVisible = false;
  }

  public onTabChange(e) {
    /* e.index = 0 -> tab stato attivazione */
    /* e.index = 1 -> tab storico ribaltoni lanciati */
    if (e.index === 0) {
      this.refreshStatoAttivazioni = {};
    } else if (e.index === 1) {
      this.refreshStoricoLanci = {};
    }
  }

  private isDataRibaltoneOk() {
    let ok = true;
    const errors = [];
    if (this.ribaltamento.idAzienda == null) {
      errors.push({ severity: "warn", summary: "Attenzione", detail: "E' necessario selezionare l'azienda" });
      ok = false;
    }
    if (this.ribaltamento.email == null || this.ribaltamento.email === "") {
      errors.push({ severity: "warn", summary: "Attenzione", detail: "E' necessario inserire l'indirizzo e-mail" });
      ok = false;
    } else if (!this.isEmail(this.ribaltamento.email)) {
      errors.push({ severity: "warn", summary: "Attenzione", detail: "L'indirizzo e-mail non è valido" });
      ok = false;
    }
    if (!ok) {
      this.messageService.addAll(errors);
    }
    return ok;
  }

  private isEmail(email: string): boolean {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  public addUserEmail() {
    if (this.loggedUser.utente.email !== null) {
      this.ribaltamento.email = this.loggedUser.utente.email;
    } else {
      this.messageService.add({ severity: "warn", summary: "Attenzione", detail: "Non hai una e-mail personale impostata" });
    }
  }
}
