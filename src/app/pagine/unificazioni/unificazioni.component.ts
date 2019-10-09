import { Component, OnInit } from '@angular/core';
import { STATI_STR_UNIFICATE } from "../../../environments/app-constants"
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';


@Component({
  selector: 'app-unificazioni',
  templateUrl: './unificazioni.component.html',
  styleUrls: ['./unificazioni.component.css']
})
export class UnificazioniComponent implements OnInit {

  public STATI = STATI_STR_UNIFICATE;
  public cacheCorrenti = true; 
  public cacheBozza = true; 
  public cacheStorico = true;
  public loggedUser: UtenteUtilities;
  public showTabView;


  constructor(public loginService: NtJwtLoginService) { 
    this.loginService.loggedUser$.subscribe(utente => {this.loggedUser = utente});
  }

  ngOnInit() {
    this.showTabView = this.loggedUser.isCA() || this.loggedUser.isCI();
  }

  public reloadDataRecived(e): void {
    console.log("reloadDataRecived")
    if (e === this.STATI.Corrente) {
      this.cacheCorrenti = false;
    } else if (e === this.STATI.Bozza) {
      this.cacheBozza = false;
    } else if (e === this.STATI.Storico) {
      this.cacheStorico = false;
    }
  }

}
