# BM CRM — Despliegue en Azure

Proyecto: React (Vite) + Azure Functions (Node.js) + Azure SQL Database,
con login restringido a tu tenant de Microsoft 365 vía Entra ID.

Estructura:
```
app/     -> frontend React
api/     -> Azure Functions (API)
sql/     -> schema.sql
staticwebapp.config.json
```

## 0. Requisitos previos

```bash
az login
az account set --subscription "<TU_SUSCRIPCION>"

# Instalar la CLI de Static Web Apps si no la tenés
npm install -g @azure/static-web-apps-cli
```

## 1. Variables (ajustá a tu gusto)

```bash
RG="rg-bm-crm"
LOCATION="eastus2"          # SWA solo está disponible en algunas regiones
SQL_SERVER="bm-crm-sql-$RANDOM"
SQL_DB="bmcrm"
SQL_ADMIN="bmcrmadmin"
SQL_PASSWORD="<ELEGÍ_UNA_CONTRASEÑA_FUERTE>"
SWA_NAME="bm-crm"
```

## 2. Resource group

```bash
az group create --name $RG --location $LOCATION
```

## 3. Azure SQL (tier serverless, económico)

```bash
az sql server create \
  --name $SQL_SERVER --resource-group $RG --location $LOCATION \
  --admin-user $SQL_ADMIN --admin-password $SQL_PASSWORD

az sql db create \
  --resource-group $RG --server $SQL_SERVER --name $SQL_DB \
  --edition GeneralPurpose --family Gen5 --capacity 1 \
  --compute-model Serverless --auto-pause-delay 60

# Permitir que los servicios de Azure (Functions) accedan a la base
az sql server firewall-rule create \
  --resource-group $RG --server $SQL_SERVER \
  --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Cargá el schema (podés usar el portal → Query Editor, o `sqlcmd` si lo tenés instalado):

```bash
sqlcmd -S $SQL_SERVER.database.windows.net -d $SQL_DB -U $SQL_ADMIN -P "$SQL_PASSWORD" -i sql/schema.sql
```

## 4. Registrar la app en Entra ID (para el login de tu equipo)

```bash
az ad app create \
  --display-name "BM CRM" \
  --web-redirect-uris "https://<TU_SWA_URL>/.auth/login/aad/callback"
```

Guardá el `appId` (Client ID) que devuelve. Después, en **Certificates & secrets** del
registro (portal de Entra ID), generá un client secret y guardalo.
La URL de tu SWA la sabés recién después del paso 5 — podés crear el registro
ahora con una URL provisoria y editarla después en el portal.

Reemplazá en `staticwebapp.config.json`:
- `<TENANT_ID>` por tu Tenant ID (Entra ID → Overview).

## 5. Crear el Static Web App

```bash
az staticwebapp create \
  --name $SWA_NAME --resource-group $RG --location $LOCATION \
  --sku Standard
```

El plan **Standard** es necesario para usar autenticación con un registro
custom de Entra ID (el plan Free solo permite login "genérico" sin restringir tenant).

## 6. Configurar variables de entorno de la Function App

```bash
az staticwebapp appsettings set \
  --name $SWA_NAME --resource-group $RG \
  --setting-names \
    AZURE_SQL_CONNECTION_STRING="Server=tcp:$SQL_SERVER.database.windows.net,1433;Database=$SQL_DB;User Id=$SQL_ADMIN;Password=$SQL_PASSWORD;Encrypt=true;" \
    AAD_CLIENT_ID="<CLIENT_ID_DEL_PASO_4>" \
    AAD_CLIENT_SECRET="<CLIENT_SECRET_DEL_PASO_4>"
```

## 7. Deploy

Desde la raíz del proyecto:

```bash
swa deploy ./app --api-location ./api --deployment-token $(az staticwebapp secrets list --name $SWA_NAME --resource-group $RG --query "properties.apiKey" -o tsv)
```

Esto compila el frontend y publica frontend + API juntos.

## 8. Probar

```bash
az staticwebapp show --name $SWA_NAME --resource-group $RG --query "defaultHostname" -o tsv
```

Abrí esa URL — te va a pedir login con tu cuenta de Microsoft 365. Solo entran
usuarios de tu tenant (según el `openIdIssuer` configurado con tu Tenant ID).

## Desarrollo local

```bash
cd app && npm install
cd ../api && npm install
cd .. && swa start ./app --api-location ./api
```

Necesitás `AZURE_SQL_CONNECTION_STRING` en `api/local.settings.json` apuntando
a tu base (podés usar la misma de Azure, o una instancia local de SQL Server/Docker).

## Notas

- **Costos aproximados** (uso liviano de un equipo chico): Static Web Apps Standard
  ~US$9/mes, SQL Serverless con auto-pause puede quedar en unos pocos dólares/mes
  si no hay actividad constante.
- Si más adelante necesitás roles distintos (ej. vendedor vs. administración),
  se agregan en `staticwebapp.config.json` con `rolesSource` apuntando a una
  Function que resuelva el rol según el usuario.
- El firewall de SQL en el paso 3 permite acceso desde servicios de Azure en general;
  si querés restringirlo más (ej. solo a las IPs salientes de tu Function App),
  se puede afinar con Private Endpoints — avisame si querés esa vuelta de tuerca.
