import { UtenteUtilities } from "@bds/nt-jwt-login";
import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList, Input, EventEmitter, Output } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng/api";
import { Azienda, StrutturaUnificata, Struttura, Utente, ENTITIES_STRUCTURE } from "@bds/ng-internauta-model";
import {  LOCAL_IT } from "@bds/nt-communicator";
import { StrutturaUnificataService } from "../../services/strutturaunificata-service";
import { PROJECTIONS, getInternautaUrl } from "../../../environments/app-constants";
import { Table } from "primeng/table";
import { Calendar } from "primeng/calendar";
import { MessageService, ConfirmationService } from "primeng/components/common/api";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { STATI_STR_UNIFICATE, BaseUrlType } from "../../../environments/app-constants";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { FiltersAndSorts, FILTER_TYPES, AdditionalDataDefinition, SortDefinition, SORT_MODES, UtilityFunctions, BatchOperation, NextSdrEntity, BatchOperationTypes } from "@nfa/next-sdr";


@Component({
  selector: "app-strutture-unificate",
  templateUrl: "./strutture-unificate.component.html",
  styleUrls: ["./strutture-unificate.component.css"],
  providers: [DatePipe]
})
export class StruttureUnificateComponent implements OnInit, AfterViewInit {

  private componentDescription = "StruttureUnificateComponent";
  public loggedUser: UtenteUtilities;

  @ViewChild("dt", null) private _table: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;

  @Input() stato: string;

  @Output() reloadDataEmit: EventEmitter<string> = new EventEmitter<string>();
  public cols: any[];
  public totalRecords: number;

  public dataRange: any = {};
  public localIt = LOCAL_IT;

  public newRow: boolean;
  public displayDettaglioRecordDialog: boolean;
  public displayDisattivaDialog: boolean;

  public struttureUnificate: StrutturaUnificata[];
  public strutturaUnificataPopup: StrutturaUnificata;
  public aziendaSorgente: Azienda;
  public strutturaSorgente: Struttura;
  public aziendaDestinazione: Azienda;
  public strutturaDestinazione: Struttura;
  public tipoOperazione: string;
  public datiDisattivazionePopup: any = {};
  public selectedRows: StrutturaUnificata[] = new Array<StrutturaUnificata>();

  public STATI = STATI_STR_UNIFICATE;

  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();

  private previousEvent: LazyLoadEvent;


  constructor(
    private strutturaUnificataService: StrutturaUnificataService,
    private datepipe: DatePipe,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public loginService: NtJwtLoginService) {
    this.loginService.loggedUser$.subscribe(utente => { this.loggedUser = utente; });
  }

  ngOnInit() {
    this.cols = [
      {
        field: "dataAttivazione",
        header: "Data attivazione",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        filterWidget: "Calendar",
        ariaLabelDescription: "Colonna attivazione, Cella filtro"
      },
      {
        field: "idStrutturaSorgente.idAzienda.descrizione",
        header: "Azienda sorgente",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "idStrutturaSorgente.nome",
        header: "Struttura sorgente",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "idStrutturaDestinazione.idAzienda.descrizione",
        header: "Azienda destinazione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "idStrutturaDestinazione.nome",
        header: "Struttura destinazione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "tipoOperazione",
        header: "Tipo operazione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "dataInserimentoRiga",
        header: "Data inserimento",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        filterWidget: "Calendar",
        ariaLabelDescription: "Colonna Inserimento, Cella filtro"
      }
    ];

    const dataDisattivazione = {
      field: "dataDisattivazione",
      header: "Data disattivazione",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      fieldType: "DateTime",
      filterWidget: "Calendar",
      ariaLabelDescription: "Colonna disattivazione, Cella filtro"
    };

    const pencil = {
      // colonna pencil
    };

    const thrash = {
      // colonna thrash
    };

    const deactive = {
      // colonna disattivazione
    };

    const select = {
      // colonna selezione
      // placeHolder: true
    };

    if (this.stato === this.STATI.Storico) {
      this.cols.splice(1, 0, dataDisattivazione);
    } else if (this.stato === this.STATI.Bozza) {
      this.cols.push(pencil);
      this.cols.push(thrash);
      this.cols.splice(0, 0, select);
    } else if (this.stato === this.STATI.Corrente) {
      if (this.loggedUser.isCI()) {
        this.cols.push(deactive);
      }
      this.cols.splice(1, 0, dataDisattivazione);
    }
  }


  ngAfterViewInit() {
    // aggiungo le label aria al campo input del calendario
    const colsDate = this.cols.filter(e => e.filterWidget === "Calendar");
    colsDate.forEach(element => {
      const calElm = document.getElementById("CalInput_" + element.field);
      calElm.setAttribute("aria-label", element.ariaLabelDescription);
    });
  }


  calendarTooltip(field: string) {
    let tooltip: string = "";
    if (this.dataRange && this.dataRange[field]) {
      if (this.dataRange[field][0]) {
        tooltip += this.datepipe.transform(this.dataRange[field][0], "dd/MM/yyyy");
      }
      if (this.dataRange[field][1]) {
        tooltip += " - " + this.datepipe.transform(this.dataRange[field][1], "dd/MM/yyyy");
      }
    }
    return tooltip;
  }


  public handleEvent(nome: string, event) {
    switch (nome) {
      case "onLazyLoad":
        this.loadLazy(event);
        break;
    }
  }


  private loadLazy(event: LazyLoadEvent) {
    this.loadData(event);
  }



  private loadData(event: LazyLoadEvent) {
    const functionName = "loadData";
    // mi salvo il filtro dell'evento così, se cambio struttura o azienda posso ricaricare i dati applicando quel filtro
    // in alternativa potrei svuotare i filtri al cambio di struttura e azienda
    if (event) {
      this.previousEvent = event;
      this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    }
    this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata
    this.strutturaUnificataService.getData(PROJECTIONS.strutturaunificata.customProjections.StrutturaUnificataCustom, this.initialFiltersAndSorts, this.lazyLoadFiltersAndSorts)
      .subscribe(
        data => {
          this.struttureUnificate = undefined;
          this.totalRecords = 0;
          if (data && data.results && data.page) {
            this.struttureUnificate = <StrutturaUnificata[]>data.results;
            this.totalRecords = data.page.totalElements;

            this.struttureUnificate.forEach(s => {
              s.idStrutturaSorgente["descrizioneCustom"] = s.idStrutturaSorgente.nome + (s.idStrutturaSorgente.codice != null ? " [" + s.idStrutturaSorgente.codice + "]" : "");
              s.idStrutturaDestinazione["descrizioneCustom"] = s.idStrutturaDestinazione.nome + (s.idStrutturaDestinazione.codice != null ? " [" + s.idStrutturaDestinazione.codice + "]" : "");

            });
          }
        },
        error => console.log(this.componentDescription, functionName, "errore", error)
      );
  }


  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const initialFiltersAndSorts = new FiltersAndSorts();

    initialFiltersAndSorts.addAdditionalData(new AdditionalDataDefinition("getDataByStato", this.stato));
    initialFiltersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.desc));

    return initialFiltersAndSorts;
  }


  public onCalendarAction(event: any, field: string, action: string) {
    switch (action) {
      case "today":
        const calSel: Calendar = this._calGen.find(e => e.inputId === "CalInput_" + field);
        if (calSel) {
          calSel.overlayVisible = false;
        }
        break;

      case "clear":
        this._table.filter(null, field, null);
        break;

      case "select":
        if (this._calGen) {
          const calSel: Calendar = this._calGen.find(a => a.inputId === "CalInput_" + field);
          if (calSel && this.dataRange && this.dataRange[field].length === 2
            && this.dataRange[field][0] && this.dataRange[field][1]) {
            calSel.overlayVisible = false;
          }
        }

        event = this.dataRange[field];
        this._table.filter(event, field, null);
        break;
    }
  }


  public aziendaSorgSelezionataRecived(event) {
    // ho cambiato la selezione sull'azienda sorgente. Svuoto la struttura sorgente
    this.aziendaSorgente = event;
    this.strutturaUnificataPopup.idStrutturaSorgente = undefined;
  }


  public strutturaSorgSelezionataRecived(event) {
    this.strutturaUnificataPopup.idStrutturaSorgente = event;
  }


  public aziendaDestSelezionataRecived(event) {
    // ho cambiato la selezione sull'azienda destinazione. Svuoto la struttura destinazione
    this.aziendaDestinazione = event;
    this.strutturaUnificataPopup.idStrutturaDestinazione = undefined;
  }


  public strutturaDestSelezionataRecived(event) {
    this.strutturaUnificataPopup.idStrutturaDestinazione = event;
  }


  public tipoOperazioneSelezionataRecived(event) {
    this.strutturaUnificataPopup.tipoOperazione = event;
  }


  // aggiunta/modifica Record
  showDettaglioRecordDialog(row: StrutturaUnificata) {
    if (row) {
      // modifica record esistente
      this.newRow = false;
      this.strutturaUnificataPopup = UtilityFunctions.cloneObj(row);
      this.aziendaSorgente = this.strutturaUnificataPopup.idStrutturaSorgente.idAzienda;
      this.aziendaDestinazione = this.strutturaUnificataPopup.idStrutturaDestinazione.idAzienda;
    } else {
      // aggiunta nuovo record
      this.newRow = true;
      this.strutturaUnificataPopup = new StrutturaUnificata();
      this.aziendaSorgente = undefined;
      this.aziendaDestinazione = undefined;
    }
    this.displayDettaglioRecordDialog = true;
  }

  saveRecord() {
    if (!this.aziendaSorgente || !this.strutturaUnificataPopup.idStrutturaSorgente || !this.aziendaDestinazione || !this.strutturaUnificataPopup.idStrutturaDestinazione || !this.strutturaUnificataPopup.tipoOperazione) {
      this.messageService.add({ severity: "warn", summary: "Attenzione", detail: "tutti i campi devono essere compilati" });
    } else {
      if (this.newRow) {
        this.strutturaUnificataService.insert(this.strutturaUnificataPopup, this.datepipe)
          .subscribe(data => {
            console.log("riga inserita correttamente", data);
            this.messageService.add({ severity: "success", summary: "OK", detail: "Record inserito con successo" });
            this.loadData(this.previousEvent);
          },
            error => {
              console.log("post error", error);
              this.messageService.add({ severity: "error", summary: "Errore", detail: "Inserimento record non andato a buon fine" });
            }
          );
      } else {
        this.confirmationService.confirm({
          message: "Confermi le modifiche?",
          accept: () => {
            this.strutturaUnificataService.update(this.strutturaUnificataPopup)
              .subscribe(data => {
                console.log("riga aggiornata correttamente", data);
                this.messageService.add({ severity: "success", summary: "OK", detail: "Record modificato con successo" });
                this.loadData(this.previousEvent);
              },
                error => {
                  console.log("patch error", error);
                  this.messageService.add({ severity: "error", summary: "Errore", detail: "Modifica record non andata a buon fine" });
                }
              );
          },
          reject: () => {
          }
        });
      }
      this.displayDettaglioRecordDialog = false;
    }
  }

  closeDettaglioRecordDialog(): void {
    this.displayDettaglioRecordDialog = false;
  }


  // cancecellazione Record
  public deleteRecord(row: StrutturaUnificata) {

    this.confirmationService.confirm({
      message: "Confermi l'eliminazione della riga?",
      accept: () => {
        this.strutturaUnificataService.delete(row)
          .subscribe(data => {
            console.log("riga cancellata correttamente", data);
            this.messageService.add({ severity: "success", summary: "OK", detail: "Record cancellato con successo" });
            this.loadData(this.previousEvent);
          },
          error => {
            console.log("delete error", error);
            this.messageService.add({ severity: "error", summary: "Errore", detail: "Cancellazione record non andata a buon fine" });
          });
      },
      reject: () => {
      }
    });
    if (!this.newRow) {
    }
  }

  // attivazione strutturaUnificata
  public activateRecords(): void {
    this.confirmationService.confirm({
      message: "Stai per attivare le unificazioni selezionate. Vuoi procedere?",
      accept: () => {
        const batchOperations: BatchOperation[] = this.selectedRows.map((item) => {
          const elementToUpdate: NextSdrEntity = {
            dataAccensioneAttivazione: new Date()
          };
          return {
            id: item.id,
            operation: BatchOperationTypes.UPDATE,
            entityPath: getInternautaUrl(BaseUrlType.Baborg, true) + "/" + ENTITIES_STRUCTURE.baborg.strutturaunificata.path,
            entityBody: elementToUpdate
          } as BatchOperation;
        });

        console.log("request batch: ", batchOperations);
        this.strutturaUnificataService.batch(batchOperations).subscribe(
          res => {
            this.loadData(this.previousEvent);
            this.reloadDataEmit.emit(this.STATI.Corrente);
            this.messageService.add({ severity: "success", summary: "OK", detail: "Attivazione avvenuta con successo" });
          },
          err => {
            console.log("error", err);
            this.messageService.add({ severity: "error", summary: "Errore", detail: "Attivazione non andata a buon fine" });
          }
        );
      },
      reject: () => { }
    });
  }


  // disattivazione strutturaUnificata
  public showDeactivateDialog(row: any): void {
    this.datiDisattivazionePopup = {
      id: row.id,
      dataDisattivazione: row.dataDisattivazione
    };
    this.displayDisattivaDialog = true;
  }

  public deactivateRecord(): void {
    this.confirmationService.confirm({
      message: "Stai per disattivare questa unificazione. Vuoi procedere?",
      accept: () => {
        this.strutturaUnificataService.update(this.datiDisattivazionePopup)
          .subscribe(data => {
            this.loadData(this.previousEvent);
            this.reloadDataEmit.emit(this.STATI.Storico);
            this.messageService.add({ severity: "success", summary: "OK", detail: "Disattivazione avvenuta con successo" });
          },
          error => {
            console.log("patch error", error);
            this.messageService.add({ severity: "error", summary: "Errore", detail: "Disattivazione non andata a buon fine" });
          });
      },
      reject: () => {
      }
    });
    this.displayDisattivaDialog = false;
  }

  closeDisattivaDialog(): void {
    this.displayDisattivaDialog = false;
  }

}
