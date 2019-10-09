import { NTJWTModuleConfig } from "@bds/nt-jwt-login";
import { LOGIN_ROUTE, HOME_ROUTE, LOCALHOST_PORT, BABORG_ROUTE } from "../../environments/app-constants";

export const loginModuleConfig: NTJWTModuleConfig = {
    loginURL: ""/* relativeURL: LOGIN_RELATIVE_URL */,
    loginComponentRoute: LOGIN_ROUTE,
    homeComponentRoute: HOME_ROUTE,
    localhostPort: LOCALHOST_PORT,
    applicazione: "baborg",
    logoutRedirectRoute: BABORG_ROUTE,
    sessionExpireSeconds: 1800, // 0 = distattivato
    pingInterval: 900 // 0 disattivato
};
