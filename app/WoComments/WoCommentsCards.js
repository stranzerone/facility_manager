import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const CommentCard = ({ comment }) => {
  const { nightMode } = usePermissions();
  const styles = getStyles(nightMode);

  const users = useSelector((state) => state.users.data);
  const user = users.length > 1 && Array.isArray(users[1]) 
    ? users[1].find((u) => u.user_id === comment.created_by) 
    : null;
  const userName = user ? user.name : 'Unknown User';
  const formattedDateTime = format(new Date(comment.created_at), 'MMMM d, HH:mm');

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <FontAwesome name="user-circle" size={24} color={nightMode ? '#90caf9' : '#074B7C'} style={styles.userIcon} />
        <Text style={styles.userId}>{userName}</Text>
      </View>
      <Text style={styles.commentText}>{comment.comment}</Text>
      <Text style={styles.commentTime}>{formattedDateTime}</Text>
    </View>
  );
};

const getStyles = (nightMode) =>
  StyleSheet.create({
    commentCard: {
      backgroundColor: nightMode ? '#1e1e1e' : '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: nightMode ? '#333' : '#E0E0E0',
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    userIcon: {
      marginRight: 10,
    },
    userId: {
      fontSize: 16,
      color: nightMode ? '#90caf9' : '#074B7C',
      fontWeight: 'bold',
    },
    commentText: {
      fontSize: 14,
      color: nightMode ? '#ddd' : '#333',
      marginBottom: 8,
      lineHeight: 20,
    },
    commentTime: {
      fontSize: 12,
      color: nightMode ? '#aaa' : '#888',
      textAlign: 'right',
      fontStyle: 'italic',
    },
  });

export default CommentCard;
