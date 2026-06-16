/**
 * Service d'automatisations — DELIKREOL
 *
 * Système de règles d'automatisation pour la gestion des commandes,
 * l'affectation des livreurs et les rappels. Toutes les fonctions
 * sont en mode démo/fallback — aucun appel API externe.
 *
 * @module automationService
 */

import { notifyOrderConfirmed, notifyOrderPreparing } from './notificationService';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/** Définit les types de déclencheurs disponibles */
export type AutomationTrigger =
  | 'order:confirmed'
  | 'order:preparing'
  | 'order:ready'
  | 'order:delivered'
  | 'schedule:every_30min'
  | 'schedule:hourly'
  | 'schedule:daily';

/** Définit les types d'actions disponibles */
export type AutomationAction =
  | 'notify:client'
  | 'assign:driver'
  | 'remind:delivery'
  | 'update:status';

/**
 * Règle d'automatisation
 */
export interface AutomationRule {
  /** Identifiant unique de la règle */
  id: string;
  /** Nom human-readable */
  name: string;
  /** Événement ou planification qui déclenche la règle */
  trigger: AutomationTrigger;
  /** Action à exécuter lorsque la règle est déclenchée */
  action: AutomationAction;
  /** Indique si la règle est active */
  enabled: boolean;
}

/** Résultat d'exécution d'une tâche d'automatisation */
export interface AutomationResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Règles internes
// ──────────────────────────────────────────────

/** Règles d'automatisation prédéfinies (démo) */
const _defaultRules: AutomationRule[] = [
  {
    id: 'rule-order-confirm',
    name: 'Confirmation de commande',
    trigger: 'order:confirmed',
    action: 'notify:client',
    enabled: true,
  },
  {
    id: 'rule-order-ready',
    name: 'Notification commande prête',
    trigger: 'order:ready',
    action: 'notify:client',
    enabled: true,
  },
  {
    id: 'rule-auto-assign',
    name: 'Affectation automatique livreur',
    trigger: 'order:confirmed',
    action: 'assign:driver',
    enabled: true,
  },
  {
    id: 'rule-delivery-reminder',
    name: 'Rappel livraison (30 min)',
    trigger: 'schedule:every_30min',
    action: 'remind:delivery',
    enabled: false,
  },
];

/** Stockage interne des règles (mutable pour démo) */
let _rules: AutomationRule[] = [..._defaultRules];

// ──────────────────────────────────────────────
// Fonctions principales
// ──────────────────────────────────────────────

/**
 * Vérifie les commandes en attente et exécute les automatisations
 * applicables. Mode démo : simule la vérification sans appel externe.
 *
 * @returns AutomationResult avec le nombre de commandes traitées
 */
export function checkPendingOrders(): AutomationResult {
  const enabledRules = _rules.filter((r) => r.enabled);
  const triggered = enabledRules.filter(
    (r) => r.trigger === 'schedule:every_30min' || r.trigger === 'order:confirmed',
  );

  console.log(
    `[automationService] Vérification de ${
      enabledRules.length
    } règle(s) active(s) — ${triggered.length} règle(s) déclenchée(s)`,
  );

  return {
    success: true,
    message: `Vérification terminée : ${triggered.length} automatisation(s) exécutée(s)`,
    details: {
      rulesActive: enabledRules.length,
      rulesTriggered: triggered.length,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Envoie une confirmation de commande au client.
 * Mode démo : utilise le service de notification simulé.
 *
 * @param orderId - Identifiant de la commande
 * @returns AutomationResult
 */
export function sendOrderConfirmation(orderId: string): AutomationResult {
  console.log(`[automationService] Envoi confirmation pour commande ${orderId}`);

  const notification = notifyOrderConfirmed(orderId);

  return {
    success: notification.success,
    message: `Confirmation envoyée pour la commande ${orderId}`,
    details: {
      orderId,
      waLink: notification.waLink,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Envoie un rappel de livraison au client.
 * Mode démo : utilise le service de notification simulé.
 *
 * @param orderId - Identifiant de la commande
 * @returns AutomationResult
 */
export function sendDeliveryReminder(orderId: string): AutomationResult {
  console.log(`[automationService] Rappel livraison pour commande ${orderId}`);

  const notification = notifyOrderPreparing(orderId);

  return {
    success: notification.success,
    message: `Rappel de livraison envoyé pour la commande ${orderId}`,
    details: {
      orderId,
      waLink: notification.waLink,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Affecte automatiquement un livreur à une commande dans une zone donnée.
 * Mode démo : simule l'affectation sans logique réelle.
 *
 * @param orderId - Identifiant de la commande
 * @param zone - Zone de livraison (ex. 'centre-ville', 'nord', 'sud')
 * @returns AutomationResult
 */
export function autoAssignDriver(orderId: string, zone: string): AutomationResult {
  console.log(
    `[automationService] Affectation automatique — commande ${orderId}, zone ${zone}`,
  );

  const driverId = _generateDriverId();

  return {
    success: true,
    message: `Livreur ${driverId} affecté à la commande ${orderId} (zone : ${zone})`,
    details: {
      orderId,
      zone,
      driverId,
      assignedAt: new Date().toISOString(),
    },
  };
}

// ──────────────────────────────────────────────
// Gestion des règles
// ──────────────────────────────────────────────

/**
 * Retourne la liste des règles d'automatisation (démo)
 * @returns Tableau de AutomationRule
 */
export function getRules(): AutomationRule[] {
  return [..._rules];
}

/**
 * Active ou désactive une règle par son identifiant
 * @param ruleId - Identifiant de la règle
 * @param enabled - Nouvel état
 * @returns boolean indiquant si la mise à jour a réussi
 */
export function setRuleEnabled(ruleId: string, enabled: boolean): boolean {
  const rule = _rules.find((r) => r.id === ruleId);
  if (!rule) {
    console.warn(`[automationService] Règle ${ruleId} introuvable`);
    return false;
  }
  rule.enabled = enabled;
  console.log(
    `[automationService] Règle ${ruleId} ${enabled ? 'activée' : 'désactivée'}`,
  );
  return true;
}

/**
 * Ajoute une règle d'automatisation personnalisée
 * @param rule - Règle à ajouter (sans id)
 * @returns La règle créée avec son identifiant
 */
export function addRule(
  rule: Omit<AutomationRule, 'id'>,
): AutomationRule {
  const newRule: AutomationRule = {
    ...rule,
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  _rules.push(newRule);
  console.log(`[automationService] Règle ajoutée : ${newRule.name} (${newRule.id})`);
  return newRule;
}

/**
 * Supprime une règle d'automatisation
 * @param ruleId - Identifiant de la règle à supprimer
 * @returns boolean indiquant si la suppression a réussi
 */
export function removeRule(ruleId: string): boolean {
  const index = _rules.findIndex((r) => r.id === ruleId);
  if (index === -1) {
    console.warn(`[automationService] Règle ${ruleId} introuvable`);
    return false;
  }
  _rules.splice(index, 1);
  console.log(`[automationService] Règle ${ruleId} supprimée`);
  return true;
}

/**
 * Réinitialise les règles aux valeurs par défaut
 */
export function resetRules(): void {
  _rules = [..._defaultRules];
  console.log('[automationService] Règles réinitialisées');
}

// ──────────────────────────────────────────────
// Helpers internes
// ──────────────────────────────────────────────

/**
 * Génère un identifiant livreur simulé
 * @returns Identifiant livreur formaté
 */
function _generateDriverId(): string {
  const drivers = ['DRV-001', 'DRV-002', 'DRV-003', 'DRV-004', 'DRV-005'];
  return drivers[Math.floor(Math.random() * drivers.length)];
}