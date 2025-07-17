import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [playing, setPlaying] = useState(false);

  if (screen === 'radio') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.radioScreen}>
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => setScreen('home')}
              style={styles.backBtn}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>RADIO BONNE NOUVELLE</Text>
          </View>

          <View style={styles.center}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>📻 RBN</Text>
            </View>
            <Text style={styles.name}>RADIO BONNE NOUVELLE</Text>
            <Text style={styles.freq}>105.6 FM</Text>
            <Text style={styles.slogan}>Le canal de la Grandeur</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.playBtn, playing && styles.pauseBtn]}
              onPress={() => {
                setPlaying(!playing);
                Alert.alert(playing ? 'Pause' : 'Play', 'Simulation audio');
              }}>
              <Text style={styles.playText}>{playing ? '⏸️' : '▶️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.status}>
            {playing ? '🔴 SIMULATION EN DIRECT' : 'Appuyez pour simuler'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.homeScreen}>
        <Text style={styles.menuTitle}>Menu Principal</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setScreen('radio')}>
          <Text style={styles.menuText}>📻 Ma Radio</Text>
          <Text>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Facebook', 'Fonction à venir!')}>
          <Text style={styles.menuText}>📘 Facebook</Text>
          <Text>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Réveil', 'Fonction à venir!')}>
          <Text style={styles.menuText}>⏰ Réveil</Text>
          <Text>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  homeScreen: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  menuTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: 'white', 
    padding: 20, 
    marginBottom: 15, 
    borderRadius: 10,
    elevation: 2 
  },
  menuText: { fontSize: 18, fontWeight: '600' },
  radioScreen: { flex: 1, backgroundColor: '#2e7d32' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    marginTop: 20 
  },
  backBtn: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 10, 
    borderRadius: 8 
  },
  backText: { color: 'white', fontSize: 16 },
  title: { 
    flex: 1, 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginRight: 50
  },
  center: { alignItems: 'center', paddingVertical: 50 },
  logo: { 
    width: 120, 
    height: 120, 
    backgroundColor: 'white', 
    borderRadius: 60, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
  name: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  freq: { color: 'white', fontSize: 18, marginBottom: 10 },
  slogan: { color: 'white', fontSize: 16, fontStyle: 'italic', opacity: 0.9 },
  controls: { alignItems: 'center', paddingVertical: 40 },
  playBtn: { 
    width: 80, 
    height: 80, 
    backgroundColor: 'white', 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 8
  },
  pauseBtn: { backgroundColor: '#ffeb3b' },
  playText: { fontSize: 35 },
  status: { 
    color: 'white', 
    fontSize: 16, 
    textAlign: 'center', 
    fontWeight: '600' 
  },
});