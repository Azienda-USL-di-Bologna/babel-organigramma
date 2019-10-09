import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from "@angular/core";
import { FILTER_TYPES, PTableColumn, ServicePrimeNgTableSupport, Mode, AdditionalDataDefinition, EntityValidations, FiltersAndSorts, NextSdrServiceQueringWrapper, FilterDefinition, SortDefinition, SORT_MODES } from "@nfa/next-sdr";
import { PecService } from "src/app/services/pec.service";
import { PROJECTIONS } from "src/environments/app-constants";
import { PecProviderService } from "src/app/services/pec-provider.service";
import { PecValidations } from "src/app/validations/PecValidations";
import { MessageService } from "primeng/api";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Utente, Azienda, PecAzienda, Pec, CODICI_RUOLO, CODICI_AZIENDA } from "@bds/ng-internauta-model";
import { AziendaServiceNext } from "../../services/azienda-service-next";
import { Subscription } from "rxjs";

@Component({
  selector: "app-anagrafe-pec",
  templateUrl: "./anagrafe-pec.component.html",
  styleUrls: ["./anagrafe-pec.component.css"]
})
export class AnagrafePecComponent implements OnInit, OnDestroy {
  public _cols: PTableColumn[];
  public _pecTableSupport: ServicePrimeNgTableSupport;
  public biStateValues: any = {};
  public dialogVisible: boolean = false;
  public gestoriPecVisible: boolean = false;
  public pecSelezionata: any;
  public loggedUtenteUtilities: UtenteUtilities;
  public loggedUtente: Utente;
  public aziendeSelezionate: Azienda[] = [];
  private subscriptions: Subscription[] = [];
  public CODICI_RUOLO: any;
  public CODICI_AZIENDA: any;
  public serviceQWcomboAziende: NextSdrServiceQueringWrapper;
  public messagesPolicy = [
    { label: "Non cancellare i messaggi originali", value: 0 },
    { label: "Sposta in una cartella di backup i messaggi originali", value: 1 },
    { label: "Cancella i messaggi originali", value: 2 }
  ];

  @ViewChild("dtPec", null) dtPec: any;
  @ViewChild("editComponent", null) editComponent: any;
  @ViewChild("dialog", null) dialog: any;
  @ViewChild("search", null) search: any;

  // @Output() attivaComponente = new EventEmitter<any>();

  constructor(private pecService: PecService,
    protected pecProviderService: PecProviderService,
    private messageService: MessageService,
    private loginService: NtJwtLoginService,
    protected aziendaServiceNext: AziendaServiceNext) {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
      this.loggedUtente = utenteUtilities.getUtente();
      console.log("loggedUtente", this.loggedUtente);
    })
    );
  }

  ngOnInit() {

    this.CODICI_RUOLO = CODICI_RUOLO;
    this.CODICI_AZIENDA = CODICI_AZIENDA;


    this.serviceQWcomboAziende = {
      service: this.aziendaServiceNext
    };

    this._cols = [
      {
        field: "indirizzo",
        header: "Indirizzo",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string"
      },
      {
        field: "descrizione",
        header: "Descrizione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        style: {
          width: "150px"
        }
      },
      /* {
        field: "username",
        header: "Username",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        width: "150px"
      },
      {
        field: "password",
        header: "Password",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        width: "150px"
      }, */
      {
        field: "attiva",
        header: "Attiva",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "150px"
        }
      },
      {
        field: "messagePolicy",
        header: "Policy",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "number",
        style: {
          width: "150px"
        }
      },
      {
        field: "perRiservato",
        header: "Per riservato",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "150px"
        }
      },
      {
        field: "idPecProvider.descrizione",
        header: "Provider",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "object",
        style: {
          width: "150px"
        }
      }/* ,
      {
        field: null,
        header: "",
        filterMatchMode: null,
        fieldType: "button",
        icon: "pi pi-pencil",
        label: "Modifica"
      } */
    ];

    this._pecTableSupport = new ServicePrimeNgTableSupport({
      service: this.pecService,
      projection: PROJECTIONS.pec.customProjections.PecWithPecProviderAndAziendaCustom,
      table: this.dtPec,
      initialBuildAndSort: this.InitialPecTableBuid(),
      editComponent: this.editComponent,
      registerTableSelectEditEvents: false,
      // _detailSupport: this.editDialog,
      entityValidations: new EntityValidations([], PecValidations.validate),
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error, mode);
      }
      // registerTableSelectEditEvents: false,
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // commento questa funzione: non passiamo nessun additionalData per dire al backend di filtrare per ruolo, lo fa in automatico.
  // non so se questo va bene, valutare
  private InitialPecTableBuid(): FiltersAndSorts {
    const initialConstraints: FiltersAndSorts = new FiltersAndSorts();
    initialConstraints.addSort(new SortDefinition("indirizzo", SORT_MODES.asc));
    return initialConstraints;
  }


  // TODO: Generalizzare in un componenete apposito da far estendere a tutti anche altre applicazioni.
  public showRequestErrorMessage(reqError: any, mode: any): void {
    if (mode === "GET") {
      this.messageService.add({ severity: "error", summary: "Errore", detail: "Errore reperimento dei dati" });
    } else if (mode === "UPDATE") {
      this.messageService.add({ severity: "error", summary: "Errore", detail: "Errore nell'aggiornamento del record" });
    } else if (mode === "INSERT") {
      this.messageService.add({ severity: "error", summary: "Errore", detail: "Errore nell'inserimento del record" });
    }
    console.log("Si è verificato un errore nella richiesta");
  }


  onStartEdit(event: any) {
    const entity = event.entity;
    /* for (const key in entity) {
      if (typeof entity[key] === "boolean") {
        this.setBiCheckValue(entity[key], key);
      }
    } */
    console.log("onStartEdit", entity);
    if (entity.pecAziendaList) {
      this.aziendeSelezionate = entity.pecAziendaList.map(pa => pa.idAzienda);
    }
    console.log("onStartEdit", this.aziendeSelezionate);
    this.dialog.visible = true;
  }

  /* setBiCheckValue(value: boolean, field) {
    if (value === true) {
      this.biStateValues[field] = "si";
    } else if (value === false) {
      this.biStateValues[field] = "no";
    } else {
      this.biStateValues[field] = null;
    }
  }

  onChange(event: any, field) {
    this.setBiCheckValue(event.value, field);
  } */

  apriGestoriPec(rowData: any) {
    this.pecSelezionata = rowData;
    this.gestoriPecVisible = true;
  }


  onSave(event: any) {
    const pec: Pec = event.entity;
    const pecAziendaList: PecAzienda[] = [];

    this.aziendeSelezionate.forEach(element => {
      let alreadyPresentElement = null;
      if (pec.pecAziendaList) {
        alreadyPresentElement = pec.pecAziendaList.find(e => e.fk_idAzienda.id === element.id);
      }
      if (alreadyPresentElement) {
        pecAziendaList.push(alreadyPresentElement);
      } else {
        const pecAzienda: PecAzienda = new PecAzienda();
        pecAzienda.idAzienda = element;
        pecAziendaList.push(pecAzienda);
      }
    });
    event.entity.pecAziendaList = pecAziendaList;
  }

  onHideDialog() {
    this.aziendeSelezionate = [];
    this.editComponent.cancel();
  }

  possoModificare(rowData: Pec) {
    // console.log("possoModificare_rowData", rowData);
    if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      return true;
    }

    return false;

    // La gestione di cosa può fare il CA per ora viene saltata
    // // posso modificare se la pec non è associate a nessun azienda e sono CA
    // if (rowData && (!rowData.pecAziendaList || (rowData.pecAziendaList && rowData.pecAziendaList.length === 0))
    //   && this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
    //   return true;
    // }
    // if (rowData && rowData.pecAziendaList) {
    //   for (let i = 0; i < rowData.pecAziendaList.length; i++) {
    //     const pecAzienda: PecAzienda = rowData.pecAziendaList[i];
    //     // posso modificare se sono CA di almeno un'azieda a cui la pec è associata
    //     const aziendaTrovata = this.loggedUtente.ruoliUtentiPersona[this.CODICI_RUOLO.CA].find(codiceAzienda =>
    //       codiceAzienda == pecAzienda.idAzienda.codice
    //     );
    //     console.log("aziendaTrovata", aziendaTrovata);
    //     if (aziendaTrovata) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }

  }

}




