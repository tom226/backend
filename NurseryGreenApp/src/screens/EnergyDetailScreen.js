import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';

const APP_LOGO = require('../../assets/icon.png');

export default function EnergyDetailScreen({ route, navigation }) {
  const { plant } = route.params;
  if (!plant) return null;

  const energyColors = { positive: '#43A047', negative: '#E53935', caution: '#FF9800', neutral: '#78909C' };
  const eType = plant.energy?.type || 'neutral';
  const eColor = energyColors[eType] || energyColors.neutral;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{plant.commonName}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Name & Score Header */}
        <View style={styles.nameSection}>
          <View style={[styles.bigIcon, { backgroundColor: eColor + '20' }]}>
            <Image source={APP_LOGO} style={styles.bigLogo} resizeMode="contain" />
          </View>
          <Text style={styles.commonName}>{plant.commonName}</Text>
          {plant.scientificName && <Text style={styles.sciName}>{plant.scientificName}</Text>}
          {plant.hindiName && <Text style={styles.hindiName}>Hindi: {plant.hindiName}</Text>}
          <View style={[styles.scorePill, { backgroundColor: eColor }]}>
            <Ionicons name="flash" size={14} color="#FFF" />
            <Text style={styles.scorePillText}>Energy Score: {plant.energy?.score || 0}/10</Text>
          </View>
        </View>

        {/* Energy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="flash" size={16} color={eColor} /> Energy & Vibe
          </Text>
          <Text style={styles.summary}>{plant.energy?.summary}</Text>
          {plant.energy?.detailedDescription && (
            <Text style={styles.detailed}>{plant.energy.detailedDescription}</Text>
          )}
        </View>

        {/* Vastu Section */}
        {plant.vastu && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="compass" size={16} color="#FF9800" /> Vastu & Feng Shui
            </Text>
            <Text style={styles.summary}>{plant.vastu.insight}</Text>
            {plant.vastu.detailedInsight && (
              <Text style={styles.detailed}>{plant.vastu.detailedInsight}</Text>
            )}
            {plant.vastu.direction && (
              <View style={styles.infoChip}>
                <Ionicons name="navigate" size={14} color={Colors.primary} />
                <Text style={styles.infoChipText}>Best Direction: {plant.vastu.direction}</Text>
              </View>
            )}

            {/* Do's and Don'ts */}
            {plant.vastu.dosAndDonts && plant.vastu.dosAndDonts.length > 0 && (
              <View style={styles.dosDonts}>
                <Text style={styles.subTitle}>Do's & Don'ts</Text>
                {plant.vastu.dosAndDonts.map((item, idx) => (
                  <View key={idx} style={styles.ddItem}>
                    <Ionicons
                      name={item.toLowerCase().startsWith("don't") || item.toLowerCase().startsWith('don\'t') || item.toLowerCase().startsWith('avoid') ? 'close-circle' : 'checkmark-circle'}
                      size={16}
                      color={item.toLowerCase().startsWith("don't") || item.toLowerCase().startsWith('don\'t') || item.toLowerCase().startsWith('avoid') ? Colors.error : Colors.success}
                    />
                    <Text style={styles.ddText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Health Benefits */}
        {plant.healthBenefits && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="fitness" size={16} color="#43A047" /> Health Benefits
            </Text>
            <Text style={styles.summary}>{plant.healthBenefits.healthSummary}</Text>
            {plant.healthBenefits.healthDetailed && (
              <Text style={styles.detailed}>{plant.healthBenefits.healthDetailed}</Text>
            )}

            <View style={styles.tagsRow}>
              {plant.healthBenefits.airPurify && (
                <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                  <Image source={APP_LOGO} style={styles.tagLogo} resizeMode="contain" />
                  <Text style={[styles.tagText, { color: '#43A047' }]}>Air Purifying</Text>
                </View>
              )}
              {plant.healthBenefits.nasaApproved && (
                <View style={[styles.tag, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="shield-checkmark" size={12} color="#1E88E5" />
                  <Text style={[styles.tagText, { color: '#1E88E5' }]}>NASA Approved</Text>
                </View>
              )}
            </View>

            {/* Toxins Removed */}
            {plant.healthBenefits.toxinsRemoved && plant.healthBenefits.toxinsRemoved.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.subTitle}>Toxins Removed</Text>
                {plant.healthBenefits.toxinsRemoved.map((t, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.listDot} />
                    <Text style={styles.listText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Medicinal Uses */}
            {plant.healthBenefits.medicinalUses && plant.healthBenefits.medicinalUses.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.subTitle}>Medicinal Uses</Text>
                {plant.healthBenefits.medicinalUses.map((m, i) => (
                  <View key={i} style={styles.listItem}>
                    <Ionicons name="medical" size={12} color={Colors.primary} />
                    <Text style={styles.listText}>{m}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Spiritual */}
        {plant.spiritual && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="sparkles" size={16} color="#7B1FA2" /> Spiritual Significance
            </Text>
            {plant.spiritual.significance && <Text style={styles.detailed}>{plant.spiritual.significance}</Text>}
            {plant.spiritual.festivals && <Text style={styles.detailed}>Festivals: {plant.spiritual.festivals}</Text>}
            {plant.spiritual.deities && <Text style={styles.detailed}>Associated Deities: {plant.spiritual.deities}</Text>}
            {plant.spiritual.traditions && <Text style={styles.detailed}>{plant.spiritual.traditions}</Text>}
          </View>
        )}

        {/* Care Guide */}
        {plant.care && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="water" size={16} color="#1E88E5" /> Care Guide
            </Text>
            <View style={styles.careGrid}>
              {plant.care.sunlight && (
                <View style={styles.careBox}>
                  <Ionicons name="sunny-outline" size={20} color="#FF9800" />
                  <Text style={styles.careLabel}>Sunlight</Text>
                  <Text style={styles.careValue}>{plant.care.sunlight}</Text>
                </View>
              )}
              {plant.care.watering && (
                <View style={styles.careBox}>
                  <Ionicons name="water-outline" size={20} color="#1E88E5" />
                  <Text style={styles.careLabel}>Watering</Text>
                  <Text style={styles.careValue}>{plant.care.watering}</Text>
                </View>
              )}
              {plant.care.soil && (
                <View style={styles.careBox}>
                  <Ionicons name="earth-outline" size={20} color="#795548" />
                  <Text style={styles.careLabel}>Soil</Text>
                  <Text style={styles.careValue}>{plant.care.soil}</Text>
                </View>
              )}
              {plant.care.temperature && (
                <View style={styles.careBox}>
                  <Ionicons name="thermometer-outline" size={20} color="#E53935" />
                  <Text style={styles.careLabel}>Temperature</Text>
                  <Text style={styles.careValue}>{plant.care.temperature}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Healthy Indicators */}
        {plant.healthyIndicators && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="heart" size={16} color={Colors.error} /> Healthy Plant Signs
            </Text>
            {plant.healthyIndicators.leafColor && (
              <Text style={styles.detailed}>Leaf Color: {plant.healthyIndicators.leafColor}</Text>
            )}
            {plant.healthyIndicators.leafTexture && (
              <Text style={styles.detailed}>Leaf Texture: {plant.healthyIndicators.leafTexture}</Text>
            )}
            {plant.healthyIndicators.growth && (
              <Text style={styles.detailed}>Growth: {plant.healthyIndicators.growth}</Text>
            )}
            {plant.healthyIndicators.signs && plant.healthyIndicators.signs.length > 0 && (
              <View style={styles.listSection}>
                {plant.healthyIndicators.signs.map((s, i) => (
                  <View key={i} style={styles.listItem}>
                    <Ionicons name="checkmark" size={12} color={Colors.success} />
                    <Text style={styles.listText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* References */}
        {plant.references && plant.references.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="book" size={16} color={Colors.textSecondary} /> References
            </Text>
            {plant.references.map((ref, i) => (
              <View key={i} style={styles.refItem}>
                <Ionicons name="document-text-outline" size={12} color={Colors.textLight} />
                <Text style={styles.refText}>{ref.title || ref.source}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
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
  title: { ...Fonts.title, fontSize: 18, flex: 1, textAlign: 'center' },
  scrollContent: { padding: Spacing.lg },
  nameSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  bigIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  bigLogo: { width: 48, height: 48, borderRadius: 24 },
  commonName: { ...Fonts.title, fontSize: 24, textAlign: 'center' },
  sciName: { ...Fonts.caption, fontStyle: 'italic', marginTop: 4, textAlign: 'center' },
  hindiName: { ...Fonts.caption, marginTop: 2, textAlign: 'center' },
  scorePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, marginTop: Spacing.md },
  scorePillText: { color: '#FFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadows.small,
  },
  sectionTitle: { ...Fonts.subtitle, fontSize: 16, marginBottom: Spacing.md, color: Colors.text },
  summary: { ...Fonts.medium, fontSize: 14, lineHeight: 22, color: Colors.text, marginBottom: Spacing.sm },
  detailed: { ...Fonts.regular, lineHeight: 22, color: Colors.textSecondary, marginBottom: Spacing.sm },
  subTitle: { ...Fonts.medium, fontSize: 13, marginBottom: Spacing.sm, marginTop: Spacing.md, color: Colors.text },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: Spacing.sm,
  },
  infoChipText: { ...Fonts.caption, fontWeight: '600', marginLeft: 5, color: Colors.primary },
  dosDonts: { marginTop: Spacing.md },
  ddItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  ddText: { ...Fonts.regular, flex: 1, marginLeft: Spacing.sm, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, gap: Spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full },
  tagText: { ...Fonts.small, fontWeight: '700', marginLeft: 4 },
  tagLogo: { width: 12, height: 12, borderRadius: 6 },
  listSection: { marginTop: Spacing.sm },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  listDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6, marginRight: Spacing.sm },
  listText: { ...Fonts.caption, flex: 1, lineHeight: 18, marginLeft: Spacing.sm },
  careGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  careBox: {
    width: '48%', backgroundColor: Colors.card, padding: Spacing.md, borderRadius: Radius.md,
  },
  careLabel: { ...Fonts.small, fontWeight: '700', marginTop: 6, textTransform: 'uppercase' },
  careValue: { ...Fonts.caption, marginTop: 3, lineHeight: 18 },
  refItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  refText: { ...Fonts.small, flex: 1, marginLeft: Spacing.sm, lineHeight: 16 },
});
