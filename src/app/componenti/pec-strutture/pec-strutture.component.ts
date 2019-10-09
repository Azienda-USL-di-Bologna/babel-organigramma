import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { PTableColumn, ServicePrimeNgTableSupport, FILTER_TYPES, Mode, FiltersAndSorts, AdditionalDataDefinition, FilterDefinition } from "@nfa/next-sdr";
import { PROJECTIONS } from "src/environments/app-constants";
import { StrutturaServiceNext } from "src/app/services/struttura.service";
import { Entita, CategoriaPermessi, PermessiEntita, Permesso } from "@bds/nt-communicator";
import { PecStruttureService } from "src/app/services/pec-strutture.service";
import { SelectItem, ConfirmationService } from "primeng/api";
import { Azienda } from "@bds/ng-internauta-model";

@Component({
  selector: "app-pec-strutture",
  templateUrl: "./pec-strutture.component.html",
  styleUrls: ["./pec-strutture.component.css"]
})
export class PecStruttureComponent implements OnInit {
  public idPec: number;
  public _cols: PTableColumn[];
  public _associazioniTableSupport: ServicePrimeNgTableSupport;
  public _pec: any;
  public oggetto: Entita;
  public editingVisibile: boolean = false;
  public alreadyChecked: number[] = null;
  public _checkedBeforeEditing: number[] = null;
  public booleans: SelectItem[] = [
    {label: "Si", value: true},
    {label: "No", value: false}
  ];
  public permessiDaEliminare: any[] = [];
  public onlyReadMode: boolean = true;
  public _azienda: Azienda;

  @Input("pec") set pec(value: any) {
    if (value) {
      this._pec = value;
      this.oggetto = new Entita();
      this.oggetto.id_provenienza = this._pec.id;
      this.oggetto.schema = "baborg";
      this.oggetto.table = "pec";
      this.buildData();
      this._associazioniTableSupport.refreshData();
    }
  }

  @Input() set azienda(value: Azienda) {
    console.log("set azienda", value);
    this._azienda = value;
  }

  @ViewChild("dtAssociazioni", null) dtAssociazioni: any;
  // @ViewChild("editComponent") editComponent: any;
  // @ViewChild("dialog") dialog: any;

  constructor(private strutturaService: StrutturaServiceNext, private pecStruttureService: PecStruttureService, private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this._cols = [
      {
        field: "nome",
        header: "Struttura",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string"
      },
      {
        field: "permessi.principale",
        header: "Principale",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "200px",
          textAlign: "center"
        }
      },
      {
        // field: (persona: Persona) => this.buildPermessi(persona),
        field: "permessi.propaga_soggetto",
        header: "Associa a sottostrutture",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "200px",
          textAlign: "center"
        }
      }
    ];
  }

  private buildData() {
    this._associazioniTableSupport = new ServicePrimeNgTableSupport({
      service: this.strutturaService,
      projection: PROJECTIONS.struttura.customProjections.StrutturaWithIdAziendaAndPermessiCustom,
      table: this.dtAssociazioni,
      // editComponent: this.editComponent,
      initialBuildAndSort: this.buildInitialBuildAndSort(),
      registerTableSelectEditEvents: false,
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error);
      }
    });
  }

  private buildInitialBuildAndSort(): FiltersAndSorts {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "GetPermessiStrutturePec"));
    filters.addAdditionalData(new AdditionalDataDefinition("idPec", this._pec.id.toString()));
    filters.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    return filters;
  }

  public buildPermessiPrincipale(row) {
    // console.log("buildPermessiPrincipale", row);
    // console.log("build", row.permessi[0].categorie[0].permessi[0].predicato)
    if (row && !!row.permessi && row.permessi.length > 0
      && !!row.permessi[0].categorie && row.permessi[0].categorie.length > 0
      && !!row.permessi[0].categorie[0].permessi && row.permessi[0].categorie[0].permessi.length > 0
      && row.permessi[0].categorie[0].permessi[0].predicato === "SPEDISCE_PRINCIPALE") {
        // console.log("ritorno true")
        return true;
    } else {
      return false;
    }
  }

  public buildPermessiPropagaSoggetto(row) {
    // console.log("buildPermessiPropagaSoggetto", row);
    if (row && !!row.permessi && row.permessi.length > 0
      && !!row.permessi[0].categorie && row.permessi[0].categorie.length > 0
      && !!row.permessi[0].categorie[0].permessi && row.permessi[0].categorie[0].permessi.length > 0) {
        // console.log("row.permessi[0].categorie[0].permessi[0].propaga_soggetto;", row.permessi[0].categorie[0].permessi[0].propaga_soggetto);
        return row.permessi[0].categorie[0].permessi[0].propaga_soggetto;
    }
    return false;
  }

  public togglePrincipale(principale: boolean, row) {
    for (const element of this.dtAssociazioni.value) {
      if (element.id === row.id) {
        element.permessi[0].categorie[0].permessi[0].predicato = principale ? "SPEDISCE_PRINCIPALE" : "SPEDISCE";
        break;
      }
    }
  }

  public togglePropagazione(propaga: boolean, row) {
    for (const element of this.dtAssociazioni.value) {
      if (element.id === row.id) {
        element.permessi[0].categorie[0].permessi[0].propaga_soggetto = propaga;
        break;
      }
    }
  }

  public editPermission(row) {
    const array = [];

    this.dtAssociazioni.value.forEach(element => {
      array.push(element.id);
    });
    this.alreadyChecked = array;
    this._checkedBeforeEditing  = Object.assign([], this.alreadyChecked);
    console.log("this.alreadyChecked, pec strutture", this.alreadyChecked);
    // this.alreadyChecked = this.dtAssociazioni.value;
    /* this.personaInEditing = row == null ? {persona: null, permesso: null} : {persona: row, permesso: row.permessi[0].categorie[0].permessi[0].predicato};
    this.insertingMode = row == null ? true : false; */
    this.editingVisibile = true;
  }

  public showRequestErrorMessage(reqError: any): void {
    console.log("Si è verificato un errore nella richiesta");
  }

  public struttureSelectate() {
    this.editingVisibile = false;
    console.log("strutture scegliute", this._checkedBeforeEditing, this.alreadyChecked);
    console.log(this.dtAssociazioni);
    this.alreadyChecked.forEach(idStruttura => {
      /* this.dtAssociazioni.value.forEach(alreadyPresent => {
        if()
      }); */
      if (!(this._checkedBeforeEditing.indexOf(idStruttura) > -1)) {
        this.caricaStruttura(idStruttura);
      }
    });
    console.log(this.dtAssociazioni);
  }

  public caricaStruttura(idStrutura: number) {
    const filtro = new FiltersAndSorts();
    filtro.addFilter(new FilterDefinition("id", FILTER_TYPES.not_string.equals, idStrutura));
    this.strutturaService.getData(null, filtro, null).toPromise().then(
      data => {
        console.log("data", data.results[0]);
        data.results[0].permessi = [this.buildPermessoDefault(data.results[0].id)];
        this.dtAssociazioni.value.push(data.results[0]);
      });
  }

  buildPermessoDefault(idStruttura: number) {
    const soggetto = new Entita();
    soggetto.table = "strutture";
    soggetto.schema = "baborg";
    soggetto.id_provenienza = idStruttura;

    const permesso = new Permesso();
    permesso.origine_permesso = "BABORG";
    permesso.propaga_oggetto = false;
    permesso.propaga_soggetto = false;
    permesso.predicato = "SPEDISCE";

    const categoriaPermessi = new CategoriaPermessi();
    categoriaPermessi.ambito = "PECG";
    categoriaPermessi.tipo = "PEC";
    categoriaPermessi.permessi = [permesso];

    const permessiEntita = new PermessiEntita();
    permessiEntita.soggetto = soggetto;
    permessiEntita.oggetto = this.oggetto;
    permessiEntita.categorie = [categoriaPermessi];

    return permessiEntita;
  }

  public salvaTutto() {
    const permessi: PermessiEntita[] = [];

    this.dtAssociazioni.value.forEach(element => {
      permessi.push(element.permessi[0]);
    });

    // Prima cancello i permessi da cancellare
    this.callPecStruttureService(this.permessiDaEliminare);
    this.permessiDaEliminare = [];

    // Ora aggiorno/inserisco
    this.callPecStruttureService(permessi);
  }

  public eliminaPermesso(row) {
    this.confirmAndExecute("Confermi di voler eliminare questa associazione?", () => {
      const permesso = row.permessi[0] ;
      permesso.categorie[0].permessi.pop();
      this.permessiDaEliminare.push(permesso);

      for (const element of this.dtAssociazioni.value) {
        if (element.id === row.id) {
          const index = this.dtAssociazioni.value.indexOf(element, 0);
          if (index > -1) {
            this.dtAssociazioni.value.splice(index, 1);
          }
          break;
        }
      }
    });
  }

  private callPecStruttureService(permessoDaInviare) {
    console.log(permessoDaInviare);
    this.pecStruttureService.managePermission(permessoDaInviare).subscribe(res => {
      this._associazioniTableSupport.refreshData();
    },
    error => {
      console.log("errore", error);
    });
  }

  private confirmAndExecute(question: string, exe: any) {
    this.confirmationService.confirm({
      message: question,
      accept: () => {
        exe();
      },
      reject: () => {
      }
    });
  }
}
