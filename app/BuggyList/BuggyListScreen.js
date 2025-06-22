import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Loader from '../LoadingScreen/AnimatedLoader';
import ProgressPage from '../AssetDetails/ProgressBar';
import CommentsPage from '../WoComments/WoCommentsScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import CardRenderer from '../BuggyNewCardComp/CardsMainScreen';
import InfoCard from './InstructionDetails';
import { workOrderService } from '../../services/apis/workorderApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const BuggyListPage = ({ uuid, wo, restricted, restrictedTime, id, type, sequence, handleBuggyChange }) => {
  const [data, setData] = useState([]);
  const [assetDescription, setAssetDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const animation = useState(new Animated.Value(0))[0];
  const [canComplete, setCancomplete] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [shouldRenderComments, setShouldRenderComments] = useState(false);
  const navigation = useNavigation();
  const { height } = Dimensions.get('screen');
  const { nightMode } = usePermissions();

  useEffect(() => {
    setLoading(true);
    loadBuggyList();
    if (sequence !== 'HK') loadAssetDescription();
  }, [uuid]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardOpen(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRenderComments(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const loadBuggyList = async () => {
    try {
      let result = sequence === 'HK' ? [] : await workOrderService.getInstructionsForWo({
        asset_uuid: wo.asset_uuid,
        ref_uuid: uuid,
        ref_type: 'WO',
      });
      setData(result?.data || []);
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const loadAssetDescription = async () => {
    try {
      const response = await workOrderService.getWoInfo(uuid);
      setAssetDescription(response?.data[0]?.wo.Description || 'No description available.');
    } catch (error) {
      setError(error.message || 'Error fetching asset description.');
    }
  };

  const handleRefreshData = async () => {
    await loadBuggyList();
  };

  const toggleExpand = () => {
    handleBuggyChange(false);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 100,
      useNativeDriver: false,
    }).start(() => setExpanded(!expanded));
  };

  const commentsHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height >= 800 ? height * 0.7 : height * 0.65],
    extrapolate: 'clamp',
  });

  const groupBy = (array, key) =>
    array?.reduce((result, current) => {
      const groupKey = current[key] || 'Ungrouped';
      (result[groupKey] ||= []).push(current);
      return result;
    }, {});

  if (loading) return <Loader />;
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: nightMode ? '#121212' : '#f0f4f7' }]}>
        <Text style={[styles.errorText, { color: nightMode ? '#FF6B6B' : 'red' }]}>{error}</Text>
        <TouchableOpacity onPress={handleRefreshData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.pageWrapper, { backgroundColor: nightMode ? '#121212' : '#f0f4f7' }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
        >
          <InfoCard wo={wo} restricted={restricted} restrictedTime={restrictedTime} description={assetDescription} />

          {data.length ? (
            Object.entries(groupBy(data, 'group')).map(([groupName, items], groupIndex) => (
<View
  key={groupIndex}
  style={{
    marginBottom: 20,
    paddingBottom: 50,
backgroundColor: groupIndex % 2 === 1 
  ? (nightMode ? '#1C1C2E' : '#D0E6FF') 
  : 'transparent',
    borderRadius: 10,
    paddingTop: 8,
  }}
>
                <View
                  style={[
                    styles.groupHeader,
                  ]}
                >
                  <FontAwesome5 name="folder-open" size={18} color={nightMode ? '#E5E5EA' : '#074B7C'} style={styles.groupIcon} />
                  <Text style={[styles.groupTitle, { color: nightMode ? '#E5E5EA' : '#074B7C' }]}>{groupName}</Text>
                </View>
                {items.map((item, index) => (
                  <CardRenderer
                    key={item.id}
                    restricted={restricted}
                    item={item}
                    onUpdateSuccess={handleRefreshData}
                    index={index}
                    WoUuId={uuid}
                    wo={wo}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: nightMode ? '#888' : 'red' }]}>No instructions available.</Text>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Comments Drawer */}
      {shouldRenderComments && (
        <Animated.View
          style={[
            styles.commentsContainer,
            { height: commentsHeight, backgroundColor: nightMode ? '#1E1E1E' : 'white' },
          ]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <CommentsPage WoUuId={uuid} />
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Expand Button */}
      <View style={[styles.expandButtonContainer, { bottom: isKeyboardOpen ? 0 : 8 }]}>
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          <FontAwesome5 name="comments" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {!expanded && (
        <View
          style={[
            styles.progressBarContainer,
            {
              left:canComplete ?0: 40,
              right:0,
              bottom: isKeyboardOpen ? 0 : 0,
            },
          ]}
        >
          <ProgressPage
            id={id}
            type={type}
            uuid={uuid}
            data={data}
            wo={wo}
            canComplete={setCancomplete}
            sequence={sequence}
            restricted={restricted}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginHorizontal: 12,
    borderRadius: 10,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  groupIcon: {
    marginRight: 8,
  },
  expandButtonContainer: {
    position: 'absolute',
    left: 10,
    zIndex: 100,
  },
  expandButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#074B7C',
    borderRadius: 25,
  },
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '95%',
    overflow: 'hidden',
  },
  progressBarContainer: {
    position: 'absolute',
    marginBottom: 0,
    marginLeft: Platform.OS === 'ios' ? 20 : null,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: '#074B7C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default BuggyListPage;
