import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProgressCircle = ({ percentage }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressCircle}>
        <View style={[styles.progressBackground]} />
        <View style={[styles.progressFill, { 
          transform: [{ rotate: `${(percentage / 100) * 360}deg` }] 
        }]} />
      </View>
      <View style={styles.progressCenter}>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    </View>
  );
};

const StatCard = ({ label, value, color }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue} color={color}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QueueItem = ({ id, type, time, status, iconName }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'Queued': 
        return { backgroundColor: '#3B82F6', color: '#FFFFFF' };
      case 'Processing': 
        return { backgroundColor: '#F59E0B', color: '#FFFFFF' };
      case 'Completed': 
        return { backgroundColor: '#10B981', color: '#FFFFFF' };
      default: 
        return { backgroundColor: '#6B7280', color: '#FFFFFF' };
    }
  };

  return (
    <View style={styles.queueItem}>
      <View style={styles.queueLeft}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={18} color="#6B7280" />
        </View>
        <View style={styles.queueInfo}>
          <Text style={styles.queueId}>{id}</Text>
          <Text style={styles.queueDetails}>{type} • {time}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusStyle().backgroundColor }]}>
        <Text style={[styles.statusText, { color: getStatusStyle().color }]}>{status}</Text>
      </View>
    </View>
  );
};

const FeatureItem = ({ title, subtitle, available, iconName }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureLeft}>
      <View style={styles.featureIconContainer}>
        <Icon name={iconName} size={18} color={available ? '#10B981' : '#EF4444'} />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={[styles.featureSubtitle, { color: available ? '#6B7280' : '#EF4444' }]}>
          {subtitle}
        </Text>
      </View>
    </View>
    <View style={[styles.featureStatus, { 
      backgroundColor: available ? '#D1FAE5' : '#FEE2E2',
      borderColor: available ? '#10B981' : '#EF4444'
    }]}>
      <Icon 
        name={available ? 'check' : 'times'} 
        size={12} 
        color={available ? '#10B981' : '#EF4444'} 
      />
    </View>
  </View>
);

const OfflineSyncDashboard = () => {
  const queueItems = [
    { 
      id: 'WO-1234', 
      type: 'Work Order', 
      time: '10:45 AM', 
      status: 'Queued',
      iconName: 'clipboard'
    },
    { 
      id: 'INS-5678', 
      type: 'Inspection', 
      time: '10:43 AM', 
      status: 'Processing',
      iconName: 'search'
    },
    { 
      id: 'SR-9012', 
      type: 'Service Request', 
      time: '10:40 AM', 
      status: 'Queued',
      iconName: 'file-text-o'
    },
    { 
      id: 'MT-3456', 
      type: 'Maintenance', 
      time: '10:35 AM', 
      status: 'Completed',
      iconName: 'wrench'
    }
  ];

  const offlineFeatures = [
    { 
      title: 'Work Orders', 
      subtitle: 'Available offline', 
      available: true, 
      iconName: 'clipboard' 
    },
    { 
      title: 'Service Requests', 
      subtitle: 'Available offline', 
      available: true, 
      iconName: 'file-text-o' 
    },
    { 
      title: 'Asset Management', 
      subtitle: 'Available offline', 
      available: true, 
      iconName: 'database' 
    },
    { 
      title: 'Reports', 
      subtitle: 'Requires connection', 
      available: false, 
      iconName: 'bar-chart' 
    },
    { 
      title: 'User Management', 
      subtitle: 'Requires connection', 
      available: false, 
      iconName: 'users' 
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Sync</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="refresh" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Offline Readiness Card */}
        <View style={styles.readinessCard}>
          <Text style={styles.cardTitle}>Offline Readiness</Text>
          
          <ProgressCircle percentage={92} />
          
          <View style={styles.syncInfoContainer}>
            <View style={styles.syncInfoItem}>
              <Icon name="clock-o" size={14} color="#6B7280" />
              <Text style={styles.syncInfoText}>Last synced: 2 min ago</Text>
            </View>
            <View style={styles.syncInfoItem}>
              <Icon name="hdd-o" size={14} color="#6B7280" />
              <Text style={styles.syncInfoText}>Cache size: 4.2 MB</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Queued" value="24" color="#3B82F6" />
            <View style={styles.statDivider} />
            <StatCard label="Completed" value="156" color="#10B981" />
            <View style={styles.statDivider} />
            <StatCard label="Pending" value="18" color="#F59E0B" />
          </View>
        </View>

        {/* Sync Queue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Queue</Text>
          <View style={styles.card}>
            {queueItems.map((item, index) => (
              <QueueItem
                key={index}
                id={item.id}
                type={item.type}
                time={item.time}
                status={item.status}
                iconName={item.iconName}
              />
            ))}
          </View>
        </View>

        {/* Offline Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Features</Text>
          <View style={styles.card}>
            {offlineFeatures.map((feature, index) => (
              <FeatureItem
                key={index}
                title={feature.title}
                subtitle={feature.subtitle}
                available={feature.available}
                iconName={feature.iconName}
              />
            ))}
          </View>
        </View>

        {/* Sync Button */}
        <TouchableOpacity style={styles.syncButton}>
          <Icon name="refresh" size={16} color="#FFFFFF" style={styles.syncButtonIcon} />
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  readinessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  progressContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    position: 'relative',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
  },
  progressBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
  },
  progressFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderColor: '#3B82F6',
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: -1,
  },
  syncInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  syncInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncInfoText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  queueInfo: {
    flex: 1,
  },
  queueId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  queueDetails: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  featureSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  featureStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  syncButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  syncButtonIcon: {
    marginRight: 8,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});

export default OfflineSyncDashboard;