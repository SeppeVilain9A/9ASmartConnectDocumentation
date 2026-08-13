<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Authentication & secrets

### OAuth token acquisition & caching

`NANOAuthToken` acquires tokens according to the connector's authentication type (Azure, OAuth, Audience). When *Use token cache* is on, tokens are cached globally (via `NANOAuthTokenCache`) until shortly before expiry (a five-second safety buffer), avoiding a token request on every call.

### Three ways to store secrets

#### Plain text

Default. Acceptable only for non-production / early project setup.

#### Field encryption

When *Encrypt credentials* is on, `NANConnecterEncryptCredentials` encrypts connection strings, secrets and passwords at rest.

#### Azure Key Vault

When *Use Key Vault* is on, fields reference secrets fetched from Key Vault at runtime. Recommended for production.

### Credential encryption

When `NANParameterTable.EncryptCredentials` is switched on, the three sensitive fields on every connector — `ConnectionString`, `ClientSecret` and `Password` — are encrypted at rest using the platform's `Global::editEncryptedStringField()`. The class `NANConnecterEncryptCredentials` performs the work:

| Method | Action |
| --- | --- |
| `encryptAllCredentials()` / `decryptAllCredentials()` | Batch-encrypt or decrypt every connector (with a confirmation prompt). |
| `encryptRecord()` / `decryptRecord()` | Encrypt/decrypt a single connector's three secret fields. |

Toggling the parameter automatically encrypts (No → Yes) or decrypts (Yes → No) all existing connectors, so you can import connectors in plain text and encrypt them in one action once configured.

### Azure Key Vault

When `NANParameterTable.UseKeyvault` is on, the connector's credential fields no longer hold the secret *value* — they hold the *name* of a Key Vault secret. At runtime `getConnectionString()`, `getClientSecret()` and `getPassword()` resolve the real value through `KeyVaultCertificateHelper::getManualSecretValue()` against the standard `KeyVaultCertificateTable`. The form lookups `lookupKeyvaultSecret()` and `lookupKeyvaultCertificate()` let you pick a secret or certificate from the vault.

> **Warning: Encryption and Key Vault are mutually exclusive**
>
> Use *either* field encryption *or* Key Vault — not both. Key Vault is the recommended production approach; enable it as soon as the vault is available and move the secret *names* onto the connectors.

### Certificates

Certificates are stored in `NANConnecterCertificateTable` with a purpose of *Signing*, *Encryption* (AS2) or *Authentication* (SFTP). The SFTP connector re-reads the certificate stream before each operation because the stream is consumed during I/O.
