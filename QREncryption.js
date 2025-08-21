// ============================================================================
// SCANNER QR AVEC DÉCHIFFREMENT SÉCURISÉ - Radio Bonne Nouvelle
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, Camera } from 'expo-camera';

// Import du système de chiffrement
import { decryptQRData, isValidAppQRCode, validateQRData } from './QREncryption';

const { width, height } = Dimensions.get('window');

// ============================================================================
// COMPOSANT SCANNER QR SÉCURISÉ
// ============================================================================

const SecureQRCodeScreen = ({ onNavigate, onBack }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  /**
   * Traite le résultat du scan QR avec déchiffrement
   */
  const handleQRResult = (scannedText) => {
    console.log('🔍 QR Code brut scanné:', scannedText);
    
    try {
      // Nettoyer le texte scanné
      const cleanText = scannedText.trim();
      
      // Ajouter à l'historique
      setScanHistory(prev => [...prev.slice(-9), {
        text: cleanText.substring(0, 50) + (cleanText.length > 50 ? '...' : ''),
        timestamp: new Date().toLocaleTimeString(),
        isValid: false
      }]);

      // Vérifier si c'est un QR code de notre app
      console.log('🔍 Vérification du préfixe QR...');
      if (!isValidAppQRCode(cleanText)) {
        console.log('❌ QR code non reconnu comme QR code de l\'app');
        
        // Vérifier les anciens codes en clair pour rétrocompatibilité
        const upperText = cleanText.toUpperCase();
        if (['EGLISE', 'MINISTERE', 'RADIO'].includes(upperText)) {
          console.log('🔄 QR code legacy détecté:', upperText);
          handleLegacyQRCode(upperText);
          return;
        }
        
        Alert.alert(
          '❌ QR Code Non Reconnu',
          `Ce QR code ne provient pas de Radio Bonne Nouvelle.\n\nContenu scanné: "${cleanText.substring(0, 100)}${cleanText.length > 100 ? '...' : ''}"\n\nVeuillez scanner un QR code officiel de l'application.`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          }]
        );
        return;
      }

      console.log('✅ QR code reconnu - préfixe valide');

      // Déchiffrer les données
      console.log('🔐 Tentative de déchiffrement...');
      const decryptedData = decryptQRData(cleanText);
      
      if (!decryptedData) {
        console.log('❌ Échec du déchiffrement');
        Alert.alert(
          '❌ QR Code Invalide',
          'Ce QR code semble corrompu ou utilise une version incompatible.\n\nVeuillez générer un nouveau QR code ou contacter le support.',
          [{ 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          }]
        );
        return;
      }

      console.log('✅ Déchiffrement réussi');

      // Valider les données déchiffrées
      if (!validateQRData(decryptedData)) {
        console.log('❌ Données QR invalides après déchiffrement');
        Alert.alert(
          '❌ Données Invalides',
          'Les données du QR code sont invalides ou corrompues.',
          [{ 
            text: 'OK', 
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          }]
        );
        return;
      }

      console.log('✅ Données QR validées');

      // Traiter les données déchiffrées
      handleDecryptedData(decryptedData);
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du QR code:', error);
      Alert.alert(
        '❌ Erreur',
        'Une erreur est survenue lors du traitement du QR code.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setScanned(false);
            setIsProcessing(false);
          }
        }]
      );
    }
  };

  /**
   * Traite les données déchiffrées du QR code
   */
  const handleDecryptedData = (data) => {
    console.log('✅ Données déchiffrées:', data);

    // Mettre à jour l'historique
    setScanHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].isValid = true;
      }
      return updated;
    });

    // Construire le message de confirmation
    let message = `✅ QR Code Authentifié !\n\n`;
    message += `📱 Section: ${data.name}\n`;
    message += `📝 Description: ${data.description}\n`;
    
    if (data.frequency) {
      message += `📻 Fréquence: ${data.frequency} FM\n`;
    }
    
    if (data.types && data.types.length > 0) {
      message += `\n🎯 Types disponibles: ${data.types.length}`;
    }

    Alert.alert(
      '🔐 QR Code Sécurisé Détecté',
      message,
      [{
        text: 'Continuer →',
        onPress: () => {
          setScanned(false);
          setIsProcessing(false);
          
          // Naviguer vers la page de don avec les données déchiffrées
          onNavigate('donation', { 
            section: data.section,
            fromQR: true,
            qrData: data 
          });
        }
      }, {
        text: 'Scanner à nouveau',
        style: 'cancel',
        onPress: () => {
          setScanned(false);
          setIsProcessing(false);
        }
      }]
    );
  };

  /**
   * Gère les anciens QR codes en clair (rétrocompatibilité)
   */
  const handleLegacyQRCode = (section) => {
    console.log('🔄 QR code legacy détecté:', section);
    
    Alert.alert(
      '⚠️ QR Code Ancien Format',
      `QR code "${section}" détecté (ancien format).\n\nCe format fonctionne encore mais nous recommandons d'utiliser les nouveaux QR codes sécurisés.`,
      [{
        text: 'Continuer quand même',
        onPress: () => {
          setScanned(false);
          setIsProcessing(false);
          onNavigate('donation', { section, fromQR: true });
        }
      }, {
        text: 'Annuler',
        style: 'cancel',
        onPress: () => {
          setScanned(false);
          setIsProcessing(false);
        }
      }]
    );
  };

  /**
   * Gestionnaire du scan de code-barres
   */
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    console.log('📱 Barcode scanné - Type:', type, 'Data length:', data.length);
    
    // Délai pour l'animation
    setTimeout(() => {
      handleQRResult(data);
    }, 500);
  };

  /**
   * Remet à zéro le scanner
   */
  const resetScanning = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  /**
   * Efface l'historique des scans
   */
  const clearHistory = () => {
    setScanHistory([]);
  };

  // ============================================================================
  // RENDU DES ÉTATS
  // ============================================================================

  if (hasPermission === null) {
    return (
      <LinearGradient
        colors={['#1a4a1a', '#2e7d32']}
        style={styles.qrContainer}>
        <View style={styles.qrPermissionContainer}>
          <Text style={styles.qrPermissionText}>🔄 Demande d'accès à la caméra...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient
        colors={['#1a4a1a', '#2e7d32']}
        style={styles.qrContainer}>
        <View style={styles.qrHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.qrTitle}>Scanner QR Sécurisé</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.qrPermissionContainer}>
          <Text style={styles.qrPermissionTitle}>📷 Accès Caméra Requis</Text>
          <Text style={styles.qrPermissionText}>
            Pour scanner les QR codes sécurisés, l'application a besoin d'accéder à votre caméra.
          </Text>
          <TouchableOpacity 
            style={styles.qrPermissionButton}
            onPress={getCameraPermissions}>
            <Text style={styles.qrPermissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ============================================================================
  // INTERFACE PRINCIPALE
  // ============================================================================

  return (
    <LinearGradient
      colors={['#1a4a1a', '#2e7d32']}
      style={styles.qrContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header avec indicateur de sécurité */}
      <View style={styles.qrHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.qrTitle}>Scanner QR Sécurisé</Text>
          <View style={styles.securityIndicator}>
            <Text style={styles.securityIcon}>🔐</Text>
            <Text style={styles.securityText}>Chiffrement AES</Text>
          </View>
        </View>
        
        {scanHistory.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.historyButton}>
            <Text style={styles.historyIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Zone de scan avec camera */}
      <View style={styles.qrCameraArea}>
        <CameraView
          style={styles.qrCamera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        {/* Overlay avec cadre de scan sécurisé */}
        <View style={styles.qrOverlay}>
          <View style={styles.qrOverlayTop} />
          <View style={styles.qrOverlayMiddle}>
            <View style={styles.qrOverlaySide} />
            <View style={[styles.qrFrame, isProcessing && styles.qrFrameScanning]}>
              {/* Coins du cadre avec animation */}
              <View style={styles.qrFrameCorner} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerTopRight]} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerBottomLeft]} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerBottomRight]} />
              
              {/* Indicateur de sécurité au centre */}
              {!isProcessing && (
                <View style={styles.securityBadge}>
                  <Text style={styles.securityBadgeIcon}>🔐</Text>
                  <Text style={styles.securityBadgeText}>Sécurisé</Text>
                </View>
              )}
              
              {/* Animation de traitement */}
              {isProcessing && (
                <View style={styles.processingBadge}>
                  <Text style={styles.processingIcon}>⚡</Text>
                  <Text style={styles.processingText}>Déchiffrement...</Text>
                </View>
              )}
            </View>
            <View style={styles.qrOverlaySide} />
          </View>
          <View style={styles.qrOverlayBottom} />
        </View>
      </View>

      {/* Instructions et historique */}
      <View style={styles.qrInstructions}>
        <Text style={styles.qrInstructionTitle}>
          {isProcessing ? '🔐 Déchiffrement sécurisé...' : '📱 Positionnez le QR Code dans le cadre'}
        </Text>
        <Text style={styles.qrInstructionText}>
          Seuls les QR codes officiels de Radio Bonne Nouvelle sont acceptés
        </Text>
        
        {/* Historique des scans */}
        {scanHistory.length > 0 && (
          <View style={styles.scanHistory}>
            <Text style={styles.historyTitle}>📊 Historique ({scanHistory.length})</Text>
            <View style={styles.historyList}>
              {scanHistory.slice(-3).map((scan, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyIcon}>
                    {scan.isValid ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.historyText}>{scan.text}</Text>
                  <Text style={styles.historyTime}>{scan.timestamp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {scanned && (
          <TouchableOpacity 
            style={styles.qrRetryButton}
            onPress={resetScanning}>
            <Text style={styles.qrRetryButtonText}>🔄 Scanner à nouveau</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  qrContainer: {
    flex: 1,
  },
  
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? height * 0.08 : height * 0.06,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.025,
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  qrTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  
  securityIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  
  securityText: {
    fontSize: width * 0.03,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backIcon: {
    fontSize: width * 0.05,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  historyButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  historyIcon: {
    fontSize: width * 0.04,
  },
  
  qrCameraArea: {
    flex: 1,
    position: 'relative',
  },
  
  qrCamera: {
    flex: 1,
  },
  
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  qrOverlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  qrOverlayMiddle: {
    flexDirection: 'row',
    height: width * 0.7,
  },
  
  qrOverlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  qrOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  
  qrFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  qrFrameScanning: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  
  qrFrameCorner: {
    position: 'absolute',
    width: width * 0.08,
    height: width * 0.08,
    borderColor: '#4caf50',
    borderWidth: 4,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  
  qrFrameCornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  
  qrFrameCornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 8,
  },
  
  qrFrameCornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 8,
  },
  
  securityBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  securityBadgeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  
  securityBadgeText: {
    fontSize: width * 0.03,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  processingBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  
  processingIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  
  processingText: {
    fontSize: width * 0.035,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  qrInstructions: {
    backgroundColor: 'rgba(26, 74, 26, 0.95)',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    paddingBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    alignItems: 'center',
  },
  
  qrInstructionTitle: {
    fontSize: width * 0.045,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  
  qrInstructionText: {
    fontSize: width * 0.038,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  
  scanHistory: {
    width: '100%',
    marginTop: height * 0.02,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
  },
  
  historyTitle: {
    fontSize: width * 0.04,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  historyList: {
    gap: 8,
  },
  
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  
  historyText: {
    flex: 1,
    fontSize: width * 0.035,
    color: '#ffffff',
    marginHorizontal: 10,
  },
  
  historyTime: {
    fontSize: width * 0.03,
    color: '#ffffff',
    opacity: 0.7,
  },
  
  qrRetryButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.06,
    marginTop: height * 0.01,
  },
  
  qrRetryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  
  qrPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  
  qrPermissionTitle: {
    fontSize: width * 0.055,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.025,
  },
  
  qrPermissionText: {
    fontSize: width * 0.04,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: height * 0.025,
    marginBottom: height * 0.04,
  },
  
  qrPermissionButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: width * 0.075,
    paddingVertical: height * 0.02,
    borderRadius: width * 0.06,
  },
  
  qrPermissionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
});

export default SecureQRCodeScreen;