import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommentCard from './WoCommentsCards';
import { workOrderService } from '../../services/apis/workorderApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const CommentsPage = ({ WoUuId, handleBuggyChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedButton, setSelectedButton] = useState('C');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { height } = Dimensions.get('window');
  const { nightMode } = usePermissions();
  const styles = getStyles(nightMode);

  useEffect(() => {
    loadComments();
  }, [selectedButton]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await workOrderService.getWorkOrderComments(WoUuId, selectedButton);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const payload = {
        comment: newComment,
        data: {},
        ref_uuid: WoUuId,
        tag: 'C',
        type: 'WO',
      };
      const response = await workOrderService.addComments(payload);
      if (response) {
        await loadComments();
        setNewComment('');
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}
      style={{ flex: 1 }}
    >
      <TouchableOpacity style={styles.closeButton} onPress={() => handleBuggyChange(true)}>
        <Icon name="times" size={24} color="#074B7C" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1996D3" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CommentCard comment={item} />}
            scrollEnabled={false}
            contentContainerStyle={styles.commentsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No {selectedButton === 'H' ? 'History' : selectedButton === 'all' ? 'Records' : 'Comments'} available
              </Text>
            }
          />
        </ScrollView>
      )}

      {selectedButton === 'C' && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter remarks up to 250 char"
            placeholderTextColor={nightMode ? "#aaa" : "#999"}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={2}
            maxLength={200}
          />
          <TouchableOpacity style={styles.button} onPress={handleCommentSubmit}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[styles.bottomButton, selectedButton === 'C' && styles.selectedButton]}
          onPress={() => setSelectedButton('C')}
        >
          <Icon name="comments" size={16} color={selectedButton === 'C' ? '#fff' : '#074B7C'} />
          <Text style={[styles.bottomButtonText, selectedButton === 'C' && { color: '#fff' }]}>Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, selectedButton === 'H' && styles.selectedButton]}
          onPress={() => setSelectedButton('H')}
        >
          <Icon name="history" size={16} color={selectedButton === 'H' ? '#fff' : '#074B7C'} />
          <Text style={[styles.bottomButtonText, selectedButton === 'H' && { color: '#fff' }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, selectedButton === 'all' && styles.selectedButton]}
          onPress={() => setSelectedButton('all')}
        >
          <Icon name="list" size={16} color={selectedButton === 'all' ? '#fff' : '#074B7C'} />
          <Text style={[styles.bottomButtonText, selectedButton === 'all' && { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (nightMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // padding: 10,
      backgroundColor: nightMode ? '#121212' : '#f9f9f9',
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    commentsList: {
      // paddingBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: nightMode ? '#bbb' : '#999',
      textAlign: 'center',
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      borderTopWidth: 1,
      borderTopColor: nightMode ? '#444' : '#ccc',
      backgroundColor: nightMode ? '#1e1e1e' : '#f2fcff',
    },
    input: {
      flex: 1,
      borderColor: nightMode ? '#555' : '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      padding: 2,
      backgroundColor: nightMode ? '#2a2a2a' : 'white',
      color: nightMode ? '#fff' : '#000',
      textAlignVertical: 'center',
      maxHeight: 50,
    },
    button: {
      backgroundColor: '#074B7C',
      borderRadius: 8,
      // paddingVertical: 10,
      paddingHorizontal: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      padding:5,
      paddingVertical:10,
      fontWeight: 'bold',
    },
    bottomButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: nightMode ? '#1e1e1e' : '#a6d1e0',
      // paddingBottom: Platform.OS === 'android' ? 60 : 80,
    },
    bottomButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 6,
    },
    selectedButton: {
      borderRadius: 10,
      backgroundColor: '#074B7C',
    },
    bottomButtonText: {
      fontWeight: 'bold',
      marginTop: 5,
      fontSize: 12,
      color: nightMode ? '#074B7C' : '#000',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      padding: 10,
    },
  });

export default CommentsPage;
