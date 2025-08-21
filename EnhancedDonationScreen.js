import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Taux de conversion vers CFA (à mettre à jour régulièrement)
const EXCHANGE_RATES = {
  CFA: 1,
  EUR: 656, // 1 EUR = 656 CFA (approximatif)
  USD: 600, // 1 USD = 600 CFA (approximatif)
};

const CURRENCIES = [
  { code: 'CFA', symbol: 'f', name: 'Franc CFA', color: '#4caf50', gradient: ['#4caf50', '#66bb6a'] },
  { code: 'EUR', symbol: '€', name: 'Euro', color: '#2e7d32', gradient: ['#2e7d32', '#4caf50'] },
  { code: 'USD', symbol: '$', name: 'Dollar US&', color: '#1b5e20', gradient: ['#1b5e20', '#2e7d32'] },
];

const PREDEFINED_AMOUNTS = {
  CFA: [500, 1000, 2000, 5000, 10000],
  EUR: [1, 2, 5, 10, 20],
  USD: [1, 2, 5, 10, 20],
};

const UltraStyledDonationScreen = ({
  showCinetPayModal,
  setShowCinetPayModal,
  openCinetPay,
  isGeneratingPayment,
  Logo,
  setShowMenu,
}) => {
  // États pour les donations
  const [selectedCurrency, setSelectedCurrency] = useState('CFA');
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulsation continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de rotation pour les étoiles
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Animation de scintillement
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Mémoisation des montants prédéfinis pour éviter les re-renders
  const predefinedAmounts = useMemo(() => 
    PREDEFINED_AMOUNTS[selectedCurrency] || PREDEFINED_AMOUNTS.CFA
  , [selectedCurrency]);

  // Fonction pour convertir vers CFA
  const convertToCFA = useCallback((amount, fromCurrency) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return Math.round(numAmount * EXCHANGE_RATES[fromCurrency]);
  }, []);

  // Montant en CFA pour CinetPay
  const amountInCFA = useMemo(() => 
    convertToCFA(donationAmount, selectedCurrency)
  , [donationAmount, selectedCurrency, convertToCFA]);

  // Devise actuelle
  const currentCurrency = useMemo(() => 
    CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]
  , [selectedCurrency]);

  // Handlers avec useCallback pour éviter les re-renders
  const handleAmountChange = useCallback((text) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) return;
    
    setDonationAmount(cleanText);
  }, []);

  const handleDonorNameChange = useCallback((text) => {
    setDonorName(text);
  }, []);

  const handleDonorEmailChange = useCallback((text) => {
    setDonorEmail(text);
  }, []);

  const selectPredefinedAmount = useCallback((amount) => {
    setDonationAmount(amount.toString());
    
    // Animation de feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectCurrency = useCallback((currencyCode) => {
    setSelectedCurrency(currencyCode);
    setDonationAmount('');
    setShowCurrencyModal(false);
  }, []);

  const handleDonation = useCallback(() => {
    if (!donationAmount || isNaN(parseFloat(donationAmount)) || parseFloat(donationAmount) <= 0) {
      Alert.alert('❌ Erreur', 'Veuillez entrer un montant valide');
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
            onPress: () => openCinetPay(cfaAmount, donorName, donorEmail)
          }
        ]
      );
    } else {
      openCinetPay(cfaAmount, donorName, donorEmail);
    }
  }, [donationAmount, selectedCurrency, amountInCFA, currentCurrency, donorName, donorEmail, openCinetPay]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Particules animées
  const AnimatedParticles = () => (
    <View style={styles.particlesContainer}>
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              top: (i * height) / 8 + '%',
              left: (i * 15 + 10) + '%',
              opacity: sparkleAnim,
              transform: [
                { rotate: rotation },
                { scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1]
                })}
              ],
            },
          ]}>
          <Text style={styles.particleText}>✨</Text>
        </Animated.View>
      ))}
    </View>
  );

  // Modal de sélection de devise ultra stylée SANS OMBRES PROBLÉMATIQUES
  const UltraStyledCurrencyModal = () => (
    <Modal
      visible={showCurrencyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCurrencyModal(false)}>
      <View style={styles.currencyModalOverlay}>
        <Animated.View style={[styles.currencyModalContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currencyModalGradient}>
            
            <View style={styles.currencyModalContent}>
              <Text style={styles.currencyModalTitle}>💱 Choisir la devise</Text>
              
              {CURRENCIES.map((currency, index) => (
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
                      <Animated.View style={[styles.currencyCheckContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.ultraCurrencyCheckmark}>✓</Text>
                      </Animated.View>
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
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.ultraContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient avec tes couleurs d'origine */}
      <LinearGradient
        colors={['#1a4a1a', '#2e7d32', '#4caf50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}>
        
        <AnimatedParticles />
        
        {/* Header */}
        <Animated.View style={[styles.ultraHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity 
            onPress={() => setShowMenu(true)}
            style={styles.ultraHeaderButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.headerButtonGradient}>
              <Text style={styles.ultraMenuIcon}>☰</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.ultraHeaderCenter}>
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.logoShadow}>
                <Image source={Logo} style={styles.ultraHeaderLogo} />
              </View>
            </Animated.View>
          </View>
          
          <View style={{ width: width * 0.12 }} />
        </Animated.View>
        
        {/* Content */}
        <ScrollView 
          style={styles.ultraScrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}>
          
          <Animated.View style={[styles.ultraMainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainCardGradient}>
              
              <View style={styles.cardContent}>
                <Text style={styles.ultraDonationTitle}>🎁 Faire un Don</Text>
                <Text style={styles.ultraDonationSubtitle}>Radio Bonne Nouvelle</Text>
                
                {/* Sélecteur de devise stylé */}
                <View style={styles.ultraCurrencySelector}>
                  <Text style={styles.ultraAmountLabel}>💱 Devise :</Text>
                  <TouchableOpacity 
                    style={styles.ultraCurrencyButton}
                    onPress={() => setShowCurrencyModal(true)}>
                    <LinearGradient
                      colors={currentCurrency.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.currencyButtonGradient}>
                      <Text style={styles.ultraCurrencyButtonSymbol}>{currentCurrency.symbol}</Text>
                      <Text style={styles.ultraCurrencyButtonText}>{currentCurrency.name}</Text>
                      <Text style={styles.ultraCurrencyButtonArrow}>▼</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                {/* Montant personnalisé */}
                <Text style={styles.ultraCustomAmountLabel}>Saisissez le montant :</Text>
                <View style={styles.ultraCustomAmountContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(248,249,250,0.9)']}
                    style={styles.amountInputGradient}>
                    <TextInput
                      style={styles.ultraAmountInput}
                      placeholder={`Ex: ${selectedCurrency === 'CFA' ? '3000' : '5'}`}
                      placeholderTextColor="rgba(102, 102, 102, 0.7)"
                      value={donationAmount}
                      onChangeText={handleAmountChange}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    <View style={styles.currencyIndicator}>
                      <Text style={styles.ultraCurrencyText}>{currentCurrency.symbol}</Text>
                    </View>
                  </LinearGradient>
                </View>
                
                {/* Affichage de la conversion */}
                {selectedCurrency !== 'CFA' && donationAmount && (
                  <Animated.View style={[styles.ultraConversionDisplay, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient
                      colors={['rgba(76, 175, 80, 0.2)', 'rgba(129, 199, 132, 0.2)']}
                      style={styles.conversionGradient}>
                      <Text style={styles.ultraConversionText}>
                        💱 Équivalent : {amountInCFA.toLocaleString()} FCFA
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                )}
                
                {/* Informations du donateur stylées */}
                <View style={styles.ultraDonorInfoContainer}>
                  <View style={styles.ultraInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(248,249,250,0.9)']}
                      style={styles.inputGradient}>
                      <TextInput
                        style={styles.ultraDonorInput}
                        placeholder="👤 Votre nom "
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={donorName}
                        onChangeText={handleDonorNameChange}
                        returnKeyType="next"
                        autoCorrect={false}
                        autoCapitalize="words"
                      />
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.ultraInputWrapper}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(248,249,250,0.9)']}
                      style={styles.inputGradient}>
                      <TextInput
                        style={styles.ultraDonorInput}
                        placeholder="📧 Votre email (optionnel)"
                        placeholderTextColor="rgba(102, 102, 102, 0.7)"
                        value={donorEmail}
                        onChangeText={handleDonorEmailChange}
                        keyboardType="email-address"
                        returnKeyType="done"
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </LinearGradient>
                  </View>
                </View>
                
                {/* Bouton de paiement ultra stylé */}
                <TouchableOpacity
                  style={[
                    styles.ultraMainDonationBtn,
                    (!donationAmount || isGeneratingPayment || amountInCFA < 100) && styles.ultraDonationBtnDisabled
                  ]}
                  onPress={handleDonation}
                  disabled={!donationAmount || isGeneratingPayment || amountInCFA < 100}>
                  
                  <LinearGradient
                    colors={(!donationAmount || isGeneratingPayment || amountInCFA < 100) ? 
                      ['#cccccc', '#999999'] : 
                      ['#4caf50', '#66bb6a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.donationButtonGradient}>
                    
                    <Animated.View style={[styles.buttonContent, { transform: [{ scale: pulseAnim }] }]}>
                      <Text style={styles.ultraDon}>🎁</Text> 
                      <Text style={styles.ultraDonationBtnText}>
                        {isGeneratingPayment 
                          ? 'Génération du paiement...' 
                          : donationAmount 
                            ? `Donner ${donationAmount} ${currentCurrency.symbol}${selectedCurrency !== 'CFA' ? ` (${amountInCFA.toLocaleString()} FCFA)` : ''}`
                            : 'Valider'
                        }
                      </Text>
                    </Animated.View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Carte de remerciement stylée */}
          <Animated.View style={[styles.ultraThankYouCard, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.3)', 'rgba(129, 199, 132, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thankYouGradient}>
              <Text style={styles.ultraThankYouText}>
                ✨ Merci de faire partie de cette magnifique aventure avec nous ! 🙏
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
        
        <UltraStyledCurrencyModal />
      </LinearGradient>
    </View>
  );
};

// STYLES ULTRA COMPATIBLES iOS/ANDROID 🎨✨
const styles = {
  ultraContainer: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  particle: {
    position: 'absolute',
    width: width * 0.05,
    height: width * 0.05,
  },
  
  particleText: {
    fontSize: width * 0.04,
  },
  
  ultraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    marginTop: Platform.OS === 'ios' ? '12%' : '10%',
    zIndex: 2,
  },
  
  ultraHeaderButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    } : {
      elevation: 10,
    }),
  },
  
  headerButtonGradient: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  ultraMenuIcon: {
    fontSize: width * 0.06,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  ultraHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoShadow: {
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    } : {
      elevation: 15,
    }),
  },
  
  ultraHeaderLogo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.05,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  
  ultraScrollView: {
    flex: 1,
    paddingHorizontal: '5%',
    zIndex: 2,
  },
  
  ultraMainCard: {
    marginTop: '5%',
    marginBottom: '5%',
    borderRadius: width * 0.075,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.4,
      shadowRadius: 25,
    } : {
      elevation: 20,
    }),
  },
  
  mainCardGradient: {
    borderRadius: width * 0.075,
    padding: '8%',
  },
  
  cardContent: {
    alignItems: 'center',
  },
  
  ultraDonationTitle: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '2%',
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    } : {}),
  },
  
  ultraDonationSubtitle: {
    fontSize: width * 0.045,
    color: '#7f8c8d',
    marginBottom: '8%',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  ultraCurrencySelector: {
    width: '100%',
    marginBottom: '6%',
    alignItems: 'center',
  },
  
  ultraAmountLabel: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4%',
    textAlign: 'center',
  },
  
  ultraCurrencyButton: {
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    } : {
      elevation: 10,
    }),
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
  
  ultraCurrencyButtonSymbol: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: '4%',
  },
  
  ultraCurrencyButtonText: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  
  ultraCurrencyButtonArrow: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
  },
  
  ultraCustomAmountLabel: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4%',
    textAlign: 'center',
  },
  
  ultraCustomAmountContainer: {
    width: '100%',
    marginBottom: '5%',
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    } : {
      elevation: 8,
    }),
  },
  
  amountInputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: width * 0.05,
    paddingHorizontal: '5%',
  },
  
  ultraAmountInput: {
    flex: 1,
    fontSize: width * 0.05,
    fontWeight: 'bold',
    paddingVertical: '4%',
    textAlign: 'center',
    color: '#2c3e50',
  },
  
  currencyIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderRadius: width * 0.04,
  },
  
  ultraCurrencyText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  
  ultraConversionDisplay: {
    width: '100%',
    marginBottom: '5%',
    borderRadius: width * 0.04,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    } : {
      elevation: 5,
    }),
  },
  
  conversionGradient: {
    padding: '4%',
    borderRadius: width * 0.04,
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
  },
  
  ultraConversionText: {
    fontSize: width * 0.04,
    color: '#2e7d32',
    fontWeight: '700',
    textAlign: 'center',
  },
  
  ultraDonorInfoContainer: {
    marginBottom: '6%',
    gap: width * 0.04,
    width: '100%',
  },
  
  ultraInputWrapper: {
    width: '100%',
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    } : {
      elevation: 8,
    }),
  },
  
  inputGradient: {
    borderRadius: width * 0.05,
    paddingHorizontal: '5%',
  },
  
  ultraDonorInput: {
    fontSize: width * 0.04,
    color: '#2c3e50',
    paddingVertical: '4%',
    fontWeight: '600',
  },
  
  ultraMainDonationBtn: {
    width: '100%',
    marginBottom: '6%',
    borderRadius: width * 0.06,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
    } : {
      elevation: 15,
    }),
  },
  
  donationButtonGradient: {
    borderRadius: width * 0.06,
    paddingVertical: '5%',
    paddingHorizontal: '10%',
  },
  
  buttonContent: {
    alignItems: 'center',
  },
  
  ultraDon: {
    fontSize: width * 0.07,
    marginBottom: '2%',
  },
  
  ultraDonationBtnText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? {
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    } : {}),
  },
  
  ultraDonationBtnDisabled: {
    opacity: 0.6,
  },
  
  ultraThankYouCard: {
    marginBottom: '8%',
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    } : {
     
    }),
  },
  
  thankYouGradient: {
    borderRadius: width * 0.05,
    padding: '6%',
    alignItems: 'center',
  },
  
  ultraThankYouText: {
    fontSize: width * 0.045,
    color: '#151615ff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: width * 0.065,
    fontWeight: '700',
    ...(Platform.OS === 'ios' ? {
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    } : {}),
  },
  
  // Modal ultra stylée SANS PROBLÈMES D'OMBRES
  currencyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  
  currencyModalContainer: {
    borderRadius: width * 0.075,
    width: '90%',
    maxHeight: '70%',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.5,
      shadowRadius: 30,
    } : {
      elevation: 25,
    }),
  },
  
  currencyModalGradient: {
    borderRadius: width * 0.075,
    padding: '8%',
  },
  
  currencyModalContent: {
    alignItems: 'center',
  },
  
  currencyModalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '6%',
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? {
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    } : {}),
  },
  
  ultraCurrencyOption: {
    width: '100%',
    marginBottom: '4%',
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    } : {
      elevation: 8,
    }),
  },
  
  selectedUltraCurrencyOption: {
    ...(Platform.OS === 'ios' ? {
      shadowOpacity: 0.5,
      shadowRadius: 15,
    } : {
      elevation: 12,
    }),
  },
  
  currencyOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '5%',
    paddingHorizontal: '6%',
    borderRadius: width * 0.05,
  },
  
  currencySymbolContainer: {
    width: width * 0.125,
    alignItems: 'center',
    marginRight: '4%',
  },
  
  ultraCurrencySymbol: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
  },
  
  currencyInfo: {
    flex: 1,
  },
  
  ultraCurrencyName: {
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  
  ultraCurrencyCode: {
    fontSize: width * 0.035,
    marginTop: '1%',
    fontWeight: '600',
  },
  
  currencyCheckContainer: {
    width: width * 0.09,
    height: width * 0.09,
    borderRadius: width * 0.045,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  ultraCurrencyCheckmark: {
    fontSize: width * 0.05,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  ultraCurrencyModalClose: {
    marginTop: '5%',
    borderRadius: width * 0.05,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
    } : {
      elevation: 10,
    }),
  },
  
  closeButtonGradient: {
    paddingVertical: '4%',
    paddingHorizontal: '10%',
    borderRadius: width * 0.05,
    alignItems: 'center',
  },
  
  ultraCurrencyModalCloseText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#ffffff',
    ...(Platform.OS === 'ios' ? {
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    } : {}),
  },
};

export default UltraStyledDonationScreen;