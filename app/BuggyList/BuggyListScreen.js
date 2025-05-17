import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import { GetInstructionsApi } from '../../service/BuggyListApis/GetInstructionsApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Loader from '../LoadingScreen/AnimatedLoader';
import ProgressPage from '../AssetDetails/ProgressBar';
import CommentsPage from '../WoComments/WoCommentsScreen';
import { FontAwesome5 } from '@expo/vector-icons';
import { WorkOrderInfoApi } from '../../service/WorkOrderInfoApi';
import CardRenderer from '../BuggyNewCardComp/CardsMainScreen';
import { Platform } from 'react-native';
import InfoCard from './InstructionDetails';

const BuggyListPage = ({ uuid, wo ,restricted,restrictedTime,id,type,sequence,handleBuggyChange}) => {
  const [data, setData] = useState([]);
  const [assetDescription, setAssetDescription] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false); 
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const animation = useState(new Animated.Value(0))[0];
  const [canComplete,setCancomplete]  = useState(false)
  const navigate = useNavigation();
 
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  // Function to fetch buggy list data

  const loadBuggyList = async () => {
    try {
      let result ;
      if(sequence == 'HK'){
       result = await GetInstructionsApi({WoUuId:uuid,type:"HW"});
     

      }else{
       result = await GetInstructionsApi({WoUuId:uuid,type:"WO"});
      }
      if(result){
        setData(result);

      }else{
        setData([])
      }
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false)
    }
  };

  // Function to fetch asset description
  const loadAssetDescription = async () => {
    try {
      const response = await WorkOrderInfoApi(uuid); 
      setAssetDescription(response[0].wo.Description || 'No description available.');
    } catch (error) {
      setError(error.message || 'Error fetching asset description.');
    }
  };

  useEffect(() => {
    setLoading(true)
    loadBuggyList();
    if(sequence !== "HK"){
    loadAssetDescription(); 
    }
  }, [uuid]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     loadBuggyList(); 
  //     loadAssetDescription(); 
  //   }, [uuid])
  // );

  const handleRefreshData = async () => {
    await loadBuggyList(); 
  };

  const renderCard = ({ item, index }) => (
    <CardRenderer
    restricted={restricted}
      item={item}
      onUpdateSuccess={handleRefreshData} 
      index={index}
      WoUuId={uuid}
      wo={wo}
    />
  );






  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const toggleExpand = () => {
    const finalValue = expanded ? 0 : 1; 
    // setExpanded(!expanded);
    handleBuggyChange(false)
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 100,
      useNativeDriver: false, 
    }).start();
  };

  const {height}  = Dimensions.get('screen')
  const commentsHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height >= 800? height * 0.70 : height <= 800 ?height * 0.65 :height * 0.80], 
    extrapolate: 'clamp',
  });


  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefreshData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }




  if (loading) {
    return <Loader />;
  }

  const groupBy = (array, key) => {
    return array.reduce((result, currentItem) => {
      const groupKey = currentItem[key] || 'Ungrouped';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentItem);
      return result;
    }, {});
  };
  


  return (
    <View
    style={{ flex: 1}}
    >
  
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
       

          <View>
            <InfoCard  wo={wo} restricted={restricted} restrictedTime={restrictedTime}  description={assetDescription}/>
          </View>
          {/* List of Cards */}
          {data.length !== 0 ? (
  Object.entries(groupBy(data, 'group')).map(([groupName, items], groupIndex) => (
    <View key={groupIndex} style={{ marginBottom: 20 }}>
    <View style={styles.groupHeader}>
  <FontAwesome5 name="folder-open" size={18} color="#074B7C" style={styles.groupIcon} />
  <Text style={styles.groupTitle}>{groupName}</Text>
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
    <Text style={styles.emptyText}>No instructions available.</Text>
  </View>
)}

          
          {/* Comments Section */}
      

          {/* Bottom Controls */}
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Comment input button */}
      <View style={[styles.expandButtonContainer,{bottom:isKeyboardOpen?0:65}]}  >
      
        <Animated.View style={[styles.commentsContainer, { height: commentsHeight,overflow:"scroll" }]}>
        <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    > 
            <CommentsPage WoUuId={uuid} />
</KeyboardAvoidingView>

        </Animated.View>
     
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          <FontAwesome5 name={expanded ? 'comments' : 'comments'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    { !expanded && <View    className="w-[70%]"  style={[styles.progressBarContainer, { right:canComplete?70:0,left:canComplete?null:40, bottom: isKeyboardOpen?0: 57 }]}>
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
      </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingBottom:100
  },
  scrollViewContainer: {
    paddingBottom: 100,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 0,
  },
  expandButtonContainer: {
// bottom: 80,
left:10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#e1ecf4',
    borderRadius: 5,
    marginHorizontal: 1,
    marginTop: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f6fb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 10,
  },
  
  groupIcon: {
    marginRight: 8,
  },
  
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#074B7C',
  },
  
  
  progressBarContainer:{
   marginBottom: Platform.OS === "ios"?  10:null,
   marginLeft: Platform.OS ==="ios" ? 20 :null,
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
    bottom: 5,
    height:"100%",
    width: '95%',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  descriptionContainer: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
  },
  assetDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  emptyContainer: {
    flex:1,
    textAlign:'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign:"center",
    color: 'red',
    textAlignVertical:'center'
  },
});

export default BuggyListPage;