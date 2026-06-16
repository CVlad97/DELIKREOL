/**
 * Service de notifications — DELIKREOL
 *
 * Simule un système de notifications utilisateur (WhatsApp simulé via wa.me).
 * Toutes les fonctions sont démo/fallback, aucun appel API externe.
 *
 * @module notificationService
 */

/** Format d'une notification dans le système DELIKREOL */
export interface Notification {
  /** Identifiant unique de la notification */
  id: string;
  /** Catégorie : 'order' | 'delivery' | 'promotion' | 'payment' | 'system' */
  type: 'order' | 'delivery' | 'promotion' | 'payment' | 'system';
  /** Titre court */
  title: string;
  /** Corps du message */
  message: string;
  /** Timestamp ISO de création */
  timestamp: string;
  /** Lecture acquittée */
  read: boolean;
}

/** Préférences de notification par catégorie */
export interface NotificationPreferences {
  /** Notification lors de la confirmation de commande */
  orderConfirmation: boolean;
  /** Notification lors des mises à jour de livraison */
  deliveryUpdate: boolean;
  /** Notification promotionnelles */
  promotion: boolean;
  /** Notification liées aux paiements */
  payment: boolean;
}

/** Résultat retourné par les fonctions de notification */
export interface NotificationResult {
  /** Indique si la notification a été envoyée avec succès */
  success: boolean;
  /** Message descriptif */
  message: string;
  /** Lien WhatsApp simulé (wa.me) */
  waLink: string;
}

// ──────────────────────────────────────────────
// Constantes internes
// ──────────────────────────────────────────────

/** Numéro de support utilisé pour les notifications simulées */
const NOTIFICATION_PHONE = '596696653589';

/** Stockage interne des notifications (démo) */
let _notifications: Notification[] = [];

/** Préférences par défaut */
const _defaultPreferences: NotificationPreferences = {
  orderConfirmation: true,
  deliveryUpdate: true,
  promotion: false,
  payment: true,
};

// ──────────────────────────────────────────────
// Helpers internes
// ──────────────────────────────────────────────

/**
 * Génère un identifiant unique simple (démo)
 * @returns Chaîne hexadécimale de 12 caractères
 */
function _generateId(): string {
  return Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
}

/**
 * Crée un lien WhatsApp avec message pré-rempli
 * @param message - Texte à pré-remplir dans WhatsApp
 * @returns URL complète wa.me
 */
function _makeWaLink(message: string): string {
  const clean = NOTIFICATION_PHONE.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Ajoute une notification au stockage local et retourne le résultat
 * @param type - Catégorie de notification
 * @param title - Titre de la notification
 * @param message - Corps du message
 * @returns NotificationResult
 */
function _addNotification(
  type: Notification['type'],
  title: string,
  message: string,
): NotificationResult {
  const notification: Notification = {
    id: _generateId(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  _notifications.unshift(notification);

  const waLink = _makeWaLink(message);

  console.log(`[notificationService] ${type}: ${title}`);

  return {
    success: true,
    message: `Notification envoyée : ${title}`,
    waLink,
  };
}

// ──────────────────────────────────────────────
// Fonctions de notification par événement
// ──────────────────────────────────────────────

/**
 * Notifie le client que sa commande a été confirmée
 * @param orderId - Identifiant de la commande
 * @returns NotificationResult avec lien WhatsApp simulé
 */
export function notifyOrderConfirmed(orderId: string): NotificationResult {
  return _addNotification(
    'order',
    `Commande ${orderId} confirmée`,
    `Votre commande ${orderId} a été confirmée. Nous préparons votre colis. Merci de votre confiance ! 🙏`,
  );
}

/**
 * Notifie le client que sa commande est en cours de préparation
 * @param orderId - Identifiant de la commande
 * @returns NotificationResult avec lien WhatsApp simulé
 */
export function notifyOrderPreparing(orderId: string): NotificationResult {
  return _addNotification(
    'order',
    `Commande ${orderId} en préparation`,
    `Votre commande ${orderId} est en cours de préparation. Nous vous tiendrons informé dès qu'elle sera prête. 🔄`,
  );
}

/**
 * Notifie le client que sa commande est prête
 * @param orderId - Identifiant de la commande
 * @returns NotificationResult avec lien WhatsApp simulé
 */
export function notifyOrderReady(orderId: string): NotificationResult {
  return _addNotification(
    'delivery',
    `Commande ${orderId} prête`,
    `Votre commande ${orderId} est prête ! Un livreur va bientôt la récupérer pour vous la livrer. 🎉`,
  );
}

/**
 * Notifie le client que sa commande a été livrée
 * @param orderId - Identifiant de la commande
 * @returns NotificationResult avec lien WhatsApp simulé
 */
export function notifyOrderDelivered(orderId: string): NotificationResult {
  return _addNotification(
    'delivery',
    `Commande ${orderId} livrée`,
    `Votre commande ${orderId} a été livrée avec succès. Bon appétit ! 🍽️ Merci d'avoir choisi DELIKREOL.`,
  );
}

// ──────────────────────────────────────────────
// Gestion des notifications stockées
// ──────────────────────────────────────────────

/**
 * Retourne la liste des notifications simulées
 * @returns Tableau de Notification trié du plus récent au plus ancien
 */
export function getNotifications(): Notification[] {
  return [..._notifications];
}

/**
 * Marque une notification comme lue
 * @param id - Identifiant de la notification
 */
export function markAsRead(id: string): void {
  const notification = _notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    console.log(`[notificationService] Notification ${id} marquée comme lue`);
  }
}

/**
 * Marque toutes les notifications comme lues
 */
export function markAllAsRead(): void {
  _notifications.forEach((n) => {
    n.read = true;
  });
  console.log('[notificationService] Toutes les notifications marquées comme lues');
}

/**
 * Retourne le compteur de notifications non lues
 * @returns Nombre de notifications non lues
 */
export function getUnreadCount(): number {
  return _notifications.filter((n) => !n.read).length;
}

/**
 * Retourne les préférences de notification par défaut
 * @returns NotificationPreferences
 */
export function getDefaultPreferences(): NotificationPreferences {
  return { ..._defaultPreferences };
}

/**
 * Vide le stockage de notifications (démo / test)
 */
export function clearNotifications(): void {
  _notifications = [];
  console.log('[notificationService] Notifications vidées');
}