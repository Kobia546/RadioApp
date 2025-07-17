import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { WebView } from 'react-native-webview';

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
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showPlayer, setShowPlayer] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Radio Bonne Nouvelle');

  // États pour les alarmes spirituelles
  const [alarms, setAlarms] = useState([
    { id: 1, title: "Prière du matin", time: "06:00", enabled: true, type: "prayer", content: PRAYERS[0] },
    { id: 2, title: "Verset du jour", time: "12:00", enabled: true, type: "verse", content: BIBLICAL_VERSES[0] },
    { id: 3, title: "Prière du soir", time: "20:00", enabled: false, type: "prayer", content: PRAYERS[2] },
  ]);
  
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false);
  const [showAlarmDetailModal, setShowAlarmDetailModal] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [newAlarm, setNewAlarm] = useState({ title: '', time: '07:00', type: 'prayer', content: '' });
  const [dailyVerse, setDailyVerse] = useState(BIBLICAL_VERSES[0]);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  // URL de ton player RadioKing 
  const radioPlayerUrl = 'https://a4.asurahosting.com/public/radio_bonne_nouvelle/embed?theme=light';

  useEffect(() => {
    if (currentScreen === 'radio' || currentScreen === 'alarms') {
      startEntranceAnimation();
    }
    startRotationAnimation();
    
    // Changer le verset du jour quotidiennement
    const today = new Date().getDay();
    setDailyVerse(BIBLICAL_VERSES[today % BIBLICAL_VERSES.length]);
  }, [currentScreen]);

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

    const interval = setInterval(checkAlarms, 60000); // Vérifier chaque minute
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarm = (alarm) => {
    Alert.alert(
      `🔔 ${alarm.title}`,
      alarm.type === 'verse' ? `${alarm.content.text}\n\n— ${alarm.content.ref}` : 
      alarm.type === 'prayer' ? alarm.content.text : alarm.content,
      [
        { text: 'Amen 🙏', style: 'default' },
        { text: 'Rappeler dans 5 min', onPress: () => scheduleSnooze(alarm) },
      ]
    );
  };

  const scheduleSnooze = (alarm) => {
    setTimeout(() => {
      Alert.alert(`🔔 Rappel: ${alarm.title}`, "Il est temps de prier ou méditer 🙏");
    }, 5 * 60 * 1000); // 5 minutes
  };

  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
    
    // Animation d'entrée du player
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Simulation de chargement puis auto-play
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
    setIsLoading(true);
    setWebViewKey(prev => prev + 1);
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      setIsPlaying(true);
    }, 2000);
  };

  const togglePlayback = () => {
    if (!showPlayer) {
      showRadioPlayer();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const addAlarm = () => {
    if (newAlarm.title.trim()) {
      const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      const alarm = {
        id: Date.now(),
        title: newAlarm.title.trim(),
        time: timeStr,
        type: newAlarm.type,
        enabled: true,
        content: newAlarm.type === 'prayer' ? 
          PRAYERS[Math.floor(Math.random() * PRAYERS.length)] :
          BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)]
      };
      
      setAlarms([...alarms, alarm]);
      setNewAlarm({ title: '', time: '07:00', type: 'prayer', content: '' });
      setSelectedHour(7);
      setSelectedMinute(0);
      setShowAddAlarmModal(false);
      Alert.alert('✅ Alarme ajoutée', 'Votre alarme spirituelle a été créée avec succès!');
    } else {
      Alert.alert('❌ Erreur', 'Veuillez entrer un titre pour l\'alarme');
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

  const HomeScreen = () => (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#2e7d32']} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Radio Bonne Nouvelle</Text>
        <Text style={styles.headerSubtitle}>Le canal de la Grandeur • 103.6 FM</Text>
      </LinearGradient>
      
      <View style={styles.menuContainer}>
        {[
          { icon: '📻', title: 'Ma Radio', subtitle: 'Écouter la Parole en direct', action: () => setCurrentScreen('radio'), primary: true },
          { icon: '📘', title: 'Facebook', subtitle: 'Communauté de foi', action: () => Alert.alert('Facebook', 'Rejoignez notre communauté de foi!') },
          { icon: '🔔', title: 'Alarmes Spirituelles', subtitle: 'Rappels et méditations', action: () => setCurrentScreen('alarms') },
        ].map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.menuItemContainer,
              {
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }],
                opacity: fadeAnim,
              }
            ]}>
            <TouchableOpacity
              style={[styles.menuItem, item.primary && styles.primaryMenuItem]}
              onPress={item.action}
              activeOpacity={0.8}>
              <View style={[styles.menuIcon, item.primary && styles.primaryIcon]}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, item.primary && styles.primaryText]}>{item.title}</Text>
                <Text style={[styles.menuSubtext, item.primary && styles.primarySubtext]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.arrowContainer, item.primary && styles.primaryArrow]}>
                <Text style={styles.arrow}>▶</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const AlarmsScreen = () => (
    <View style={styles.radioContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <Animated.View style={[styles.radioHeader, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          onPress={() => setCurrentScreen('home')}
          style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.stationName}>Alarmes Spirituelles</Text>
          <Text style={styles.statusText}>{alarms.filter(a => a.enabled).length} alarmes actives</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setShowAddAlarmModal(true)}
          style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.alarmsScrollView} showsVerticalScrollIndicator={false}>
        {/* Verset du jour */}
        <Animated.View style={[styles.verseCard, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => setShowVerseModal(true)}>
            <Text style={styles.verseTitle}>📖 Verset du jour</Text>
            <Text style={styles.verseText}>"{dailyVerse.text}"</Text>
            <Text style={styles.verseRef}>— {dailyVerse.ref}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getRandomVerse} style={styles.refreshVerseBtn}>
            <Text style={styles.refreshVerseText}>🔄 Nouveau verset</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View style={[styles.quickActionsCard, { opacity: fadeAnim }]}>
          <Text style={styles.quickActionsTitle}>Actions rapides</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => {
              Alert.alert('🙏 Prière', PRAYERS[Math.floor(Math.random() * PRAYERS.length)].text);
            }}>
              <Text style={styles.quickActionIcon}>🙏</Text>
              <Text style={styles.quickActionText}>Prière</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => {
              const verse = BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
              Alert.alert('📖 Verset', `${verse.text}\n\n— ${verse.ref}`);
            }}>
              <Text style={styles.quickActionIcon}>📖</Text>
              <Text style={styles.quickActionText}>Verset</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Liste des alarmes */}
        <Animated.View style={[styles.alarmsListCard, { opacity: fadeAnim }]}>
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
                onPress={() => setShowAddAlarmModal(true)}
                style={styles.addFirstAlarmBtn}>
                <Text style={styles.addFirstAlarmText}>➕ Créer ma première alarme</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal pour ajouter une alarme */}
      <Modal
        visible={showAddAlarmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddAlarmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>➕ Nouvelle alarme spirituelle</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre de l'alarme</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Prière du matin, Lecture biblique..."
                value={newAlarm.title}
                onChangeText={(text) => setNewAlarm({...newAlarm, title: text})}
                autoFocus={true}
                maxLength={50}
                returnKeyType="done"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heure de l'alarme</Text>
              <TouchableOpacity 
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timePickerText}>
                  {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timePickerIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type d'alarme</Text>
              <View style={styles.typeSelector}>
                {[
                  { value: 'prayer', label: '🙏 Prière' },
                  { value: 'verse', label: '📖 Verset biblique' }
                ].map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      newAlarm.type === type.value && styles.selectedType
                    ]}
                    onPress={() => setNewAlarm({...newAlarm, type: type.value})}>
                    <Text style={[
                      styles.typeText,
                      newAlarm.type === type.value && styles.selectedTypeText
                    ]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowAddAlarmModal(false);
                  setNewAlarm({ title: '', time: '07:00', type: 'prayer', content: '' });
                  setSelectedHour(7);
                  setSelectedMinute(0);
                }}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={addAlarm}>
                <Text style={styles.saveText}>Créer l'alarme</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sélecteur d'heure */}
      <Modal
        visible={showTimePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <Text style={styles.timePickerTitle}>🕐 Choisir l'heure</Text>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Heure</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({length: 24}, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.timeOption,
                        selectedHour === i && styles.selectedTimeOption
                      ]}
                      onPress={() => setSelectedHour(i)}>
                      <Text style={[
                        styles.timeOptionText,
                        selectedHour === i && styles.selectedTimeText
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Minutes</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {[0, 15, 30, 45].map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        selectedMinute === minute && styles.selectedTimeOption
                      ]}
                      onPress={() => setSelectedMinute(minute)}>
                      <Text style={[
                        styles.timeOptionText,
                        selectedMinute === minute && styles.selectedTimeText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.timePickerButtons}>
              <TouchableOpacity
                style={styles.timePickerCancel}
                onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePickerConfirm}
                onPress={() => {
                  setShowTimePicker(false);
                }}>
                <Text style={styles.timePickerConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Modal pour le verset du jour */}
      <Modal
        visible={showVerseModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowVerseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📖 Verset du jour</Text>
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
   const didUpdateTrack = useRef(false);

  // Auto-play when the currentTrack changes
    useEffect(() => {
    if (didUpdateTrack.current) {
      togglePlayback();
    } else {
      didUpdateTrack.current = true;
    }
  }, [currentTrack]);

  return (
    <View style={styles.radioContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <Animated.View style={[styles.radioHeader, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => {
            hidePlayer();
            setCurrentScreen('home');
          }}
          style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.stationName}>Radio Bonne Nouvelle</Text>
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
      </Animated.View>

      {/* Album Art */}
      <Animated.View
        style={[
          styles.albumSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
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

            {/* Animated Radio Waves */}
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
          <Text style={styles.trackTitle}>
            {currentTrack || (isPlaying ? '🔴 EN DIRECT' : 'Radio Bonne Nouvelle')}
          </Text>
          <Text style={styles.trackSubtitle}>103.6 FM • Le canal de la Grandeur</Text>

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
      </Animated.View>

      {/* Player Controls */}
      <Animated.View
        style={[
          styles.controlsSection,
          { opacity: fadeAnim }
        ]}>

        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.secondaryControl}>
            <Text style={styles.controlIcon}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying && styles.playingButton,
              isLoading && styles.loadingButton
            ]}
            onPress={togglePlayback}
            disabled={isLoading}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.playIcon}>
                {isLoading ? '⋯' : !showPlayer ? '▶' : isPlaying ? '⏸' : '▶'}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryControl}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Animated Progress Bar */}
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
            <Text style={styles.progressText}>
              {isLoading ? 'Connexion...' : isPlaying ? 'Diffusion en cours' : 'Prêt'}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* WebView Player */}
      {showPlayer && (
        <Animated.View
          style={[
            styles.playerContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim
            }
          ]}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerTitle}>🎵 Player Radio</Text>
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

              // Try to auto-click on play after loading
              setTimeout(() => {
                webViewRef.current?.injectJavaScript(`
                  try {
                    console.log('🎵 Recherche du bouton play RadioKing...');

                    // Strategy 3: Auto-start audio elements
                    if (!found) {
                      const audioElements = document.querySelectorAll('audio');
                      audioElements.forEach(audio => {
                        if (audio.paused) {
                          audio.play().then(() => {
                            console.log('✅ Audio element démarré');
                            found = true;
                          }).catch(e => console.log('Audio play failed:', e));
                        }
                      });
                    }

                    // Retrieve the current title from the div you showed me
                    const currentTitle = document.querySelector('#current-title span');
                    const currentArtist = document.querySelector('#current-artist span');

                    if (currentTitle) {
                      const title = currentTitle.textContent;
                      console.log('🎵 Titre en cours:', title);

                      // Send the title to React Native
                      window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'currentTrack',
                        title: title,
                        artist: currentArtist?.textContent || ''
                      }));
                    }

                    if (found) {
                      console.log('🎵 Radio démarrée automatiquement!');
                      window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'playbackStarted'
                      }));
                    }

                  } catch(e) {
                    console.log('❌ Auto-play failed:', e);
                  }
                  true;
                `);
              }, 3000);

              // Monitor title changes
              setTimeout(() => {
                webViewRef.current?.injectJavaScript(`
                  // Observe title changes
                  const titleElement = document.querySelector('#current-title span');
                  if (titleElement) {
                    const observer = new MutationObserver((mutations) => {
                      mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                          const newTitle = titleElement.textContent;
                          console.log('🎵 Nouveau titre:', newTitle);

                          window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'trackChanged',
                            title: newTitle
                          }));
                        }
                      });
                    });

                    observer.observe(titleElement, {
                      childList: true,
                      subtree: true,
                      characterData: true
                    });
                  }
                  true;
                `);
              }, 5000);
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);

                if (data.type === 'currentTrack') {
                  setCurrentTrack(data.title || '🔴 EN DIRECT');
                  console.log('Titre reçu:', data.title);
                }

                if (data.type === 'playbackStarted') {
                  setIsPlaying(true);
                  setIsConnected(true);
                  console.log('Playback démarré automatiquement!');
                }

                if (data.type === 'trackChanged') {
                  setCurrentTrack(data.title || '🔴 EN DIRECT');
                  console.log('Nouveau titre:', data.title);
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
      <Animated.View
        style={[
          styles.bottomControls,
          { opacity: fadeAnim }
        ]}>
        {!showPlayer ? (
          <TouchableOpacity
            style={styles.showPlayerBtn}
            onPress={showRadioPlayer}>
            <Text style={styles.showPlayerText}>🎵 Ouvrir Player Radio</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.playerControlBtn} onPress={hidePlayer}>
              <Text style={styles.playerControlText}>🗙 Masquer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playerControlBtn} onPress={reloadPlayer}>
              <Text style={styles.playerControlText}>⟳ Recharger</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playerControlBtn}
              onPress={() => {
                webViewRef.current?.injectJavaScript(`
                  // Force click on play with all possible selectors
                  const selectors = [
                    'button[class*="play"]',
                    '[class*="play-button"]',
                    '[class*="btn-play"]',
                    '.rk-play-btn',
                    'button[title*="play"]',
                    'button[title*="Play"]'
                  ];

                  let clicked = false;
                  for (const selector of selectors) {
                    const btn = document.querySelector(selector);
                    if (btn && !clicked) {
                      btn.click();
                      console.log('✅ Bouton play forcé:', selector);
                      clicked = true;

                      // Update title after click
                      setTimeout(() => {
                        const title = document.querySelector('#current-title span')?.textContent;
                        if (title) {
                          window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'currentTrack',
                            title: title
                          }));
                        }
                      }, 1000);
                      break;
                    }
                  }

                  if (!clicked) {
                    // Last attempt with all buttons
                    const allBtns = document.querySelectorAll('button, [role="button"]');
                    allBtns.forEach(btn => {
                      const text = btn.textContent || btn.innerHTML || '';
                      if (text.includes('▶') || text.includes('play')) {
                        btn.click();
                        console.log('✅ Bouton play trouvé par contenu');
                      }
                    });
                  }
                  true;
                `);
              }}>
              <Text style={styles.playerControlText}>▶ Force Play</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Quality Indicator */}
      <View style={styles.qualityIndicator}>
        <Text style={styles.qualityText}>
          {isConnected ? '🎵 HD Audio • 128 kbps' : '📻 Touchez ▶ pour écouter'}
        </Text>
      </View>
    </View>
  );
};


  return (
    <SafeAreaView style={styles.safeArea}>
      {currentScreen === 'home' ? <HomeScreen /> : 
       currentScreen === 'alarms' ? <AlarmsScreen /> : 
       <RadioScreen />}
    </SafeAreaView>
  );
}

const LinearGradient = ({ colors, style, children }) => (
  <View style={[style, { backgroundColor: colors[0] }]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  menuItemContainer: {
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryMenuItem: {
    backgroundColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
  },
  menuIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  primaryIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuIconText: {
    fontSize: 26,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 3,
  },
  primaryText: {
    color: '#ffffff',
  },
  menuSubtext: {
    fontSize: 14,
    color: '#666',
  },
  primarySubtext: {
    color: 'rgba(255,255,255,0.8)',
  },
  arrowContainer: {
    width: 30,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  primaryArrow: {
    color: '#ffffff',
  },
  // Radio Screen Styles
  radioContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
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
  backIcon: {
    fontSize: 28,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  // Bouton d'ajout pour les alarmes
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
    borderColor: '#4caf50',
    borderRadius: 9999,
  },
  wave1: {
    width: 120,
    height: 120,
    borderColor: '#4caf50',
  },
  wave2: {
    width: 160,
    height: 160,
    borderColor: '#66bb6a',
  },
  wave3: {
    width: 200,
    height: 200,
    borderColor: '#81c784',
  },
  wave4: {
    width: 240,
    height: 240,
    borderColor: '#a5d6a7',
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
  trackSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 15,
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
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  secondaryControl: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 25,
  },
  controlIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
  playButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  playingButton: {
    backgroundColor: '#4caf50',
  },
  loadingButton: {
    backgroundColor: '#666',
  },
  playIcon: {
    fontSize: 36,
    color: '#1a1a1a',
    fontWeight: 'bold',
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
  progressText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },
  playerContainer: {
    position: 'absolute',
    bottom: 120,
    left: 15,
    right: 15,
    height: height * 0.4,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  playerControlBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  playerControlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  qualityIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qualityText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  // Alarmes Spirituelles Styles
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
    justifyContent: 'space-around',
  },
  quickActionBtn: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    minWidth: 80,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#4caf50',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTypeText: {
    color: '#ffffff',
  },
  // Sélecteur d'heure
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timePickerIcon: {
    fontSize: 20,
  },
  timePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxHeight: height * 0.6,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  timeColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timeColumnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  timeScroll: {
    maxHeight: 200,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#4caf50',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  timePickerCancel: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  timePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timePickerConfirm: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    alignItems: 'center',
  },
  timePickerConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Détails d'alarme
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
  meditationDetailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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
  // Modal verset du jour
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