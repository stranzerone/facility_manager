import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import BuggyListPage from '../BuggyList/BuggyListScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CommentsPage from '../WoComments/WoCommentsScreen';

const BuggyListTopTabs = ({ route }) => {
  const [isCommentOpen, setCommentOpen] = useState(true);
  const [isReady, setIsReady] = useState(false); // 🔐 Prevent early mount
  const { ppmAsstPermissions } = usePermissions();

  const uuid = route.params.workOrder;
  const wo = route.params.wo;
  const restricted = route.params.restricted;
  const restrictedTime = route.params.restrictedTime;
  const as = route.params.as || {}; // Ensure 'as' is defined
  const navigation = useNavigation();

  const handleBuggyChange = (value) => {
    setCommentOpen(value);
  };

  // ✅ Delay rendering to avoid useInsertionEffect warning
  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 0); // render-safe delay
    return () => clearTimeout(timeout);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {isReady &&
            (isCommentOpen ? (
              <BuggyListPage
                restricted={restricted}
                restrictedTime={restrictedTime}
                uuid={uuid}
                wo={wo}
                as={as}
                handleBuggyChange={handleBuggyChange}
              />
            ) : (
              <CommentsPage WoUuId={uuid} handleBuggyChange={handleBuggyChange} />
            ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  contentContainer: {
    flex: 1,
  },
});

export default BuggyListTopTabs;
