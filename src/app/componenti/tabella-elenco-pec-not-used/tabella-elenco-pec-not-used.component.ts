import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { FILTER_TYPES, PTableColumn, PagingConf, FiltersAndSorts, AdditionalDataDefinition, FilterDefinition, 
  SORT_MODES, SortDefinition, UtilityFunctions, ValidationErrorsNextSDR, 
  ServicePrimeNgTableSupport, EntityValidations, Mode } from "@nfa/next-sdr";
import { PecService } from "src/app/services/pec.service";
import { ENTITIES_STRUCTURE, Azienda, UtenteStruttura, Struttura, CODICI_RUOLO, AZIENDA_CORRENTE, PecAzienda, Pec } from "@bds/ng-internauta-model";
import { PROJECTIONS } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { LazyLoadEvent, MessageService, Message } from "primeng/api";
import { DatePipe } from "@angular/common";
import { Table } from "primeng/table";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from "rxjs";
import { PecValidations } from "src/app/validations/PecValidations";
import { PecProviderService } from "src/app/services/pec-provider.service";

@Component({
  selector: "app-tabella-elenco-pec-not-used",
  templateUrl: "./tabella-elenco-pec-not-used.component.html",
  styleUrls: ["./tabella-elenco-pec-not-used.component.css"]
})
export class TabellaElencoPecNotUsedComponent implements OnInit, OnDestroy {
  public _cols: PTableColumn[];
  public _value: any[];
  public _totalRecords: number;
  public _rows = 10;
  public _aziendaFilter: any = null;
  public _strutturaFilter: any;
  public _utenteFilter: any;
  private additionalDataCustomQueryParams: AdditionalDataCustomQueryParamsStructure = {};
  private previousEvent: LazyLoadEvent = null;
  public _loading = false;
  private subscriptions: Subscription[] = [];
  private loggedUtenteUtilities: UtenteUtilities;
  public _aziendaIniziale: any = null;
  public _comboAziendeReadOnly = true;
  public _hoPermessiPerQuestoComponenente = false;
  public _displayDialog = false;
  public _dialogEntity: any;
  public _dialogMode: string;
  public messagesPolicy = [
    { label: "Non cancellare i messaggi originali", value: 0 },
    { label: "Sposta in una cartella di backup i messaggi originali", value: 1 },
    { label: "Cancella i messaggi originali", value: 2 }
  ];
  @ViewChild("dtPec", null) dtPec: any;
  @ViewChild("editComponent", null) editComponent: any;
  @ViewChild("dialog", null) dialog: any;
  public _pecTableSupport: ServicePrimeNgTableSupport;
  constructor(
    private pecService: PecService,
    private datepipe: DatePipe,
    private loginService: NtJwtLoginService,
    private messageService: MessageService,
    protected pecProviderService: PecProviderService,
  ) {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((utenteUtilities: UtenteUtilities) => {
      this.loggedUtenteUtilities = utenteUtilities;
      console.log(this.loggedUtenteUtilities);
    })
    );
  }

  ngOnInit() {
    this._cols = [
      {
        field: "indirizzo",
        header: "Indirizzo",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string"
      },
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
          width: "100px"
        }
      },
      {
        field: "perRiservato",
        header: "Per riservato",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "100px"
        }
      },
      {
        field: "aziende",
        header: "Aziende",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "object",
        style: {
          width: "400px"
        }
      },
      {
        field: "strutture",
        header: "Strutture",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "object",
        style: {
          width: "400px"
        }
      },
      {
        field: "gestori",
        header: "Gestori",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "object",
        style: {
          width: "400px"
        }
      }
    ];
    this.buildInitialAziendaFilter();

    this._pecTableSupport = new ServicePrimeNgTableSupport({
      service: this.pecService,
      projection: ENTITIES_STRUCTURE.baborg.pec.customProjections.PecPlainWithStruttureAndGestoriCustom,
      table: this.dtPec,
      initialBuildAndSort: this.buildFilterAndSorts(),
      editComponent: this.editComponent,
      registerTableSelectEditEvents: false,
      // _detailSupport: this.editDialog,
      entityValidations: new EntityValidations([], PecValidations.validate),
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error, mode);
      }
      // registerTableSelectEditEvents: false,
    });
    //this.buildInitialAziendaFilter();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
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

/*   public handleEvent(nome: string, event) {
    console.log(nome, event);
    switch (nome) {
      case "onLazyLoad":
        this.loadData(event);
        break;
    }
  } */

/*   private loadData(event?: LazyLoadEvent) {
    this._loading = true;
    // se non passo l'event tengo quello precedente, perchè voglio tenere i filtri. Però devo resettare la paginazione
    if (event) {
      if (this.previousEvent && this.previousEvent.first && event.first) {
        if (this.previousEvent.first === event.first) {
          event.first = 0;
        }
      }
      this.previousEvent = event;
    } else {
      if (this.previousEvent && this.previousEvent.first) {
        this.previousEvent.first = 0;
        this._table.first = 0;
      }
    }
    this.pecService.getData(
      ENTITIES_STRUCTURE.baborg.pec.customProjections.PecPlainWithStruttureAndGestoriCustom,
      this.buildFilterAndSorts(),
      buildLazyEventFiltersAndSorts(this.previousEvent, this._cols, this.datepipe),
      this.buildPageConfig(this.previousEvent)
      )
      .subscribe(
        res => {
          this._value = res.results;
          this._totalRecords = res.page.totalElements;
          this._loading = false;
        }
      );
  } */



  private buildFilterAndSorts(): FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addSort(new SortDefinition("indirizzo", SORT_MODES.asc));
    filtersAndSorts.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "LoadDataPerInterfacciaElencoPec"));
    this.buildAdditionalDataCustomQueryParams(filtersAndSorts);
    return filtersAndSorts;
  }

/*   private buildPageConfig(event): PagingConf {
    let page = 0;
    let size = this._rows;
    if (event) {
      page = event.first / event.rows;
      size = event.rows;
    }
    const pageConf: PagingConf = {
      conf: {
        page: page,
        size: size
      },
      mode: "PAGE"
    };
    return pageConf;
  } */


  public buildAziende(row) {
    let aziendeString = "";
    for (const key in row.pecAziendaList) {
      if (row.pecAziendaList.hasOwnProperty(key))
        aziendeString += row.pecAziendaList[key]["idAzienda"]["nome"] + ", ";
    }
    return aziendeString !== "" ? aziendeString.substr(0, aziendeString.length - 2) : " - ";
  }

  public buildStrutture(row) {
    let struttureString = "";
    for (const key in row.strutture) {
      if (row.strutture.hasOwnProperty(key))
       struttureString += row.strutture[key]["nome"]
       + (row.strutture[key]["isPermessoPecPrincipale"] ? " [P]" : "")
       + (row.strutture[key]["propagaPermessoPec"] ? " (e sotto strutture)" : "")
       + ", ";
    }
    return struttureString !== "" ? struttureString.substr(0, struttureString.length - 2) : " - ";
  }

  public buildGestori(row) {
    let gestoriString = "";
    for (const key in row.gestori) {
      if (row.gestori.hasOwnProperty(key))
        gestoriString += row.gestori[key]["descrizione"] + ", ";
    }
    return gestoriString !== "" ? gestoriString.substr(0, gestoriString.length - 2) : " - ";
  }

  private buildInitialAziendaFilter() {
    if (!this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA)) {
        this._hoPermessiPerQuestoComponenente = true;
        if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CA, AZIENDA_CORRENTE)) {
          this._aziendaIniziale = this.loggedUtenteUtilities.getUtente().aziendaLogin;
        } else {
          const codiceAziendaCA = this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona[CODICI_RUOLO.CA][0];
          this._aziendaIniziale = this.loggedUtenteUtilities.getUtente().aziende.filter(a => a.codice = codiceAziendaCA);
        }
      }
    } else {
      this._hoPermessiPerQuestoComponenente = true;
       // questo è  il caricamento iniziale nel caso di CI (non gli ho settato l'azienda)
      this._comboAziendeReadOnly = false;
    };
  }

  public filterComboChange(nome: string, event) {
    console.log(nome, event);
    if (nome === "aziende") {
      this._aziendaFilter = event;
      if (this._aziendaFilter === null) {
        this._strutturaFilter = this._utenteFilter = null;
      }
    } else if (nome === "strutture") {
      this._strutturaFilter = event;
    } else if (nome === "gestori") {
      this._utenteFilter = event;
    }

    this.createAdditionalDataCustomQueryParams();
    this._pecTableSupport.initialBuildAndSort = this.buildFilterAndSorts();
  }

  private createAdditionalDataCustomQueryParams() {
    if (this._aziendaFilter) {
      this.additionalDataCustomQueryParams.idAzienda = new AdditionalDataDefinition("idAzienda", this._aziendaFilter.id);
    } else {
      this.additionalDataCustomQueryParams.idAzienda = null;
    }
    if (this._strutturaFilter) {
      this.additionalDataCustomQueryParams.idStruttura = new AdditionalDataDefinition("idStruttura", this._strutturaFilter.id);
    } else {
      this.additionalDataCustomQueryParams.idStruttura = null;
    }
    if (this._utenteFilter) {
      this.additionalDataCustomQueryParams.idPersona = new AdditionalDataDefinition("idPersona", this._utenteFilter.idUtente.idPersona.id);
    } else {
      this.additionalDataCustomQueryParams.idPersona = null;
    }
  }

  private buildAdditionalDataCustomQueryParams(filtersAndSorts: FiltersAndSorts) {
    for (const key in this.additionalDataCustomQueryParams) {
      if (this.additionalDataCustomQueryParams[key]) {
        filtersAndSorts.addAdditionalData(this.additionalDataCustomQueryParams[key]);
      }
    }
  }

  public possoModificareRow(row: any) {
    if (!row.pecAziendaList || row.pecAziendaList.length === 0) {
      return true;
    } else if (this.loggedUtenteUtilities.hasRole(CODICI_RUOLO.CI)) {
      return true;
    } else {
      const aziendePec: string[] = row.pecAziendaList.map(pa => pa.idAzienda.codice);
      const found = this.loggedUtenteUtilities.getUtente().ruoliUtentiPersona["CA"] .some(a => aziendePec.indexOf(a) >= 0);
      if (found) {
        return true;
      } else {
        return false;
      }
    }

  }

/*   public startEditRow(row: any, operation: string) {
    console.log("startEditRow", operation);
    this._dialogMode = operation;
    if (operation === "INSERT") {
      this._dialogEntity = {attiva: false, perRiservato: false, massiva: false, chiusa: false};
    } else if (operation === "UPDATE") {
      this._dialogEntity = UtilityFunctions.cloneObj(row);
      if (row.pecAziendaList) {
        this._dialogEntity._aziendeSelezionateDialog = row.pecAziendaList.map(pa => pa.idAzienda);
      }
    } else {
      return;
    }
    this._displayDialog = true;
  }

  public dialogCancel() {
    this._dialogEntity = {};
    this._dialogMode = null;
    this._displayDialog = false;
  }

  public dialogSave() {
    console.log("dialogSave()", this._dialogMode);
    const errors: ValidationErrorsNextSDR[] = PecValidations.validate(this._dialogEntity);
    if (errors.length > 0) {
      this.showValidationMessageError(errors);
    } else {
      const pecAziendaList: PecAzienda[] = [];
      if (this._dialogEntity._aziendeSelezionateDialog) {
        this._dialogEntity._aziendeSelezionateDialog.forEach(element => {
          let alreadyPresentElement = null;
          if (this._dialogEntity.pecAziendaList) {
            alreadyPresentElement = this._dialogEntity.pecAziendaList.find(e => e.fk_idAzienda.id === element.id);
          }
          if (alreadyPresentElement) {
            pecAziendaList.push(alreadyPresentElement);
          } else {
            const pecAzienda: PecAzienda = new PecAzienda();
            pecAzienda.idAzienda = element;
            pecAziendaList.push(pecAzienda);
          }
        });
      }
      this._dialogEntity.pecAziendaList = pecAziendaList;
      console.log("salvataggio", this._dialogMode);
      if (this._dialogMode === "UPDATE") {
        this.pecService.patchHttpCall(this._dialogEntity, this._dialogEntity.id).subscribe(
          res => {
            this.messageService.add({key: "toast_tab_elenco_pec", severity: "success", summary: "OK", detail: "Record modificato correttamente" });
            this._displayDialog = false;
            this.loadData();
          },
          err => {
            this.messageService.add({key: "toast_tab_elenco_pec", severity: "error", summary: "Errrore", detail: "Errore nella modifica del record"});
          }
        );
      } else if (this._dialogMode === "INSERT") {
        this.pecService.postHttpCall(this._dialogEntity).subscribe(
          res => {
            this.messageService.add({key: "toast_tab_elenco_pec", severity: "success", summary: "OK", detail: "Record inserito correttamente" });
            this._displayDialog = false;
            this.loadData();
          },
          err => {
            this.messageService.add({key: "toast_tab_elenco_pec", severity: "error", summary: "Errrore", detail: "Errore nell'inserimento del record"});
          }
        );
      }
    }
  }


  public showValidationMessageError(errors: ValidationErrorsNextSDR[]) {
    if (errors && errors.length > 0) {
      const messages: Message[] = [];
      errors.forEach((error: ValidationErrorsNextSDR) => {
        const message: Message = {
          severity: error.validationSeverity === "ERROR" ? "error" : "warn",
          summary: error.fieldName + ":",
          detail: error.message,
          key: "msg_dialog_tab_elenco_pec"
        };
        messages.push(message);
      });
      this.messageService.clear("msg_dialog_tab_elenco_pec");
      this.messageService.addAll(messages);
    }
  } */

  
  onStartEdit(event: any) {
    const entity = event.entity;
    /* for (const key in entity) {
      if (typeof entity[key] === "boolean") {
        this.setBiCheckValue(entity[key], key);
      }
    } */
    console.log("onStartEdit", entity);
    if (entity.pecAziendaList) {
      entity.aziendeSelezionate = entity.pecAziendaList.map(pa => pa.idAzienda);
    }
    console.log("onStartEdit", entity.aziendeSelezionate);
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



  onSave(event: any) {
    const pec: Pec = event.entity;
    const pecAziendaList: PecAzienda[] = [];

    pec["aziendeSelezionate"].forEach(element => {
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
    this.editComponent.cancel();
  }
}

interface AdditionalDataCustomQueryParamsStructure {
  [key: string]: AdditionalDataDefinition;
}
