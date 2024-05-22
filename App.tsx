import React, {useRef, useState} from 'react';
import {View, Button, StyleSheet} from 'react-native';
import {RNCamera} from 'react-native-camera';
import axios from 'axios';
import {RNFFmpeg} from 'react-native-ffmpeg';

const App = () => {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const options = {quality: RNCamera.Constants.VideoQuality['480p']};
      cameraRef.current.recordAsync(options).then(data => {
        console.log('Recording started:', data.uri);
        processVideo(data.uri);
      });
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  const processVideo = async (uri: any) => {
    try {
      const command = `-i ${uri} -vf fps=1 out%d.png`; // Extract 1 frame per second
      await RNFFmpeg.execute(command);

      for (let i = 1; i <= 10; i++) {
        // Assuming 10 frames for simplicity
        const response = await axios.post(
          'http://your-flask-server-address/process',
          {
            frame: `out${i}.png`,
          },
        );
        console.log('Server response:', response.data);
      }
    } catch (error) {
      console.error('Error processing video frames:', error);
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        captureAudio={true}
      />
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '80%',
  },
});

export default App;
