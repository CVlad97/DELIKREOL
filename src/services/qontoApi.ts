/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Qonto API — Service backend pour l'intégration Qonto.
 *
 * Ce module fournit les types et fonctions d'appel à l'API REST Qonto v2.
 * Il est destiné exclusivement à un usage backend (Edge Functions Supabase,
 * API server Node.js). Ne JAMAIS importer ce fichier depuis un composant React.
 *
 * @module qontoApi
 */

// ---------------------------------------------------------------------------
// Types : Interfaces des objets Qonto
// ---------------------------------------------------------------------------

/**
 * Organisation Qonto — représente le compte organisation (entreprise).
 */
export interface QontoOrganization {
  /** Identifiant unique de l'organisation */
  id: string;
  /** Nom légal de l'entreprise */
  name: string;
  /** Email de contact principal */
  contact_email: string;
  /** Numéro de téléphone */
  phone: string | null;
  /** Adresse postale */
  address: string | null;
  /** Slug identifiant l'organisation dans l'API */
  slug: string;
  /** Devise par défaut (ex: "EUR") */
  default_currency: string;
  /** Date de création (ISO 8601) */
  created_at: string;
  /** Statut de l'organisation ("active" | "suspended" | "closed") */
  status: string;
  /** Identifiant du plan d'abonnement */
  plan: string;
  /** Nombre de comptes bancaires autorisés */
  bank_accounts_quota: number;
  /** Nombre de cartes autorisées */
  cards_quota: number;
  /** Nombre de transactions mensuelles autorisées */
  monthly_transactions_quota: number;
  /** Version du contrat */
  contract_version: string | null;
}

/**
 * Compte bancaire Qonto.
 */
export interface QontoBankAccount {
  /** Identifiant du compte bancaire */
  id: string;
  /** Identifiant de l'organisation propriétaire */
  organization_id: string;
  /** Nom du compte (ex: "Compte courant") */
  name: string;
  /** IBAN du compte */
  iban: string;
  /** BIC / SWIFT */
  bic: string;
  /** Devise du compte */
  currency: string;
  /** Solde actuel en centimes */
  balance_cents: number;
  /** Solde autorisé (découvert) en centimes */
  authorized_balance_cents: number | null;
  /** Date d'ouverture */
  opened_at: string;
  /** Statut du compte ("active" | "closed") */
  status: string;
  /** Type de compte ("checking" | "savings" | "external") */
  type: string;
  /** Étiquettes personnalisées */
  labels: string[];
}

/**
 * Catégorie de transaction Qonto.
 */
export interface QontoTransactionCategory {
  /** Identifiant de la catégorie (ex: "106") */
  id: string;
  /** Nom de la catégorie (ex: "Frais bancaires") */
  name: string;
  /** Catégorie parente (null si racine) */
  parent_id: string | null;
  /** Slug unique */
  slug: string;
  /** Type de transaction associé ("debit" | "credit" | "both") */
  side: string;
}

/**
 * Transaction bancaire Qonto.
 */
export interface QontoTransaction {
  /** Identifiant unique de la transaction */
  id: string;
  /** Identifiant du compte bancaire */
  bank_account_id: string;
  /** Identifiant de l'organisation */
  organization_id: string;
  /** Statut de la transaction ("pending" | "completed" | "declined") */
  status: string;
  /** Montant en centimes (positif = crédit, négatif = débit) */
  amount_cents: number;
  /** Devise de la transaction */
  currency: string;
  /** Date de la transaction (ISO 8601) */
  settled_at: string;
  /** Date d'enregistrement (ISO 8601) */
  emitted_at: string;
  /** Libellé brut de la transaction */
  label: string;
  /** Référence unique interne */
  reference: string;
  /** Note libre associée */
  note: string | null;
  /** Catégorie de la transaction */
  category: QontoTransactionCategory | null;
  /** Identifiant du virement groupé (si applicable) */
  transfer_id: string | null;
  /** Identifiant de la carte bancaire (si paiement par carte) */
  card_id: string | null;
  /** Solde du compte après la transaction en centimes */
  balance_cents: number | null;
  /** TVA associée — montant en centimes */
  vat_amount_cents: number | null;
  /** Taux de TVA en pourcentage (ex: 20.0) */
  vat_rate: number | null;
  /** Informations sur l'initiateur */
  initiated_by: string | null;
  /** Montant en devise d'origine (pour transactions étrangères) */
  original_amount_cents: number | null;
  /** Devise d'origine */
  original_currency: string | null;
  /** Taux de change appliqué */
  exchange_rate: number | null;
  /** Indique si la transaction est réconciliée */
  is_reconciled: boolean;
  /** Indique si une pièce jointe est attachée */
  has_attachments: boolean;
  /** Métadonnées additionnelles */
  metadata: Record<string, unknown> | null;
}

/**
 * Client Qonto (tiers) — une entité avec laquelle l'organisation a des transactions.
 */
export interface QontoClient {
  /** Identifiant unique du client / tiers */
  id: string;
  /** Identifiant de l'organisation */
  organization_id: string;
  /** Nom complet (entreprise ou particulier) */
  name: string;
  /** Email de contact */
  email: string | null;
  /** Numéro de téléphone */
  phone: string | null;
  /** Adresse postale */
  address: string | null;
  /** Identifiant fiscal (SIRET, TVA intracommunautaire) */
  tax_id: string | null;
  /** Type de client ("individual" | "company" | "association") */
  client_type: string;
  /** Étiquettes associées */
  labels: string[];
  /** Date de création */
  created_at: string;
  /** Date de dernière mise à jour */
  updated_at: string;
}

/**
 * Pièce jointe associée à une transaction Qonto.
 */
export interface QontoAttachment {
  /** Identifiant unique de la pièce jointe */
  id: string;
  /** Identifiant de la transaction associée */
  transaction_id: string;
  /** Nom original du fichier */
  filename: string;
  /** Type MIME du fichier */
  content_type: string;
  /** Taille du fichier en octets */
  byte_size: number;
  /** URL de téléchargement temporaire (signée) */
  url: string;
  /** Date d'upload */
  created_at: string;
  /** Date d'expiration de l'URL signée */
  expires_at: string;
  /** Type de document ("invoice" | "receipt" | "contract" | "other") */
  document_type: string;
}

// ---------------------------------------------------------------------------
// Paramètres d'appel
// ---------------------------------------------------------------------------

/**
 * Filtres disponibles pour la liste des transactions.
 */
export interface QontoListTransactionsParams {
  /** Identifiant du compte bancaire à filtrer */
  bank_account_id?: string;
  /** Statut des transactions ("pending" | "completed" | "declined") */
  status?: string;
  /** Identifiant de la catégorie */
  category?: string;
  /** Période au format "YYYY-MM-DD:YYYY-MM-DD" */
  period?: string;
  /** Pagination : numéro de page */
  page?: number;
  /** Pagination : nombre d'éléments par page (max 100) */
  per_page?: number;
}

/**
 * Paramètres de création d'un client / tiers Qonto.
 */
export interface QontoCreateClientParams {
  /** Nom complet (obligatoire) */
  name: string;
  /** Email de contact */
  email?: string;
  /** Numéro de téléphone */
  phone?: string;
  /** Adresse postale */
  address?: string;
  /** Identifiant fiscal */
  tax_id?: string;
  /** Type de client ("individual" | "company" | "association") */
  client_type?: string;
  /** Étiquettes */
  labels?: string[];
}

/**
 * Réponse paginée de l'API Qonto.
 */
export interface QontoPaginatedResponse<T> {
  /** Éléments de la page courante */
  items: T[];
  /** Métadonnées de pagination */
  meta: {
    /** Numéro de la page courante */
    current_page: number;
    /** Nombre total de pages */
    total_pages: number;
    /** Nombre total d'éléments */
    total_count: number;
    /** Nombre d'éléments par page */
    per_page: number;
  };
}

/**
 * Réponse générique de l'API Qonto (encapsule data + error).
 */
export interface QontoApiResponse<T> {
  /** Données renvoyées par l'API (undefined si erreur) */
  data: T | null;
  /** Erreur éventuelle (null si succès) */
  error: QontoApiError | null;
}

/**
 * Structure d'erreur de l'API Qonto.
 */
export interface QontoApiError {
  /** Code HTTP de l'erreur */
  status: number;
  /** Message d'erreur */
  message: string;
  /** Code d'erreur interne Qonto (si disponible) */
  code?: string;
  /** Détails supplémentaires */
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Cache interne pour le token OAuth
// ---------------------------------------------------------------------------

/** Token OAuth mis en cache avec son expiration (privé — jamais exporté). */
interface QontoAuthToken {
  access_token: string;
  token_type: string;
  expires_at: number; // timestamp ms
}

let _authToken: QontoAuthToken | null = null;
let _tokenRefreshPromise: Promise<QontoAuthToken> | null = null;

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

/**
 * Lit et valide les variables d'environnement Qonto.
 *
 * @returns Un objet contenant baseUrl, clientId, clientSecret.
 * @throws Si une variable d'environnement requise est absente.
 */
function _getEnv(): { baseUrl: string; clientId: string; clientSecret: string } {
  const baseUrl = process.env.QONTO_API_BASE_URL;
  const clientId = process.env.QONTO_CLIENT_ID;
  const clientSecret = process.env.QONTO_CLIENT_SECRET;

  if (!baseUrl) {
    throw new Error(
      '[qontoApi] QONTO_API_BASE_URL is not set. ' +
        'Set it in your environment variables.'
    );
  }
  if (!clientId) {
    throw new Error(
      '[qontoApi] QONTO_CLIENT_ID is not set. ' +
        'Set it in your environment variables.'
    );
  }
  if (!clientSecret) {
    throw new Error(
      '[qontoApi] QONTO_CLIENT_SECRET is not set. ' +
        'Set it in your environment variables.'
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''), // nettoie le trailing slash
    clientId,
    clientSecret,
  };
}

/**
 * Acquiert un token OAuth via le flow client_credentials.
 * Le token est mis en cache et refresh automatiquement à expiration.
 *
 * @returns Le token d'accès OAuth.
 */
async function _acquireToken(): Promise<string> {
  const now = Date.now();

  // Si un token valide existe en cache, le réutiliser
  if (_authToken && _authToken.expires_at > now + 60_000) {
    // 60s de marge de sécurité
    return _authToken.access_token;
  }

  // Éviter les requêtes concurrentes pour le refresh token
  if (_tokenRefreshPromise) {
    return (await _tokenRefreshPromise).access_token;
  }

  const env = _getEnv();

  _tokenRefreshPromise = (async (): Promise<QontoAuthToken> => {
    const response = await fetch(`${env.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: env.clientId,
        client_secret: env.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(
        `[qontoApi] OAuth token request failed: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(
        `Qonto OAuth failed: ${response.status} — ${response.statusText}`
      );
    }

    const result = await response.json();

    const token: QontoAuthToken = {
      access_token: result.access_token,
      token_type: result.token_type ?? 'Bearer',
      expires_at: now + (result.expires_in ?? 3600) * 1000,
    };

    _authToken = token;
    return token;
  })();

  try {
    return (await _tokenRefreshPromise).access_token;
  } finally {
    _tokenRefreshPromise = null;
  }
}

/**
 * Invalide le token OAuth en cache (appelé après un 401).
 */
function _invalidateToken(): void {
  _authToken = null;
}

// ---------------------------------------------------------------------------
// Rate limiting simple (token bucket)
// ---------------------------------------------------------------------------

interface RateLimiterState {
  tokens: number;
  lastRefill: number;
}

const _rateLimiters = new Map<string, RateLimiterState>();

/**
 * Implémente un rate limiter token bucket simple.
 * Limite à `maxTokens` requêtes par fenêtre de `windowMs` millisecondes.
 *
 * @param key Identifiant du seau (ex: "qonto_api").
 * @param maxTokens Nombre maximum de requêtes autorisées.
 * @param windowMs Fenêtre de temps en ms.
 * @returns `true` si la requête est autorisée, `false` sinon.
 */
function _checkRateLimit(
  key: string,
  maxTokens: number = 10,
  windowMs: number = 1_000
): boolean {
  const now = Date.now();
  let state = _rateLimiters.get(key);

  if (!state) {
    state = { tokens: maxTokens, lastRefill: now };
    _rateLimiters.set(key, state);
  }

  // Refill tokens
  const elapsed = now - state.lastRefill;
  const tokensToAdd = Math.floor((elapsed / windowMs) * maxTokens);
  if (tokensToAdd > 0) {
    state.tokens = Math.min(maxTokens, state.tokens + tokensToAdd);
    state.lastRefill = now;
  }

  if (state.tokens <= 0) {
    return false; // rate limit exceeded
  }

  state.tokens -= 1;
  return true;
}

/**
 * Pause asynchrone (utilisée lors du rate limiting).
 *
 * @param ms Nombre de millisecondes à attendre.
 */
function _sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Requête de base
// ---------------------------------------------------------------------------

/**
 * Effectue une requête vers l'API REST Qonto v2.
 *
 * Gère automatiquement :
 * - L'authentification OAuth client_credentials
 * - Le refresh du token en cas de 401
 * - Le rate limiting (token bucket, 10 req/s)
 * - Les erreurs HTTP (logging + parsing)
 * - Les timeouts (15 secondes par défaut)
 *
 * @param method Méthode HTTP ("GET" | "POST" | "PUT" | "PATCH" | "DELETE").
 * @param path Chemin relatif de l'API (ex: "/v2/organizations/current").
 * @param body Corps de la requête pour POST/PUT/PATCH (optionnel).
 * @param retries Nombre de tentatives restantes en cas d'erreur 429/5xx (défaut: 2).
 * @returns Un objet { data, error } avec les données typées ou l'erreur.
 *
 * @example
 * ```ts
 * const { data, error } = await _qontoRequest<QontoOrganization>(
 *   'GET',
 *   '/v2/organizations/current'
 * );
 * ```
 */
async function _qontoRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  retries: number = 2
): Promise<QontoApiResponse<T>> {
  const env = _getEnv();
  const url = `${env.baseUrl}${path}`;

  // Rate limiting — attendre si on dépasse le quota
  if (!_checkRateLimit('qonto_api', 10, 1_000)) {
    console.warn('[qontoApi] Rate limit reached, waiting 500ms...');
    await _sleep(500);
    // Réessayer une fois après l'attente
    if (!_checkRateLimit('qonto_api', 10, 1_000)) {
      return {
        data: null,
        error: {
          status: 429,
          message: 'Rate limit exceeded. Please try again later.',
          code: 'rate_limit_exceeded',
        },
      };
    }
  }

  try {
    const token = await _acquireToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 — Token expiré, on refresh et on réessaie une fois
    if (response.status === 401) {
      console.warn('[qontoApi] Received 401 — refreshing token...');
      _invalidateToken();
      // Une seule tentative de refresh, pas de récursion infinie
      const newToken = await _acquireToken();
      const retryResponse = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: 'application/json',
          ...(body && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        const errorBody = await retryResponse.text().catch(() => '');
        console.error(
          `[qontoApi] Request failed after token refresh: ${retryResponse.status} ${retryResponse.statusText}`,
          errorBody
        );
        return {
          data: null,
          error: {
            status: retryResponse.status,
            message: `Request failed: ${retryResponse.statusText}`,
            details: { body: errorBody },
          },
        };
      }

      const retryData = await retryResponse.json();
      return { data: retryData as T, error: null };
    }

    // 429 — Rate limit, attendre et réessayer
    if (response.status === 429 && retries > 0) {
      const retryAfter = parseInt(
        response.headers.get('Retry-After') ?? '1',
        10
      );
      const waitMs = Math.min(retryAfter * 1000, 10_000);
      console.warn(
        `[qontoApi] Rate limited (429), waiting ${waitMs}ms before retry (${retries} retries left)...`
      );
      await _sleep(waitMs);
      return _qontoRequest<T>(method, path, body, retries - 1);
    }

    // 5xx — Erreur serveur, réessayer
    if (response.status >= 500 && retries > 0) {
      console.warn(
        `[qontoApi] Server error ${response.status}, retrying (${retries} retries left)...`
      );
      await _sleep(1_000);
      return _qontoRequest<T>(method, path, body, retries - 1);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(
        `[qontoApi] Request failed: ${response.status} ${response.statusText}`,
        { url, method, path, errorBody }
      );
      return {
        data: null,
        error: {
          status: response.status,
          message: `Request failed: ${response.statusText}`,
          details: errorBody ? { body: errorBody } : undefined,
        },
      };
    }

    const data = await response.json();
    return { data: data as T, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error during API request';
    console.error('[qontoApi] Unexpected error:', err);
    return {
      data: null,
      error: {
        status: 0,
        message,
        details: err instanceof Error ? { stack: err.stack } : undefined,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Fonctions d'appel API publiques
// ---------------------------------------------------------------------------

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Récupère les informations de l'organisation Qonto courante.
 *
 * @returns L'organisation Qonto connectée.
 *
 * @example
 * ```ts
 * const { data, error } = await getOrganization();
 * if (data) console.log(data.name);
 * ```
 */
export async function getOrganization(): Promise<
  QontoApiResponse<QontoOrganization>
> {
  return _qontoRequest<QontoOrganization>(
    'GET',
    '/v2/organizations/current'
  );
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Liste l'ensemble des comptes bancaires de l'organisation.
 *
 * @returns La liste des comptes bancaires Qonto.
 *
 * @example
 * ```ts
 * const { data, error } = await listBankAccounts();
 * if (data) data.items.forEach(acc => console.log(acc.iban));
 * ```
 */
export async function listBankAccounts(): Promise<
  QontoApiResponse<QontoPaginatedResponse<QontoBankAccount>>
> {
  return _qontoRequest<QontoPaginatedResponse<QontoBankAccount>>(
    'GET',
    '/v2/bank_accounts'
  );
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Liste les transactions bancaires avec filtres optionnels.
 *
 * @param params - Filtres de la requête :
 *   - `bank_account_id` : filtre par compte bancaire
 *   - `status` : statut ("pending" | "completed" | "declined")
 *   - `category` : identifiant de catégorie
 *   - `period` : période "YYYY-MM-DD:YYYY-MM-DD"
 *   - `page`, `per_page` : pagination
 * @returns La liste paginée des transactions.
 *
 * @example
 * ```ts
 * const { data, error } = await listTransactions({
 *   bank_account_id: '123',
 *   status: 'completed',
 *   period: '2024-01-01:2024-12-31',
 * });
 * ```
 */
export async function listTransactions(
  params?: QontoListTransactionsParams
): Promise<QontoApiResponse<QontoPaginatedResponse<QontoTransaction>>> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.bank_account_id) searchParams.set('bank_account_id', params.bank_account_id);
    if (params.status) searchParams.set('status', params.status);
    if (params.category) searchParams.set('category', params.category);
    if (params.period) searchParams.set('period', params.period);
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.per_page !== undefined) searchParams.set('per_page', String(params.per_page));
  }

  const queryString = searchParams.toString();
  const path = `/v2/transactions${queryString ? `?${queryString}` : ''}`;

  return _qontoRequest<QontoPaginatedResponse<QontoTransaction>>('GET', path);
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Récupère une transaction par son identifiant.
 *
 * @param id - Identifiant unique de la transaction.
 * @returns La transaction correspondante.
 *
 * @example
 * ```ts
 * const { data, error } = await getTransaction('txn_abc123');
 * ```
 */
export async function getTransaction(
  id: string
): Promise<QontoApiResponse<QontoTransaction>> {
  return _qontoRequest<QontoTransaction>('GET', `/v2/transactions/${encodeURIComponent(id)}`);
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Liste les pièces jointes d'une transaction.
 *
 * @param transactionId - Identifiant de la transaction.
 * @returns La liste des pièces jointes.
 *
 * @example
 * ```ts
 * const { data, error } = await listAttachments('txn_abc123');
 * if (data) data.items.forEach(att => console.log(att.filename));
 * ```
 */
export async function listAttachments(
  transactionId: string
): Promise<
  QontoApiResponse<QontoPaginatedResponse<QontoAttachment>>
> {
  return _qontoRequest<QontoPaginatedResponse<QontoAttachment>>(
    'GET',
    `/v2/transactions/${encodeURIComponent(transactionId)}/attachments`
  );
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Récupère une pièce jointe par son identifiant.
 *
 * @param id - Identifiant unique de la pièce jointe.
 * @returns La pièce jointe avec son URL de téléchargement temporaire.
 *
 * @example
 * ```ts
 * const { data, error } = await getAttachment('att_xyz789');
 * if (data) console.log(data.url); // URL signée temporaire
 * ```
 */
export async function getAttachment(
  id: string
): Promise<QontoApiResponse<QontoAttachment>> {
  return _qontoRequest<QontoAttachment>(
    'GET',
    `/v2/attachments/${encodeURIComponent(id)}`
  );
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Crée un nouveau client / tiers dans Qonto.
 *
 * @param data - Données du client à créer.
 * @returns Le client créé.
 *
 * @example
 * ```ts
 * const { data, error } = await createClient({
 *   name: 'SARL Martinique Saveurs',
 *   email: 'contact@martinique-saveurs.fr',
 *   client_type: 'company',
 *   tax_id: '12345678901234',
 * });
 * ```
 */
export async function createClient(
  data: QontoCreateClientParams
): Promise<QontoApiResponse<QontoClient>> {
  return _qontoRequest<QontoClient>('POST', '/v2/clients', data as unknown as Record<string, unknown>);
}

/* ⚠️ BACKEND ONLY — never import in React components */

/**
 * Liste tous les clients / tiers de l'organisation.
 *
 * @returns La liste paginée des clients Qonto.
 *
 * @example
 * ```ts
 * const { data, error } = await listClients();
 * if (data) data.items.forEach(client => console.log(client.name));
 * ```
 */
export async function listClients(): Promise<
  QontoApiResponse<QontoPaginatedResponse<QontoClient>>
> {
  return _qontoRequest<QontoPaginatedResponse<QontoClient>>(
    'GET',
    '/v2/clients'
  );
}
