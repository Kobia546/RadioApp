// ============================================================================
// SYSTÈME DE CHIFFREMENT POUR QR CODES - Radio Bonne Nouvelle
// ============================================================================

import CryptoJS from 'crypto-js';

// ============================================================================
// CONFIGURATION DE SÉCURITÉ
// ============================================================================

const ENCRYPTION_CONFIG = {
  // Clé secrète de l'application (à garder confidentielle)
  SECRET_KEY: 'RBN_2024_SECURE_KEY_BENIDEDIEU_MINISTRIES_MC2G',
  
  // Préfixe pour identifier les QR codes de l'app
  APP_PREFIX: 'RBN_ENCRYPTED_',
  
  // Version pour la compatibilité future
  VERSION: 'v1.0',
  
  // Algorithme de chiffrement
  ALGORITHM: 'AES'
};

// ============================================================================
// FONCTIONS DE CHIFFREMENT
// ============================================================================

/**
 * Chiffre les données pour un QR code
 * @param {Object} data - Les données à chiffrer
 * @returns {string} - Données chiffrées pour le QR code
 */
export const encryptQRData = (data) => {
  try {
    // 1. Préparer les données avec métadonnées
    const payload = {
      version: ENCRYPTION_CONFIG.VERSION,
      timestamp: Date.now(),
      data: data
    };

    // 2. Convertir en JSON
    const jsonString = JSON.stringify(payload);

    // 3. Chiffrer avec AES
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_CONFIG.SECRET_KEY).toString();

    // 4. Ajouter le préfixe d'identification
    const qrCodeData = `${ENCRYPTION_CONFIG.APP_PREFIX}${encrypted}`;

    console.log('✅ Données chiffrées pour QR code:', {
      original: data,
      encrypted: qrCodeData.substring(0, 50) + '...',
      length: qrCodeData.length
    });

    return qrCodeData;

  } catch (error) {
    console.error('❌ Erreur de chiffrement:', error);
    throw new Error('Impossible de chiffrer les données');
  }
};

/**
 * Déchiffre les données d'un QR code scanné
 * @param {string} encryptedData - Données chiffrées du QR code
 * @returns {Object|null} - Données déchiffrées ou null si invalide
 */
export const decryptQRData = (encryptedData) => {
  try {
    // 1. Vérifier le préfixe d'identification
    if (!encryptedData.startsWith(ENCRYPTION_CONFIG.APP_PREFIX)) {
      console.log('❌ QR code ne provient pas de notre app');
      return null;
    }

    // 2. Extraire les données chiffrées (sans le préfixe)
    const encryptedContent = encryptedData.replace(ENCRYPTION_CONFIG.APP_PREFIX, '');

    // 3. Déchiffrer avec AES
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_CONFIG.SECRET_KEY);
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      console.log('❌ Impossible de déchiffrer le QR code');
      return null;
    }

    // 4. Parser le JSON
    const payload = JSON.parse(decryptedString);

    // 5. Vérifier la version
    if (payload.version !== ENCRYPTION_CONFIG.VERSION) {
      console.log('⚠️ Version du QR code différente:', payload.version);
      // On peut quand même continuer pour la rétrocompatibilité
    }

    // 6. Vérifier l'âge du QR code (optionnel)
    const ageInHours = (Date.now() - payload.timestamp) / (1000 * 60 * 60);
    if (ageInHours > 24 * 30) { // 30 jours
      console.log('⚠️ QR code ancien (généré il y a', Math.round(ageInHours / 24), 'jours)');
    }

    console.log('✅ QR code déchiffré avec succès:', payload.data);
    return payload.data;

  } catch (error) {
    console.error('❌ Erreur de déchiffrement:', error);
    return null;
  }
};

// ============================================================================
// GÉNÉRATEUR DE QR CODES CHIFFRÉS
// ============================================================================

/**
 * Génère les données chiffrées pour chaque section
 * @returns {Object} - QR codes chiffrés pour chaque section
 */
export const generateEncryptedQRCodes = () => {
  const qrCodes = {};

  // QR Code pour l'Église
  const egliseData = {
    section: 'EGLISE',
    name: 'Eglise MC2G Groupe',
    description: 'Dîmes & Offrandes',
    types: ['dimes', 'offrandes', 'voeux', 'engagements', 'action_grace', 'soutien_programme'],
    color: '#cd8033ff'
  };
  qrCodes.EGLISE = encryptQRData(egliseData);

  // QR Code pour le Ministère
  const ministereData = {
    section: 'MINISTERE',
    name: 'FEA BENIDEDIEU Ministries',
    description: 'Soutenir l\'Homme de Dieu',
    types: ['offrandes', 'voeux', 'action_grace'],
    color: '#1976d2'
  };
  qrCodes.MINISTERE = encryptQRData(ministereData);

  // QR Code pour la Radio
  const radioData = {
    section: 'RADIO',
    name: 'Radio Bonne Nouvelle',
    description: 'Soutien Radio',
    types: ['soutien_radio'],
    frequency: '103.6',
    color: '#388e3c'
  };
  qrCodes.RADIO = encryptQRData(radioData);

  return qrCodes;
};

// ============================================================================
// UTILITAIRES DE VALIDATION
// ============================================================================

/**
 * Vérifie si un QR code provient de notre application
 * @param {string} qrData - Données du QR code
 * @returns {boolean} - true si c'est notre QR code
 */
export const isValidAppQRCode = (qrData) => {
  return qrData && qrData.startsWith(ENCRYPTION_CONFIG.APP_PREFIX);
};

/**
 * Génère une signature pour vérifier l'intégrité
 * @param {Object} data - Données à signer
 * @returns {string} - Signature
 */
export const generateSignature = (data) => {
  const dataString = JSON.stringify(data);
  return CryptoJS.HmacSHA256(dataString, ENCRYPTION_CONFIG.SECRET_KEY).toString();
};

/**
 * Vérifie la signature des données
 * @param {Object} data - Données à vérifier
 * @param {string} signature - Signature à vérifier
 * @returns {boolean} - true si valide
 */
export const verifySignature = (data, signature) => {
  const expectedSignature = generateSignature(data);
  return signature === expectedSignature;
};

// ============================================================================
// EXEMPLE D'UTILISATION
// ============================================================================

// Générer tous les QR codes chiffrés
console.log('🔐 Génération des QR codes chiffrés...');
const encryptedQRCodes = generateEncryptedQRCodes();

console.log('\n📱 QR Codes générés:');
Object.entries(encryptedQRCodes).forEach(([section, qrData]) => {
  console.log(`${section}: ${qrData.substring(0, 50)}...`);
});

// Test de déchiffrement
console.log('\n🔍 Test de déchiffrement:');
const testDecrypt = decryptQRData(encryptedQRCodes.EGLISE);
console.log('Données déchiffrées:', testDecrypt);

// Test avec QR code invalide
console.log('\n❌ Test avec QR code invalide:');
const invalidTest = decryptQRData('INVALID_QR_CODE_DATA');
console.log('Résultat:', invalidTest);

// ============================================================================
// EXPORT POUR UTILISATION DANS L'APP
// ============================================================================

export default {
  encryptQRData,
  decryptQRData,
  generateEncryptedQRCodes,
  isValidAppQRCode,
  generateSignature,
  verifySignature,
  ENCRYPTION_CONFIG
};