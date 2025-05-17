// src/components/BuggyListCard/styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardContainer: {
    borderLeftWidth: 6,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    width: '100%',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#074B7C',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#074B7C',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#1996D3',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#074B7C',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  remarkContainer: {
    marginTop: 16,
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  remarkText: {
    color: '#888',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#074B7C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  imagePlaceholder: {
    marginTop: 8,
    alignItems: 'center',
  },
});

export default styles;
