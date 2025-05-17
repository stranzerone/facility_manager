import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import AddWorkOrderScreen from '../AddWorkOrders/AddWorkOrderScreen';
import PMList from '../PmsUi/AllPms';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';

const RequestServiceTabs = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const route = useRoute();
  const { qr, type, uuid } = route.params;

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'WorkOrder':
        return <AddWorkOrderScreen screen={qr} type={type} uuid={uuid} />;
      case 'PPM':
        return <PMList screen={qr} type={type} uuid={uuid} />;
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
    if (qr === 'qr') {
      navigation.goBack;
    } else {
      navigation.goBack();
    }
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
      <View style={styles.backButton} >
        <TouchableOpacity className='bg-white h-6 rounded-md px-3 py-1'  onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={15} color="black" />
        </TouchableOpacity>

        </View>

        <TabView
          navigationState={{
            index: selectedTab,
            routes: [
              { key: 'WorkOrder', title: 'Manual' },
              { key: 'PPM', title: `PM's` },
            ],
          }}
          renderScene={renderScene}
          onIndexChange={setSelectedTab}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
          animationEnabled={true}
          initialLayout={{ width: 400 }}
        />
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
  notAuthorizedText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RequestServiceTabs;
