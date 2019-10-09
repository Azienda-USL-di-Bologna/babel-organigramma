import { Component, ViewChild, Input, AfterViewInit, OnInit, Output, EventEmitter } from "@angular/core";
import { FILTER_TYPES, PTableColumn, ServicePrimeNgTableSupport, Mode, AdditionalDataDefinition, FiltersAndSorts, NextSdrServiceQueringWrapper, FilterDefinition, SortDefinition, SORT_MODES } from "@nfa/next-sdr";
import { PROJECTIONS, PERMESSI_PEC, NO_LIMIT } from "src/environments/app-constants";
import { PersonaService } from "src/app/services/persona.service";
import { GestoriPecService } from "src/app/services/gestori-pec.service";
import { Entita, PermessiEntita, CategoriaPermessi, Permesso, LOCAL_IT, UtilityFunctions } from "@bds/nt-communicator";
import { ConfirmationService } from "primeng/api";
import { Persona, Pec, Azienda, Utente, UtenteStruttura } from "@bds/ng-internauta-model";
import { DatePipe, DeprecatedDatePipe } from "@angular/common";
import { UtenteService } from "src/app/services/utente.service";
import { Message } from "primeng/components/common/api";
import { MessageService } from "primeng/components/common/messageservice";



@Component({
  selector: "app-gestori-pec",
  templateUrl: "./gestori-pec.component.html",
  styleUrls: ["./gestori-pec.component.css"],
  providers: [DatePipe],
})
export class GestoriPecComponent implements AfterViewInit, OnInit {
  private componentName = "GestoriPecComponent";

  public _cols: PTableColumn[];
  public _gestoriPecTableSupport: ServicePrimeNgTableSupport;
  public listaPermessi: string[];
  public _pec: Pec;
  public oggetto: Entita;
  public dialogVisible: boolean = false;
  public personaInEditing: any = null;
  public insertingMode: boolean;
  public servicePersoneFiltrate: NextSdrServiceQueringWrapper;
  public _azienda: Azienda;

  public valueTableDialog: any[] = [];
  public valueEditDialog: any;
  public dialogMode: string;

  public localIt = LOCAL_IT;
  public today = new Date();

  public maxDataInizio: Date;
  public minDataFine: Date;

  public NO_LIMIT = NO_LIMIT;


  @Input("pec") set pec(value: any) {
    if (value) {
      this._pec = value;
      this.oggetto = new Entita();
      this.oggetto.id_provenienza = this._pec.id;
      this.oggetto.schema = "baborg";
      this.oggetto.table = "pec";
    }
  }

  @Input() set azienda(value: Azienda) {
    console.log(this.componentName, "set azienda", value);
    this._azienda = value;
  }

  @Output() aggiornatiGestori = new EventEmitter<boolean>();

  @ViewChild("dtGestoriPec", null) dtGestoriPec: any;
  @ViewChild("tableInserisciGestori", null) tableInserisciGestori: any;
  // @ViewChild("editComponent") editComponent: any;
  // @ViewChild("dialog") dialog: any;

  constructor(private personaService: PersonaService,
    private utenteService: UtenteService,
    private gestoriPecService: GestoriPecService,
    private confirmationService: ConfirmationService,
    private datepipe: DatePipe,
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.buildData();
    this.setInitialLimitDate(this.today, null);


    this.servicePersoneFiltrate = {
      service: this.utenteService,
      initialFiltersAndSorts: this.initialBuildPersone(),
      projection: PROJECTIONS.utente.standardProjections.UtenteWithIdAziendaAndIdPersona,
    };

  }


  private resetAddFields() {
    console.log("resetAddFields");
    this.valueEditDialog = { idUtente: {}, permesso: "", dataInizio: this.today, dataFine: null };
  }


  private initialBuildPersone(): FiltersAndSorts {
    const initialConstraints: FiltersAndSorts = new FiltersAndSorts();
    initialConstraints.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    initialConstraints.addFilter(new FilterDefinition("attivo", FILTER_TYPES.not_string.equals, true));
    initialConstraints.addSort(new SortDefinition("idPersona.descrizione", SORT_MODES.asc));
    return initialConstraints;
  }

  ngAfterViewInit() {
  }

  public buildData() {
    this._cols = [
      {
        field: "descrizione",
        header: "Utente",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
      },
      {
        field: "codiceFiscale",
        header: "Codice fiscale",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        style: {
          width: "180px"
        }
      },
      {
        // field: (persona: Persona) => this.buildPermessi(persona),
        field: "permessi",
        header: "Permessi",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "object",
        style: {
          width: "100px"
        }
      },
      {
        // field: (persona: Persona) => this.buildPermessi(persona),
        field: "attivo_dal",
        header: "Inizio permesso",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        style: {
          width: "100px"
        }
      },
      {
        // field: (persona: Persona) => this.buildPermessi(persona),
        field: "attivo_al",
        header: "Fine permesso",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        style: {
          width: "100px"
        }
      }
    ];



    this._gestoriPecTableSupport = new ServicePrimeNgTableSupport({
      service: this.personaService,
      projection: PROJECTIONS.persona.customProjections.PersonaPlainWithPermessiCustom,
      table: this.dtGestoriPec,
      initialBuildAndSort: this.buildInitialBuildAndSort(),
      registerTableSelectEditEvents: false,
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error);
      }
    });
    this._gestoriPecTableSupport.refreshData();
  }

  private buildInitialBuildAndSort(): FiltersAndSorts {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "GetPermessiGestoriPec"));
    filters.addAdditionalData(new AdditionalDataDefinition("idPec", this._pec.id.toString()));
    filters.addAdditionalData(new AdditionalDataDefinition("idAzienda", this._azienda.id.toString()));
    filters.addSort(new SortDefinition("descrizione", SORT_MODES.asc));
    return filters;
  }

  public createQueryParamsComboUtenti(event: any): FiltersAndSorts {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idPersona.descrizione", FILTER_TYPES.string.startsWithIgnoreCase, event.query));
    return filters;
  }


  public buildPermessi(persona: any): string {
    let res: string = "";
    if (persona.permessi && persona.permessi.length > 0) {
      persona.permessi.forEach(element => {
        element.categorie.forEach(elemento => {
          elemento.permessi.forEach(elementos => {
            res += elementos.predicato + ", ";
          });
        });
      });
      res = res.substr(0, res.length - 2);
    }

    return res;
  }

  public buildDateFieldsTable(rowData: any, field: string): Date {
    let data: Date = null;
    if (rowData.permessi[0].categorie[0].permessi[0][field]) {
      rowData.permessi[0].categorie[0].permessi[0][field] = new Date(rowData.permessi[0].categorie[0].permessi[0][field]);
    }
    // se ho più di un permesso sul singolo utente c'è qualche errore, quindi me lo segno 
    // e in interfaccia impedisco la modifica
    // guardo che il campo sia attivo_al in modo da fare il controllo una volta sola
    if (field === "attivo_al" && rowData.permessi[0].categorie[0].permessi.length > 1) {
      rowData["permessi_multipli"] = true;
    } else {
      data = rowData.permessi[0].categorie[0].permessi[0][field];
    }
    return data;
  }

  /*  public callbackOnBeforeSave(obj: any): void {
     obj.additionalData.push(new AdditionalDataDefinition("gdm", "bravo"));
     obj.additionalData.push(new AdditionalDataDefinition("non mettere gdm", "BeforeSave"));
   }

   public callbackOnBeforeDelete(obj: any): void {
     obj.additionalData.push(new AdditionalDataDefinition("gdm", "bravo"));
     obj.additionalData.push(new AdditionalDataDefinition("non mettere gdm", "22"));
   } */

  public showRequestErrorMessage(reqError: any): void {
    console.log("Si è verificato un errore nella richiesta");
  }

  public filterPermessi(event) {
    this.listaPermessi = [];
    PERMESSI_PEC.forEach(element => {
      if (element.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
        this.listaPermessi.push(element);
      }
    });
  }


  public editPermission(row) {
    console.log("editPermission", row);
    this.valueTableDialog = [];
    if (row == null) {
      this.resetAddFields();
      this.dialogMode = "add";
    } else {
      this.valueEditDialog = {
        idUtente: { idPersona: row, campoCustom: row.descrizione + " - " + row.codiceFiscale },
        permesso: row.permessi[0].categorie[0].permessi[0].predicato,
        dataInizio: row.permessi[0].categorie[0].permessi[0].attivo_dal,
        dataFine: row.permessi[0].categorie[0].permessi[0].attivo_al
        // dataInizio: new Date(),
        // dataFine: new Date(),
        // rowData.permessi[0].categorie[0].permessi[0][field]
      };
      // this.maxDataInizio = null;
      // this.minDataFine = null;
      this.dialogMode = "edit";
    }
    this.dialogVisible = true;
  }


  public savePermission() {

    const resultMessages = {
      success: {
        target: "toast1",
        message: "Salvataggio avvenuto con successo"
      },
      error: {
        target: "message1",
        message: "Salvataggio non andato a buon fine"
      }
    };

    const popolaPermesso = (dialogElement): Permesso => {
      const permesso = new Permesso();
      permesso.predicato = dialogElement.permesso.toUpperCase();
      permesso.propaga_oggetto = false;
      permesso.propaga_soggetto = false;
      permesso.origine_permesso = "BABORG";
      permesso.id_permesso_bloccato = null;
      permesso.attivo_dal = dialogElement.dataInizio;
      permesso.attivo_al = dialogElement.dataFine;
      return permesso;
    }

    const oggettiPermesso: any[] = [];

    console.log("savePermission", this.valueTableDialog);
    // console.log("personaInEditing", personaInEditing);
    this.messageService.clear("message1");
    if (this.dialogMode === "add") {
      if (!this.possoSalvareAdd()) {
        this.messageService.add({ key: "message1", severity: "warn", summary: "Impossibile salvare", detail: "Compilare utente e permesso per tutte le righe" });
        return;
      }

      this.valueTableDialog.forEach(e => {
        if (e.permesso && e.idUtente.idPersona.descrizione) {
          const oggettoPermesso = {
            persona: e.idUtente.idPersona,
            permesso: popolaPermesso(e),
            pec: this._pec
          };
          oggettiPermesso.push(oggettoPermesso);
        }
      });
    } else if (this.dialogMode === "edit") {
      const oggettoPermesso = {
        persona: this.valueEditDialog.idUtente.idPersona,
        permesso: popolaPermesso(this.valueEditDialog),
        pec: this._pec
      };
      oggettiPermesso.push(oggettoPermesso);
    }

    const successFunct = () => {
      this.dialogVisible = false;
    };

    if (oggettiPermesso.length > 0) {
      this.callGestoriPecService(oggettiPermesso, successFunct, resultMessages);
    } else {
      this.dialogVisible = false;
    }
  }

  public eliminaPermesso(e) {
    this.confirmAndExecute("Confermi di voler eliminare questo gestore pec?", () => {

      const oggettoPermesso = {
        permesso: null,
        persona: e,
        pec: this._pec
      };

      const oggettiPermesso: any[] = [];
      oggettiPermesso.push(oggettoPermesso);

      const resultMessages = {
        success: {
          target: "toast1",
          message: "Eliminazione avvenuta con successo"
        },
        error: {
          target: "toast1",
          message: "Eliminazione non andata a buon fine"
        }
      };

      // const oggettiPemrmessoClean = this.cleanArrayForHttpCall(oggettiPermesso, this.datepipe);



      this.callGestoriPecService(oggettiPermesso, null, resultMessages);
    });
  }

  public valueChangeComboUtenti(event: Utente) {
    console.log("valueChangeComboUtenti", event);
  }



  public addGestore(element: any) {
    this.messageService.clear("message1");
    if (!this.validGestore(element)) {
      return;
    } else if (this.gestoreGiaInserito(element)) {
      this.messageService.add({ key: "message1", severity: "warn", summary: "Impossibile aggiungere la riga", detail: "Utente già inserito" });
      return;
    }
    this.valueTableDialog = [{ idUtente: element.idUtente, permesso: element.permesso, dataInizio: element.dataInizio, dataFine: element.dataFine }, ...this.valueTableDialog];
    this.resetAddFields();
  }

  private validGestore(element: any): boolean {
    let isValid = true;
    let campiNonValidi = "";
    if (!element.idUtente.campoCustom) {
      campiNonValidi += "Utente, ";
      isValid = false;
    }
    if (!element.permesso) {
      campiNonValidi += "Permesso, ";
      isValid = false;
    }
    if (!element.dataInizio) {
      campiNonValidi += "Data inizio, ";
      isValid = false;
    }
    if (!isValid) {
      this.messageService.add({ key: "message1", severity: "warn", summary: "Compilare i campi obbligatori:", detail: campiNonValidi.substring(0, campiNonValidi.length - 2) });
    }
    return isValid;
  }

  // // TODO: rivedere. Il controllo non dovrebbe essere specifico sui campi
  // private tuttiCampiCompilati(element: any): boolean {
  //   let possoAggiungere = true;
  //   if (!(element.permesso && element.idUtente.campoCustom && element.dataInizio && element.dataFine)) {
  //     possoAggiungere = false;
  //   }
  //   return possoAggiungere;
  // }

  private gestoreGiaInserito(element: any): boolean {
    return !!this.valueTableDialog.find(e => e.idUtente.campoCustom === element.idUtente.campoCustom);
  }

  // TODO: rivedere. Ora usiamo campoCustom e non descrizione. Forse dev'essere generalizzato
  public possoSalvareAdd(): boolean {
    console.log("possoSalvare");
    let possoSalvare = true;
    this.valueTableDialog.forEach(e => {
      if ((e.permesso && !e.idUtente.idPersona.descrizione) || (!e.permesso && e.idUtente.idPersona.descrizione)) {
        possoSalvare = false;
      }
    });
    return possoSalvare;
  }

  public eliminaGestore(row: any) {
    console.log("eliminaGestore", row);
    const index = this.valueTableDialog.indexOf(row);
    this.valueTableDialog.splice(index, 1);
  }


  private callGestoriPecService(permessiDaInviare, successFunct, resultMessages) {
    this.gestoriPecService.managePermissionsGestoriPec(permessiDaInviare).subscribe(res => {
      this._gestoriPecTableSupport.refreshData();
      this.aggiornatiGestori.emit(true);
      if (successFunct) {
        successFunct();
      }
      if (resultMessages.success && resultMessages.success.target && resultMessages.success.message) {
        this.messageService.add({ key: resultMessages.success.target, severity: "success", summary: "OK", detail: resultMessages.success.message });
      }
    },
      error => {
        if (resultMessages.error && resultMessages.error.target && resultMessages.error.message) {
          this.messageService.clear(resultMessages.error.target);
          this.messageService.add({ key: resultMessages.error.target, severity: "error", summary: "Errore", detail: resultMessages.error.message });
        }
        console.log("errore", error);
      });
  }

  closeDialog() {
    const closeWithoutSaving = () => {
      this.messageService.clear("message1");
      this.dialogVisible = false;
    };

    if (this.valueTableDialog.length > 0) {
      this.confirmAndExecute("Chiudendo perderai i dati non salvati, vuoi proseguire?", () => {
        closeWithoutSaving();
      });
    } else {
      closeWithoutSaving();
    }
  }

  private confirmAndExecute(question: string, exe: any) {
    this.confirmationService.confirm({
      key: "gestori",
      message: question,
      accept: () => {
        exe();
      },
      reject: () => {
      }
    });
  }

  public trasformValuesAfterSearch(values: any[]): any[] {

    // togliere dalla lista degli elementi da mostrare alcuni elementi
    /*
    const elem = { idPersona: { codiceFiscale: "ZLOGDU83C31D458O" } };
    const invalidList = [elem];

    const filteredValues: any[] = values.filter(item => {
      return !invalidList.find(invalidItem => invalidItem.idPersona.codiceFiscale === item.idPersona.codiceFiscale);
    }) */

    values.forEach(element => {
      element["campoCustom"] = element.idPersona.descrizione + " - " + element.idPersona.codiceFiscale;
    });

    return values;
  }

  enabledSaveDialog(dialogMode: string) {
    if (dialogMode === "add") {
      return this.valueTableDialog.length > 0;
    } else if (dialogMode === "edit") {
      return true;
    } else { return false; }
  }


  public onSelectDataInizio(event) {
    console.log("onSelectDataInizio", event);
    this.minDataFine = new Date(event);
    this.minDataFine.setDate(this.minDataFine.getDate() + 1);
  }

  public onSelectDataFine(event) {
    console.log("onSelectDataFine", event);
    this.maxDataInizio = new Date(event);
    this.maxDataInizio.setDate(this.maxDataInizio.getDate() - 1);
  }


  setInitialLimitDate(dataInizio, dataFine) {
    this.maxDataInizio = new Date();
    this.minDataFine = new Date();

    if (dataFine) {
      this.maxDataInizio.setDate(dataFine.getDate() - 1);
      if (this.maxDataInizio.getDate() < this.today.getDate()) {
        this.maxDataInizio = this.today;
      }
    } else {
      this.maxDataInizio = null;
    }

    if (dataInizio) {
      this.minDataFine.setDate(dataInizio.getDate() + 1);
    }

    if (this.minDataFine.getDate() < this.today.getDate()) {
      this.minDataFine.setDate(this.today.getDate());
    }

  }


  public cleanObjForHttpCall(origObj: any, datepipe): any {
    if (typeof (origObj) != "object") {
      return origObj;
    }
    let newObj = {};
    let hasProp: boolean = false;
    for (let prop in origObj) {
      hasProp = true;
      if (datepipe && origObj[prop] instanceof Date) {
        newObj[prop] = datepipe.transform(origObj[prop], "yyyy-MM-ddTHH:mm:ss");
      } else if (typeof (origObj[prop]) == "object") {
        if (origObj[prop] instanceof Array) {
          let origArray = origObj[prop];
          let newArray: any[] = [];
          origArray.forEach(element => {
            newArray.push(this.cleanObjForHttpCall(element, datepipe))
          });
          newObj[prop] = newArray;
        } else {
          newObj[prop] = this.cleanObjForHttpCall(origObj[prop], datepipe);
        }
      } else {
        newObj[prop] = origObj[prop];
      }
    }
    if (!hasProp) {
      newObj = null;
    }
    return newObj;
  }


  public cleanArrayForHttpCall(origArray: any[], datepipe): any[] {
    const newArray = [];
    origArray.forEach(element => {
      newArray.push(this.cleanObjForHttpCall(element, datepipe));
    });
    return newArray;
  }

}




