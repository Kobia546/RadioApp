import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  Vibration,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import { WebView } from 'react-native-webview';




import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useRef, useEffect } from 'react';
import { Image } from 'expo-image';
import UltraStyledDonationScreen from './EnhancedDonationScreen';

const { width, height } = Dimensions.get('window');
const Logo = require('./assets/images/Logo.jpeg')

// Configuration CinetPay
const CINETPAY_CONFIG = {
  apiUrl: 'https://api-checkout.cinetpay.com/v2/payment',
  apikey: '1627998221687ae5cd78f184.04992672',
  site_id: '105902489',
  return_url: 'https://success.cinetpay.com/',
  cancel_url: 'https://cancel.cinetpay.com/',
  notify_url: 'https://notify.cinetpay.com/',
};

// SONS SYSTÈME POUR ALARMES (Patterns de vibration)
// Pour utiliser de vrais sons audio: installez expo-audio et remplacez les patterns par des fichiers audio
const ALARM_SOUNDS = [
  { id: 'default', name: 'Son par défaut', pattern: [200, 300, 200, 300] },
  { id: 'bell', name: '🔔 Cloche', pattern: [500, 200, 500, 200, 500, 200] },
  { id: 'chime', name: '🎵 Carillon', pattern: [100, 100, 100, 100, 100, 500] },
  { id: 'ding', name: '🔕 Ding', pattern: [300, 300] },
  { id: 'notification', name: '📢 Notification', pattern: [100, 200, 100, 200, 100, 200] },
];


// Composant ULTRA-SIMPLIFIÉ pour créer des alarmes avec son
const AddAlarmModal = ({ visible, onClose, onAddAlarm }) => {
  const [alarmTitle, setAlarmTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [selectedSound, setSelectedSound] = useState('default');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const resetForm = () => {
    setAlarmTitle('');
    setAlarmTime('07:00');
    setSelectedSound('default');
    setShowTimePicker(false);
    setShowSoundModal(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (event.type === 'set' && time) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      setAlarmTime(`${hours}:${minutes}`);
      setSelectedDate(time);
    }
  };

  const playTestSound = async (soundId) => {
    try {
      // Arrêter toute vibration en cours
      Vibration.cancel();
      
      const selectedSoundData = ALARM_SOUNDS.find(s => s.id === soundId);
      if (selectedSoundData && selectedSoundData.pattern) {
        // Jouer le pattern de vibration correspondant
        Vibration.vibrate(selectedSoundData.pattern);
        
        // Arrêter automatiquement après 3 secondes
        setTimeout(() => {
          Vibration.cancel();
        }, 3000);
      }
    } catch (error) {
      console.log('Erreur test son:', error);
      // Fallback: vibration simple
      Vibration.vibrate([200, 300, 200, 300]);
    }
  };

  const handleAddAlarm = () => {
    if (!alarmTitle.trim()) {
      Alert.alert('❌ Erreur', 'Veuillez entrer un nom pour l\'alarme');
      return;
    }

    const newAlarm = {
      id: Date.now(),
      title: alarmTitle.trim(),
      time: alarmTime,
      enabled: true,
      sound: selectedSound,
    };

    onAddAlarm(newAlarm);
    Alert.alert('✅ Succès', `Alarme "${alarmTitle}" créée à ${alarmTime}`);
    handleClose();
  };

  // Modal de sélection de son
  const SoundSelectionModal = () => (
    <Modal
      visible={showSoundModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSoundModal(false)}>
      <View style={styles.soundModalOverlay}>
        <View style={styles.soundModalContainer}>
          <Text style={styles.soundModalTitle}>🔊 Choisir le son</Text>
          
          <ScrollView style={styles.soundList}>
            {ALARM_SOUNDS.map((soundOption) => (
              <TouchableOpacity
                key={soundOption.id}
                style={[
                  styles.soundItem,
                  selectedSound === soundOption.id && styles.selectedSoundItem
                ]}
                onPress={() => {
                  setSelectedSound(soundOption.id);
                  playTestSound(soundOption.id);
                }}>
                <Text style={[
                  styles.soundItemText,
                  selectedSound === soundOption.id && styles.selectedSoundItemText
                ]}>
                  {soundOption.name}
                </Text>
                {selectedSound === soundOption.id && (
                  <Text style={styles.soundCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.soundModalClose}
            onPress={() => setShowSoundModal(false)}>
            <Text style={styles.soundModalCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.addAlarmContainer}>
        <View style={styles.addAlarmHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.modernCancelButton}>
            <Text style={styles.modernCancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.addAlarmTitle}>➕ Nouvelle Alarme</Text>
          <View style={{ width: '20%' }} />
        </View>

        <ScrollView style={styles.addAlarmContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>📝 Nom de l'alarme</Text>
            <TextInput
              style={styles.modernFormInput}
              placeholder="Ex: Réveil du matin"
              value={alarmTitle}
              onChangeText={setAlarmTitle}
              autoFocus={true}
              returnKeyType="done"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>⏰ Heure</Text>
            <TouchableOpacity 
              style={styles.modernTimeButton}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.modernTimeButtonText}>{alarmTime}</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🔊 Son d'alarme</Text>
            <TouchableOpacity 
              style={styles.modernSoundButton}
              onPress={() => setShowSoundModal(true)}>
              <Text style={styles.modernSoundButtonText}>
                {ALARM_SOUNDS.find(s => s.id === selectedSound)?.name || 'Son par défaut'}
              </Text>
              <Text style={styles.modernSoundButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View> */}

          {/* BOUTON SAUVER DÉPLACÉ EN BAS */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity onPress={handleAddAlarm} style={styles.modernSaveButtonBottom}>
              <Text style={styles.modernSaveButtonBottomText}>💾 Sauvegarder l'alarme</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DATE TIME PICKER AMÉLIORÉ POUR ANDROID/iOS */}
        {showTimePicker && (
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>⏰ Choisir l'heure</Text>
              </View>
              
              <View style={styles.datePickerContent}>
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  style={styles.datePickerStyle}
                  textColor="#333"
                />
              </View>
              
              {Platform.OS === 'android' && (
                <View style={styles.datePickerButtons}>
                  <TouchableOpacity 
                    style={styles.datePickerCancelBtn}
                    onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.datePickerCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.datePickerOkBtn}
                    onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.datePickerOkText}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        <SoundSelectionModal />
      </SafeAreaView>
    </Modal>
  );
};

export default function App() {
  // États principaux
  const [currentScreen, setCurrentScreen] = useState('radio');
  const [showPlayer, setShowPlayer] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Radio Bonne Nouvelle');
  const [showMenu, setShowMenu] = useState(false);
  const [showCinetPayModal, setShowCinetPayModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [donationMethod, setDonationMethod] = useState('local');

   const translateX = useRef(new Animated.Value(width)).current;

  const generateCinetPayUrl = async (amount = '1000', currency = 'XOF') => {
    setIsGeneratingPayment(true);
    
    try {
      const transactionId = 'RBN_' + Date.now();
      
      const paymentData = {
        apikey: CINETPAY_CONFIG.apikey,
        site_id: CINETPAY_CONFIG.site_id,
        transaction_id: transactionId,
        amount: parseInt(amount),
        currency: currency,
        description: `Don de ${parseInt(amount).toLocaleString()} FCFA pour Radio Bonne Nouvelle`,
        return_url: CINETPAY_CONFIG.return_url,
        notify_url: CINETPAY_CONFIG.notify_url,
        channels: 'ALL', 
        lang: 'fr',
        customer_id: '1',
        customer_name: donorName || 'Donateur',
        customer_surname: 'Anonyme',
        customer_email: donorEmail || 'contact@radiobonnenouvelle.com',
        customer_phone_number: '+2250000000000',
        customer_address: 'Cocody Angré',
        customer_city: 'Abidjan',
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225'
      };

      console.log('🚀 Envoi des données à CinetPay:', paymentData);

      const response = await fetch(CINETPAY_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      console.log('📄 Réponse CinetPay:', result);

      if (result.code === '201' && result.data && result.data.payment_url) {
        console.log('✅ URL de paiement générée:', result.data.payment_url);
        return result.data.payment_url;
      } else {
        console.error('❌ Erreur CinetPay:', result);
        Alert.alert(
          '❌ Erreur de paiement',
          result.message || result.description || 'Impossible de générer le lien de paiement',
          [{ text: 'OK' }]
        );
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur réseau CinetPay:', error);
      Alert.alert(
        '❌ Erreur de connexion',
        'Impossible de contacter CinetPay. Vérifiez votre connexion internet.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  const openCinetPay = async (amount) => {
    if (!amount || isNaN(amount) || parseInt(amount) < 100) {
      Alert.alert(
        '❌ Montant invalide',
        'Veuillez entrer un montant valide (minimum 100 FCFA)',
        [{ text: 'OK' }]
      );
      return;
    }

    const url = await generateCinetPayUrl(amount.toString());
    if (url) {
      setPaymentUrl(url);
      setShowCinetPayModal(true);
    }
  };

  // FACEBOOK CORRIGÉ - Multi-fallback pour éviter les erreurs
 const openFacebookPage = async () => {
  try {
    await Linking.openURL('https://www.facebook.com/profile.php?id=61577836107085');
  } catch (error) {
    Linking.openURL('https://facebook.com').catch(() => {
      Alert.alert('Info', 'Recherchez "Radio Bonne Nouvelle YAKRO" sur Facebook');
    });
  }
  setShowMenu(false);
};
  const CinetPayModal = () => (
    <Modal
      visible={showCinetPayModal}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setShowCinetPayModal(false);
        setPaymentUrl(null);
      }}>
      <SafeAreaView style={styles.cinetPayContainer}>
        <View style={styles.modernCinetPayHeader}>
          <TouchableOpacity 
            onPress={() => {
              setShowCinetPayModal(false);
              setPaymentUrl(null);
            }}
            style={styles.modernBackButton}>
            <Text style={styles.modernBackButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.modernCinetPayTitle}>Paiement Sécurisé</Text>
         
        </View>
        
        {isGeneratingPayment ? (
          <View style={styles.modernLoadingOverlay}>
            <Text style={styles.modernLoadingSpinner}>⏳</Text>
            <Text style={styles.modernLoadingText}>Génération du lien de paiement...</Text>
          </View>
        ) : paymentUrl ? (
          <WebView
            source={{ uri: paymentUrl }}
            style={styles.cinetPayWebView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.modernLoadingOverlay}>
                <Text style={styles.modernLoadingSpinner}>💳</Text>
                <Text style={styles.modernLoadingText}>Chargement CinetPay...</Text>
              </View>
            )}
            onNavigationStateChange={(navState) => {
              console.log('🌐 Navigation CinetPay:', navState.url);
              
              if (navState.url.includes('success') || 
                  navState.url.includes('payment_success') || 
                  navState.url.includes('completed') ||
                  navState.url.includes(CINETPAY_CONFIG.return_url)) {
                
                const donationText = donationAmount 
                  ? `Votre don de ${parseInt(donationAmount).toLocaleString()} FCFA a été reçu par la Radio Bonne Nouvelle. Que Dieu vous bénisse.`
                  : 'Votre don a été traité avec succès via CinetPay.';
                
                Alert.alert(
                  '🎉 Paiement Réussi !',
                  `${donationText} Que Dieu vous bénisse !`,
                  [{
                    text: 'Amen 🙏',
                    onPress: () => {
                      setShowCinetPayModal(false);
                      setPaymentUrl(null);
                      setDonationAmount('');
                      setDonorName('');
                      setDonorEmail('');
                    }
                  }]
                );
              }
              
              if (navState.url.includes('cancel') || 
                  navState.url.includes('cancelled')) {
                Alert.alert(
                  'ℹ️ Paiement Annulé',
                  'Votre paiement a été annulé. Vous pouvez réessayer quand vous voulez.',
                  [{
                    text: 'OK',
                    onPress: () => {
                      setShowCinetPayModal(false);
                      setPaymentUrl(null);
                    }
                  }]
                );
              }
            }}
            onError={(error) => {
              console.log('❌ Erreur WebView CinetPay:', error);
              Alert.alert(
                '❌ Erreur de chargement',
                'Impossible de charger la page de paiement CinetPay.',
                [
                  { 
                    text: 'Réessayer', 
                    onPress: async () => {
                      const newUrl = await generateCinetPayUrl();
                      if (newUrl) {
                        setPaymentUrl(newUrl);
                      }
                    }
                  },
                  { 
                    text: 'Annuler', 
                    style: 'cancel',
                    onPress: () => {
                      setShowCinetPayModal(false);
                      setPaymentUrl(null);
                    }
                  }
                ]
              );
            }}
          />
        ) : (
          <View style={styles.modernLoadingOverlay}>
            <Text style={styles.modernLoadingSpinner}>❌</Text>
            <Text style={styles.modernLoadingText}>Erreur de génération du paiement</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  // États pour les alarmes ULTRA-SIMPLIFIÉES avec sons
  const [alarms, setAlarms] = useState([
    { id: 1, title: "Réveil du matin", time: "06:00", enabled: true, sound: 'bell' },
    { id: 2, title: "Pause déjeuner", time: "12:00", enabled: true, sound: 'chime' },
    { id: 3, title: "Fin de journée", time: "18:00", enabled: false, sound: 'default' },
  ]);
  
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [showAlarmDetailModal, setShowAlarmDetailModal] = useState(false);
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  
  // Références pour les animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.3)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Référence pour gérer la vibration en cours
  const currentVibration = useRef(null);
  const snoozeTimeout = useRef(null);
  const webViewRef = useRef(null);

  const radioPlayerUrl = 'https://a4.asurahosting.com:7400/radio.mp3';

  useEffect(() => {
    startRotationAnimation();
    
    setTimeout(() => {
      showRadioPlayer();
    }, 1000);
    
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
      startProgressAnimation();
    } else {
      stopAnimations();
    }
  }, [isPlaying]);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          triggerAlarm(alarm);
        }
      });
    };

    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [alarms]);

  // Cleanup des vibrations et timeouts au démontage
  useEffect(() => {
    return () => {
      Vibration.cancel();
      if (snoozeTimeout.current) {
        clearTimeout(snoozeTimeout.current);
      }
      currentVibration.current = false;
    };
  }, []);

  const showAddAlarmModal_func = () => {
    setShowAddAlarmModal(true);
  };

  const handleAddAlarm = (newAlarm) => {
    setAlarms([...alarms, newAlarm]);
  };

  const testAlarm = (alarm) => {
    Alert.alert(
      '🔔 Test de l\'alarme',
      `Voulez-vous tester l'alarme "${alarm.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Tester', 
          onPress: () => {
            // Arrêter toute vibration en cours
            Vibration.cancel();
            
            // Obtenir le pattern pour cette alarme
            const soundData = ALARM_SOUNDS.find(s => s.id === alarm.sound) || ALARM_SOUNDS[0];
            
            // Vibrer avec le pattern pendant 3 secondes
            Vibration.vibrate(soundData.pattern);
            setTimeout(() => {
              Vibration.cancel();
            }, 3000);
          }
        }
      ]
    );
  };

  // ALARME ULTRA-SIMPLIFIÉE AVEC SON CORRIGÉ
  const triggerAlarm = async (alarm) => {
    // Arrêter toute vibration en cours
    Vibration.cancel();
    if (snoozeTimeout.current) {
      clearTimeout(snoozeTimeout.current);
      snoozeTimeout.current = null;
    }

    // Obtenir le pattern de vibration pour cette alarme
    const soundData = ALARM_SOUNDS.find(s => s.id === alarm.sound) || ALARM_SOUNDS[0];
    const vibrationPattern = soundData.pattern;

    // Démarrer la vibration répétée
    const startVibration = () => {
      Vibration.vibrate(vibrationPattern, true); // true = répétition
      currentVibration.current = true;
    };

    // Arrêter toute vibration
    const stopVibration = () => {
      Vibration.cancel();
      currentVibration.current = false;
    };

    // Démarrer la vibration
    startVibration();

    Alert.alert(
      `🔔 ${alarm.title}`,
      `Il est ${alarm.time} !`,
      [
        {
          text: 'Amen 🙏',
          style: 'default',
          onPress: () => {
            stopVibration();
          }
        },
        {
          text: 'Rappeler dans 5 min',
          onPress: () => {
            stopVibration();
            scheduleSnooze(alarm);
          }
        },
      ],
      {
        cancelable: false,
        onDismiss: () => {
          stopVibration();
        }
      }
    );

    // Arrêter automatiquement après 60 secondes si pas de réponse
    setTimeout(() => {
      if (currentVibration.current) {
        stopVibration();
      }
    }, 60000);
  };

  const scheduleSnooze = (alarm) => {
    // Programmer le rappel dans 5 minutes
    snoozeTimeout.current = setTimeout(() => {
      // Arrêter toute vibration en cours
      Vibration.cancel();
      
      // Obtenir le pattern de vibration
      const soundData = ALARM_SOUNDS.find(s => s.id === alarm.sound) || ALARM_SOUNDS[0];
      
      // Démarrer la vibration pour le rappel
      Vibration.vibrate(soundData.pattern, true);
      currentVibration.current = true;
      
      Alert.alert(
        `🔔 Rappel: ${alarm.title}`, 
        `Il est temps ! ⏰`,
        [
          {
            text: 'Amen 🙏',
            onPress: () => {
              Vibration.cancel();
              currentVibration.current = false;
            }
          }
        ],
        {
          cancelable: false,
          onDismiss: () => {
            Vibration.cancel();
            currentVibration.current = false;
          }
        }
      );
      
      // Arrêter automatiquement après 30 secondes
      setTimeout(() => {
        if (currentVibration.current) {
          Vibration.cancel();
          currentVibration.current = false;
        }
      }, 30000);
      
    }, 5 * 60 * 1000); // 5 minutes
  };

  const showDonationScreen = () => {
    setCurrentScreen('donation');
    setShowMenu(false);
  };

  const handleDonation = () => {
    if (!donationAmount || !donorName) {
      Alert.alert('❌ Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      '💝 Merci pour votre don !',
      `Merci ${donorName} pour votre généreux don de ${donationAmount}€. Que Dieu vous bénisse !`,
      [{ text: 'Amen 🙏', onPress: () => {
        setDonationAmount('');
        setDonorName('');
        setDonorEmail('');
        setShowDonationModal(false);
      }}]
    );
  };

  // Animations
  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    progressAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showRadioPlayer = () => {
    setIsLoading(true);
    setShowPlayer(true);
    
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      setIsPlaying(true);
    }, 2500);
  };

  const hidePlayer = () => {
    Animated.spring(slideAnim, {
      toValue: height * 0.3,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      setShowPlayer(false);
      setIsPlaying(false);
      setIsConnected(false);
      setWebViewKey(prev => prev + 1);
      slideAnim.setValue(height * 0.3);
    });
  };

  // AUTO-PLAY RADIO ULTRA-AMÉLIORÉ
  const reloadPlayer = () => {
    if (!showPlayer) {
      showRadioPlayer();
    } else {
      setIsLoading(true);
      setIsPlaying(false);
      setIsConnected(false);
      setWebViewKey(prev => prev + 1);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsConnected(true);
        setIsPlaying(true);
      }, 2000);
    }
  };

  const toggleAlarm = (id) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id) => {
    Alert.alert(
      'Supprimer l\'alarme',
      'Êtes-vous sûr de vouloir supprimer cette alarme?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => {
          setAlarms(alarms.filter(alarm => alarm.id !== id));
        }}
      ]
    );
  };

  const showAlarmDetails = (alarm) => {
    setSelectedAlarm(alarm);
    setShowAlarmDetailModal(true);
  };

  // Menu moderne responsive
  const MenuOverlay = () => (
    <Modal
      visible={showMenu}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowMenu(false)}>
      <View style={styles.modernMenuOverlay}>
        <View style={styles.modernMenuModal}>
          <Text style={styles.modernMenuModalTitle}>📻 MENU</Text>
          
          <TouchableOpacity
            style={[styles.modernMenuModalItem, currentScreen === 'radio' && styles.modernActiveMenuItem]}
            onPress={() => {
              setCurrentScreen('radio');
              setShowMenu(false);
            }}>
            <Text style={styles.modernMenuModalIcon}>📻</Text>
            <Text style={[styles.modernMenuModalText, currentScreen === 'radio' && {color: '#ffffff'}]}>Ma Radio</Text>
            {currentScreen === 'radio' && <Text style={styles.modernActiveIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modernMenuModalItem, currentScreen === 'alarms' && styles.modernActiveMenuItem]}
            onPress={() => {
              setCurrentScreen('alarms');
              setShowMenu(false);
            }}>
            <Text style={styles.modernMenuModalIcon}>🔔</Text>
            <Text style={[styles.modernMenuModalText, currentScreen === 'alarms' && {color: '#ffffff'}]}>Alarmes</Text>
            {currentScreen === 'alarms' && <Text style={styles.modernActiveIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modernMenuModalItem, currentScreen === 'donation' && styles.modernActiveMenuItem]}
            onPress={showDonationScreen}>
            <Text style={styles.modernMenuModalIcon}>🎁</Text>
            <Text style={[styles.modernMenuModalText, currentScreen === 'donation' && {color: '#ffffff'}]}>Soutenir la Radio</Text>
            {currentScreen === 'donation' && <Text style={styles.modernActiveIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernMenuModalItem}
            onPress={openFacebookPage}>
            <Text style={styles.modernMenuModalIcon}>📘</Text>
            <Text style={styles.modernMenuModalText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernMenuModalClose}
            onPress={() => setShowMenu(false)}>
            <Text style={styles.modernMenuModalCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DonationScreen = () => (
    <UltraStyledDonationScreen
      showCinetPayModal={showCinetPayModal}
      setShowCinetPayModal={setShowCinetPayModal}
      openCinetPay={openCinetPay}
      isGeneratingPayment={isGeneratingPayment}
      Logo={Logo}
      setShowMenu={setShowMenu}
    />
  );

  // ALARMES ULTRA-SIMPLIFIÉES
  const AlarmsScreen = () => (
    <View style={styles.modernContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.modernRadioHeader}>
        <TouchableOpacity 
          onPress={() => setShowMenu(true)}
          style={styles.modernHeaderButton}>
          <Text style={styles.modernMenuIcon}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernStationName}>Mes Alarmes</Text>
          <Text style={styles.modernStatusText}>{alarms.filter(a => a.enabled).length} alarmes actives</Text>
        </View>
        
        <TouchableOpacity 
          onPress={showAddAlarmModal_func}
          style={styles.modernAddButton}>
          <Text style={styles.modernAddIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modernAlarmsScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: '10%' }}>
        <View style={styles.modernAlarmsListCard}>
          <Text style={styles.modernAlarmsListTitle}>Mes alarmes ({alarms.length})</Text>
          
          {alarms.map((alarm) => (
            <View key={alarm.id} style={[styles.modernAlarmItem, !alarm.enabled && styles.modernDisabledAlarm]}>
              <TouchableOpacity 
                style={styles.modernAlarmMainInfo}
                onPress={() => showAlarmDetails(alarm)}>
                <View style={styles.modernAlarmInfo}>
                  <Text style={styles.modernAlarmTime}>{alarm.time}</Text>
                  <Text style={styles.modernAlarmTitle}>{alarm.title}</Text>
                  <Text style={styles.modernAlarmSound}>
                    🔊 {ALARM_SOUNDS.find(s => s.id === alarm.sound)?.name || 'Son par défaut'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.modernAlarmControls}>
                <TouchableOpacity
                  onPress={() => testAlarm(alarm)}
                  style={styles.modernTestBtn}>
                  <Text style={styles.modernTestIcon}>▶️</Text>
                </TouchableOpacity>
                
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => toggleAlarm(alarm.id)}
                  trackColor={{ false: '#767577', true: '#4caf50' }}
                  thumbColor={alarm.enabled ? '#ffffff' : '#f4f3f4'}
                />
                <TouchableOpacity
                  onPress={() => deleteAlarm(alarm.id)}
                  style={styles.modernDeleteBtn}>
                  <Text style={styles.modernDeleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {alarms.length === 0 && (
            <View style={styles.modernNoAlarmsContainer}>
              <Text style={styles.modernNoAlarmsText}>Aucune alarme configurée</Text>
              <TouchableOpacity
                onPress={showAddAlarmModal_func}
                style={styles.modernAddFirstAlarmBtn}>
                <Text style={styles.modernAddFirstAlarmText}>➕ Créer ma première alarme</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AddAlarmModal
        visible={showAddAlarmModal}
        onClose={() => setShowAddAlarmModal(false)}
        onAddAlarm={handleAddAlarm}
      />

      {renderOtherModals()}
    </View>
  );

  const RadioScreen = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
      useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -width,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.modernContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#151111ff" />

        <View style={styles.modernRadioHeader}>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.modernHeaderButton}>
            <Text style={styles.modernMenuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.modernHeaderCenter}>
            <Text style={styles.modernStationName}>Radio Bonne Nouvelle</Text>
            <Text style={styles.modernHeaderSubtitle1}>Le canal de la Grandeur</Text>
            <Text style={styles.modernHeaderSubtitle}>103.6</Text>
            <View style={styles.modernStatusRow}>
              <View style={[styles.modernStatusDot, isConnected && styles.modernActiveDot]} />
              <Text style={styles.modernStatusText}>
                {isConnected ? 'EN DIRECT' : 'HORS LIGNE'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={reloadPlayer}
            style={styles.modernHeaderButton}>
            <Animated.View style={{ transform: [{ rotate: isLoading ? rotation : '0deg' }] }}>
              <Text style={styles.modernReloadIcon}>⟳</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.modernAlbumSection}>
          <Animated.View
            style={[
              styles.modernRadioWaveContainer,
              {
                transform: [
                  { scale: pulseAnim }
                ]
              }
            ]}>
            <View style={styles.modernRadioTower}>
              <View style={styles.modernAntenna}>
                <View style={styles.modernAntennaBase} />
                <View style={styles.modernAntennaRod} />
                <View style={styles.modernAntennaTop} />
              </View>

              {isPlaying && [1, 2, 3, 4].map(i => (
                <Animated.View
                  key={i}
                  style={[
                    styles.modernRadioWave,
                    styles[`modernWave${i}`],
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.05],
                        outputRange: [0.3, 0.8],
                      }),
                      transform: [{
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.05],
                          outputRange: [1, 1.2],
                        })
                      }]
                    }
                  ]}
                />
              ))}

              <View style={styles.modernLogo}>
               <Image source={Logo} style={styles.modernLogo} />
               
              </View>
            </View>
          </Animated.View>

          <View style={styles.modernTrackInfo}>
            <Text style={styles.modernTrackTitle}>
              {isConnected ? '🟢 Live Broadcast' : '🔴 Broadcast Offline'}
            </Text>
        

            {isPlaying && (
              <Animated.View style={styles.modernWaveform}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.modernWaveBar,
                      {
                        transform: [{
                          scaleY: pulseAnim.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: [0.5, 1.5],
                          })
                        }]
                      }
                    ]}
                  />
                ))}
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.modernControlsSection}>
          {(isPlaying || isLoading) && (
            <View style={styles.modernProgressContainer}>
              <View style={styles.modernProgressTrack}>
                <Animated.View
                  style={[
                    styles.modernProgressFill,
                    { width: isLoading ? '30%' : progressWidth }
                  ]}
                />
              </View>
             
            </View>
          )}
         
        </View>

        {showPlayer && (
          <Animated.View
            style={[
              styles.modernPlayerContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}>
            <View style={styles.modernPlayerHeader}>
              <Text style={styles.modernPlayerTitle}>📻 Radio En ligne</Text>
              <TouchableOpacity onPress={hidePlayer} style={styles.modernClosePlayer}>
                <Text style={styles.modernCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <WebView
              key={webViewKey}
              source={{ uri: radioPlayerUrl }}
              style={styles.modernWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.modernLoadingOverlay}>
                  <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Text style={styles.modernLoadingSpinner}>⟳</Text>
                  </Animated.View>
                  <Text style={styles.modernLoadingText}>Chargement...</Text>
                </View>
              )}
              onLoad={() => {
                console.log('Player chargé!');
                setIsLoading(false);
                setIsConnected(true);
                setIsPlaying(true);

                // AUTO-PLAY ULTRA-PERSISTANT ET AMÉLIORÉ
                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    try {
                      console.log('🎵 AUTO-PLAY ULTIMATE: Démarrage...');
                      
                      let playAttempts = 0;
                      const maxAttempts = 20;
                      
                      const tryAutoPlay = () => {
                        console.log('Tentative', playAttempts + 1, 'sur', maxAttempts);
                        
                        // Sélecteurs ultra-complets
                        const selectors = [
                          'button[title="Play"]',
                          'button[aria-label="Play"]', 
                          'button[aria-label="Jouer"]',
                          '.radio-control-play-button',
                          'button.btn.p-0.radio-control-play-button',
                          '[class*="play-button"]',
                          '[class*="control-play"]',
                          'button[type="button"]',
                          '.play-btn',
                          '.btn-play',
                          '[data-action="play"]',
                          '.radio-controls button',
                          '#play-button',
                          '.player-play'
                        ];

                        let found = false;
                        
                        // Méthode 1: Recherche par sélecteurs spécifiques
                        for (const selector of selectors) {
                          const buttons = document.querySelectorAll(selector);
                          buttons.forEach(btn => {
                            if (!found && (
                              btn.title?.toLowerCase().includes('play') || 
                              btn.getAttribute('aria-label')?.toLowerCase().includes('play') ||
                              btn.getAttribute('aria-label')?.toLowerCase().includes('jouer') ||
                              btn.className?.toLowerCase().includes('play') ||
                              btn.textContent?.toLowerCase().includes('play') ||
                              btn.textContent?.toLowerCase().includes('▶')
                            )) {
                              console.log('✅ Bouton trouvé avec sélecteur:', selector);
                              
                              // Simulation d'événements multiples
                              const events = ['mousedown', 'mouseup', 'click', 'tap', 'touchstart', 'touchend'];
                              events.forEach((eventType, index) => {
                                setTimeout(() => {
                                  try {
                                    const event = new Event(eventType, { bubbles: true, cancelable: true });
                                    btn.dispatchEvent(event);
                                  } catch(e) {
                                    btn.click();
                                  }
                                }, index * 50);
                              });
                              
                              found = true;
                            }
                          });
                          if (found) break;
                        }

                        // Méthode 2: Recherche exhaustive dans tous les boutons
                        if (!found) {
                          const allButtons = document.querySelectorAll('button, [role="button"], .btn, [onclick]');
                          allButtons.forEach((btn, index) => {
                            if (!found && index < 30) { // Limite pour éviter les abus
                              const text = (btn.textContent || '').toLowerCase();
                              const title = (btn.title || '').toLowerCase();
                              const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                              const className = (btn.className || '').toLowerCase();
                              
                              if (text.includes('play') || text.includes('▶') || text.includes('jouer') ||
                                  title.includes('play') || title.includes('jouer') ||
                                  ariaLabel.includes('play') || ariaLabel.includes('jouer') ||
                                  className.includes('play')) {
                                
                                console.log('✅ Bouton trouvé par analyse:', btn);
                                
                                // Triple-click agressif
                                setTimeout(() => btn.click(), 100);
                                setTimeout(() => btn.click(), 300);
                                setTimeout(() => btn.click(), 500);
                                
                                found = true;
                              }
                            }
                          });
                        }

                        // Méthode 3: Forcer l'audio directement
                        setTimeout(() => {
                          const audioElements = document.querySelectorAll('audio, video');
                          audioElements.forEach(audio => {
                            try {
                              if (audio.paused) {
                                audio.play().then(() => {
                                  console.log('✅ Audio forcé avec succès');
                                }).catch(e => {
                                  console.log('Audio bloqué:', e);
                                });
                              }
                            } catch(e) {
                              console.log('Erreur audio:', e);
                            }
                          });
                        }, 1000);

                        // Incrémenter les tentatives
                        playAttempts++;
                        
                        // Continuer les tentatives si pas trouvé
                        if (!found && playAttempts < maxAttempts) {
                          setTimeout(tryAutoPlay, 2000); // Réessayer dans 2 secondes
                        } else if (found) {
                          console.log('🎉 AUTO-PLAY RÉUSSI!');
                        } else {
                          console.log('❌ AUTO-PLAY échoué après', maxAttempts, 'tentatives');
                        }
                      };

                      // Démarrer immédiatement
                      tryAutoPlay();
                      
                    } catch(e) {
                      console.log('❌ Erreur auto-play général:', e);
                    }
                    true;
                  `);
                }, 500);

                // Observer les changements de DOM pour détecter les nouveaux boutons
                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    const observer = new MutationObserver(() => {
                      const playButtons = document.querySelectorAll('button[title*="Play"], button[aria-label*="Play"]');
                      if (playButtons.length > 0) {
                        playButtons[0].click();
                        console.log('🎵 Nouveau bouton détecté et cliqué');
                      }
                    });
                    
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true
                    });
                    
                    true;
                  `);
                }, 2000);
              }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);

                  if (data.type === 'currentTrack') {
                    setCurrentTrack('🔴 Live Broadcast');
                    console.log('Titre reçu:', data.title);
                  }

                  if (data.type === 'playbackStarted') {
                    setIsPlaying(true);
                    setIsConnected(true);
                    console.log('Playback démarré automatiquement!');
                  }

                } catch (e) {
                  console.log('Erreur parsing message:', e);
                }
              }}
              onError={() => {
                Alert.alert('Erreur', 'Impossible de charger le player');
                setIsLoading(false);
              }}
              ref={webViewRef}
            />
          </Animated.View>
        )}
   <View style={styles.bottomActionsContainer}>
  <TouchableOpacity
    style={[styles.bottomActionButton, currentScreen === 'donation' && styles.activeBottomButton]}
    onPress={showDonationScreen}>
    <View style={styles.bottomButtonIconContainer}>
      <Text style={styles.bottomButtonIcon}>🎁</Text>
    </View>
    <Text style={[styles.bottomButtonText, currentScreen === 'donation' && styles.activeBottomButtonText]}>
      Soutenir la Radio
    </Text>
    {currentScreen === 'donation' && <View style={styles.bottomActiveIndicator} />}
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.bottomActionButton}
    onPress={openFacebookPage}>
    <View style={styles.bottomButtonIconContainer}>
      <Text style={styles.bottomButtonIcon}>📘</Text>
    </View>
    <Text style={styles.bottomButtonText}>
      Suivez-nous sur Facebook
    </Text>
  </TouchableOpacity>
</View>
      </View>
    );
  };

  const renderOtherModals = () => (
    <>
      <Modal
        visible={showAlarmDetailModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAlarmDetailModal(false)}>
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContainer}>
            {selectedAlarm && (
              <>
                <Text style={styles.modernModalTitle}>🔔 {selectedAlarm.title}</Text>
                <Text style={styles.modernAlarmDetailTime}>⏰ {selectedAlarm.time}</Text>
                <Text style={styles.modernAlarmDetailSound}>
                  🔊 {ALARM_SOUNDS.find(s => s.id === selectedAlarm.sound)?.name || 'Son par défaut'}
                </Text>
                
                <TouchableOpacity
                  style={styles.modernCloseModalBtn}
                  onPress={() => setShowAlarmDetailModal(false)}>
                  <Text style={styles.modernCloseModalText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'alarms':
        return <AlarmsScreen />;
      case 'donation':
        return <DonationScreen />;
      default:
        return <RadioScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.modernSafeArea}>
      {renderCurrentScreen()}
      <MenuOverlay />
      <CinetPayModal/>
    </SafeAreaView>
  );
}

// STYLES ULTRA-RESPONSIVES & COMPATIBLES iOS/ANDROID
const styles = StyleSheet.create({
  modernSafeArea: {
    flex: 1,
    backgroundColor: '#1a4a1a',
  },
  modernContainer: {
    flex: 1,
    backgroundColor: '#1a4a1a',
    
  },
  bottomActionsContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(26, 74, 26, 0.95)',
  paddingHorizontal: '5%',
  paddingVertical: '4%',
  paddingBottom: Platform.OS === 'ios' ? '8%' : '4%', // Safe area pour iOS
  borderTopLeftRadius: width * 0.06,
  borderTopRightRadius: width * 0.06,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.1)',
  ...(Platform.OS === 'ios' ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } : {
    elevation: 12,
  }),
},

bottomActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: '4%',
  paddingHorizontal: '5%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: width * 0.04,
  marginBottom: '3%',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
},

activeBottomButton: {
  backgroundColor: 'rgba(76, 175, 80, 0.8)',
  borderColor: 'rgba(76, 175, 80, 0.6)',
},

bottomButtonIconContainer: {
  width: width * 0.12,
  height: width * 0.12,
  borderRadius: width * 0.06,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '4%',
},

bottomButtonIcon: {
  fontSize: width * 0.06,
},

bottomButtonText: {
  fontSize: width * 0.042,
  fontWeight: '600',
  color: '#ffffff',
  flex: 1,
  opacity: 0.9,
},

activeBottomButtonText: {
  fontWeight: 'bold',
  opacity: 1,
},

bottomActiveIndicator: {
  width: width * 0.025,
  height: width * 0.025,
  borderRadius: width * 0.0125,
  backgroundColor: '#ffffff',
  marginLeft: '3%',
},
  
  // Menu ultra-responsive
  modernMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  modernMenuModal: {
    backgroundColor: '#ffffff',
    borderRadius: width * 0.05,
    padding: '6%',
    width: '90%',
    maxWidth: width * 0.9,
    maxHeight: '80%',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: width * 0.05 },
      shadowOpacity: 0.4,
      shadowRadius: width * 0.08,
    } : {
      elevation: 10,
    }),
  },
  modernMenuModalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '8%',
  },
  modernMenuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '6%',
    backgroundColor: '#f8f9fa',
    borderRadius: width * 0.04,
    marginBottom: '3%',
  },
  modernActiveMenuItem: {
    backgroundColor: '#2e7d32',
  },
  modernMenuModalIcon: {
    fontSize: width * 0.07,
    marginRight: '5%',
    width: width * 0.09,
    textAlign: 'center',
  },
  modernMenuModalText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modernActiveIndicator: {
    fontSize: width * 0.06,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernMenuModalClose: {
    marginTop: '6%',
    paddingVertical: '4%',
    backgroundColor: '#6c757d',
    borderRadius: width * 0.04,
    alignItems: 'center',
  },
  modernMenuModalCloseText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Header ultra-responsive
  modernRadioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    marginTop: Platform.OS === 'ios' ? '3%' : '6%',
    backgroundColor: '#1a4a1a',
  },
  modernHeaderButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernMenuIcon: {
    fontSize: width * 0.055,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernReloadIcon: {
    fontSize: width * 0.06,
    color: '#ffffff',
  },
  modernHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    top:50,
  },
  modernStationName: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '2%',
    textAlign: 'center',
  },
  modernHeaderSubtitle1: {
    fontSize: width * 0.04,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: '1%',
    textAlign: 'center',
  },
  modernHeaderSubtitle: {
    fontSize: width * 0.04,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.9,
    marginBottom: '2%',
    textAlign: 'center',
  },
  modernStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatusDot: {
    width: width * 0.025,
    height: width * 0.025,
    borderRadius: width * 0.0125,
    backgroundColor: '#666',
    marginRight: '3%',
  },
  modernActiveDot: {
    backgroundColor: '#4caf50',
  },
  modernStatusText: {
    fontSize: width * 0.035,
    color: '#aaa',
    fontWeight: '600',
  },
  modernAddButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernAddIcon: {
    fontSize: width * 0.07,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Radio section ultra-responsive
  modernAlbumSection: {
    alignItems: 'center',
    paddingVertical: '8%',
  },
  modernRadioWaveContainer: {
    marginBottom: '8%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernRadioTower: {
    width: width * 0.75,
    height: width * 0.75,
    top:30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modernAntenna: {
    position: 'absolute',
    top: '15%',
    alignItems: 'center',
    zIndex: 10,
  },
  modernAntennaBase: {
    width: width * 0.025,
    height: width * 0.18,
    backgroundColor: '#ffffff',
    borderRadius: width * 0.0125,
  },
  modernAntennaRod: {
    width: width * 0.0125,
    height: width * 0.22,
    backgroundColor: '#ffffff',
    borderRadius: width * 0.00625,
  },
  modernAntennaTop: {
    width: width * 0.0375,
    height: width * 0.0375,
    backgroundColor: '#ff4444',
    borderRadius: width * 0.01875,
  },
  modernRadioWave: {
    position: 'absolute',
    borderWidth: width * 0.01,
    borderRadius: 9999,
  },
  modernWave1: {
    width: width * 0.32,
    height: width * 0.32,
    borderColor: '#888888',
  },
  modernWave2: {
    width: width * 0.42,
    height: width * 0.42,
    borderColor: '#aaaaaa',
  },
  modernWave3: {
    width: width * 0.52,
    height: width * 0.52,
    borderColor: '#cccccc',
  },
  modernWave4: {
    width: width * 0.62,
    height: width * 0.62,
    borderColor: '#ffffff',
  },
  modernRadioLogo: {
    position: 'absolute',
    bottom: '25%',
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: width * 0.0125,
    borderColor: '#ffffff',
  },
  modernLogoText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modernLogoSubtext: {
    fontSize: width * 0.045,
    marginTop: -2,
  },
  modernTrackInfo: {
    alignItems: 'center',
    top:30,
  },
  modernLogo: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.03,
  },
  modernTrackTitle: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '3%',
    textAlign: 'center',
  },
  modernWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    top:30,
    gap: width * 0.015,
  },
  modernWaveBar: {
    width: width * 0.01,
    height: width * 0.05,
    backgroundColor: '#4caf50',
    borderRadius: width * 0.005,
  },
  modernControlsSection: {
    paddingHorizontal: '12%',
    paddingVertical: '6%',
  },
  modernProgressContainer: {
    alignItems: 'center',
    top:50
  },
  modernProgressTrack: {
    width: '100%',
    height: width * 0.015,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: width * 0.0075,
    marginBottom: '4%',
  },
  modernProgressFill: {
    height: width * 0.015,
    backgroundColor: '#4caf50',
    borderRadius: width * 0.0075,
  },


  modernPlayerContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: '5%',
    right: '5%',
    height: height * 0.16,
    display:'none',
   
    borderRadius: width * 0.05,
    overflow: 'hidden',
  },
  modernPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modernPlayerTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
  },
  modernClosePlayer: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#c73535ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernCloseIcon: {
    fontSize: width * 0.04,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernWebView: {
    flex: 1,
    backgroundColor:'#5d3636ff',
   
  },
  modernLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3a3737ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernLoadingSpinner: {
    fontSize: width * 0.09,
    color: '#737973ff',
    marginBottom: '4%',
  },
  modernLoadingText: {
    fontSize: width * 0.045,
    color: '#6d796dff',
    fontWeight: '600',
  },

  // Alarmes ultra-responsives COMPATIBLES iOS/ANDROID
  modernAlarmsScrollView: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  modernAlarmsListCard: {
    backgroundColor: '#f4f4f4',
    padding: '6%',
    borderRadius: width * 0.04,
    marginBottom: '10%',
    marginTop: '4%',
  },
  modernAlarmsListTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5%',
  },
  modernAlarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: width * 0.03,
    marginBottom: '3%',
  },
  modernDisabledAlarm: {
    opacity: 0.5,
  },
  modernAlarmMainInfo: {
    flex: 1,
  },
  modernAlarmInfo: {
    flex: 1,
  },
  modernAlarmTime: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  modernAlarmTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginTop: '2%',
  },
  modernAlarmSound: {
    fontSize: width * 0.035,
    color: '#666',
    marginTop: '1%',
  },
  modernAlarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },
  modernTestBtn: {
    padding: '3%',
  },
  modernTestIcon: {
    fontSize: width * 0.045,
  },
  modernDeleteBtn: {
    padding: '2%',
  },
  modernDeleteIcon: {
    fontSize: width * 0.045,
  },
  modernNoAlarmsContainer: {
    alignItems: 'center',
    paddingVertical: '10%',
  },
  modernNoAlarmsText: {
    fontSize: width * 0.045,
    color: '#aaa',
    marginBottom: '5%',
    textAlign: 'center',
  },
  modernAddFirstAlarmBtn: {
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    backgroundColor: '#4caf50',
    borderRadius: width * 0.06,
  },
  modernAddFirstAlarmText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },

  // Modal d'ajout RÉORGANISÉ avec bouton en bas
  addAlarmContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  addAlarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: '5%',
    backgroundColor: '#2e7d32',
  },
  addAlarmTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  modernCancelButton: {
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: width * 0.04,
  },
  modernCancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  addAlarmContent: {
    flex: 1,
    padding: '6%',
  },
  formGroup: {
    marginBottom: '8%',
  },
  formLabel: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '3%',
  },
    text: {
    fontSize: 20,
    top:100,
    color:'#e9ecef'
  },
  modernFormInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: width * 0.03,
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    fontSize: width * 0.042,
    backgroundColor: '#fff',
  },
  
  modernTimeButton: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: width * 0.03,
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modernTimeButtonText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  modernSoundButton: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: width * 0.03,
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernSoundButtonText: {
    fontSize: width * 0.042,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  modernSoundButtonArrow: {
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: 'bold',
  },

  // BOUTON SAUVER EN BAS
  bottomButtonContainer: {
    marginTop: '10%',
    paddingVertical: '5%',
  },
  modernSaveButtonBottom: {
    backgroundColor: '#4caf50',
    borderRadius: width * 0.04,
    paddingVertical: '5%',
    paddingHorizontal: '8%',
    alignItems: 'center',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    } : {
      elevation: 8,
    }),
  },
  modernSaveButtonBottomText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },

  // DATE PICKER AMÉLIORÉ POUR VISIBILITÉ
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: width * 0.05,
    padding: '5%',
    width: '85%',
    maxWidth: width * 0.9,
    alignItems: 'center',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    } : {
      elevation: 20,
    }),
  },
  datePickerHeader: {
    marginBottom: '5%',
  },
  datePickerTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  datePickerContent: {
    width: '100%',
    alignItems: 'center',
  },
  datePickerStyle: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 50,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: '5%',
  },
  datePickerCancelBtn: {
    paddingVertical: '3%',
    paddingHorizontal: '8%',
    backgroundColor: '#f5f5f5',
    borderRadius: width * 0.03,
  },
  datePickerCancelText: {
    fontSize: width * 0.04,
    color: '#666',
    fontWeight: '600',
  },
  datePickerOkBtn: {
    paddingVertical: '3%',
    paddingHorizontal: '8%',
    backgroundColor: '#4caf50',
    borderRadius: width * 0.03,
  },
  datePickerOkText: {
    fontSize: width * 0.04,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Modal sélection de son
  soundModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  soundModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: width * 0.05,
    padding: '6%',
    width: '90%',
    maxWidth: width * 0.9,
    maxHeight: '70%',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.4,
      shadowRadius: 25,
    } : {
      elevation: 20,
    }),
  },
  soundModalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '6%',
  },
  soundList: {
    maxHeight: '60%',
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    backgroundColor: '#f8f9fa',
    borderRadius: width * 0.03,
    marginBottom: '3%',
  },
  selectedSoundItem: {
    backgroundColor: '#4caf50',
  },
  soundItemText: {
    fontSize: width * 0.042,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  selectedSoundItemText: {
    color: '#ffffff',
  },
  soundCheckmark: {
    fontSize: width * 0.045,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  soundModalClose: {
    marginTop: '6%',
    paddingVertical: '4%',
    backgroundColor: '#6c757d',
    borderRadius: width * 0.04,
    alignItems: 'center',
  },
  soundModalCloseText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // CinetPay Modal ultra-responsive
  cinetPayContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modernCinetPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: '5%',
    backgroundColor: '#2e7d32',
  },
  modernCinetPayTitle: {
    fontSize: width * 0.04,
    marginLeft:'20%',
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  modernBackButton: {
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: width * 0.04,
  },
  modernBackButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  cinetPayWebView: {
    flex: 1,
  },

  // Modals ultra-responsives COMPATIBLES iOS/ANDROID
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  modernModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: width * 0.05,
    padding: '8%',
    width: '90%',
    maxWidth: width * 0.9,
    maxHeight: '80%',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.4,
      shadowRadius: 25,
    } : {
      elevation: 20,
    }),
  },
  modernModalTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '6%',
    textAlign: 'center',
  },
  modernAlarmDetailTime: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: '4%',
  },
  modernAlarmDetailSound: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: '6%',
  },
  modernCloseModalBtn: {
    paddingVertical: '4%',
    paddingHorizontal: '8%',
    backgroundColor: '#6c757d',
    borderRadius: width * 0.06,
    alignItems: 'center',
    alignSelf: 'center',
  },
  modernCloseModalText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});