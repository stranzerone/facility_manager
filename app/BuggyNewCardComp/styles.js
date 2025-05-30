// styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 10,
    padding: 12,
    backgroundColor: 'white',
    marginHorizontal:10,
    
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#074B7C',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f0f0f0',
    color: '#212529',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  middleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1996D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  unchecked: {
    backgroundColor: 'white',
  },
  checked: {
    backgroundColor: '#074B7C',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "bold",
    // color: '#074B7C',
  },
  pdfButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    height:"60%",
    justifyContent: 'center',
  },
  imageAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start of the container
    justifyContent: 'space-between', // Space between image and buttons
    marginTop: 8, // Add some margin at the top
  },
  cameraButton: {
    backgroundColor: '#074B7C',
    padding: 10,
    minWidth: 130,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  button: {
    flex: 1,
    backgroundColor: '#1996D3',
    padding: 6,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48, // Make both buttons take up almost equal width
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  imagePlaceholder: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CED4DA',
    marginTop: 10,
    width: 100,
    height: 100,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {
    position: 'absolute',
    padding: 10,
    top: 50,
    right: 20,
  },
  modalImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  selectedFileText: {
    marginTop: 8,
    fontSize: 14,
    color: '#074B7C',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1996D3',
    padding: 6,
    borderRadius: 5,
    marginTop: 10,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,  // Position the icon to the right
    top: '50%',  // Vertically center the icon
    marginTop: -12,  // Adjust based on icon size (24px / 2)
  },
});

export default styles;
