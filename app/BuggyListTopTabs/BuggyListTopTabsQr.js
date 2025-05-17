import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import BuggyListPage from '../BuggyList/BuggyListScreen';
import AssetDetailsMain from '../AssetDetails/AssetDetailsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommentsPage from '../WoComments/WoCommentsScreen';
import { useDispatch } from 'react-redux';
import { clearAllTeams } from '../../utils/Slices/TeamSlice';
import { clearAllUsers } from '../../utils/Slices/UsersSlice';

const BuggyListTopTabs = ({ route }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [siteLogo, setSiteLogo] = useState(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isCommentOpen,setCommentOpen]  = useState(true);
  const uuid = route.params.workOrder;
  const type = route.params.type;
  const id = route.params.uuid
  const wo = route.params.wo;
  const restricted = route.params.restricted;
  const restrictedTime = route.params.restrictedTime;
  const dispatch = useDispatch();
 

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const societyString = await AsyncStorage.getItem('userInfo');
        if (societyString) {
          const societyData = JSON.parse(societyString);
          const parsedImages = JSON.parse(societyData.data.society.data);
          setSiteLogo(parsedImages.logo);
        }
      } catch (error) {
        console.error('Error fetching society data:', error);
      }
    };
    fetchLogo();
  }, []);

  const handleBuggyChange = (value) =>{

    setCommentOpen(value)
  }

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'BuggyList':
        return isCommentOpen ? (
          <BuggyListPage 
            sequence={wo?.['Sequence No']?.split('-')[0]} 
            restricted={restricted} 
            restrictedTime={restrictedTime} 
            uuid={uuid} 
            wo={wo} 
            id={id} 
            type={type} 
            handleBuggyChange={handleBuggyChange} 

          />
        ) : (
          <CommentsPage 
            WoUuId={uuid}  
            handleBuggyChange={handleBuggyChange}  
          />
        );
  
      case 'Details':
        return <AssetDetailsMain uuid={uuid} />;
  
      default:
        return null;
    }
  };
  

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      const teams =   await dispatch(clearAllTeams())
      await dispatch(clearAllUsers())
      navigation.replace("Login");

    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Header with Logo */}
  <SafeAreaView style={{ flex: 1, backgroundColor: '#1996D3' }}>
      
      <View style={styles.header}>
        {siteLogo && <Image   className="w-24 h-32"
  source={{ uri: siteLogo }}
  style={[styles.logo, { borderRadius: 48, overflow: 'hidden' }]} 
  resizeMode="contain" />}
  <View>
  <Text style={styles.headerText}>Instructions</Text>

  </View>

        <View>
        
             <TouchableOpacity 
                   
                    onPress={() => setModalVisible(true)} // Open confirmation popup
                    className="bg-red-600 p-2 rounded-full"
                  >
                    <Icon name="power-off" size={15} color="white" />
              </TouchableOpacity>
              </View>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
       <View style={styles.backButton} >
               <TouchableOpacity className='bg-white rounded-md h-6  py-1 px-3'  onPress={handleBackPress}>
                 <FontAwesome name="arrow-left" size={15} color="black" />
               </TouchableOpacity>
       
               </View>

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
          initialLayout={{ width: 200 }}
        />
      </View>

      <DynamicPopup
        visible={modalVisible}
        type="warning"
        message="You will be logged out. Are you sure you want to log out?"
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          handleLogout();
        }}
      />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f7',
    height: '100%',
  },
  header: {
    backgroundColor: '#1996D3',
    padding: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  logo: {
    maxWidth: 80,
    maxHeight: 50,
    borderRadius: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
   width:"20%",
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
