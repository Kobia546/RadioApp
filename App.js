import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
  Animated,
  Linking,
  Platform,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');


function hexToString(hex) {
  try {
    return hex.split(/(.{2})/).filter(Boolean).map(h => String.fromCharCode(parseInt(h, 16))).join('');
  } catch (error) {
    console.log('❌ Erreur conversion hex:', error);
    return null;
  }
}

function decodeQRCode(qrText) {
  console.log('🔍 Décodage QR:', qrText);
  
  const cleanText = qrText.trim();
  let section = null;
  let hexPart = null;
  
  if (cleanText.startsWith('4') && cleanText.endsWith('5')) {
  
    hexPart = cleanText.slice(1, -1);
    console.log('🙏 Format MINISTERE détecté, hex:', hexPart);
    
    const decodedString = hexToString(hexPart);
    console.log('Décodé:', decodedString);
    if (decodedString && decodedString.toUpperCase() === 'MINISTERE') {
      section = 'MINISTERE';
    }
    
  } else if (cleanText.startsWith('5') && cleanText.endsWith('5')) {
  
    hexPart = cleanText.slice(1, -1);
    console.log('⛪ Format EGLISE détecté, hex:', hexPart);
    
    const decodedString = hexToString(hexPart);
    console.log('Décodé:', decodedString);
    if (decodedString && decodedString.toUpperCase() === 'EGLISE') {
      section = 'EGLISE';
    }
    
  } else if (cleanText.startsWith('9') && cleanText.endsWith('6')) {
  
    hexPart = cleanText.slice(1, -1);
    console.log('📻 Format RADIO détecté, hex:', hexPart);
    
    const decodedString = hexToString(hexPart);
    console.log('Décodé:', decodedString);
    if (decodedString && decodedString.toUpperCase() === 'RADIO') {
      section = 'RADIO';
    }
  }
  
  console.log('✅ Section identifiée:', section);
  return section;
}


  

// Configuration CinetPay
const CINETPAY_CONFIG = {
  apiUrl: 'https://api-checkout.cinetpay.com/v2/payment',
  apikey: '1627998221687ae5cd78f184.04992672',
  site_id: '105902489',
  return_url: 'https://success.cinetpay.com/',
  cancel_url: 'https://cancel.cinetpay.com/',
  notify_url: 'https://notify.cinetpay.com/',
};

// SONS SYSTÈME POUR ALARMES
const ALARM_SOUNDS = [
  { id: 'default', name: 'Son par défaut', pattern: [200, 300, 200, 300] },
  { id: 'bell', name: '🔔 Cloche', pattern: [500, 200, 500, 200, 500, 200] },
  { id: 'chime', name: '🎵 Carillon', pattern: [100, 100, 100, 100, 100, 500] },
  { id: 'ding', name: '🔕 Ding', pattern: [300, 300] },
  { id: 'notification', name: '📢 Notification', pattern: [100, 200, 100, 200, 100, 200] },
];

// Types de dons pour chaque section
const DONATION_TYPES = {
  EGLISE: [
    { id: 'dimes', name: ' Dîmes',  color: '#4caf50' },
    { id: 'offrandes', name: ' Offrandes',  color: '#2196f3' },
    { id: 'voeux', name: ' Vœux',  color: '#ff9800' },
    { id: 'engagements', name: ' Engagements',  color: '#9c27b0' },
    { id: 'action_grace', name: ' Action de Grâce',  color: '#e91e63' },
    { id: 'soutien_programme', name: ' Soutien Programme',  color: '#607d8b' },
  ],
  MINISTERE: [
 { id: 'dimes', name: ' Dîmes',  color: '#4caf50' },
    { id: 'offrandes', name: ' Offrandes',  color: '#2196f3' },
    { id: 'voeux', name: ' Vœux',  color: '#ff9800' },
    { id: 'engagements', name: ' Engagements',  color: '#9c27b0' },
    { id: 'action_grace', name: ' Action de Grâce',  color: '#e91e63' },
    { id: 'soutien_programme', name: ' Soutien Programme',  color: '#607d8b' },
  ],
  RADIO: [
    { id: 'soutien_radio', name: ' Soutien Radio', color: '#4caf50' },
  ]
};

// Taux de conversion vers CFA
const EXCHANGE_RATES = {
  CFA: 1,
  EUR: 656,
  USD: 600,
};

const CURRENCIES = [
  { code: 'CFA', symbol: 'f', name: 'Franc CFA', color: '#4caf50', gradient: ['#4caf50', '#66bb6a'] },
  { code: 'EUR', symbol: '€', name: 'Euro', color: '#2e7d32', gradient: ['#2e7d32', '#4caf50'] },
  { code: 'USD', symbol: '$', name: 'Dollar US', color: '#1b5e20', gradient: ['#1b5e20', '#2e7d32'] },
];

// Logo par défaut (placeholder)
const Logo = require('./assets/images/Logo.jpeg'); // Remplace par ton logo

// Composant Écran d'Accueil
const HomeScreen = ({ onNavigate }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems = [
    {
      id: 'ministere',
      title: 'FEA BENIDEDIEU   Ministries',
      subtitle: 'Soutenir l\'Homme de Dieu',
      // Option 1: Image locale
      image: require('../Radioci/assets/images/ministere.jpeg'),
      // Option 2: Image en ligne (décommentez si vous préférez)
      // imageUri: 'https://votre-domaine.com/images/ministere.png',
      colors: ['#1976d2', '#42a5f5'],
      destination: 'ministere'
    },
    {
      id: 'eglise',
      title: 'Eglise MC2G            ',
      subtitle: 'Dîmes & Offrandes',
      image: require('../Radioci/assets/images/eglise.jpeg'),
      // imageUri: 'https://votre-domaine.com/images/eglise.png',
      colors: ['#cd8033ff', '#ffb74d'],
      destination: 'eglise'
    },
    {
      id: 'radio',
      title: 'Radio Bonne Nouvelle',
      subtitle: 'Écouter en Direct',
      image: require('../Radioci/assets/images/Logo.jpeg'),
      // imageUri: 'https://votre-domaine.com/images/radio.png',
      colors: ['#388e3c', '#66bb6a'],
      destination: 'radio'
    },
    {
      id: 'qrcode',
      title: 'QR      Code',
      subtitle: 'Scanner un Code',
      image: require('../Radioci/assets/images/qrcode.png'),
      // imageUri: 'https://votre-domaine.com/images/qrcode.png',
      colors: ['#7b1fa2', '#ba68c8'],
      destination: 'qrcode'
    }
  ];

  return (
    <LinearGradient
      colors={['#F4FCEE', '#F4FCEE']}
      style={styles.homeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a4a1a" />
      
      {/* Header */}
      <Animated.View style={[
        styles.homeHeader,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Text style={styles.homeTitle}>Oeuvres Spirituelles</Text>
        
        <View style={styles.frequencyContainer}>
          <Text style={styles.frequency}>Bienvenue</Text>
        </View>
      </Animated.View>

      {/* Menu Grid */}
      <ScrollView 
        contentContainerStyle={styles.menuGrid}
        showsVerticalScrollIndicator={false}>
        
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.menuCardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
            
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => onNavigate(item.destination)}
              activeOpacity={0.8}>
              
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuCardInner}>
                
                <View style={styles.iconContainer}>
                  {/* Utilisation d'Image au lieu d'emoji */}
                  <Image
                    source={item.image}
                    // Ou pour une image en ligne:
                    // source={{ uri: item.imageUri }}
                    style={styles.menuImage}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  <Text style={styles.menuArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Footer */}
      <Animated.View style={[
        styles.homeFooter,
        { opacity: fadeAnim }
      ]}>
        <Text style={styles.footerText}>✨ Que Dieu vous bénisse ✨</Text>
      </Animated.View>
    </LinearGradient>
  );
};

// Composant Radio Complet
const RadioScreen = ({ onNavigate, onBack }) => {
  const [currentScreen, setCurrentScreen] = useState('radio');
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [alarms, setAlarms] = useState([
    { id: 1, title: "Réveil du matin", time: "06:00", enabled: true, sound: 'bell' },
    { id: 2, title: "Pause déjeuner", time: "12:00", enabled: true, sound: 'chime' },
    { id: 3, title: "Fin de journée", time: "18:00", enabled: false, sound: 'default' },
  ]);
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  const radioPlayerUrl = 'https://a4.asurahosting.com:7400/radio.mp3';

  useEffect(() => {
    startAnimations();
    setTimeout(() => {
      showRadioPlayer();
    }, 1000);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
    } else {
      stopAnimations();
    }
  }, [isPlaying]);

  const startAnimations = () => {
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

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showRadioPlayer = () => {
    setIsLoading(true);
    setShowPlayer(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      setIsPlaying(true);
    }, 2500);
  };

  const reloadPlayer = () => {
    if (!showPlayer) {
      showRadioPlayer();
    } else {
      setIsLoading(true);
      setIsPlaying(false);
      setIsConnected(false);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsConnected(true);
        setIsPlaying(true);
      }, 2000);
    }
  };

  const openFacebookPage = async () => {
    try {
      await Linking.openURL('https://www.facebook.com/profile.php?id=61577836107085');
    } catch (error) {
      Alert.alert('Info', 'Impossible d\'ouvrir Facebook');
    }
  };

  // Menu Modal
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
            style={styles.modernMenuModalItem}
            onPress={() => {
              onNavigate('donation', { section: 'RADIO' });
              setShowMenu(false);
            }}>
            <Text style={styles.modernMenuModalIcon}>🎁</Text>
            <Text style={styles.modernMenuModalText}>Soutenir la Radio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernMenuModalItem}
            onPress={() => {
              openFacebookPage();
              setShowMenu(false);
            }}>
            <Image style={styles.imageSocial} 
              source={require('../Radioci/assets/images/facebook.png')}/>
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

  // Écran Radio Principal
  const RadioMainScreen = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <LinearGradient
        colors={['#1a4a1a', '#2e7d32']}
        style={styles.modernContainer}>
        
        {/* Header */}
        <View style={styles.modernRadioHeader}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.modernHeaderButton}>
            <Text style={styles.modernMenuIcon}>←</Text>
          </TouchableOpacity>

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

        {/* Radio Tower & Logo */}
        <View style={styles.modernAlbumSection}>
          <Animated.View
            style={[
              styles.modernRadioWaveContainer,
              {
                transform: [{ scale: pulseAnim }]
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
                <Image source={Logo} style={styles.modernLogoImage} />
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

        {/* Bottom Actions */}
        <View style={styles.bottomActionsContainer}>
          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={() => onNavigate('donation', { section: 'RADIO' })}>
            <View style={styles.bottomButtonIconContainer}>
              <Text style={styles.bottomButtonIcon}>🎁</Text>
            </View>
            <Text style={styles.bottomButtonText}>
              Soutenir la Radio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={openFacebookPage}>
            <View style={styles.bottomButtonIconContainer}>
              <Image style={styles.imageSocial} 
              source={require('../Radioci/assets/images/facebook.png')}/>
            </View>
            <Text style={styles.bottomButtonText}>
              Suivez-nous sur Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* WebView Player caché */}
        {showPlayer && (
          <View style={styles.hiddenWebView}>
            <WebView
              ref={webViewRef}
              source={{ uri: radioPlayerUrl }}
              style={styles.modernWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              startInLoadingState={true}
              onLoad={() => {
                console.log('Player chargé!');
                setIsLoading(false);
                setIsConnected(true);
                setIsPlaying(true);
              }}
              onError={() => {
                Alert.alert('Erreur', 'Impossible de charger le player');
                setIsLoading(false);
              }}
            />
          </View>
        )}
      </LinearGradient>
    );
  };

  // Écran Alarmes
  const AlarmsScreen = () => (
    <LinearGradient
      colors={['#1a4a1a', '#2e7d32']}
      style={styles.modernContainer}>
      
      {/* Header */}
      <View style={styles.modernRadioHeader}>
        <TouchableOpacity 
          onPress={() => setCurrentScreen('radio')}
          style={styles.modernHeaderButton}>
          <Text style={styles.modernMenuIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.modernHeaderCenter}>
          <Text style={styles.modernStationName}>Mes Alarmes</Text>
          <Text style={styles.modernStatusText}>{alarms.filter(a => a.enabled).length} alarmes actives</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setShowAddAlarmModal(true)}
          style={styles.modernAddButton}>
          <Text style={styles.modernAddIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modernAlarmsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.modernAlarmsListCard}>
          <Text style={styles.modernAlarmsListTitle}>Mes alarmes ({alarms.length})</Text>
          
          {alarms.map((alarm) => (
            <View key={alarm.id} style={[styles.modernAlarmItem, !alarm.enabled && styles.modernDisabledAlarm]}>
              <TouchableOpacity style={styles.modernAlarmMainInfo}>
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
                  onPress={() => Alert.alert('Test', `Test de l'alarme ${alarm.title}`)}
                  style={styles.modernTestBtn}>
                  <Text style={styles.modernTestIcon}>▶️</Text>
                </TouchableOpacity>
                
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => {
                    setAlarms(alarms.map(a => 
                      a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
                    ));
                  }}
                  trackColor={{ false: '#767577', true: '#4caf50' }}
                  thumbColor={alarm.enabled ? '#ffffff' : '#f4f3f4'}
                />
                
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Supprimer l\'alarme',
                      'Êtes-vous sûr?',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Supprimer', style: 'destructive', onPress: () => {
                          setAlarms(alarms.filter(a => a.id !== alarm.id));
                        }}
                      ]
                    );
                  }}
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
                onPress={() => setShowAddAlarmModal(true)}
                style={styles.modernAddFirstAlarmBtn}>
                <Text style={styles.modernAddFirstAlarmText}>➕ Créer ma première alarme</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );

  // Modal Ajouter Alarme
  const AddAlarmModal = () => {
    const [alarmTitle, setAlarmTitle] = useState('');
    const [alarmTime, setAlarmTime] = useState('07:00');

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
        sound: 'default',
      };

      setAlarms([...alarms, newAlarm]);
      Alert.alert('✅ Succès', `Alarme "${alarmTitle}" créée à ${alarmTime}`);
      setShowAddAlarmModal(false);
      setAlarmTitle('');
      setAlarmTime('07:00');
    };

    return (
      <Modal
        visible={showAddAlarmModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddAlarmModal(false)}>
        <SafeAreaView style={styles.addAlarmContainer}>
          <View style={styles.addAlarmHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddAlarmModal(false)} 
              style={styles.modernCancelButton}>
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
              <TextInput
                style={styles.modernFormInput}
                placeholder="07:00"
                value={alarmTime}
                onChangeText={setAlarmTime}
              />
            </View>

            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity onPress={handleAddAlarm} style={styles.modernSaveButtonBottom}>
                <Text style={styles.modernSaveButtonBottomText}>💾 Sauvegarder l'alarme</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.modernSafeArea}>
      {currentScreen === 'radio' ? <RadioMainScreen /> : <AlarmsScreen />}
      <MenuOverlay />
      <AddAlarmModal />
    </View>
  );
};

// Composant de Sélection de Type de Don
const DonationTypeSelector = ({ visible, section, onClose, onSelect }) => {
  const types = DONATION_TYPES[section] || [];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Choisir le type de don</Text>
          <Text style={styles.selectorSubtitle}>
            Section: {section === 'EGLISE' ? 'Église' : section === 'MINISTERE' ? 'Ministère' : 'Radio'}
          </Text>
          
          <ScrollView style={styles.typesList}>
            {types.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeItem, { borderLeftColor: type.color }]}
                onPress={() => onSelect(type)}>
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const QRCodeScreen = ({ onNavigate, onBack }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

 // 🔥 REMPLACE TA FONCTION handleQRResult EXISTANTE PAR CELLE-CI :

const handleQRResult = (scannedText) => {
  console.log('🔍 QR Code scanné:', scannedText);
  
  // Utiliser la nouvelle fonction de décodage
  const decodedSection = decodeQRCode(scannedText);
  
  if (decodedSection) {
    // ✅ Code reconnu : aller directement vers la section de don
    console.log('✅ QR Code valide détecté:', decodedSection);
    setScanned(false);
    setIsProcessing(false);
    onNavigate('donation', { section: decodedSection, fromQR: true });
    
  } else {
    // ❌ Code non reconnu : afficher l'alerte d'erreur
    Alert.alert(
      '❌ QR Code Non Reconnu',
      `Code scanné: "${scannedText}"\n\nCe n'est pas un QR code valide de Radio Bonne Nouvelle.\n\nFormats attendus:\n• Ministère: 4[code]6\n• Église: 5[code]5\n• Radio: 9[code]6`,
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
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    console.log('📱 Barcode scanné - Type:', type, 'Data:', data);
    handleQRResult(data);
  };

  const resetScanning = () => {
    setScanned(false);
    setIsProcessing(false);
  };

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
          <Text style={styles.qrTitle}>Scanner QR Code</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.qrPermissionContainer}>
          <Text style={styles.qrPermissionTitle}>📷 Accès Caméra Requis</Text>
          <Text style={styles.qrPermissionText}>
            Pour scanner les QR codes, l'application a besoin d'accéder à votre caméra.
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

  return (
    <LinearGradient
      colors={['#1a4a1a', '#2e7d32']}
      style={styles.qrContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.qrHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.qrTitle}>Scanner QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.qrCameraArea}>
        <CameraView
          style={styles.qrCamera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        {/* Overlay avec cadre de scan */}
        <View style={styles.qrOverlay}>
          <View style={styles.qrOverlayTop} />
          <View style={styles.qrOverlayMiddle}>
            <View style={styles.qrOverlaySide} />
            <View style={[styles.qrFrame, isProcessing && styles.qrFrameScanning]}>
              <View style={styles.qrFrameCorner} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerTopRight]} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerBottomLeft]} />
              <View style={[styles.qrFrameCorner, styles.qrFrameCornerBottomRight]} />
            </View>
            <View style={styles.qrOverlaySide} />
          </View>
          <View style={styles.qrOverlayBottom} />
        </View>
      </View>

      <View style={styles.qrInstructions}>
        <Text style={styles.qrInstructionTitle}>
          {isProcessing ? '🔍 Traitement...' : '📱 Positionnez le QR Code dans le cadre'}
        </Text>
        <Text style={styles.qrInstructionText}>
          Scannez les QR codes disponibles sur les supports 
        </Text>
        
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

// Composant Ministère
const MinistereScreen = ({ onNavigate, onBack }) => {
  const openFacebook = () => {
    Linking.openURL('https://www.facebook.com/profile.php?id=61577836107085').catch(() => {
      Alert.alert('Info', 'Impossible d\'ouvrir Facebook');
    });
  };

  const openTikTok = () => {
    Linking.openURL('https://www.tiktok.com/@fea_benidedieu_officiel?_t=ZM-8z1GqWDxfZY&_r=1').catch(() => {
      Alert.alert('Info', 'Impossible d\'ouvrir TikTok');
    });
  };

  return (
    <LinearGradient
      colors={['#2e7d32', '#b2d1b2ff']}
      style={styles.sectionContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.sectionHeader}>
        <View style={styles.retour}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
         </View>
          <View style={styles.headerImageContainer}>
          <Image
            source={require('../Radioci/assets/images/ministere.jpeg')}
           
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.sectionTitle}>FEA BENIDEDIEU Ministries</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.sectionContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Soutenir l'Homme de Dieu</Text>
          <Text style={styles.welcomeText}>
            Votre soutien aide à l'expansion du Royaume de Dieu à travers le ministère.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#1976d2' }]}
          onPress={() => onNavigate('donation', { section: 'MINISTERE' })}>
          <Text style={styles.actionIcon}>🎁</Text>
          <Text style={styles.actionText}>Faire un Don au Ministère 
             </Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Se connecter Via:</Text>
          
          <TouchableOpacity style={styles.socialButton} onPress={openFacebook}>
              <Image style={styles.imageSocial} 
              source={require('../Radioci/assets/images/facebook.png')}/>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={openTikTok}>
            <Image style={styles.imageSocial} 
              source={require('../Radioci/assets/images/tik-tok.png')}/>
            <Text style={styles.socialText}>TikTok</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Composant Église
const EgliseScreen = ({ onNavigate, onBack }) => {
  const openWebsite = () => {
    Linking.openURL('https://feabenidedieu.org').catch(() => {
      Alert.alert('Info', 'Impossible d\'ouvrir le site web');
    });
  };

  const openFacebook = () => {
    Linking.openURL('https://https://www.facebook.com/share/1EUR7faWv4').catch(() => {
      Alert.alert('Info', 'Impossible d\'ouvrir Facebook');
    });
  };

  return (
    <LinearGradient
     colors={['#2e7d32', '#b2d1b2ff']}
      style={styles.sectionContainer}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.sectionHeader}>
        <View style={styles.retour}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        </View>
        <View style={styles.headerImageContainer}>
          <Image
            source={require('../Radioci/assets/images/eglise.jpeg')}
            // Ou pour une image en ligne:
            // source={{ uri: 'https://votre-domaine.com/images/eglise.png' }}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.sectionTitle}>Eglise MC2G </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.sectionContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Maison de Prière</Text>
          <Text style={styles.welcomeText}>
            Contribuez à l'œuvre de Dieu à travers vos dîmes, offrandes et soutiens.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#388e3c' }]}
          onPress={() => onNavigate('donation', { section: 'EGLISE' })}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Dîmes & Offrandes</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Liens utiles</Text>
          
          <TouchableOpacity style={styles.socialButton} onPress={openWebsite}>
            <Text style={styles.socialIcon}>🌐</Text>
            <Text style={styles.socialText}>Site Web</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={openFacebook}>
             <Image style={styles.imageSocial} 
              source={require('../Radioci/assets/images/facebook.png')}/>
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// NOUVEAU: Composant Dropdown pour Type de Don
const DonationTypeDropdown = ({ section, selectedType, onSelectType }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const types = DONATION_TYPES[section] || [];

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.inputLabel}>🎯 Type de don :</Text>
      
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}>
        
        <View style={styles.dropdownButtonContent}>
          
          <Text style={styles.dropdownText}>
            {selectedType ? selectedType.name : 'Choisir le type de don...'}
          </Text>
          <Text style={[styles.dropdownArrow, showDropdown && styles.dropdownArrowUp]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownList}>
          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.dropdownItem,
                selectedType?.id === type.id && styles.dropdownItemSelected
              ]}
              onPress={() => {
                onSelectType(type);
                setShowDropdown(false);
              }}>
              
              <Text style={styles.dropdownItemIcon}>{type.icon}</Text>
              <Text style={[
                styles.dropdownItemText,
                selectedType?.id === type.id && styles.dropdownItemTextSelected
              ]}>
                {type.name}
              </Text>
              
              {selectedType?.id === type.id && (
                <Text style={styles.dropdownItemCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Composant de Don Complet avec CinetPay DIRECT - MODIFIÉ
const EnhancedDonationScreen = ({ section, donationType, fromQR, onBack }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('CFA');
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [showCinetPayModal, setShowCinetPayModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  
  // NOUVEAU: State pour le type sélectionné quand c'est depuis QR
  const [selectedDonationType, setSelectedDonationType] = useState(donationType);

  const sectionName = section === 'EGLISE' ? 'Église' : section === 'MINISTERE' ? 'Ministère' : 'Radio';
  const sectionImage = section === 'EGLISE' 
    ? require('../Radioci/assets/images/eglise.jpeg')
    : section === 'MINISTERE' 
    ? require('../Radioci/assets/images/ministere.jpeg')
    : require('../Radioci/assets/images/Logo.jpeg');
  const typeInfo = selectedDonationType || { name: 'Don', icon: '🎁' };

  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  const convertToCFA = (amount, fromCurrency) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return Math.round(numAmount * EXCHANGE_RATES[fromCurrency]);
  };

  const amountInCFA = convertToCFA(donationAmount, selectedCurrency);

  // GÉNÉRATION DIRECTE CINETPAY
  const generateCinetPayUrl = async (amount, currency = 'XOF') => {
    setIsGeneratingPayment(true);
    
    try {
      const transactionId = 'RBN_' + Date.now();
      
      
      const description = `${typeInfo.name} - ${sectionName} - ${donorName}`;
      
      const paymentData = {
        apikey: CINETPAY_CONFIG.apikey,
        site_id: CINETPAY_CONFIG.site_id,
        transaction_id: transactionId,
        amount: parseInt(amount),
        currency: currency,
        description: description, // ← ICI C'EST CE QUI COMPTE !
        return_url: CINETPAY_CONFIG.return_url,
        notify_url: CINETPAY_CONFIG.notify_url,
        channels: 'ALL', 
        lang: 'fr',
        customer_id: '1',
        customer_name: donorName || 'Donateur',
        customer_surname: donorName || 'Anonyme',
        customer_email: donorEmail || 'contact@radiobonnenouvelle.com',
        customer_phone_number: '+2250000000000',
        customer_address: 'Cocody Angré',
        customer_city: 'Abidjan',
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225'
      };

      console.log('🚀 Envoi des données à CinetPay:', paymentData);
      console.log('📋 Description pour départage:', description);

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

  const handleDonation = async () => {
    // NOUVEAU: Vérifier qu'un type est sélectionné pour toutes les sections sauf RADIO
    if (section !== 'RADIO' && !selectedDonationType) {
      Alert.alert('❌ Erreur', 'Veuillez choisir un type de don');
      return;
    }

    if (!donationAmount || !donorName) {
      Alert.alert('❌ Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const cfaAmount = amountInCFA;
    if (cfaAmount < 100) {
      Alert.alert('❌ Montant trop faible', 'Le montant minimum est de 100 FCFA');
      return;
    }

    if (selectedCurrency !== 'CFA') {
      Alert.alert(
        '💰 Confirmation du don',
        `Montant: ${donationAmount} ${currentCurrency.symbol}\nÉquivalent: ${cfaAmount.toLocaleString()} FCFA\n\nContinuer avec le paiement?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Confirmer',
            onPress: async () => {
              const url = await generateCinetPayUrl(cfaAmount);
              if (url) {
                setPaymentUrl(url);
                setShowCinetPayModal(true);
              }
            }
          }
        ]
      );
    } else {
      const url = await generateCinetPayUrl(cfaAmount);
      if (url) {
        setPaymentUrl(url);
        setShowCinetPayModal(true);
      }
    }
  };

  const selectCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setDonationAmount('');
    setShowCurrencyModal(false);
  };

  // Modal CinetPay
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
                  ? `Votre don de ${parseInt(donationAmount).toLocaleString()} ${currentCurrency.symbol} a été reçu par la ${sectionName}.`
                  : 'Votre don a été traité avec succès via CinetPay.';
                
                Alert.alert(
                  '🎉 Paiement Réussi !',
                  `${donationText}\n\nVous verrez "${typeInfo.name} - ${sectionName} - ${donorName}" dans vos relevés CinetPay.\n\nQue Dieu vous bénisse !`,
                  [{
                    text: 'Amen 🙏',
                    onPress: () => {
                      setShowCinetPayModal(false);
                      setPaymentUrl(null);
                      setDonationAmount('');
                      setDonorName('');
                      setDonorEmail('');
                      onBack();
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
                      const newUrl = await generateCinetPayUrl(amountInCFA);
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

  // Modal de sélection de devise
  const CurrencyModal = () => (
    <Modal
      visible={showCurrencyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCurrencyModal(false)}>
      <View style={styles.currencyModalOverlay}>
        <View style={styles.currencyModalContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currencyModalGradient}>
            
            <View style={styles.currencyModalContent}>
              <Text style={styles.currencyModalTitle}>💱 Choisir la devise</Text>
              
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.ultraCurrencyOption,
                    selectedCurrency === currency.code && styles.selectedUltraCurrencyOption
                  ]}
                  onPress={() => selectCurrency(currency.code)}>
                  
                  <LinearGradient
                    colors={selectedCurrency === currency.code ? currency.gradient : ['#f8f9fa', '#e9ecef']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.currencyOptionGradient}>
                    
                    <View style={styles.currencySymbolContainer}>
                      <Text style={[styles.ultraCurrencySymbol, { color: selectedCurrency === currency.code ? '#fff' : currency.color }]}>
                        {currency.symbol}
                      </Text>
                    </View>
                    
                    <View style={styles.currencyInfo}>
                      <Text style={[styles.ultraCurrencyName, { color: selectedCurrency === currency.code ? '#fff' : '#333' }]}>
                        {currency.name}
                      </Text>
                      <Text style={[styles.ultraCurrencyCode, { color: selectedCurrency === currency.code ? 'rgba(255,255,255,0.8)' : '#666' }]}>
                        {currency.code}
                      </Text>
                    </View>
                    
                    {selectedCurrency === currency.code && (
                      <View style={styles.currencyCheckContainer}>
                        <Text style={styles.ultraCurrencyCheckmark}>✓</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.ultraCurrencyModalClose}
                onPress={() => setShowCurrencyModal(false)}>
                <LinearGradient
                  colors={['#6c757d', '#495057']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.closeButtonGradient}>
                  <Text style={styles.ultraCurrencyModalCloseText}>Fermer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#1a4a1a', '#2e7d32']}
      style={styles.donationContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.donationHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.donationHeaderCenter}>
          <Image
            source={sectionImage}
            style={styles.donationSectionImage}
            resizeMode="contain"
          />
         
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.donationContent}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.donationCard}>
          
           <Text style={styles.donationCardTitle}>
  {section === 'EGLISE' 
    ? ' DON A L\'EGLISE MC2G' 
    : section === 'MINISTERE' 
    ? ' DON A FEA BENIDEDIEU Ministries' 
    : ' DON A LA RADIO BONNE NOUVELLE'}
</Text>
          <Text style={styles.donationCardSubtitle}>
          {fromQR ? ' (QR Code)' : ''}
          </Text>

          {section !== 'RADIO' && (
            <DonationTypeDropdown 
              section={section}
              selectedType={selectedDonationType}
              onSelectType={setSelectedDonationType}
            />
          )}

          {/* Sélecteur de devise */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💱 Devise :</Text>
            <TouchableOpacity 
              style={styles.currencyButton}
              onPress={() => setShowCurrencyModal(true)}>
              <LinearGradient
                colors={currentCurrency.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.currencyButtonGradient}>
                <Text style={styles.currencyButtonSymbol}>{currentCurrency.symbol}</Text>
                <Text style={styles.currencyButtonText}>{currentCurrency.name}</Text>
                <Text style={styles.currencyButtonArrow}>▼</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Montant */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Montant ({selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder={`Ex: ${selectedCurrency === 'CFA' ? '5000' : '10'}`}
              value={donationAmount}
              onChangeText={setDonationAmount}
              keyboardType="decimal-pad"
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Affichage de la conversion */}
          {selectedCurrency !== 'CFA' && donationAmount && (
            <View style={styles.conversionDisplay}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.2)', 'rgba(129, 199, 132, 0.2)']}
                style={styles.conversionGradient}>
                <Text style={styles.conversionText}>
                  💱 Équivalent : {amountInCFA.toLocaleString()} FCFA
                </Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 Nom complet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              value={donorName}
              onChangeText={setDonorName}
              returnKeyType="next"
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📧 Email (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              value={donorEmail}
              onChangeText={setDonorEmail}
              keyboardType="email-address"
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.donateButton,
              (!donationAmount || isGeneratingPayment || amountInCFA < 100 || (section !== 'RADIO' && !selectedDonationType)) && styles.donateButtonDisabled
            ]}
            onPress={handleDonation}
            disabled={!donationAmount || isGeneratingPayment || amountInCFA < 100 || (section !== 'RADIO' && !selectedDonationType)}>
            
            <LinearGradient
              colors={(!donationAmount || isGeneratingPayment || amountInCFA < 100 || (section !== 'RADIO' && !selectedDonationType)) ? 
                ['#cccccc', '#999999'] : 
                ['#4caf50', '#66bb6a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.donateButtonGradient}>
              
             
              <Text style={styles.donateButtonText}>
                {isGeneratingPayment 
                  ? 'Génération du paiement...' 
                  : donationAmount 
                    ? `Donner ${donationAmount} ${currentCurrency.symbol}${selectedCurrency !== 'CFA' ? ` (${amountInCFA.toLocaleString()} FCFA)` : ''}`
                    : 'Valider'
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Carte de remerciement */}
        <LinearGradient
          colors={['rgba(76, 175, 80, 0.3)', 'rgba(129, 199, 132, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thankYouCard}>
          <Text style={styles.thankYouText}>
            ✨ Merci de faire partie de cette magnifique aventure avec nous ! 🙏
          </Text>
        </LinearGradient>
      </ScrollView>
      
      <CurrencyModal />
      <CinetPayModal />
    </LinearGradient>
  );
};

// Application Principale - SIMPLIFIÉE
const ChurchPaymentApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [fromQR, setFromQR] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false); // TEMPORAIRE pour éviter l'erreur

const navigate = (screen, params = {}) => {
    if (screen === 'donation' && params.section) {
      // Aller directement à l'écran de don pour toutes les sections
      setSelectedSection(params.section);
      setSelectedType(null); 
      setFromQR(params.fromQR || false);
      setCurrentScreen('donation');
    } else {
      setCurrentScreen(screen);
    }
  };

  const goBack = () => {
    setCurrentScreen('home');
    setSelectedSection(null);
    setSelectedType(null);
    setFromQR(false);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'ministere':
        return <MinistereScreen onNavigate={navigate} onBack={goBack} />;
      case 'eglise':
        return <EgliseScreen onNavigate={navigate} onBack={goBack} />;
      case 'qrcode':
        return <QRCodeScreen onNavigate={navigate} onBack={goBack} />;
      case 'donation':
        return (
          <EnhancedDonationScreen 
            section={selectedSection}
            donationType={selectedType}
            fromQR={fromQR} // NOUVEAU
            onBack={goBack}
          />
        );
      case 'radio':
        return <RadioScreen onNavigate={navigate} onBack={goBack} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.modernSafeArea}>
      {renderCurrentScreen()}
      
      {/* TEMPORAIRE - Modal encore présent pour éviter les erreurs */}
      <DonationTypeSelector
        visible={showTypeSelector}
        section={selectedSection}
        onClose={() => setShowTypeSelector(false)}
        onSelect={(type) => {
          setSelectedType(type);
          setShowTypeSelector(false);
          setCurrentScreen('donation');
        }}
      />
    </SafeAreaView>
  );
};

// STYLES COMPLETS POUR REACT NATIVE
const styles = StyleSheet.create({
  modernSafeArea: {
    flex: 1,
    backgroundColor: '#1a4a1a',
  },
  
  imageSocial: {
    width: width * 0.1,
    height: width * 0.1,
  },

  // NOUVEAU: Container manquant
  modernContainer: {
    flex: 1,
  },

  // Menu Modal
  modernMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  modernMenuModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: width * 0.9,
    maxHeight: '80%',
  },
  
  modernMenuModalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  
  modernMenuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 12,
  },
  
  modernActiveMenuItem: {
    backgroundColor: '#2e7d32',
  },
  
  modernMenuModalIcon: {
    fontSize: width * 0.07,
    marginRight: 15,
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
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#6c757d',
    borderRadius: 15,
    alignItems: 'center',
  },
  
  modernMenuModalCloseText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Alarmes
  modernAlarmsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  modernAlarmsListCard: {
    backgroundColor: '#f4f4f4',
    padding: 25,
    borderRadius: 15,
    marginBottom: 40,
    marginTop: 15,
  },
  
  modernAlarmsListTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  
  modernAlarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
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
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  
  modernAlarmTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  
  modernAlarmSound: {
    fontSize: width * 0.035,
    color: '#666',
    marginTop: 3,
  },
  
  modernAlarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  modernTestBtn: {
    padding: 12,
  },
  
  modernTestIcon: {
    fontSize: width * 0.045,
  },
  
  modernDeleteBtn: {
    padding: 8,
  },
  
  modernDeleteIcon: {
    fontSize: width * 0.045,
  },
  
  modernNoAlarmsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  modernNoAlarmsText: {
    fontSize: width * 0.045,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  modernAddFirstAlarmBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: '#4caf50',
    borderRadius: 25,
  },
  
  modernAddFirstAlarmText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },

  // Add Alarm Modal
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
  },
  
  addAlarmTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  
  modernCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
  },
  
  modernCancelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  
  addAlarmContent: {
    flex: 1,
    padding: 25,
  },
  
  formGroup: {
    marginBottom: 25,
  },
  
  formLabel: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  
  modernFormInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: width * 0.042,
    backgroundColor: '#fff',
  },

  bottomButtonContainer: {
    marginTop: 30,
    paddingVertical: 20,
  },
  
  modernSaveButtonBottom: {
    backgroundColor: '#4caf50',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  
  modernSaveButtonBottomText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  
  // Home Screen
  homeContainer: {
    flex: 1,
  },
  
  homeHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : height * 0.04,
    paddingBottom: height * 0.04,
    paddingHorizontal: width * 0.08,
    backgroundColor:'#c9c29dff',
    borderBottomRightRadius:120,
    borderBottomLeftRadius:120
  },
  
  homeTitle: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#205e37ff',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  
  homeSubtitle: {
    fontSize: width * 0.045,
    color: '#cd4545ff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  
  frequencyContainer: {
    backgroundColor: 'rgba(171, 95, 95, 0.2)',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.05,
  },
  
  frequency: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#454545ff',
  },
  
  menuGrid: {
    padding: width * 0.05,
    gap: width * 0.04,
  },
  
  menuCardContainer: {
    marginBottom: height * 0.02,
  },
  
  menuCard: {
    borderRadius: width * 0.04,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  menuCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.05,
    minHeight: height * 0.1,
  },
  
  iconContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.04,
  },
  
  menuIcon: {
    fontSize: width * 0.08,
  },
  
  menuTextContainer: {
    flex: 1,
  },
  
  menuTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: height * 0.005,
  },
  
  menuSubtitle: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
  },
  
  arrowContainer: {
    padding: width * 0.025,
  },
  
  menuArrow: {
    fontSize: width * 0.06,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  homeFooter: {
    alignItems: 'center',
    paddingVertical: height * 0.025,
  },
  
  footerText: {
    fontSize: width * 0.04,
    color: '#171515ff',
    opacity: 0.8,
    fontStyle: 'italic',
  },

  // Radio Screen
  modernRadioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: Platform.OS === 'ios' ? 10 : 5,
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
    marginTop: 50,
  },
  
  modernStationName: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  modernHeaderSubtitle1: {
    fontSize: width * 0.04,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 5,
    textAlign: 'center',
  },
  
  modernHeaderSubtitle: {
    fontSize: width * 0.04,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.9,
    marginBottom: 10,
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
    marginRight: 8,
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

  // Radio section
  modernAlbumSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  
  modernRadioWaveContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  modernRadioTower: {
    width: width * 0.75,
    height: width * 0.75,
    marginTop: 30,
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
  
  modernLogo: {
    position: 'absolute',
    bottom: '30%',
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: width * 0.0125,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  
  modernLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.125,
  },
  
  modernTrackInfo: {
    alignItems: 'center',
    marginTop: 30,
  },
  
  modernTrackTitle: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  modernWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    gap: width * 0.015,
  },
  
  modernWaveBar: {
    width: width * 0.01,
    height: width * 0.05,
    backgroundColor: '#4caf50',
    borderRadius: width * 0.005,
  },

  // Bottom Actions
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 74, 26, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopLeftRadius: width * 0.06,
    borderTopRightRadius: width * 0.06,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  bottomActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.04,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  bottomButtonIconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
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

  hiddenWebView: {
    position: 'absolute',
    top: -1000,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },

  modernWebView: {
    flex: 1,
    backgroundColor: '#5d3636ff',
  },

  hiddenWebView: {
    position: 'absolute',
    top: -1000,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },

  modernWebView: {
    flex: 1,
    backgroundColor: '#5d3636ff',
  },

  // Menu Modal
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

  // Alarmes
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

  // Add Alarm Modal
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
  
  modernFormInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: width * 0.03,
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    fontSize: width * 0.042,
    backgroundColor: '#fff',
  },

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
  },
  
  modernSaveButtonBottomText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },

  // QR Code Screen
  qrContainer: {
    flex: 1,
  },
  
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  qrTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
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
  
  // QR Code Screen responsive
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
  
  qrTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
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
  },
  
  qrFrameScanning: {
    // Animation d'effet de scan
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

  // Donation Type Selector
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  selectorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxHeight: '80%',
  },
  
  selectorTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  selectorSubtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  typesList: {
    maxHeight: '70%',
  },
  
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  
  typeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  
  typeName: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  typeArrow: {
    fontSize: 20,
    color: '#666',
  },
  
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },

  // NOUVEAU: Styles pour le Dropdown
  dropdownContainer: {
    marginBottom: 20,
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    
    padding: 15,
  },

  dropdownIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  dropdownText: {
    fontSize: width * 0.045,
    color: '#333',
    flex: 1,
  },

  dropdownArrow: {
    fontSize: 16,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },

  dropdownArrowUp: {
    transform: [{ rotate: '180deg' }],
  },

  dropdownList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#ddd',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#fff',
    maxHeight: 400,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  dropdownItemSelected: {
    backgroundColor: '#4caf50',
  },

  dropdownItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  dropdownItemText: {
    fontSize: width * 0.042,
    color: '#333',
    flex: 1,
  },

  dropdownItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  dropdownItemCheck: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Section Screens responsive
  sectionContainer: {
    flex: 1,
  },
  
  sectionHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingHorizontal: 20,
    paddingBottom:20,
    backgroundColor:'green',
    borderBottomLeftRadius: 110,
    borderBottomRightRadius:110,
  },
  
  headerImageContainer: {
    marginBottom: height * 0.00009,
   
  },
  
  headerImage: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.035,
  },
  
  sectionTitle: {
    fontSize: width * 0.050,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: height * 0.009,
    textAlign: 'center',
  },
  
  sectionContent: {
    padding: width * 0.05,
    marginTop: height * 0.03,
  },
  
  welcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: width * 0.05,
    borderRadius: width * 0.04,
    marginBottom: height * 0.03,
  },
  
  welcomeTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  retour:{
      marginRight:width * 0.8
  },
  
  welcomeText: {
    fontSize: width * 0.04,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: height * 0.025,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.05,
    borderRadius: width * 0.04,
    marginBottom: height * 0.15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  actionIcon: {
    fontSize: width * 0.08,
    marginRight: width * 0.04,
  },
  
  actionText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  
  actionArrow: {
    fontSize: width * 0.06,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  socialSection: {
    position: 'absolute',
    bottom: '-70%',
   
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 74, 26, 0.95)',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.025,
    paddingBottom: Platform.OS === 'ios' ? height * 0.15 : height * 0.1,
    borderTopLeftRadius: width * 0.06,
    borderTopRightRadius: width * 0.06,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  socialTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    backgroundColor: 'rgba(188, 197, 180, 0.57)',
    borderRadius: width * 0.04,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  socialIcon: {
    fontSize: width * 0.06,
    marginRight: width * 0.04,
  },
  
  socialText: {
    fontSize: width * 0.050,
    color: '#ffffff',
    marginLeft: width * 0.025,
    fontWeight: '600',
  },

  // Donation Screen
  donationContainer: {
    flex: 1,

  },
  
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius:100,
   
  },
  
  donationTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  donationContent: {
    padding: 20,
    
  },
  
  donationCard: {
    borderRadius: width * 0.075,
    padding: '8%',
    marginBottom: 20,
  },
  
  donationCardTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  donationCardSubtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  
  inputGroup: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: width * 0.045,
    backgroundColor: '#fff',
  },

  // Currency Selector
  currencyButton: {
    borderRadius: width * 0.05,
  },
  
  currencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    borderRadius: width * 0.05,
    minWidth: width * 0.55,
    justifyContent: 'space-between',
  },
  
  currencyButtonSymbol: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: '4%',
  },
  
  currencyButtonText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  
  currencyButtonArrow: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
  },

  // Currency Modal
  currencyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
  },

  currencyModalContainer: {
    width: '90%',
    maxWidth: width * 0.85,
    borderRadius: width * 0.08,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },

  currencyModalGradient: {
    padding: '8%',
  },

  currencyModalContent: {
    alignItems: 'center',
  },

  currencyModalTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8%',
    textAlign: 'center',
  },

  ultraCurrencyOption: {
    width: '100%',
    borderRadius: width * 0.04,
    marginBottom: '4%',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  selectedUltraCurrencyOption: {
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  currencyOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '5%',
    minHeight: width * 0.18,
  },

  currencySymbolContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '5%',
  },

  ultraCurrencySymbol: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
  },

  currencyInfo: {
    flex: 1,
  },

  ultraCurrencyName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: '2%',
  },

  ultraCurrencyCode: {
    fontSize: width * 0.037,
    opacity: 0.8,
  },

  currencyCheckContainer: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ultraCurrencyCheckmark: {
    fontSize: width * 0.045,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  ultraCurrencyModalClose: {
    marginTop: '6%',
    borderRadius: width * 0.04,
    overflow: 'hidden',
    width: '100%',
  },

  closeButtonGradient: {
    paddingVertical: '4%',
    alignItems: 'center',
  },

  ultraCurrencyModalCloseText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Conversion Display
  conversionDisplay: {
    marginBottom: 20,
  },

  conversionGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  conversionText: {
    fontSize: width * 0.042,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },

  // Donate Button
  donateButton: {
    borderRadius: width * 0.04,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  donateButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },

  donateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '5%',
    paddingHorizontal: '8%',
    minHeight: width * 0.15,
  },

  donateButtonIcon: {
    fontSize: width * 0.05,
    marginRight: '3%',
  },

  donateButtonText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },

  // Thank You Card
  thankYouCard: {
    borderRadius: width * 0.04,
    padding: '6%',
    alignItems: 'center',
    marginTop: 20,
  },

  thankYouText: {
    fontSize: width * 0.042,
    fontWeight: '600',
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: width * 0.055,
  },

  // CinetPay Modal
  cinetPayContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  modernCinetPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    backgroundColor: '#2e7d32',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },

  modernBackButton: {
    paddingHorizontal: '4%',
    paddingVertical: '3%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: width * 0.03,
  },

  modernBackButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },

  modernCinetPayTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },

  cinetPayWebView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  modernLoadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: '10%',
  },

  modernLoadingSpinner: {
    fontSize: width * 0.15,
    marginBottom: '5%',
  },

  menuImage: {
    width: 40,
    height: 40,
  },
   donationHeaderCenter: {
  flex: 1,
  alignItems: 'center',
  borderRadius: 10,
 
},

donationSectionImage: {
  width: 100,
  height: 100,
  borderRadius: 20,
  marginBottom: 10,
},
  modernLoadingText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: '5%',
  },
});

export default ChurchPaymentApp;