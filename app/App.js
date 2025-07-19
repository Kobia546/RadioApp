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
} from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useCallback } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

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
  const [showSimpleAlarmModal, setShowSimpleAlarmModal] = useState(false);
const [alarmTitle, setAlarmTitle] = useState('');

  // États pour les alarmes spirituelles
  const [alarms, setAlarms] = useState([
    { id: 1, title: "Prière du matin", time: "06:00", enabled: true, type: "prayer", content: PRAYERS[0] },
    { id: 2, title: "Verset du jour", time: "12:00", enabled: true, type: "verse", content: BIBLICAL_VERSES[0] },
    { id: 3, title: "Prière du soir", time: "20:00", enabled: false, type: "prayer", content: PRAYERS[2] },
  ]);
  
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [newAlarm, setNewAlarm] = useState({ title: '', time: '07:00', type: 'prayer', content: '' });
  const [dailyVerse, setDailyVerse] = useState(BIBLICAL_VERSES[0]);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showAlarmDetailModal, setShowAlarmDetailModal] = useState(false);
  
  // DateTimePicker States
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Références pour les animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  // URL de ton player RadioKing 
  const radioPlayerUrl = 'https://a4.asurahosting.com/public/radio_bonne_nouvelle/embed?theme=light';

  useEffect(() => {
    startRotationAnimation();
    const today = new Date().getDay();
    setDailyVerse(BIBLICAL_VERSES[today % BIBLICAL_VERSES.length]);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
      startProgressAnimation();
    } else {
      stopAnimations();
    }
  }, [isPlaying]);

  // Fonction pour vérifier les alarmes
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
    const showAddAlarmPrompt = () => {
  setAlarmTitle('');
  setShowSimpleAlarmModal(true);
};

// 3. FONCTION POUR CONTINUER APRÈS LE TITRE :
const continueWithAlarmCreation = () => {
  if (alarmTitle.trim()) {
    setShowSimpleAlarmModal(false);
    showTimePickerForNewAlarm(alarmTitle.trim());
  } else {
    Alert.alert('❌ Erreur', 'Veuillez entrer un titre');
  }
};

    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [alarms]);

  // 🔥 NOUVELLE SOLUTION SIMPLE POUR AJOUTER ALARMES
  const showAddAlarmPrompt = () => {
    Alert.prompt(
      '➕ Nouvelle Alarme',
      'Entrez le titre de votre alarme spirituelle :',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Continuer',
          onPress: (title) => {
            if (title && title.trim()) {
              showTimePickerForNewAlarm(title.trim());
            } else {
              Alert.alert('❌ Erreur', 'Veuillez entrer un titre');
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const showTimePickerForNewAlarm = (title) => {
    const tempDate = new Date();
    tempDate.setHours(7, 0, 0, 0);
    setSelectedDate(tempDate);
    setNewAlarm(prev => ({...prev, title: title}));
    setShowDateTimePicker(true);
  };

  const onDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateTimePicker(false);
    setSelectedDate(currentDate);
    
    if (event.type === 'set') {
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const minutes = currentDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      showTypeSelector(newAlarm.title, timeString);
    }
  };

  const showTypeSelector = (title, time) => {
    Alert.alert(
      '🔔 Type d\'alarme',
      'Choisissez le type d\'alarme :',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: '🙏 Prière',
          onPress: () => createAlarmFinal(title, time, 'prayer'),
        },
        {
          text: '📖 Verset',
          onPress: () => createAlarmFinal(title, time, 'verse'),
        },
      ]
    );
  };

  const createAlarmFinal = (title, time, type) => {
    const alarm = {
      id: Date.now(),
      title: title,
      time: time,
      type: type,
      enabled: true,
      content: type === 'prayer' ? 
        PRAYERS[Math.floor(Math.random() * PRAYERS.length)] :
        BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)]
    };
    
    setAlarms([...alarms, alarm]);
    setNewAlarm({ title: '', time: '07:00', type: 'prayer', content: '' });
    
    Alert.alert('✅ Alarme créée !', `Votre alarme "${title}" à ${time} a été ajoutée avec succès !`);
  };

  const triggerAlarm = async (alarm) => {
    try {
      console.log('🔔 Déclenchement alarme:', alarm.title);
      Vibration.vibrate([0, 1000, 500, 1000, 500, 1000]);
      
      Alert.alert(
        `🔔 ${alarm.title}`,
        alarm.type === 'verse' ? `${alarm.content.text}\n\n— ${alarm.content.ref}` : 
        alarm.content.text,
        [
          { 
            text: 'Amen 🙏', 
            style: 'default', 
            onPress: () => {
              Vibration.cancel();
              console.log('✅ Alarme arrêtée - Amen');
            }
          },
          { 
            text: 'Rappeler dans 5 min', 
            onPress: () => {
              Vibration.cancel();
              scheduleSnooze(alarm);
              console.log('⏰ Alarme reportée 5 min');
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

    } catch (error) {
      console.log('Erreur alarme:', error);
      Vibration.vibrate([0, 1000, 500, 1000]);
      Alert.alert(
        `🔔 ${alarm.title}`,
        alarm.type === 'verse' ? `${alarm.content.text}\n\n— ${alarm.content.ref}` : 
        alarm.content.text,
        [
          { 
            text: 'Amen 🙏', 
            onPress: () => {
              Vibration.cancel();
            }
          }
        ]
      );
    }
  };

  const scheduleSnooze = (alarm) => {
    setTimeout(() => {
      Vibration.vibrate([0, 1000, 500, 1000]);
      Alert.alert(`🔔 Rappel: ${alarm.title}`, "Il est temps de prier ou méditer 🙏");
    }, 5 * 60 * 1000);
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

  // 🔥 CORRECTION 4: Bouton reload lance aussi la radio
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

  // 🔥 CORRECTION 4: reloadPlayer lance automatiquement la radio
  const reloadPlayer = () => {
    if (!showPlayer) {
      // Si le player n'est pas ouvert, on l'ouvre
      showRadioPlayer();
    } else {
      // Si le player est ouvert, on le recharge
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

  // 🔥 CORRECTION 9: Boutons menu gris clair
  const MenuOverlay = () => (
    <Modal
      visible={showMenu}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowMenu(false)}>
      <View style={styles.menuOverlay}>
        <View style={styles.menuModal}>
          <Text style={styles.menuModalTitle}>📻 Menu</Text>
          
          <TouchableOpacity
            style={[styles.menuModalItem, currentScreen === 'radio' && styles.activeMenuItem]}
            onPress={() => {
              setCurrentScreen('radio');
              setShowMenu(false);
            }}>
            <Text style={styles.menuModalIcon}>📻</Text>
            <Text style={[styles.menuModalText, currentScreen === 'radio' && {color: '#ffffff'}]}>Ma Radio</Text>
            {currentScreen === 'radio' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuModalItem}
            onPress={() => {
              Alert.alert('Facebook', 'Rejoignez notre communauté de foi!');
              setShowMenu(false);
            }}>
            <Text style={styles.menuModalIcon}>📘</Text>
            <Text style={styles.menuModalText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuModalItem, currentScreen === 'alarms' && styles.activeMenuItem]}
            onPress={() => {
              setCurrentScreen('alarms');
              setShowMenu(false);
            }}>
            <Text style={styles.menuModalIcon}>🔔</Text>
            <Text style={[styles.menuModalText, currentScreen === 'alarms' && {color: '#ffffff'}]}>Alarmes Spirituelles</Text>
            {currentScreen === 'alarms' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          {/* 🔥 CORRECTION 10: Bouton Fermer gris sombre */}
          <TouchableOpacity
            style={styles.menuModalClose}
            onPress={() => setShowMenu(false)}>
            <Text style={styles.menuModalCloseText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Composant Écran des Alarmes
  const AlarmsScreen = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.radioHeader}>
        <TouchableOpacity 
          onPress={() => setShowMenu(true)}
          style={styles.backButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.stationName}>Alarmes Spirituelles</Text>
          <Text style={styles.statusText}>{alarms.filter(a => a.enabled).length} alarmes actives</Text>
        </View>
        
        <TouchableOpacity 
          onPress={showAddAlarmPrompt}
          style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.alarmsScrollView} showsVerticalScrollIndicator={false}>
        {/* 🔥 CORRECTION 6: "Verset à méditer" */}
        <View style={styles.verseCard}>
          <TouchableOpacity onPress={() => setShowVerseModal(true)}>
            <Text style={styles.verseTitle}>📖 Verset à méditer</Text>
            <Text style={styles.verseText}>"{dailyVerse.text}"</Text>
            <Text style={styles.verseRef}>— {dailyVerse.ref}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getRandomVerse} style={styles.refreshVerseBtn}>
            <Text style={styles.refreshVerseText}>🔄 Nouveau verset</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 CORRECTION 7: "Action d'aide à la Prière" et CORRECTION 8: Supprimer bouton Verset */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Action d'aide à la Prière</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => {
              Alert.alert('🙏 Prière', PRAYERS[Math.floor(Math.random() * PRAYERS.length)].text);
            }}>
              <Text style={styles.quickActionIcon}>🙏</Text>
              <Text style={styles.quickActionText}>Prière</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des alarmes */}
        <View style={styles.alarmsListCard}>
          <Text style={styles.alarmsListTitle}>Mes alarmes ({alarms.length})</Text>
          
          {alarms.map((alarm) => (
            <TouchableOpacity
              key={alarm.id}
              style={[styles.alarmItem, !alarm.enabled && styles.disabledAlarm]}
              onPress={() => showAlarmDetails(alarm)}>
              
              <View style={styles.alarmInfo}>
                <Text style={styles.alarmTime}>{alarm.time}</Text>
                <Text style={styles.alarmTitle}>{alarm.title}</Text>
                <Text style={styles.alarmType}>
                  {alarm.type === 'prayer' ? '🙏 Prière' : '📖 Verset'}
                </Text>
              </View>
              
              <View style={styles.alarmControls}>
                <Switch
                  value={alarm.enabled}
                  onValueChange={() => toggleAlarm(alarm.id)}
                  trackColor={{ false: '#767577', true: '#4caf50' }}
                  thumbColor={alarm.enabled ? '#ffffff' : '#f4f3f4'}
                />
                <TouchableOpacity
                  onPress={() => deleteAlarm(alarm.id)}
                  style={styles.deleteBtn}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          
          {alarms.length === 0 && (
            <View style={styles.noAlarmsContainer}>
              <Text style={styles.noAlarmsText}>Aucune alarme configurée</Text>
              <TouchableOpacity
                onPress={showAddAlarmPrompt}
                style={styles.addFirstAlarmBtn}>
                <Text style={styles.addFirstAlarmText}>➕ Créer ma première alarme</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* DateTimePicker */}
      {showDateTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onDateTimeChange}
        />
      )}

      {/* Autres modals */}
      {renderOtherModals()}
    </View>
  );

  // Composant Écran Radio
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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

        {/* Header */}
        <View style={styles.radioHeader}>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.backButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.stationName}>Radio Bonne Nouvelle</Text>
            <Text style={styles.headerSubtitle1}>Le canal de la Grandeur</Text>
            <Text style={styles.headerSubtitle}>103.6</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isConnected && styles.activeDot]} />
              <Text style={styles.statusText}>
                {isConnected ? 'EN DIRECT' : 'HORS LIGNE'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={reloadPlayer}
            style={styles.reloadButton}>
            <Animated.View style={{ transform: [{ rotate: isLoading ? rotation : '0deg' }] }}>
              <Text style={styles.reloadIcon}>⟳</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View style={styles.albumSection}>
          <Animated.View
            style={[
              styles.radioWaveContainer,
              {
                transform: [
                  { scale: pulseAnim }
                ]
              }
            ]}>
            <View style={styles.radioTower}>
              {/* Central Radio Antenna */}
              <View style={styles.antenna}>
                <View style={styles.antennaBase} />
                <View style={styles.antennaRod} />
                <View style={styles.antennaTop} />
              </View>

              {/* 🔥 CORRECTION 2: Ondes gris → blanc */}
              {isPlaying && [1, 2, 3, 4].map(i => (
                <Animated.View
                  key={i}
                  style={[
                    styles.radioWave,
                    styles[`wave${i}`],
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

              {/* Central Logo */}
              <View style={styles.radioLogo}>
                <Text style={styles.logoText}>RBN</Text>
                <Text style={styles.logoSubtext}>📻</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.trackInfo}>
            {/* 🔥 CORRECTION 3: Live Broadcast vert / Broadcast Offline rouge */}
            <Text style={styles.trackTitle}>
              {isConnected ? '🔴 Live Broadcast' : '🔴 Broadcast Offline'}
            </Text>

            {isPlaying && (
              <Animated.View style={styles.waveform}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
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

        {/* Player Controls */}
        <View style={styles.controlsSection}>
          {(isPlaying || isLoading) && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: isLoading ? '30%' : progressWidth }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* WebView Player */}
        {showPlayer && (
          <Animated.View
            style={[
              styles.playerContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>📻 Radio En ligne</Text>
              <TouchableOpacity onPress={hidePlayer} style={styles.closePlayer}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

           <WebView
  key={webViewKey}
  source={{ uri: radioPlayerUrl }}
  style={styles.webView}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  mediaPlaybackRequiresUserAction={false}
  allowsInlineMediaPlayback={true}
  startInLoadingState={true}
  renderLoading={() => (
    <View style={styles.loadingOverlay}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Text style={styles.loadingSpinner}>⟳</Text>
      </Animated.View>
      <Text style={styles.loadingText}>Chargement...</Text>
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

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {!showPlayer ? (
            <TouchableOpacity
              style={styles.showPlayerBtn}
              onPress={showRadioPlayer}>
              <Text style={styles.showPlayerText}>📻 Écouter la Radio</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.playerControls}>
              {/* 🔥 CORRECTION 3: Bouton coloré selon l'état */}
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  isConnected ? styles.statusButtonOnline : styles.statusButtonOffline
                ]}
                onPress={() => Alert.alert('Statut', isConnected ? 'Radio en ligne' : 'Radio hors ligne')}>
                <Text style={styles.statusButtonText}>
                  {isConnected ? 'Live Broadcast' : 'Broadcast Offline'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Fonction pour rendre les autres modals
  const renderOtherModals = () => (
    <>
      {/* Modal pour les détails d'alarme */}
      <Modal
        visible={showAlarmDetailModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAlarmDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedAlarm && (
              <>
                <Text style={styles.modalTitle}>🔔 {selectedAlarm.title}</Text>
                <Text style={styles.alarmDetailTime}>⏰ {selectedAlarm.time}</Text>
                
                <View style={styles.alarmContent}>
                  {selectedAlarm.type === 'verse' && (
                    <>
                      <Text style={styles.verseDetailText}>"{selectedAlarm.content.text}"</Text>
                      <Text style={styles.verseDetailRef}>— {selectedAlarm.content.ref}</Text>
                    </>
                  )}
                  
                  {selectedAlarm.type === 'prayer' && (
                    <Text style={styles.prayerDetailText}>{selectedAlarm.content.text}</Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setShowAlarmDetailModal(false)}>
                  <Text style={styles.closeModalText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour le verset */}
      <Modal
        visible={showVerseModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowVerseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📖 Verset à méditer</Text>
            <Text style={styles.verseModalText}>"{dailyVerse.text}"</Text>
            <Text style={styles.verseModalRef}>— {dailyVerse.ref}</Text>
            
            <View style={styles.verseModalButtons}>
              <TouchableOpacity
                style={styles.newVerseBtn}
                onPress={getRandomVerse}>
                <Text style={styles.newVerseText}>🔄 Nouveau verset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowVerseModal(false)}>
                <Text style={styles.closeModalText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentScreen === 'alarms' ? <AlarmsScreen /> : <RadioScreen />}
      <MenuOverlay />
    </SafeAreaView>
  );
}

// 🔥 STYLES AVEC TOUTES LES CORRECTIONS CLIENT
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a4a1a', // 🔥 CORRECTION 1: Fond vert sombre
  },
  container: {
    flex: 1,
    backgroundColor: '#1a4a1a', // 🔥 CORRECTION 1: Fond vert sombre
  },
  
  // 🔥 CORRECTION 9: Menu avec boutons gris clair
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  menuModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  menuModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#e8e8e8', // 🔥 CORRECTION 9: Gris clair
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeMenuItem: {
    backgroundColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
  },
  menuModalIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  menuModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activeIndicator: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // 🔥 CORRECTION 10: Bouton Fermer gris sombre
  menuModalClose: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#666666', // 🔥 CORRECTION 10: Gris sombre
    borderRadius: 15,
    alignItems: 'center',
  },
  menuModalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Radio Screen Styles
  radioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle1: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.9,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  reloadButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  albumSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  radioWaveContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioTower: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  antenna: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
    zIndex: 10,
  },
  antennaBase: {
    width: 8,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  antennaRod: {
    width: 4,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  antennaTop: {
    width: 12,
    height: 12,
    backgroundColor: '#ff4444',
    borderRadius: 6,
  },
  radioWave: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 9999,
  },
  // 🔥 CORRECTION 2: Ondes du gris (intérieur) au blanc (extérieur)
  wave1: {
    width: 120,
    height: 120,
    borderColor: '#888888', // Gris foncé (intérieur)
  },
  wave2: {
    width: 160,
    height: 160,
    borderColor: '#aaaaaa', // Gris moyen
  },
  wave3: {
    width: 200,
    height: 200,
    borderColor: '#cccccc', // Gris clair
  },
  wave4: {
    width: 240,
    height: 240,
    borderColor: '#ffffff', // Blanc (extérieur)
  },
  radioLogo: {
    position: 'absolute',
    bottom: 80,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoSubtext: {
    fontSize: 16,
    marginTop: -2,
  },
  trackInfo: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveBar: {
    width: 3,
    height: 20,
    backgroundColor: '#4caf50',
    borderRadius: 1.5,
  },
  controlsSection: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressTrack: {
    width: width - 80,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  
  playerContainer: {
    position: 'absolute',
    top: 260,
    left: 15,
    right: 15,
    height: height * 0.25,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closePlayer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    fontSize: 32,
    color: '#2e7d32',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  showPlayerBtn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#4caf50',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  showPlayerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerControls: {
    alignItems: 'center',
  },
  // 🔥 CORRECTION 3: Boutons colorés selon statut
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusButtonOnline: {
    backgroundColor: '#4caf50', // Vert pour online
  },
  statusButtonOffline: {
    backgroundColor: '#f44336', // Rouge pour offline
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Alarmes Styles
  alarmsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verseCard: {
    backgroundColor: '#2e7d32',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  verseText: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  verseRef: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    marginBottom: 15,
  },
  refreshVerseBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  refreshVerseText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsCard: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center', // 🔥 CORRECTION 8: Centrer le bouton unique
  },
  quickActionBtn: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    minWidth: 120, // Plus large pour un seul bouton
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  alarmsListCard: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  alarmsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 10,
  },
  disabledAlarm: {
    opacity: 0.5,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  alarmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  alarmType: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  alarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteBtn: {
    padding: 5,
  },
  deleteIcon: {
    fontSize: 16,
  },
  noAlarmsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noAlarmsText: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 15,
  },
  addFirstAlarmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4caf50',
    borderRadius: 25,
  },
  addFirstAlarmText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  alarmDetailTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 20,
  },
  alarmContent: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    minHeight: 100,
  },
  verseDetailText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  verseDetailRef: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    fontWeight: '600',
  },
  prayerDetailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  closeModalBtn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#4caf50',
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  verseModalText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 26,
    marginBottom: 15,
    textAlign: 'center',
  },
  verseModalRef: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 25,
  },
  verseModalButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  newVerseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    alignItems: 'center',
  },
  newVerseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});