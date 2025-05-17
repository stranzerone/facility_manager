import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import BuggyListPage from '../BuggyList/BuggyListScreen';
import AssetDetailsMain from '../AssetDetails/AssetDetailsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CommentsPage from '../WoComments/WoCommentsScreen';

const { width } = Dimensions.get('window'); // Get full screen width

const BuggyListTopTabs = ({ route }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { ppmAsstPermissions } = usePermissions();
  const [isCommentOpen,setCommentOpen]  = useState(true);
  const uuid = route.params.workOrder;
  const wo = route.params.wo;
  const restricted = route.params.restricted;
  const restrictedTime = route.params.restrictedTime;
  
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBuggyChange = (value) =>{

    setCommentOpen(value)
  }

  // Render scenes with full width
  const renderScene = ({ route }) => (
    <View style={{ width: '100%', flex: 1 }}> 
      {route.key === 'BuggyList' ? (
        
        isCommentOpen ? (
          <BuggyListPage 
            restricted={restricted} 
            restrictedTime={restrictedTime} 
            uuid={uuid} 
            wo={wo} 
            handleBuggyChange={handleBuggyChange} 
          />
        ) : <CommentsPage WoUuId={uuid}   handleBuggyChange={handleBuggyChange}   />      ) : (
        <AssetDetailsMain uuid={uuid} />
      )}
    </View>
  );

  const renderTabBar = (props) => (
    <View style={styles.tabBarContainer}>
      <TabBar
        {...props}
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
        labelStyle={styles.tabLabel}
      />
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Back Button */}
      <View style={styles.backButton} >
        <TouchableOpacity className='bg-white h-6 rounded-md px-3 py-1'  onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={15} color="black" />
        </TouchableOpacity>

        </View>

        {/* Tab View Container */}
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{
              index: selectedTab,
              routes: [
                { key: 'BuggyList', title: 'Instructions' },
                { key: 'Details', title: 'Asset Details' },
              ],
            }}
            renderScene={renderScene}
            onIndexChange={setSelectedTab}
            renderTabBar={renderTabBar}
            swipeEnabled={true}
            animationEnabled={true}
            initialLayout={{ width }}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
   width:"20%",
   height:50,
   paddingVertical:15,
    left: 0, // Keeps it at the left
    top: 0,  
    backgroundColor: '#074B7C',
    justifyContent: 'center', // Center vertically
    textAlign:"center",
    alignItems: 'center', // Center horizontally
    zIndex: 10, // Ensures it's above other elements

  },
  
  tabViewContainer: {
    flex: 1,
    width: '100%', // Ensure TabView takes full width
  },
  tabBarContainer: {
    width: '80%', // Limit width to 70%
    height: 50,
    alignSelf: 'flex-end', // Move it to the right end
  },
  tabBar: {
    backgroundColor: '#074B7C',
    paddingVertical: 5,
  },
  tabLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabIndicator: {
    height: 4,
    backgroundColor: 'white',
  },
});

export default BuggyListTopTabs;
