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

// Configuration CinetPay - CORRIGÉE selon la documentation officielle
const CINETPAY_CONFIG = {
  // URL CORRECTE pour l'API CinetPay (POST avec JSON)
  apiUrl: 'https://api-checkout.cinetpay.com/v2/payment',
  apikey: '1627998221687ae5cd78f184.04992672', // Votre vraie clé
  site_id: '105902489', // Votre vrai site_id
  
  // URLs de retour (optionnelles)
  return_url: 'https://success.cinetpay.com/',
  cancel_url: 'https://cancel.cinetpay.com/',
  notify_url: 'https://notify.cinetpay.com/',
};

// Versets bibliques pour les alarmes
const BIBLICAL_VERSES = [
  { text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", ref: "Jérémie 29:11" },
  { text: "L'Éternel est mon berger: je ne manquerai de rien.", ref: "Psaume 23:1" },
  { text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", ref: "Matthieu 11:28" },
  { text: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4:13" },
  { text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.", ref: "Proverbes 3:5" },
  { text: "Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.", ref: "Matthieu 6:33" },
  { text: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.", ref: "Psaume 91:1" },
  { text: "L'amour de Dieu est versé dans nos cœurs par le Saint-Esprit qui nous a été donné.", ref: "Romains 5:5" },
];

// Prières prédéfinies
const PRAYERS = [
  { title: "Prière du matin", text: "Seigneur, je Te remercie pour cette nouvelle journée que Tu me donnes. Guide mes pas et que Ta volonté soit faite dans ma vie. Amen." },
  { title: "Prière de midi", text: "Père céleste, au milieu de cette journée, je viens Te chercher pour avoir la force de continuer. Bénis le travail de mes mains. Amen." },
  { title: "Prière du soir", text: "Éternel, je Te remercie pour Ta protection tout au long de cette journée. Pardonne mes fautes et donne-moi un repos paisible. Amen." },
  { title: "Prière de gratitude", text: "Seigneur, je Te loue pour tous Tes bienfaits. Tu es bon et Ta miséricorde dure à toujours. Merci pour Ton amour infini. Amen." },
];

// Composant pour créer des alarmes
const AddAlarmModal = ({ visible, onClose, onAddAlarm }) => {
  const [alarmTitle, setAlarmTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [alarmType, setAlarmType] = useState('prayer');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const resetForm = () => {
    setAlarmTitle('');
    setAlarmTime('07:00');
    setAlarmType('prayer');
    setShowTimePicker(false);
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

  const handleAddAlarm = () => {
    if (!alarmTitle.trim()) {
      Alert.alert('❌ Erreur', 'Veuillez entrer un titre pour l\'alarme');
      return;
    }

    const newAlarm = {
      id: Date.now(),
      title: alarmTitle.trim(),
      time: alarmTime,
      type: alarmType,
      enabled: true,
      content: alarmType === 'prayer' ? 
        PRAYERS[Math.floor(Math.random() * PRAYERS.length)] :
        BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)]
    };

    onAddAlarm(newAlarm);
    Alert.alert('✅ Succès', `Alarme "${alarmTitle}" créée à ${alarmTime}`);
    handleClose();
  };

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
          <TouchableOpacity onPress={handleAddAlarm} style={styles.modernSaveButton}>
            <Text style={styles.modernSaveButtonText}>Sauver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.addAlarmContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>📝 Titre de l'alarme</Text>
            <TextInput
              style={styles.modernFormInput}
              placeholder="Ex: Prière du matin"
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

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>🔔 Type d'alarme</Text>
            <View style={styles.modernTypeSelector}>
              <TouchableOpacity
                style={[styles.modernTypeOption, alarmType === 'prayer' && styles.modernSelectedType]}
                onPress={() => setAlarmType('prayer')}>
                <Text style={[styles.modernTypeText, alarmType === 'prayer' && styles.modernSelectedTypeText]}>
                  🙏 Prière
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernTypeOption, alarmType === 'verse' && styles.modernSelectedType]}
                onPress={() => setAlarmType('verse')}>
                <Text style={[styles.modernTypeText, alarmType === 'verse' && styles.modernSelectedTypeText]}>
                  📖 Verset
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>👁️ Aperçu du contenu</Text>
            <View style={styles.modernPreviewContainer}>
              {alarmType === 'prayer' ? (
                <Text style={styles.previewText}>
                  {PRAYERS[0].text}
                </Text>
              ) : (
                <>
                  <Text style={styles.previewText}>"{BIBLICAL_VERSES[0].text}"</Text>
                  <Text style={styles.previewRef}>— {BIBLICAL_VERSES[0].ref}</Text>
                </>
              )}
            </View>
          </View>
        </ScrollView>

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
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
        customer_phone_number: '+2250000000000', // Format requis
        customer_address: 'Cocody Angré', // Adresse par défaut
        customer_city: 'Abidjan',
        customer_country: 'CI', // Code pays Côte d'Ivoire
        customer_state: 'CI',
        customer_zip_code: '00225'
      };

      console.log('🚀 Envoi des données à CinetPay (avec infos cartes):', paymentData);

      // Appel POST à l'API CinetPay
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
        // Succès - URL de paiement générée
        console.log('✅ URL de paiement générée:', result.data.payment_url);
        return result.data.payment_url;
      } else {
        // Erreur dans la réponse
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
    // Vérifier que le montant est valide
    if (!amount || isNaN(amount) || parseInt(amount) < 100) {
      Alert.alert(
        '❌ Montant invalide',
        'Veuillez entrer un montant valide (minimum 100 FCFA)',
        [{ text: 'OK' }]
      );
      return;
    }

    // Générer l'URL de paiement avec le montant choisi
    const url = await generateCinetPayUrl(amount.toString());
    if (url) {
      setPaymentUrl(url);
      setShowCinetPayModal(true);
    }
  };

  const openFacebookPage = async () => {
    const facebookURL = 'https://web.facebook.com/profile.php?id=61577836107085';
    
    try {
      const supported = await Linking.canOpenURL(facebookURL);
      if (supported) {
        await Linking.openURL(facebookURL);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir Facebook');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Facebook');
    }
    setShowMenu(false);
  };

  // Modal CinetPay corrigé selon la documentation officielle
  const CinetPayModal = () => (
    <Modal
      visible={showCinetPayModal}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setShowCinetPayModal(false);
        setPaymentUrl(null); // Reset l'URL
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
          <View style={{ width: 80 }} />
        </View>
        
        {isGeneratingPayment ? (
          // Loading pendant la génération de l'URL
          <View style={styles.modernLoadingOverlay}>
            <Text style={styles.modernLoadingSpinner}>⏳</Text>
            <Text style={styles.modernLoadingText}>Génération du lien de paiement...</Text>
          </View>
        ) : paymentUrl ? (
          // WebView avec l'URL de paiement générée
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
              
              // Vérifier les URLs de succès CinetPay
              if (navState.url.includes('success') || 
                  navState.url.includes('payment_success') || 
                  navState.url.includes('completed') ||
                  navState.url.includes(CINETPAY_CONFIG.return_url)) {
                
                const donationText = donationAmount 
                  ? `Votre don de ${parseInt(donationAmount).toLocaleString()} FCFA a été réçu par la Radio Bonne Nouvelle.Que Dieu vous benisse .`
                  : 'Votre don a été traité avec succès via CinetPay.';
                
                Alert.alert(
                  '🎉 Paiement Réussi !',
                  `${donationText} Que Dieu vous bénisse !`,
                  [{
                    text: 'Amen 🙏',
                    onPress: () => {
                      setShowCinetPayModal(false);
                      setPaymentUrl(null);
                      // Réinitialiser le formulaire après succès
                      setDonationAmount('');
                      setDonorName('');
                      setDonorEmail('');
                    }
                  }]
                );
              }
              
              // Vérifier les URLs d'annulation
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
          // Erreur - pas d'URL générée
          <View style={styles.modernLoadingOverlay}>
            <Text style={styles.modernLoadingSpinner}>❌</Text>
            <Text style={styles.modernLoadingText}>Erreur de génération du paiement</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  // États pour les alarmes spirituelles
  const [alarms, setAlarms] = useState([
    { id: 1, title: "Prière du matin", time: "06:00", enabled: true, type: "prayer", content: PRAYERS[0] },
    { id: 2, title: "Verset du jour", time: "12:00", enabled: true, type: "verse", content: BIBLICAL_VERSES[0] },
    { id: 3, title: "Prière du soir", time: "20:00", enabled: false, type: "prayer", content: PRAYERS[2] },
  ]);
  
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(BIBLICAL_VERSES[0]);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showAlarmDetailModal, setShowAlarmDetailModal] = useState(false);
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  
  // Références pour les animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  const radioPlayerUrl = 'https://a4.asurahosting.com/public/radio_bonne_nouvelle/embed?theme=light';

  useEffect(() => {
    startRotationAnimation();
    const today = new Date().getDay();
    setDailyVerse(BIBLICAL_VERSES[today % BIBLICAL_VERSES.length]);
    
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

  const showAddAlarmModal_func = () => {
    setShowAddAlarmModal(true);
  };

  const handleAddAlarm = (newAlarm) => {
    setAlarms([...alarms, newAlarm]);
  };

  const testAlarm = (alarm) => {
    Alert.alert(
      '🔔 Test de l\'alarme',
      'Voulez-vous tester cette alarme?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tester', onPress: () => triggerAlarm(alarm) }
      ]
    );
  };

  const triggerAlarm = (alarm) => {
    const vibrationPattern = [500, 1000, 500, 1000];
    Vibration.vibrate(vibrationPattern, true);

    Alert.alert(
      `🔔 ${alarm.title}`,
      alarm.type === 'verse' ? `${alarm.content.text}\n\n— ${alarm.content.ref}` : alarm.content.text,
      [
        {
          text: 'Amen 🙏',
          style: 'default',
          onPress: () => {
            Vibration.cancel(); 
          }
        },
        {
          text: 'Rappeler dans 5 min',
          onPress: () => {
            Vibration.cancel();
            scheduleSnooze(alarm);
          }
        },
      ],
      {
        cancelable: false,
        onDismiss: () => {
          Vibration.cancel();
        }
      }
    );
  };

  const scheduleSnooze = (alarm) => {
    setTimeout(() => {
      Vibration.vibrate([500, 1000, 500, 1000], true);
      Alert.alert(`🔔 Rappel: ${alarm.title}`, "Il est temps de prier ou méditer 🙏");
    }, 5 * 60 * 1000);
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
      toValue: 300,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      setShowPlayer(false);
      setIsPlaying(false);
      setIsConnected(false);
      setWebViewKey(prev => prev + 1);
      slideAnim.setValue(300);
    });
  };

  const reloadPlayer = () => {
    if (!showPlayer) {
      showRadioPlayer();
    } else {
      setIsLoading(true);
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

  const getRandomVerse = () => {
    const randomVerse = BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
    setDailyVerse(randomVerse);
    setShowVerseModal(true);
  };

  // Menu moderne
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
            <Text style={[styles.modernMenuModalText, currentScreen === 'alarms' && {color: '#ffffff'}]}>Alarmes Spirituelles</Text>
            {currentScreen === 'alarms' && <Text style={styles.modernActiveIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modernMenuModalItem, currentScreen === 'donation' && styles.modernActiveMenuItem]}
            onPress={showDonationScreen}>
            <Text style={styles.modernMenuModalIcon}> 🎁</Text>
            <Text style={[styles.modernMenuModalText, currentScreen === 'donation' && {color: '#ffffff'}]}>Faire un Don</Text>
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
          <Text style={styles.modernStationName}>Alarmes Spirituelles</Text>
          <Text style={styles.modernStatusText}>{alarms.filter(a => a.enabled).length} alarmes actives</Text>
        </View>
        
        <TouchableOpacity 
          onPress={showAddAlarmModal_func}
          style={styles.modernAddButton}>
          <Text style={styles.modernAddIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modernAlarmsScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }} bounces={true}>
        <View style={styles.modernVerseCard}>
          <TouchableOpacity onPress={() => setShowVerseModal(true)}>
            <Text style={styles.modernVerseTitle}>📖 Verset à méditer</Text>
            <Text style={styles.modernVerseText}>"{dailyVerse.text}"</Text>
            <Text style={styles.modernVerseRef}>— {dailyVerse.ref}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getRandomVerse} style={styles.modernRefreshVerseBtn}>
            <Text style={styles.modernRefreshVerseText}>🔄 Nouveau verset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modernQuickActionsCard}>
          <Text style={styles.modernQuickActionsTitle}>Action d'aide à la Prière</Text>
          <View style={styles.modernQuickActionsRow}>
            <TouchableOpacity style={styles.modernQuickActionBtn} onPress={() => {
              Alert.alert('🙏 Prière', PRAYERS[Math.floor(Math.random() * PRAYERS.length)].text);
            }}>
              <Text style={styles.modernQuickActionIcon}>🙏</Text>
              <Text style={styles.modernQuickActionText}>Prière</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                  <Text style={styles.modernAlarmType}>
                    {alarm.type === 'prayer' ? '🙏 Prière' : '📖 Verset'}
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

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.modernContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

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

              <View style={styles.modernRadioLogo}>
                <Text style={styles.modernLogoText}>RBN</Text>
                <Text style={styles.modernLogoSubtext}>📻</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.modernTrackInfo}>
            <Text style={styles.modernTrackTitle}>
              {isConnected ? '🟢 Live Broadcast' : '🔴 Broadcast Offline'}
            </Text>
             <Image source={Logo} style={styles.modernLogo} />

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

                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    try {
                      console.log('🎵 Auto-play: Recherche du bouton play...');
                      let found = false;

                      const selectors = [
                        'button.btn.p-0.radio-control-play-button.btn-xl[title="Play"]',
                        'button.radio-control-play-button[aria-label="Play"]',
                        'button[class*="radio-control-play-button"]',
                        '.radio-control-play-button',
                        'button.btn.p-0.radio-control-play-button',
                        'div.radio-controls button[title="Play"]',
                        'button[type="button"][title="Play"][aria-label="Play"]'
                      ];

                      for (const selector of selectors) {
                        const btn = document.querySelector(selector);
                        if (btn && !found) {
                          const event = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                          });
                          btn.dispatchEvent(event);
                          console.log('✅ Auto-click réussi avec:', selector);
                          found = true;
                          break;
                        }
                      }

                      if (!found) {
                        const allButtons = document.querySelectorAll('button, [role="button"]');
                        allButtons.forEach(btn => {
                          const classes = btn.className || '';
                          const title = btn.getAttribute('title') || '';
                          const ariaLabel = btn.getAttribute('aria-label') || '';
                          
                          if ((classes.includes('radio-control-play-button') || 
                               title === 'Play' || ariaLabel === 'Play') && !found) {
                            
                            btn.click();
                            setTimeout(() => btn.click(), 100);
                            setTimeout(() => btn.click(), 200);
                            
                            console.log('✅ Auto-click par classe/attribut');
                            found = true;
                          }
                        });
                      }

                      if (found) {
                        setTimeout(() => {
                          const audioElements = document.querySelectorAll('audio, video');
                          audioElements.forEach(audio => {
                            if (audio.paused) {
                              audio.play().catch(e => console.log('Audio autoplay blocked:', e));
                            }
                          });
                          
                          const currentTitle = document.querySelector('.now-playing-title');
                          const currentArtist = document.querySelector('.now-playing-artist');
                          
                          if (currentTitle) {
                            const title = currentTitle.textContent || 'Live Broadcast';
                            window.ReactNativeWebView?.postMessage(JSON.stringify({
                              type: 'currentTrack',
                              title: title,
                              artist: currentArtist?.textContent || ''
                            }));
                          }
                          
                          window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'playbackStarted'
                          }));
                        }, 1000);
                      }

                      if (!found) {
                        console.log('❌ Bouton play non trouvé automatiquement');
                      }

                    } catch(e) {
                      console.log('❌ Erreur auto-play:', e);
                    }
                    true;
                  `);
                }, 3000);

                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    const titleObserver = () => {
                      const titleElement = document.querySelector('.now-playing-title, h4.now-playing-title, .current-title');
                      if (titleElement) {
                        const observer = new MutationObserver(() => {
                          const newTitle = titleElement.textContent || 'Live Broadcast';
                          console.log('🎵 Titre changé:', newTitle);
                          window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'trackChanged',
                            title: newTitle
                          }));
                        });

                        observer.observe(titleElement, {
                          childList: true,
                          subtree: true,
                          characterData: true
                        });
                      }
                    };
                    
                    titleObserver();
                    true;
                  `);
                }, 5000);
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
                
                <View style={styles.modernAlarmContent}>
                  {selectedAlarm.type === 'verse' && (
                    <>
                      <Text style={styles.modernVerseDetailText}>"{selectedAlarm.content.text}"</Text>
                      <Text style={styles.modernVerseDetailRef}>— {selectedAlarm.content.ref}</Text>
                    </>
                  )}
                  
                  {selectedAlarm.type === 'prayer' && (
                    <Text style={styles.modernPrayerDetailText}>{selectedAlarm.content.text}</Text>
                  )}
                </View>
                
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

      <Modal
        visible={showVerseModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowVerseModal(false)}>
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContainer}>
            <Text style={styles.modernModalTitle}>📖 Verset à méditer</Text>
            <Text style={styles.modernVerseModalText}>"{dailyVerse.text}"</Text>
            <Text style={styles.modernVerseModalRef}>— {dailyVerse.ref}</Text>
            
            <View style={styles.modernVerseModalButtons}>
              <TouchableOpacity
                style={styles.modernNewVerseBtn}
                onPress={getRandomVerse}>
                <Text style={styles.modernNewVerseText}>🔄 Nouveau verset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modernCloseModalBtn}
                onPress={() => setShowVerseModal(false)}>
                <Text style={styles.modernCloseModalText}>Fermer</Text>
              </TouchableOpacity>
            </View>
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

// STYLES MODERNES (mis à jour pour CinetPay)
const styles = StyleSheet.create({
  modernSafeArea: {
    flex: 1,
    backgroundColor: '#1a4a1a',
  },
  modernContainer: {
    flex: 1,
    backgroundColor: '#1a4a1a',
  },
  
  // Menu moderne
  modernMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernMenuModal: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 30,
    width: width * 0.85,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  modernMenuModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  modernMenuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernActiveMenuItem: {
    backgroundColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.4,
  },
  modernMenuModalIcon: {
    fontSize: 28,
    marginRight: 20,
    width: 35,
    textAlign: 'center',
  },
  modernMenuModalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modernActiveIndicator: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernMenuModalClose: {
    marginTop: 25,
    paddingVertical: 18,
    backgroundColor: '#6c757d',
    borderRadius: 20,
    alignItems: 'center',
  },
  modernMenuModalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Header moderne
  modernRadioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#1a4a1a',
  },
  modernHeaderButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modernMenuIcon: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernReloadIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  modernHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modernLogoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernHeaderLogo: {
    width: 150,
    height: 150,
    marginTop:200,
    borderRadius:15,
  },
  modernStationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  modernHeaderSubtitle1: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.9,
    marginBottom: 8,
  },
  modernStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#666',
    marginRight: 10,
  },
  modernActiveDot: {
    backgroundColor: '#4caf50',
  },
  modernStatusText: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
  },
  modernAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modernAddIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Radio section moderne
  modernAlbumSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modernRadioWaveContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernRadioTower: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modernAntenna: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  modernAntennaBase: {
    width: 10,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 5,
  },
  modernAntennaRod: {
    width: 5,
    height: 90,
    backgroundColor: '#ffffff',
    borderRadius: 2.5,
  },
  modernAntennaTop: {
    width: 15,
    height: 15,
    backgroundColor: '#ff4444',
    borderRadius: 7.5,
  },
  modernRadioWave: {
    position: 'absolute',
    borderWidth: 4,
    borderRadius: 9999,
  },
  modernWave1: {
    width: 130,
    height: 130,
    borderColor: '#888888',
  },
  modernWave2: {
    width: 170,
    height: 170,
    borderColor: '#aaaaaa',
  },
  modernWave3: {
    width: 210,
    height: 210,
    borderColor: '#cccccc',
  },
  modernWave4: {
    width: 250,
    height: 250,
    borderColor: '#ffffff',
  },
  modernRadioLogo: {
    position: 'absolute',
    bottom: 90,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
    borderWidth: 5,
    borderColor: '#ffffff',
  },
  modernLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modernLogoSubtext: {
    fontSize: 18,
    marginTop: -2,
  },
  modernTrackInfo: {
    alignItems: 'center',
  },
  modernLogo:{
    width:130,
    height:130,
    borderRadius:15,
  },
  modernTrackTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modernWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernWaveBar: {
    width: 4,
    height: 24,
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  modernControlsSection: {
    paddingHorizontal: 50,
    paddingVertical: 25,
  },
  modernProgressContainer: {
    alignItems: 'center',
  },
  modernProgressTrack: {
    width: width - 100,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 15,
  },
  modernProgressFill: {
    height: 6,
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },

  // Player moderne
  modernPlayerContainer: {
    position: 'absolute',
    top: 280,
    left: 20,
    right: 20,
    height: height * 0.23,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    overflow: 'hidden',
  },
  modernPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modernPlayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modernClosePlayer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernCloseIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modernWebView: {
    flex: 1,
  },
  modernLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernLoadingSpinner: {
    fontSize: 36,
    color: '#2e7d32',
    marginBottom: 15,
  },
  modernLoadingText: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: '600',
  },

  // Alarmes modernes
  modernAlarmsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modernVerseCard: {
    backgroundColor: '#f4f4f4ff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernVerseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#141313ff',
    marginBottom: 15,
  },
  modernVerseText: {
    fontSize: 17,
    color: '#292525ff',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 12,
  },
  modernVerseRef: {
    fontSize: 15,
    color: 'rgba(25, 23, 23, 0.8)',
    textAlign: 'right',
    marginBottom: 20,
  },
  modernRefreshVerseBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(29, 27, 27, 0.2)',
    borderRadius: 25,
  },
  modernRefreshVerseText: {
    color: '#161515ff',
    fontSize: 14,
    fontWeight: '600',
  },
  modernQuickActionsCard: {
    backgroundColor: '#f4f4f4ff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  modernQuickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 20,
  },
  modernQuickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modernQuickActionBtn: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: ' rgba(65, 59, 59, 0.1)',
    borderRadius: 15,
    minWidth: 140,
  },
  modernQuickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modernQuickActionText: {
    color: '#0e0d0dff',
    fontSize: 14,
    fontWeight: '600',
  },
  modernAlarmsListCard: {
    backgroundColor: '#f4f4f4ff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 40,
  },
  modernAlarmsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a0aff',
    marginBottom: 20,
  },
  modernAlarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(65, 59, 59, 0.1)',
    borderRadius: 15,
    marginBottom: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  modernAlarmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#433a3aff',
    marginTop: 4,
  },
  modernAlarmType: {
    fontSize: 14,
    color: '#403a3aff',
    marginTop: 4,
  },
  modernAlarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modernTestBtn: {
    padding: 10,
  },
  modernTestIcon: {
    fontSize: 18,
  },
  modernDeleteBtn: {
    padding: 8,
  },
  modernDeleteIcon: {
    fontSize: 18,
  },
  modernNoAlarmsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modernNoAlarmsText: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 20,
  },
  modernAddFirstAlarmBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: '#4caf50',
    borderRadius: 30,
  },
  modernAddFirstAlarmText: {
    color: '#e3d7d7ff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal moderne pour ajouter alarme
  addAlarmContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  addAlarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: '#2e7d32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addAlarmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modernCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  modernCancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  modernSaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  modernSaveButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addAlarmContent: {
    flex: 1,
    padding: 25,
  },
  formGroup: {
    marginBottom: 30,
  },
  formLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modernFormInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 17,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernTimeButton: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernTimeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  modernTypeSelector: {
    flexDirection: 'row',
    gap: 15,
  },
  modernTypeOption: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  modernSelectedType: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  modernTypeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  modernSelectedTypeText: {
    color: '#ffffff',
  },
  modernPreviewContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  previewText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  previewRef: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginTop: 10,
  },

  // Donation moderne avec saisie du montant
  modernDonationContainer: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  modernMainDonationCard: {
    backgroundColor: '#f4f4f4ff',
    borderRadius: 25,
    padding: 35,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  modernDonationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f4646ff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modernDonationSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  modernAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modernQuickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  modernQuickAmountBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 80,
    alignItems: 'center',
  },
  modernSelectedAmountBtn: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  modernQuickAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  modernSelectedAmountText: {
    color: '#ffffff',
  },
  modernCustomAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modernCustomAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modernAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  modernCurrencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 10,
  },
  modernDonorInfoContainer: {
    marginBottom: 25,
    gap: 10,
  },
  modernDonorInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  modernMainDonationBtn: {
    backgroundColor: 'rgba(65, 59, 59, 0.1)',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 50,
    alignItems: 'center',
    minWidth: '100%',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modernDonationBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b2c2dff',
    marginBottom: 8,
  },
  modernDonationBtnDisabled: {
    opacity: 0.6,
  },
  don: {
    fontSize: 24,
  },
  modernPaymentInfo: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modernPaymentDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  modernPaymentNote: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    marginBottom: 15,
  },
  modernNoteText: {
    fontSize: 13,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  modernThankYouCard: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modernThankYouText: {
    fontSize: 18,
    color: '#FFD700',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },

  // CinetPay Modal (remplace MoneyFusion)
  cinetPayContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modernCinetPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: '#2e7d32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modernCinetPayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 30,
  },
  modernBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  modernBackButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  cinetPayWebView: {
    flex: 1,
  },

  // Modals modernes
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 30,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  modernModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  modernAlarmDetailTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 25,
  },
  modernAlarmContent: {
    backgroundColor: '#f8f9fa',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    minHeight: 120,
  },
  modernVerseDetailText: {
    fontSize: 17,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 27,
    marginBottom: 18,
  },
  modernVerseDetailRef: {
    fontSize: 15,
    color: '#666',
    textAlign: 'right',
    fontWeight: '600',
  },
  modernPrayerDetailText: {
    fontSize: 17,
    color: '#333',
    lineHeight: 27,
    textAlign: 'center',
  },
  modernCloseModalBtn: {
    paddingVertical: 18,
    paddingHorizontal: 35,
    backgroundColor: '#697469ff',
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
  },
  modernCloseModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modernVerseModalText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 30,
    marginBottom: 20,
    textAlign: 'center',
  },
  modernVerseModalRef: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 30,
  },
  modernVerseModalButtons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  modernNewVerseBtn: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    alignItems: 'center',
  },
  modernNewVerseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

