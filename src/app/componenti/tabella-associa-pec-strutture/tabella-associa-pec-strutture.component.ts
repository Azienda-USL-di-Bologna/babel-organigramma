import { Component, Input, ViewChild, OnInit } from "@angular/core";
import { Struttura, Azienda, CODICI_RUOLO } from "@bds/ng-internauta-model";
import { PTableColumn, ServicePrimeNgTableSupport, FiltersAndSorts, AdditionalDataDefinition, Mode, SortDefinition, NextSdrServiceQueringWrapper, FilterDefinition, SORT_MODES, FILTER_TYPES } from "@nfa/next-sdr";
import { ConfirmationService } from "primeng/api";
import { PecStruttureService } from "src/app/services/pec-strutture.service";
import { PROJECTIONS } from "src/environments/app-constants";
import { PecService } from "src/app/services/pec.service";
import { PecAziendaService } from "src/app/services/pec-azienda.service";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { Entita, PermessiEntita, Permesso, CategoriaPermessi } from "@bds/nt-communicator";

@Component({
  selector: "app-tabella-associa-pec-strutture",
  templateUrl: "./tabella-associa-pec-strutture.component.html",
  styleUrls: ["./tabella-associa-pec-strutture.component.css"]
})
export class TabellaAssociaPecStruttureComponent implements OnInit {
  private componentDefinition = "TabellaAssociaPecStruttureComponent";

  public _strutturaSelezionata: Struttura;
  public _cols: PTableColumn[];
  public _associazioniTableSupport: ServicePrimeNgTableSupport;
  public editingVisibile: boolean = false;
  public pecInEditing: any;
  public gestoriPecVisible: boolean = false;
  public pecSelezionata: any;
  public pecStruttureVisible: boolean = false;
  public _azienda: Azienda;
  // public editAbilitato: boolean = false;

  private soggetto: Entita;
  private permessoPecEmpty: PermessiEntita;
  public serviceQWcomboPecAzienda: NextSdrServiceQueringWrapper;
  public CODICI_RUOLO: any;

  @Input() set aziendaAndStruttura(value: any) {
    console.log(this.componentDefinition, "aziendaAndStruttura", value);
    this._strutturaSelezionata = value.struttura;
    this._azienda = value.azienda;
    /* if (this._strutturaSelezionata.fk_idStrutturaReplicata.id != null) {
      this.editAbilitato = false;
    } else {
      this.editAbilitato = true;
    } */

    this.soggetto = new Entita();
    this.soggetto.id_provenienza = this._strutturaSelezionata.id;
    this.soggetto.schema = "baborg";
    this.soggetto.table = "strutture";
    this.buildData();
    this.buibuildDataCompoPecAzienda();
    this.buildPermessoStrutturaPecEmpty();

  }

  // @Input("azienda") set azienda(value: any){
  //   console.log("set azienda", value);
  //   this._azienda = value;
  // }

  @ViewChild("dtAssociazioni", null) dtAssociazioni: any;

  constructor(
    public loginService: NtJwtLoginService,
    private pecService: PecService,
    private pecAziendaService: PecAziendaService,
    private pecStruttureService: PecStruttureService,
    private confirmationService: ConfirmationService) { }



  ngOnInit() {
    this.CODICI_RUOLO = CODICI_RUOLO;

    this._cols = [
      {
        field: "indirizzo",
        header: "Pec",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        style: {
          width: "400px"
        }
      },
      {
        field: "permessi.principale",
        header: "Principale",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "boolean",
        style: {
          width: "90px",
          textAlign: "center"
        }
      },
      {
        field: "permessi.propaga_soggetto",
        header: "Propaga Eredita",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        fieldType: "string",
        style: {
          width: "90px",
          textAlign: "center"
        }
      },
      {
        field: "gestori",
        header: "Gestori",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "object"
      }
    ];
  }

  private buildData() {
    this._associazioniTableSupport = new ServicePrimeNgTableSupport({
      service: this.pecService,
      projection: PROJECTIONS.pec.customProjections.PecPlainWithPermessiAndGestoriCustom,
      table: this.dtAssociazioni,
      initialBuildAndSort: this.buildInitialBuildAndSort(),
      registerTableSelectEditEvents: false,
      onError: (error: any, mode: Mode) => {
        this.showRequestErrorMessage(error);
      }
    });
    this._associazioniTableSupport.refreshData();
  }
  private showRequestErrorMessage(reqError: any): void {
    console.log("Si è verificato un errore nella richiesta");
  }

  buibuildDataCompoPecAzienda() {
    this.serviceQWcomboPecAzienda = {
      service: this.pecAziendaService,
      projection: PROJECTIONS.pecazienda.standardProjections.PecAziendaWithIdAziendaAndIdPec,
      initialFiltersAndSorts: this.InitialPecComboBuild()
    };
  }

  private buildInitialBuildAndSort(): FiltersAndSorts {
    const filters: FiltersAndSorts = new FiltersAndSorts();
    filters.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "FilterPecPerPermissionOfSubject:AddPermissionsOnPec:AddGestoriOnPec"));
    filters.addAdditionalData(new AdditionalDataDefinition("idStruttura", this._strutturaSelezionata.id.toString()));
    filters.addAdditionalData(new AdditionalDataDefinition("idAzienda", this._azienda.id.toString()));
    filters.addSort(new SortDefinition("indirizzo", "asc"));
    return filters;
  }

  private InitialPecComboBuild(): FiltersAndSorts {
    const initialConstraints: FiltersAndSorts = new FiltersAndSorts();
    initialConstraints.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._azienda.id));
    initialConstraints.addSort(new SortDefinition("idPec.indirizzo", SORT_MODES.asc));
    return initialConstraints;
  }


  public buildPermessiPrincipale(row) {
    if (row && !!row.permessi && row.permessi.length > 0
      && !!row.permessi[0].categorie && row.permessi[0].categorie.length > 0
      && !!row.permessi[0].categorie[0].permessi && row.permessi[0].categorie[0].permessi.length > 0
      && row.permessi[0].categorie[0].permessi[0].predicato === "SPEDISCE_PRINCIPALE") {
      return true;
    } else {
      return false;
    }
  }

  public buildPermessiPropagaSoggetto(row, tooltip: boolean = false) {
    if (row && !!row.permessi && row.permessi.length > 0
      && !!row.permessi[0].categorie && row.permessi[0].categorie.length > 0
      && !!row.permessi[0].categorie[0].permessi && row.permessi[0].categorie[0].permessi.length > 0) {
      if (row.permessi[0].categorie[0].permessi[0].virtuale) {
        return tooltip ? "Permesso ereditato" : "E";
      } else if (row.permessi[0].categorie[0].permessi[0].propaga_soggetto) {
        return tooltip ? "Permesso propagato" : "P";
      }
      return tooltip ? "Permesso non propagato" : "N";
    }
    console.log("errore di sbaglio, qui non dovrei arrivare");
    return "";
  }

  public buildGestori(row) {
    let gestoriString = "";
    for (const key in row.gestori) {
      if (row.gestori.hasOwnProperty(key))
        gestoriString += row.gestori[key]["descrizione"] + ", ";
    }
    return gestoriString !== "" ? gestoriString.substr(0, gestoriString.length - 2) : "Nessun gestore presente, clicca qui per inserirne";
  }

  public apriGestoriPec(row: any) {
    this.pecSelezionata = row;
    this.gestoriPecVisible = true;
  }

  public apriPecStrutture(row: any) {
    this.pecSelezionata = row;
    this.pecStruttureVisible = true;
  }

  public nuovaAssociazione() {
    this.pecInEditing = {
      pecAzienda: null,
      principale: false,
      propaga: false,
      tipoDiEditing: "insert"
    };
    this.editingVisibile = true;
  }

  public editaAssociazione(row) {
    console.log("sto provando ad editare:", row);
    this.pecInEditing = {
      pecAzienda: {
        idPec: {
          id: row.id,
          indirizzo: row.indirizzo
        }
      },
      principale: row.permessi[0].categorie[0].permessi[0].predicato === "SPEDISCE_PRINCIPALE",
      propaga: row.permessi[0].categorie[0].permessi[0].propaga_soggetto,
      tipoDiEditing: "update"
    };
    this.editingVisibile = true;
  }

  public eliminaAssociazione(row: any): void {
    this.confirmationService.confirm({
      key: "eliminaAssociazione",
      message: "Sei sicuro di voler eliminare questa associazione pec-struttura?",
      accept: () => {
        console.log("devo cancellare questo:", row);
        const permessoDaInviare = [];
        permessoDaInviare.push(Object.assign({}, row.permessi[0]));
        permessoDaInviare[0].categorie[0].permessi = [];
        this.callPecStruttureService(permessoDaInviare);
      },
      reject: () => { }
    });
  }

  public salvaPec() {
    console.log(this.pecInEditing);
    const permessoDaInviare = [];
    permessoDaInviare.push(Object.assign({}, this.permessoPecEmpty));
    permessoDaInviare[0].oggetto.id_provenienza = this.pecInEditing.pecAzienda.idPec.id;
    permessoDaInviare[0].categorie[0].permessi[0].propaga_soggetto = this.pecInEditing.propaga;
    permessoDaInviare[0].categorie[0].permessi[0].predicato = this.pecInEditing.principale ? "SPEDISCE_PRINCIPALE" : "SPEDISCE";
    this.callPecStruttureService(permessoDaInviare);
    this.editingVisibile = false;
  }

  private callPecStruttureService(permessoDaInviare) {
    console.log(permessoDaInviare);
    this.pecStruttureService.managePermission(permessoDaInviare).subscribe(res => {
      this.refreshData();
    },
      error => {
        console.log("errore", error);
      });
  }

  public refreshData() {
    this._associazioniTableSupport.refreshData();
  }

  private buildPermessoStrutturaPecEmpty() {
    const oggetto = new Entita();
    oggetto.table = "pec";
    oggetto.schema = "baborg";
    oggetto.id_provenienza = null;

    const permesso = new Permesso();
    permesso.origine_permesso = "BABORG";
    permesso.propaga_oggetto = false;
    permesso.propaga_soggetto = null;
    permesso.predicato = null;

    const categoriaPermessi = new CategoriaPermessi();
    categoriaPermessi.ambito = "PECG";
    categoriaPermessi.tipo = "PEC";
    categoriaPermessi.permessi = [permesso];

    const permessiEntita = new PermessiEntita();
    permessiEntita.soggetto = this.soggetto;
    permessiEntita.oggetto = oggetto;
    permessiEntita.categorie = [categoriaPermessi];

    this.permessoPecEmpty = permessiEntita;
  }


}
