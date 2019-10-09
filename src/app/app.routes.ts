import { Routes } from "@angular/router";
import { HomepageComponent } from "./pagine/homepage/homepage.component";
import { OrganigrammaComponent } from "./pagine/organigramma/organigramma.component";
import { UnificazioniComponent } from "./pagine/unificazioni/unificazioni.component";
import { NtJwtLoginComponent } from "@bds/nt-jwt-login";
/* import { LanciaRibaltoneComponent } from "./ribaltone/lancia-ribaltone/lancia-ribaltone.component"; */
import { NoLoginGuard, LoginGuard, RefreshLoggedUserGuard } from "@bds/nt-jwt-login";
import { AnagrafePecComponent } from "./pagine/anagrafe-pec/anagrafe-pec.component";
import { AssociaPecStruttureComponent } from "./pagine/associa-pec-strutture/associa-pec-strutture.component";
import { RoleGuard } from "./guards/role-guard";
import { RibaltorgComponent } from "./pagine/ribaltorg/ribaltorg.component";
import { CODICI_RUOLO } from "@bds/ng-internauta-model";
import { ElencoPecComponent } from "./pagine/elenco-pec/elenco-pec.component";
import { AmministrazioneMessaggiComponent } from "@bds/common-components";


export const rootRouterConfig: Routes = [
    {path: "", redirectTo: "homepage", pathMatch: "full"},
    {path: "login", component: NtJwtLoginComponent, canActivate: [NoLoginGuard], data: {}},
    {path: "homepage", component: HomepageComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "organigramma", component: OrganigrammaComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]},
    {path: "strutture-unificate", component: UnificazioniComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI]}},
    /* {path: "lancia-ribaltone", component: LanciaRibaltoneComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard]}, */
    {path: "anagrafe-pec", component: AnagrafePecComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI]}},
    {path: "associa-pec-strutture", component: AssociaPecStruttureComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI, CODICI_RUOLO.CA]}},
    {path: "elenco-pec", component: ElencoPecComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI, CODICI_RUOLO.CA]}},
    {path: "ribaltorg", component: RibaltorgComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI, CODICI_RUOLO.CA]}},
    {path: "amministrazione-messaggi", component: AmministrazioneMessaggiComponent, canActivate: [RefreshLoggedUserGuard, LoginGuard, RoleGuard], data: {roles: [CODICI_RUOLO.CI, CODICI_RUOLO.CA]}},
];
