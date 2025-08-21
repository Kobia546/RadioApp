// ============================================================================
// GÉNÉRATEUR D'IMAGES QR CODES CHIFFRÉS - Compatible Node.js
// ============================================================================
// Sauvegarde comme "generateQRImages.js" et exécute avec : node generateQRImages.js

const CryptoJS = require('crypto-js');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENCRYPTION_CONFIG = {
  SECRET_KEY: 'RBN_2024_SECURE_KEY_BENIDEDIEU_MINISTRIES_MC2G',
  APP_PREFIX: 'RBN_ENCRYPTED_',
  VERSION: 'v1.0'
};

// ============================================================================
// FONCTIONS DE CHIFFREMENT
// ============================================================================

const encryptQRData = (data) => {
  try {
    const payload = {
      version: ENCRYPTION_CONFIG.VERSION,
      timestamp: Date.now(),
      data: data
    };

    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_CONFIG.SECRET_KEY).toString();
    return `${ENCRYPTION_CONFIG.APP_PREFIX}${encrypted}`;
  } catch (error) {
    console.error('❌ Erreur de chiffrement:', error);
    throw new Error('Impossible de chiffrer les données');
  }
};

const generateEncryptedQRCodes = () => {
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
    description: 'Soutien Radio - Le canal de la Grandeur',
    types: ['soutien_radio'],
    frequency: '103.6',
    color: '#388e3c'
  };
  qrCodes.RADIO = encryptQRData(radioData);

  return qrCodes;
};

// ============================================================================
// GÉNÉRATEUR D'IMAGES QR
// ============================================================================

const generateQRImages = async () => {
  console.log('🎨 GÉNÉRATION DES IMAGES QR CODES CHIFFRÉS');
  console.log('='.repeat(50));

  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = './qr_codes_generated';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log('📁 Dossier créé:', outputDir);
  }

  try {
    // Générer les QR codes chiffrés
    const qrCodes = generateEncryptedQRCodes();
    console.log(`📱 ${Object.keys(qrCodes).length} QR codes à générer...\n`);

    // Générer les images pour chaque section
    for (const [section, encryptedData] of Object.entries(qrCodes)) {
      console.log(`🔄 Génération QR ${section}...`);
      
      try {
        // Options de génération QR
        const qrOptions = {
          width: 512,
          margin: 3,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        };

        // Générer l'image QR en base64
        const qrImage = await QRCode.toDataURL(encryptedData, qrOptions);
        
        // Sauvegarder l'image
        const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
        const fileName = `qr_${section.toLowerCase()}.png`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, base64Data, 'base64');
        
        console.log(`✅ ${fileName} généré`);
        console.log(`   📊 Taille données: ${encryptedData.length} caractères`);
        console.log(`   📁 Sauvegardé: ${filePath}`);
        console.log(`   🔐 Aperçu: ${encryptedData.substring(0, 60)}...\n`);
        
      } catch (error) {
        console.error(`❌ Erreur génération QR ${section}:`, error.message);
      }
    }

    // Générer aussi un fichier texte avec les données
    const textFileName = path.join(outputDir, 'qr_codes_data.txt');
    let textContent = '🔐 QR CODES CHIFFRÉS - Radio Bonne Nouvelle\n';
    textContent += '='.repeat(50) + '\n\n';
    
    Object.entries(qrCodes).forEach(([section, data]) => {
      textContent += `${section}:\n${data}\n\n`;
    });
    
    fs.writeFileSync(textFileName, textContent);
    console.log(`📄 Fichier texte généré: ${textFileName}`);

    // Générer un fichier HTML pour prévisualisation
    await generateHTMLPreview(qrCodes, outputDir);

    console.log('\n🎉 GÉNÉRATION TERMINÉE !');
    console.log(`📁 Tous les fichiers sont dans: ${outputDir}`);
    console.log('📱 Tu peux maintenant imprimer les QR codes ou les utiliser dans ton app !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// ============================================================================
// GÉNÉRATEUR DE PRÉVISUALISATION HTML
// ============================================================================

const generateHTMLPreview = async (qrCodes, outputDir) => {
  console.log('🌐 Génération de la prévisualisation HTML...');
  
  try {
    let htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes - Radio Bonne Nouvelle</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #1a4a1a, #2e7d32);
            color: white;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
        }
        .qr-card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .qr-image {
            width: 250px;
            height: 250px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            padding: 10px;
        }
        .qr-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .qr-description {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .qr-data {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-top: 15px;
        }
        .print-button {
            background: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        }
        .print-button:hover {
            background: #45a049;
        }
        @media print {
            body { background: white; color: black; }
            .qr-card { background: white; border: 2px solid #333; }
            .qr-data { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 QR Codes Sécurisés</h1>
        <h2>Radio Bonne Nouvelle - Le canal de la Grandeur</h2>
        <p>QR codes chiffrés pour l'application mobile</p>
        <button class="print-button" onclick="window.print()">🖨️ Imprimer</button>
    </div>
    
    <div class="qr-grid">
`;

    // Générer une carte pour chaque QR code
    for (const [section, encryptedData] of Object.entries(qrCodes)) {
      // Générer l'image QR en ligne
      const qrImage = await QRCode.toDataURL(encryptedData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      const sectionInfo = {
        'EGLISE': { name: 'Eglise MC2G Groupe', desc: 'Dîmes & Offrandes', icon: '⛪' },
        'MINISTERE': { name: 'FEA BENIDEDIEU Ministries', desc: 'Soutenir l\'Homme de Dieu', icon: '🙏' },
        'RADIO': { name: 'Radio Bonne Nouvelle', desc: 'Soutien Radio - 103.6 FM', icon: '📻' }
      };

      const info = sectionInfo[section];

      htmlContent += `
        <div class="qr-card">
            <div class="qr-title">${info.icon} ${info.name}</div>
            <div class="qr-description">${info.desc}</div>
            <img src="${qrImage}" alt="QR Code ${section}" class="qr-image">
            <div>
                <strong>Section:</strong> ${section}<br>
                <strong>Taille:</strong> ${encryptedData.length} caractères<br>
                <strong>Chiffrement:</strong> AES-256
            </div>
            <div class="qr-data">
                <strong>Données chiffrées:</strong><br>
                ${encryptedData}
            </div>
        </div>
      `;
    }

    htmlContent += `
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding: 20px;">
        <h3>📱 Instructions d'utilisation</h3>
        <p>1. Imprimez ces QR codes ou affichez-les sur écran</p>
        <p>2. Utilisez l'application Radio Bonne Nouvelle</p>
        <p>3. Allez dans la section "QR Code"</p>
        <p>4. Scannez l'un de ces QR codes sécurisés</p>
        <p>5. L'application vous dirigera vers la page de don correspondante</p>
        
        <div style="margin-top: 30px; padding: 20px; background: rgba(255,193,7,0.2); border-radius: 10px;">
            <h4>🔐 Sécurité</h4>
            <p>Ces QR codes sont chiffrés avec AES-256 et ne peuvent être déchiffrés que par votre application officielle.</p>
            <p>Toute tentative de scan avec une autre application ne révélera aucune information sensible.</p>
        </div>
    </div>
</body>
</html>
`;

    const htmlPath = path.join(outputDir, 'qr_preview.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Prévisualisation HTML: ${htmlPath}`);
    console.log('💡 Ouvre ce fichier dans ton navigateur pour voir tous les QR codes !');
  } catch (error) {
    console.error('❌ Erreur génération HTML:', error.message);
  }
};

// ============================================================================
// VÉRIFICATION DES DÉPENDANCES
// ============================================================================

const checkDependencies = () => {
  try {
    require('qrcode');
    return true;
  } catch (error) {
    console.error('❌ Dépendance manquante: qrcode');
    console.log('📦 Installe avec: npm install qrcode');
    return false;
  }
};

// ============================================================================
// EXÉCUTION PRINCIPALE
// ============================================================================

if (require.main === module) {
  console.log('🚀 GÉNÉRATEUR D\'IMAGES QR CODES CHIFFRÉS');
  console.log('='.repeat(50));
  
  // Vérifier les dépendances
  if (!checkDependencies()) {
    console.log('\n❌ Installation requise:');
    console.log('npm install qrcode crypto-js');
    process.exit(1);
  }
  
  // Générer les images
  generateQRImages().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = {
  generateQRImages,
  generateEncryptedQRCodes,
  encryptQRData
};