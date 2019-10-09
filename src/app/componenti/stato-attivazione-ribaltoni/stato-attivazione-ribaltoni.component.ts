import { Component, OnInit, Input } from "@angular/core";
import { AziendaServiceNext } from "src/app/services/azienda-service-next";
import { PagingConf, FiltersAndSorts, SortDefinition, AdditionalDataDefinition, SORT_MODES, FilterDefinition, FILTER_TYPES } from "@nfa/next-sdr";
import { StoricoAttivazioneService } from "src/app/services/storico-attivazione.service";
import { ENTITIES_STRUCTURE, StoricoAttivazione, Azienda, RibaltoneDaLanciare, Utente, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { COD_AZIENDA_INESISTENTE } from "src/environments/app-constants";

@Component({
  selector: "app-stato-attivazione-ribaltoni",
  templateUrl: "./stato-attivazione-ribaltoni.component.html",
  styleUrls: ["./stato-attivazione-ribaltoni.component.css"],
  /* animations: [
    trigger("rowExpansionTrigger", [
      state("void", style({
        transform: "translateX(-10%)",
        opacity: 0
      })),
      state("active", style({
        transform: "translateX(0)",
        opacity: 1
      })),
      transition("* <=> *", animate("400ms cubic-bezier(0.86, 0, 0.07, 1)"))
    ])
  ] */
})
export class StatoAttivazioneRibaltoniComponent implements OnInit {
  private loggedUser;
  private pageConfNoLimit: PagingConf = {
    conf: {
      page: 0,
      size: 999999
    },
    mode: "PAGE"
  };
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;

  public statoRibaltoni: Azienda[];
  public cols: any;
  public editingVisible: boolean = false;
  public editingRow: StoricoAttivazione = new StoricoAttivazione();
  public idAziendaExpanded: number;


  @Input() set refreshStatoAttivazioni(value) {
    this.loadData();
  }

  constructor(
    private aziendaService: AziendaServiceNext,
    private storicoAttivazioneService: StoricoAttivazioneService,
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
        });
    }

  ngOnInit() {
    this.cols = [
      {
        field: "codice",
        header: "Codice",
        fieldType: "string",
        style: {
          width: "50px",
          textAlign: "center"
        }
      },
      {
        field: "descrizione",
        header: "Nome",
        fieldType: "string",
        style: {
          width: "100px",
          textAlign: "left"
        }
      },
      {
        field: "ribaltaInternauta",
        header: "Ribalta internauta",
        fieldType: "boolean",
        style: {
          width: "100px",
          textAlign: "center"
        }
      },
      {
        field: "ribaltaArgo",
        header: "Ribalta locale",
        fieldType: "boolean",
        style: {
          width: "100px",
          textAlign: "center"
        }
      },
      {
        field: "stato",
        header: "Ultimo esito",
        fieldType: "string",
        style: {
          width: "100px",
          textAlign: "center"
        }
      },
      {
        field: "button",
        fieldType: "button",
        label: "",
        icon: "pi pi-pencil",
        onClick: () => this.editingVisible = true,
        style: {
          width: "30px",
          textAlign: "center"
        }
      }
    ];

    this.loadData();
  }

  private loadData() {
    this.aziendaService.getData(
      ENTITIES_STRUCTURE.baborg.azienda.customProjections.AziendaWithRibaltoneDaLanciareListCustom,
      this.buildFilterAndSorts(), null, this.pageConfNoLimit)
      .subscribe(
      res => {
        this.statoRibaltoni = res.results;
      }
    );
  }

  private buildFilterAndSorts(): FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "GetUltimoStatoRibaltone"));
    if (!this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA)) {
        this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA].forEach(element => {
          filtersAndSorts.addFilter(new FilterDefinition("codice" , FILTER_TYPES.string.equals, element));
        });
      } else {
        // se non ho i ruoli richiesti non devo recuperare nessun'azienda. Modo brutto per farlo. filtro per un codice_azienda che non esiste
        filtersAndSorts.addFilter(new FilterDefinition("codice" , FILTER_TYPES.string.equals, COD_AZIENDA_INESISTENTE));
      }
    }
    filtersAndSorts.addSort(new SortDefinition("codice", SORT_MODES.asc));
    return filtersAndSorts;
  }

  public editaAttivazione(azienda: Azienda) {
    this.editingRow = new StoricoAttivazione();
    const aziendaObj = new Azienda();
    aziendaObj.id = azienda.id;
    aziendaObj.ribaltaArgo = azienda.ribaltaArgo;
    aziendaObj.ribaltaInternauta = azienda.ribaltaInternauta;
    aziendaObj.descrizione = azienda.descrizione;
    this.editingRow.idAzienda = aziendaObj;
    this.editingRow.ribaltaInternauta = azienda.ribaltaInternauta;
    this.editingRow.ribaltaArgo = azienda.ribaltaArgo;
    const utenteObj = new Utente();
    utenteObj.id = this.loggedUser.utente.id;
    this.editingRow.idUtente = utenteObj;
    this.editingVisible = true;
  }

  public saveEditing() {
    // Devo controllare che sia stato modificato qualcosa nell'attivaiozne
    if (this.editingRow.ribaltaInternauta === this.editingRow.idAzienda.ribaltaInternauta && this.editingRow.ribaltaArgo === this.editingRow.idAzienda.ribaltaArgo) {
      this.messageService.add({ severity: "warn", summary: "Attenzione", detail: "Questa è la configurazione corrente" });
      return;
    }

    this.editingRow.dataInserimentoRiga = new Date();
    this.editingRow.idAzienda.ribaltaArgo = this.editingRow.ribaltaArgo;
    this.editingRow.idAzienda.ribaltaInternauta = this.editingRow.ribaltaInternauta;
    this.storicoAttivazioneService.postHttpCall(this.editingRow)
      .subscribe((attivazione: StoricoAttivazione) => {
        this.messageService.add({ severity: "success", summary: "Ok", detail: "Attivazione del ribaltone editata con successo" });
        this.loadData();
      });
    this.editingVisible = false;
  }

  public onRowExpand(e: any) {
    this.idAziendaExpanded = e.data.id;
  }
}
