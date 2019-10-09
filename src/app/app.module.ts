import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { rootRouterConfig } from "./app.routes";

// service
import { AziendaService } from "./services/azienda-service";
import { StrutturaService } from "./services/struttura-service";
import { UtenteStrutturaService } from "./services/utentestruttura-service";
import { StrutturaUnificataService } from "./services/strutturaunificata-service";
import { MessageService, ConfirmationService } from "primeng/components/common/api";
import { RibaltoneService } from "./services/ribaltone-service";
import { DatePipe } from "@angular/common";
import { PecProviderService } from "./services/pec-provider.service";
import { StrutturaServiceNext } from "./services/struttura.service";
import { GestoriPecService } from "./services/gestori-pec.service";
import { AziendaServiceNext } from "./services/azienda-service-next";
import { PecAziendaService } from "./services/pec-azienda.service";
import { SlideMenuModule } from "primeng/slidemenu";

// componenti angular
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// componenti pirmeNg
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { AutoCompleteModule } from "primeng/autocomplete";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { CalendarModule } from "primeng/calendar";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { DataScrollerModule } from "primeng/datascroller";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TabViewModule } from "primeng/tabview";
import { SelectButtonModule } from "primeng/selectbutton";
import { CheckboxModule } from "primeng/checkbox";
import { TriStateCheckboxModule } from "primeng/tristatecheckbox";
import { DropdownModule } from "primeng/dropdown";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { MessagesModule } from "primeng/messages";
import { MessageModule } from "primeng/message";
import { DialogService } from "primeng/api";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { SliderModule } from "primeng/slider";
import { MultiSelectModule } from "primeng/multiselect";
import { OrderListModule } from "primeng/orderlist";
import { KeyFilterModule } from "primeng/keyfilter";
import { PanelModule } from "primeng/panel";

// pagine
import { HomepageComponent } from "./pagine/homepage/homepage.component";
import { OrganigrammaComponent } from "./pagine/organigramma/organigramma.component";
import { UnificazioniComponent } from "./pagine/unificazioni/unificazioni.component";
import { AnagrafePecComponent } from "./pagine/anagrafe-pec/anagrafe-pec.component";
import { AssociaPecStruttureComponent } from "./pagine/associa-pec-strutture/associa-pec-strutture.component";
import { ElencoPecComponent } from "./pagine/elenco-pec/elenco-pec.component";

// componenti
import { AppComponent } from "./app.component";
import { TabellaUtentiComponent } from "./componenti/tabella-utenti/tabella-utenti.component";
import { AlberoStruttureComponent } from "./componenti/albero-strutture/albero-strutture.component";
import { StruttureUnificateComponent } from "./componenti/strutture-unificate/strutture-unificate.component";
import { ComboAziendeComponent } from "./componenti/combo-aziende/combo-aziende.component";
import { ComboStruttureComponent } from "./componenti/combo-strutture/combo-strutture.component";
import { ComboStruttureNewComponent } from "./componenti/combo-strutture-new/combo-strutture-new.component";
import { ComboTipiOperazioneComponent } from "./componenti/compo-tipi-operazione/combo-tipi-operazione.component";
import { LanciaRibaltoneComponent } from "./ribaltone/lancia-ribaltone/lancia-ribaltone.component";
import { ComboUtentiComponent } from "./componenti/combo-utenti/combo-utenti.component";
import { AlberoOrganigrammaComponent } from "./componenti/albero-organigramma/albero-organigramma.component";
import { GestoriPecComponent } from "./componenti/gestori-pec/gestori-pec.component";
import { PecStruttureComponent } from "./componenti/pec-strutture/pec-strutture.component";
import { DropDownUtentiComponent } from "./componenti/dropdown-utenti/dropdown-utenti.component";
import { TabellaElencoPecComponent } from "./componenti/tabella-elenco-pec/tabella-elenco-pec.component";
import { TabellaElencoPecNotUsedComponent } from "./componenti/tabella-elenco-pec-not-used/tabella-elenco-pec-not-used.component";
import { TabellaAssociaPecStruttureWrapperComponent } from "./componenti/tabella-associazioni-pec-strutture-wrapper/tabella-associa-pec-strutture-wrapper.component";

// login
import { NtJwtLoginModule } from "@bds/nt-jwt-login";
import { loginModuleConfig } from "./config/module-config";

import { NtCommunicatorModule } from "@bds/nt-communicator";

// Moduli
import { NextSdrModule } from "@nfa/next-sdr";
import { TabellaAssociaPecStruttureComponent } from "./componenti/tabella-associa-pec-strutture/tabella-associa-pec-strutture.component";

// componenti @bds
import { PrimengPluginModule, ProfiloComponent } from "@bds/primeng-plugin";
import { RibaltorgComponent } from "./pagine/ribaltorg/ribaltorg.component";
import { StatoAttivazioneRibaltoniComponent } from "./componenti/stato-attivazione-ribaltoni/stato-attivazione-ribaltoni.component";
import { StoricoAttivazioneService } from "./services/storico-attivazione.service";
import { StoricoAttivazioneRibaltoniComponent } from "./componenti/storico-attivazione-ribaltoni/storico-attivazione-ribaltoni.component";
import { StoricoLancioRibaltoniComponent } from "./componenti/storico-lancio-ribaltoni/storico-lancio-ribaltoni.component";

/* Registro la data italiana */
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import localeItExtra from "@angular/common/locales/extra/it";
import { TemplateMessaggiService } from "./services/template-messaggi.service";
import { ApplicazioniService } from "./services/applicazioni.service";
import { AmministrazioneMessaggiService } from "./services/amministrazione-messaggi.service";
import { CommonComponentsModule } from "@bds/common-components";

registerLocaleData(localeIt, "it-IT", localeItExtra);

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    OrganigrammaComponent,
    TabellaUtentiComponent,
    AlberoStruttureComponent,
    StruttureUnificateComponent,
    ComboAziendeComponent,
    ComboStruttureComponent,
    ComboTipiOperazioneComponent,
    LanciaRibaltoneComponent,
    UnificazioniComponent,
    ComboUtentiComponent,
    AnagrafePecComponent,
    GestoriPecComponent,
    AlberoOrganigrammaComponent,
    AssociaPecStruttureComponent,
    TabellaAssociaPecStruttureComponent,
    PecStruttureComponent,
    DropDownUtentiComponent,
    RibaltorgComponent,
    StatoAttivazioneRibaltoniComponent,
    StoricoAttivazioneRibaltoniComponent,
    StoricoLancioRibaltoniComponent,
    ElencoPecComponent,
    TabellaElencoPecComponent,
    ComboStruttureNewComponent,
    TabellaElencoPecNotUsedComponent,
    TabellaAssociaPecStruttureWrapperComponent
  ],
  imports: [
    NtJwtLoginModule.forRoot(loginModuleConfig),
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TreeModule,
    AutoCompleteModule,
    CalendarModule,
    TooltipModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    DataScrollerModule,
    ToastModule,
    ConfirmDialogModule,
    TabViewModule,
    SelectButtonModule,
    NextSdrModule,
    CheckboxModule,
    TriStateCheckboxModule,
    DropdownModule,
    ScrollPanelModule,
    MessagesModule,
    MessageModule,
    SlideMenuModule,
    PrimengPluginModule,
    DynamicDialogModule,
    OverlayPanelModule,
    SliderModule,
    NtCommunicatorModule,
    MultiSelectModule,
    OrderListModule,
    KeyFilterModule,
    PanelModule,
    CommonComponentsModule
  ],
  providers: [AziendaService, AziendaServiceNext, StrutturaService, UtenteStrutturaService, GestoriPecService,
    StrutturaUnificataService, PecProviderService, ConfirmationService, MessageService, RibaltoneService, DatePipe, DialogService,
    StrutturaServiceNext, PecAziendaService, StoricoAttivazioneService, TemplateMessaggiService, ApplicazioniService, AmministrazioneMessaggiService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ProfiloComponent]
})
export class AppModule { }
