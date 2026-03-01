import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';

export default function EnergyCard({ plant, onReadMore }) {
  if (!plant) return null;

  const energyColors = {
    positive: '#43A047',
    negative: '#E53935',
    caution: '#FF9800',
    neutral: '#78909C',
  };
  const energyIcons = {
    positive: 'sunny',
    negative: 'warning',
    caution: 'alert-circle',
    neutral: 'help-circle',
  };

  const eType = plant.energy?.type || 'neutral';
  const eColor = energyColors[eType] || energyColors.neutral;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.energyIcon, { backgroundColor: eColor + '20' }]}>
          <Ionicons name={energyIcons[eType]} size={24} color={eColor} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.plantName}>{plant.commonName}</Text>
          {plant.scientificName && (
            <Text style={styles.sciName}>{plant.scientificName}</Text>
          )}
          {plant.hindiName && (
            <Text style={styles.hindiName}>({plant.hindiName})</Text>
          )}
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: eColor }]}>
          <Text style={styles.scoreText}>{plant.energy?.score || 0}/10</Text>
        </View>
      </View>

      {/* Energy summary */}
      <View style={[styles.section, { backgroundColor: eColor + '10', borderLeftColor: eColor }]}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="flash" size={14} color={eColor} /> Energy & Vibe
        </Text>
        <Text style={styles.sectionText}>{plant.energy?.summary || 'No data available'}</Text>
      </View>

      {/* Vastu */}
      {plant.vastu && (
        <View style={[styles.section, { backgroundColor: '#FFF8E110', borderLeftColor: '#FF9800' }]}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="compass" size={14} color="#FF9800" /> Vastu
          </Text>
          <Text style={styles.sectionText}>{plant.vastu.insight}</Text>
          {plant.vastu.direction && (
            <View style={styles.dirRow}>
              <Ionicons name="navigate" size={12} color={Colors.primary} />
              <Text style={styles.dirText}>Best Direction: {plant.vastu.direction}</Text>
            </View>
          )}
        </View>
      )}

      {/* Health */}
      {plant.healthBenefits && (
        <View style={[styles.section, { backgroundColor: '#E8F5E910', borderLeftColor: '#43A047' }]}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="fitness" size={14} color="#43A047" /> Health Benefits
          </Text>
          <Text style={styles.sectionText}>{plant.healthBenefits.healthSummary}</Text>
          {plant.healthBenefits.nasaApproved && (
            <View style={styles.nasaBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#1E88E5" />
              <Text style={styles.nasaText}>NASA Clean Air Plant</Text>
            </View>
          )}
          {plant.healthBenefits.airPurify && (
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Ionicons name="leaf" size={11} color={Colors.primary} />
                <Text style={styles.tagText}>Air Purifying</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Care tips */}
      {plant.care && (
        <View style={styles.careGrid}>
          {plant.care.sunlight && (
            <View style={styles.careItem}>
              <Ionicons name="sunny-outline" size={16} color="#FF9800" />
              <Text style={styles.careLabel}>Light</Text>
              <Text style={styles.careValue} numberOfLines={2}>{plant.care.sunlight}</Text>
            </View>
          )}
          {plant.care.watering && (
            <View style={styles.careItem}>
              <Ionicons name="water-outline" size={16} color="#1E88E5" />
              <Text style={styles.careLabel}>Water</Text>
              <Text style={styles.careValue} numberOfLines={2}>{plant.care.watering}</Text>
            </View>
          )}
          {plant.care.soil && (
            <View style={styles.careItem}>
              <Ionicons name="earth-outline" size={16} color="#795548" />
              <Text style={styles.careLabel}>Soil</Text>
              <Text style={styles.careValue} numberOfLines={2}>{plant.care.soil}</Text>
            </View>
          )}
          {plant.care.difficulty && (
            <View style={styles.careItem}>
              <Ionicons name="speedometer-outline" size={16} color={Colors.primary} />
              <Text style={styles.careLabel}>Difficulty</Text>
              <Text style={styles.careValue}>{plant.care.difficulty}</Text>
            </View>
          )}
        </View>
      )}

      {/* Placement */}
      {plant.placement && (
        <View style={styles.placementRow}>
          <Ionicons name="home-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.placementText}>
            Best: {plant.placement.ideal} · {plant.placement.tips}
          </Text>
        </View>
      )}

      {/* Read More button */}
      {onReadMore && (
        <TouchableOpacity style={styles.readMoreBtn} onPress={() => onReadMore(plant)}>
          <Text style={styles.readMoreText}>Read More Details</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  energyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  plantName: {
    ...Fonts.subtitle,
    fontSize: 17,
  },
  sciName: {
    ...Fonts.small,
    fontStyle: 'italic',
    marginTop: 1,
  },
  hindiName: {
    ...Fonts.small,
    marginTop: 1,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  scoreText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
  },
  sectionTitle: {
    ...Fonts.caption,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    ...Fonts.regular,
    lineHeight: 20,
  },
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  dirText: {
    ...Fonts.small,
    fontWeight: '600',
    marginLeft: 4,
    color: Colors.primary,
  },
  nasaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  nasaText: {
    ...Fonts.small,
    fontWeight: '600',
    marginLeft: 4,
    color: '#1E88E5',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginRight: Spacing.sm,
  },
  tagText: {
    ...Fonts.small,
    fontWeight: '600',
    marginLeft: 3,
    color: Colors.primary,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  careItem: {
    width: '48%',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    marginRight: '2%',
  },
  careLabel: {
    ...Fonts.small,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  careValue: {
    ...Fonts.caption,
    marginTop: 2,
  },
  placementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  placementText: {
    ...Fonts.caption,
    flex: 1,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  readMoreText: {
    ...Fonts.caption,
    color: Colors.primary,
    fontWeight: '700',
    marginRight: 5,
  },
});
