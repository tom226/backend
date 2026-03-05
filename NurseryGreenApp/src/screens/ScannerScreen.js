import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import EnergyCard from '../components/EnergyCard';
import api from '../api/client';
import { haptic } from '../utils/platform';

export default function ScannerScreen({ navigation, route }) {
  const initialTab = route?.params?.tab || 'diagnose';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [plantName, setPlantName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [energyResults, setEnergyResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async (useCamera) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed to scan your plant.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library access is needed to select a plant image.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        haptic.success();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const symptomOptions = [
    'Yellow leaves', 'Brown spots', 'Wilting', 'White powder',
    'Holes in leaves', 'Root rot', 'Stunted growth', 'Leaf curl',
    'Dry edges', 'Black spots', 'White flies', 'Mealybugs',
  ];
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleDiagnose = async () => {
    if (!plantName.trim()) {
      Alert.alert('Plant Name Required', 'Please enter your plant name to diagnose.');
      return;
    }
    setLoading(true);
    setDiagnosisResult(null);
    try {
      const allSymptoms = [...selectedSymptoms];
      if (symptoms.trim()) allSymptoms.push(symptoms.trim());

      const result = await api.analyzePlant({
        plantName: plantName.trim(),
        symptoms: allSymptoms,
        leafCondition: selectedSymptoms.join(', '),
        soilCondition: '',
        environment: 'indoor',
      });
      setDiagnosisResult(result);
    } catch (error) {
      // Fallback offline diagnosis
      setDiagnosisResult({
        diagnosis: {
          diseaseName: selectedSymptoms.length > 0 ? 'Possible Plant Stress' : 'Plant Looks Healthy',
          severity: selectedSymptoms.length > 3 ? 'moderate' : 'mild',
          summary: selectedSymptoms.length > 0
            ? `Based on the symptoms (${selectedSymptoms.join(', ')}), your ${plantName} may be experiencing stress. Common causes include overwatering, underwatering, or pest infestation.`
            : `Your ${plantName} appears to be healthy! Keep maintaining proper care routine with adequate sunlight, water, and nutrition.`,
          solutions: [
            { title: 'Check Watering', steps: ['Ensure well-draining soil', 'Water when top inch is dry', 'Avoid waterlogging'] },
            { title: 'Inspect for Pests', steps: ['Check under leaves', 'Look for webs or bugs', 'Use neem oil spray if pests found'] },
            { title: 'Optimize Light', steps: ['Ensure adequate sunlight', 'Avoid direct harsh afternoon sun', 'Rotate plant weekly'] },
          ],
        },
        matched: false,
        offline: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnergySearch = async () => {
    if (!plantName.trim()) {
      Alert.alert('Plant Name Required', 'Please enter a plant name to check its energy.');
      return;
    }
    setLoading(true);
    setEnergyResults([]);
    try {
      const result = await api.matchEnergy(plantName.trim(), null, 3);
      if (result.matches && result.matches.length > 0) {
        setEnergyResults(result.matches.map(m => m.plant));
      } else {
        // Try search
        const searchResult = await api.searchEnergy(plantName.trim(), 3);
        if (searchResult.entries && searchResult.entries.length > 0) {
          setEnergyResults(searchResult.entries);
        } else {
          Alert.alert('Not Found', `No energy data found for "${plantName}". Try common plant names like Tulsi, Money Plant, Snake Plant.`);
        }
      }
    } catch (error) {
      Alert.alert('Offline', 'Could not connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    mild: Colors.warning,
    moderate: '#FF5722',
    severe: Colors.error,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Plant Scanner</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diagnose' && styles.tabActive]}
          onPress={() => setActiveTab('diagnose')}
        >
          <Ionicons name="medkit" size={18} color={activeTab === 'diagnose' ? Colors.primary : Colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'diagnose' && styles.tabTextActive]}>Diagnose</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'energy' && styles.tabActive]}
          onPress={() => setActiveTab('energy')}
        >
          <Ionicons name="flash" size={18} color={activeTab === 'energy' ? Colors.primary : Colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'energy' && styles.tabTextActive]}>Energy & Vastu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Plant Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Plant Name</Text>
          <View style={styles.searchInput}>
            <Image source={require('../../assets/icon.png')} style={styles.searchLogo} resizeMode="contain" />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Tulsi, Money Plant, Rose..."
              placeholderTextColor={Colors.textLight}
              value={plantName}
              onChangeText={setPlantName}
            />
          </View>
        </View>

        {activeTab === 'diagnose' && (
          <>
            {/* Camera/Gallery Buttons */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Scan Your Plant</Text>
              <View style={styles.cameraRow}>
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => pickImage(true)}
                >
                  <Ionicons name="camera" size={28} color={Colors.primary} />
                  <Text style={styles.cameraBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="images" size={28} color={Colors.primary} />
                  <Text style={styles.cameraBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
              {selectedImage && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Symptoms Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select Symptoms</Text>
              <View style={styles.symptomsGrid}>
                {symptomOptions.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomChip,
                      selectedSymptoms.includes(symptom) && styles.symptomChipActive,
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[
                      styles.symptomText,
                      selectedSymptoms.includes(symptom) && styles.symptomTextActive,
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Extra symptoms */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Other Symptoms (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.fullInput]}
                placeholder="Describe any other symptoms..."
                placeholderTextColor={Colors.textLight}
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
              />
            </View>

            {/* Diagnose Button */}
            <TouchableOpacity
              style={[styles.scanBtn, loading && { opacity: 0.7 }]}
              onPress={handleDiagnose}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="scan" size={20} color={Colors.white} />
                  <Text style={styles.scanBtnText}>Diagnose Plant</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Diagnosis Result */}
            {diagnosisResult && diagnosisResult.diagnosis && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={[styles.severityBadge, {
                    backgroundColor: (severityColors[diagnosisResult.diagnosis.severity] || Colors.success) + '20',
                  }]}>
                    <Ionicons
                      name={diagnosisResult.diagnosis.severity === 'mild' ? 'checkmark-circle' : 'warning'}
                      size={18}
                      color={severityColors[diagnosisResult.diagnosis.severity] || Colors.success}
                    />
                    <Text style={[styles.severityText, {
                      color: severityColors[diagnosisResult.diagnosis.severity] || Colors.success,
                    }]}>
                      {diagnosisResult.diagnosis.severity || 'healthy'}
                    </Text>
                  </View>
                  {diagnosisResult.offline && (
                    <View style={styles.offlineBadge}>
                      <Text style={styles.offlineText}>Offline</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.diseaseName}>{diagnosisResult.diagnosis.diseaseName}</Text>
                <Text style={styles.diagnosisSummary}>{diagnosisResult.diagnosis.summary}</Text>

                {/* Solutions */}
                {(diagnosisResult.diagnosis.solutions || []).map((solution, idx) => (
                  <View key={idx} style={styles.solutionCard}>
                    <Text style={styles.solutionTitle}>
                      <Ionicons name="flask" size={14} color={Colors.primary} />
                      {'  '}{solution.title}
                    </Text>
                    {(solution.steps || []).map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <View style={styles.stepDot} />
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                ))}

                {/* Recommended Products */}
                <TouchableOpacity
                  style={styles.shopLink}
                  onPress={() => navigation.navigate('ShopTab')}
                >
                  <Ionicons name="cart" size={16} color={Colors.primary} />
                  <Text style={styles.shopLinkText}>Shop Recommended Products</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {activeTab === 'energy' && (
          <>
            {/* Energy Search Button */}
            <TouchableOpacity
              style={[styles.scanBtn, loading && { opacity: 0.7 }]}
              onPress={handleEnergySearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color={Colors.white} />
                  <Text style={styles.scanBtnText}>Check Plant Energy</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Energy Results */}
            {energyResults.map((plant, idx) => (
              <EnergyCard
                key={plant.slug || idx}
                plant={plant}
                onReadMore={(p) => navigation.navigate('EnergyDetail', { plant: p })}
              />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: Spacing.xs },
  title: { ...Fonts.title, fontSize: 20 },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: Radius.full,
    backgroundColor: Colors.card, marginHorizontal: Spacing.xs,
  },
  tabActive: { backgroundColor: Colors.accentLight },
  tabText: { ...Fonts.caption, fontWeight: '600', marginLeft: 6 },
  tabTextActive: { color: Colors.primary },
  scrollContent: { padding: Spacing.lg },
  inputSection: { marginBottom: Spacing.lg },
  inputLabel: { ...Fonts.caption, fontWeight: '700', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border, ...Shadows.small,
  },
  searchLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  textInput: { flex: 1, ...Fonts.regular, paddingVertical: Spacing.md, marginLeft: Spacing.sm, color: Colors.text },
  fullInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border, height: 80,
    textAlignVertical: 'top',
  },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  symptomChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  symptomChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  symptomText: { ...Fonts.caption, fontWeight: '600' },
  symptomTextActive: { color: Colors.white },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: Radius.lg,
    marginBottom: Spacing.xl, ...Shadows.medium,
  },
  scanBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16, marginLeft: Spacing.sm },
  resultCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.medium,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  severityBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 5, borderRadius: Radius.full,
  },
  severityText: { fontSize: 12, fontWeight: '700', marginLeft: 5, textTransform: 'uppercase' },
  offlineBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  offlineText: { ...Fonts.small, color: '#FF9800', fontWeight: '600' },
  diseaseName: { ...Fonts.title, fontSize: 18, marginBottom: Spacing.sm },
  diagnosisSummary: { ...Fonts.regular, lineHeight: 22, color: Colors.textSecondary, marginBottom: Spacing.lg },
  solutionCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  solutionTitle: { ...Fonts.medium, fontSize: 14, marginBottom: Spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, paddingLeft: Spacing.sm },
  stepDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary,
    marginTop: 6, marginRight: Spacing.sm,
  },
  stepText: { ...Fonts.caption, flex: 1, lineHeight: 18 },
  shopLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: Spacing.sm,
  },
  shopLinkText: { ...Fonts.caption, color: Colors.primary, fontWeight: '700', marginHorizontal: Spacing.sm },
  cameraRow: {
    flexDirection: 'row', gap: Spacing.md,
  },
  cameraBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingVertical: Spacing.lg, borderWidth: 1.5,
    borderColor: Colors.primary, borderStyle: 'dashed',
  },
  cameraBtnText: {
    ...Fonts.caption, fontWeight: '700', color: Colors.primary, marginTop: Spacing.xs,
  },
  imagePreview: {
    marginTop: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%', height: 200, borderRadius: Radius.lg,
  },
  removeImageBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.surface, borderRadius: 12,
  },
});
