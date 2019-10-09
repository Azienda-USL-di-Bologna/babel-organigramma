import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { ENTITIES_STRUCTURE, RibaltoneDaLanciare, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { PagingConf, FiltersAndSorts, SortDefinition, SORT_MODES, FilterDefinition, Mode, ServicePrimeNgTableSupport, FILTER_TYPES, PTableColumn } from "@nfa/next-sdr";
import { RibaltoneDaLanciareService } from "src/app/services/ribaltone-da-lanciare.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DatePipe } from "@angular/common";
import { LOCAL_IT } from "@bds/nt-communicator";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from "rxjs";
import { COD_AZIENDA_INESISTENTE } from "src/environments/app-constants";

@Component({
  selector: "app-storico-lancio-ribaltoni",
  templateUrl: "./storico-lancio-ribaltoni.component.html",
  styleUrls: ["./storico-lancio-ribaltoni.component.css"],
  providers: [DatePipe]
})
export class StoricoLancioRibaltoniComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;

  @Input() idAzienda: string;
  @ViewChild("logid", null) private logChild: ElementRef;
  @ViewChild("dtLancioRibaltoni", null) dtLancioRibaltoni: any;

  @Input() set refreshStoricoLanci(value) {
    if (this._storicoLanciTableSupport)
      this._storicoLanciTableSupport.refreshData();
  }


  public _storicoLanciTableSupport: ServicePrimeNgTableSupport;
  public storicoLanci: RibaltoneDaLanciare[];
  public cols: PTableColumn[];
  public localeIT = LOCAL_IT;

  constructor(private ribaltoneDaLanciareService: RibaltoneDaLanciareService, private datepipe: DatePipe, private loginService: NtJwtLoginService) {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
    })
    );
  }

  ngOnInit() {
    this.cols = [
      {
        field: "stato",
        header: "Esito",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.equalsIgnoreCase,
        style: {
          width: "110px",
          textAlign: "center"
        }
      },
      {
        field: "struttureSpostate",
        header: "Strutture spostate",
        fieldType: "boolean",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        style: {
          width: "120px",
          textAlign: "center"
        }
      },
      {
        field: "dataInserimentoRiga",
        header: "Data lancio",
        fieldType: "Date",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        format: {viewFormat: "dd/MM/yyyy HH:mm:ss", calendarFormat: "dd/mm/yy"},
        style: {
          width: "130px",
          textAlign: "center"
        }
      },
      {
        field: "dataUltimaModifica",
        header: "Esecuzione",
        fieldType: "Date",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        format: {viewFormat: "dd/MM/yyyy HH:mm:ss", calendarFormat: "dd/mm/yy"},
        style: {
          width: "130px",
          textAlign: "center"
        }
      },
      /* {
        field: "codiceAzienda",
        header: "Codice",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.equals,
        style: {
          width: "70px",
          textAlign: "center"
        }
      }, */
      {
        field: "idAzienda.descrizione",
        header: "Azienda",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        style: {
          width: "150px",
          textAlign: "center"
        }
      },
      {
        field: "ribaltaInternauta",
        header: "Ribalta internauta",
        fieldType: "boolean",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        style: {
          width: "120px",
          textAlign: "center"
        }
      },
      {
        field: "ribaltaArgo",
        header: "Ribalta locale",
        fieldType: "boolean",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        style: {
          width: "120px",
          textAlign: "center"
        }
      },
      /* {
        field: "ribaltaRubriche",
        header: "Ribalta rubriche",
        fieldType: "boolean",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        style: {
          width: "120px",
          textAlign: "center"
        }
      }, */
      {
        field: "idUtente.idPersona.descrizione",
        header: "Utente",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        style: {
          width: "130px",
          textAlign: "center"
        }
      },
      {
        field: "email",
        header: "eMail",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        style: {
          width: "230px",
          textAlign: "center"
        }
      },
      {
        field: "note",
        header: "Note",
        fieldType: "string",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        style: {
          width: "250px",
          textAlign: "left"
        }
      },

    ];

    // this.getData();
    this.buildData();
  }

  /**
   * GetData principale. Recupera i dati che voglio mostrare dalla tabella storico_attivazioni
   */
  /* private getData(): void {
    this.ribaltoneDaLanciareService.getData(
      ENTITIES_STRUCTURE.ribaltoneutils.ribaltonedalanciare.customProjections.RibaltoneDaLanciareWithIdAziendaAndIdUtenteCustom,
      this.buildFilterAndSorts(), buildLazyEventFiltersAndSorts(), null)
      .subscribe(
        res => {
          console.log("ribaltonidalanciare", res);
          this.storicoLanci = res.results;
        }
      );
  } */
  private buildData() {
    this._storicoLanciTableSupport = new ServicePrimeNgTableSupport({
      service: this.ribaltoneDaLanciareService,
      projection: ENTITIES_STRUCTURE.ribaltoneutils.ribaltonedalanciare.customProjections.RibaltoneDaLanciareWithIdAziendaAndIdUtenteCustom,
      table: this.dtLancioRibaltoni,
      initialBuildAndSort: this.buildFilterAndSorts(),
      registerTableSelectEditEvents: false,
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error);
      }
    });
    this._storicoLanciTableSupport.refreshData();
  }

  private showRequestErrorMessage(reqError: any): void {
    console.log("Si è verificato un errore nella richiesta");
  }
  /**
   * Voglio lo storico dell'azienda selezionata.
   * E voglio gli utlimi 3 risultati in ordine di data desc.
   */
  private buildFilterAndSorts(): FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    if (!this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA)) {
        this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA].forEach(element => {
          filtersAndSorts.addFilter(new FilterDefinition("idAzienda.codice" , FILTER_TYPES.string.equals, element));
        });
      } else {
        // se non ho i ruoli richiesti non devo recuperare nessun'azienda. Modo brutto per farlo. filtro per un codice_azienda che non esiste
        filtersAndSorts.addFilter(new FilterDefinition("idAzienda.codice" , FILTER_TYPES.string.equals, COD_AZIENDA_INESISTENTE));
      }
    }
    filtersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.desc));
    return filtersAndSorts;
  }

  /**
   * Formatta la data passata nello standard di es.
   * "Martedì 26 marzo 2019, 03:01"
   * @param date
   */
  public getDateDisplay(date: string): string {
    if (date) {
      date = (new Date(date)).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      });
      return date.charAt(0).toUpperCase() + date.slice(1);
    }
  }

  /**
   *
   * @param event
   * @param ribaltone
   * @param overlaypanel
   */
  public showLog(event, ribaltone: RibaltoneDaLanciare, overlaypanel: OverlayPanel): void {
    this.logChild.nativeElement.innerHTML = this.replaceNewLine(ribaltone.log);
    overlaypanel.toggle(event);
  }

  /**
   * Faccio il replace delle /n con dei <br/>
   * @param str
   */
  private replaceNewLine(str: string) {
    return str.replace(/\n/g, "<br/>");
  }
}
