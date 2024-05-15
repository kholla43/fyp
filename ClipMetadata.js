import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import DBMetadata from '../DB/DBMetadata';
const ClipMetadata = ({ route, navigation }) => {
    const { item } = route.params;
    const inputRef = useRef(null);
    const [starttime, setStartTime] = useState('');
    const [endtime, setEndTime] = useState('');
    const [title, setTitle] = useState('');
    const [selectedPersons, setSelectedPersons] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
    const [clips, setClips] = useState([]);
    const ref = useRef();
    const dbMetadata = new DBMetadata();
    useEffect(() => {

        fetchClipsMetadata(item);

        setPaused(true);
    }, []);

    const fetchClipsMetadata = async (videoPath) => {

        try {
            dbMetadata.getMetadata(videoPath, (metadata) => {

                setClips(metadata);
            });

        } catch (error) {
            console.error('Error fetching clips metadata:', error);
        }
    };

    const handleProgress = (data) => {
        const currentTimeInSeconds = data.currentTime;
        setProgress({
            currentTime: currentTimeInSeconds,
            duration: data.seekableDuration
        });
    };

    const handleSliderChange = (value) => {
        const currentClip = clips.find(clip => value >= clip.StartTime && value <= clip.EndTime);

        if (currentClip) {
            setTitle(currentClip.Title);
            setStartTime(currentClip.StartTime);
            setEndTime(currentClip.EndTime);
            setSelectedPersons(currentClip.PersonName);
            setSelectedLocation(currentClip.LocationTitle);
            setSelectedCity(currentClip.CityName);
            setSelectedEvent(currentClip.EventTitle);
            setDescription(currentClip.Description);
            setDate(currentClip.Date);
        } else {
          
            setTitle('');
            setStartTime('');
            setEndTime('');
            setSelectedPersons('');
            setSelectedLocation('');
            setSelectedCity('');
            setSelectedEvent('');
            setDescription('');
            setDate('');
        }

        ref.current.seek(value);
        setPaused(false);
    };

    const ClipHighlight = ({ clip, progress }) => {
        const startPercent = (clip.StartTime / progress.duration) * 100;
        const endPercent = (clip.EndTime / progress.duration) * 100;

        return (
            <View
                style={{
                    backgroundColor: 'red',
                    width: `${endPercent - startPercent}%`,
                    height: '100%',
                    position: 'absolute',
                    left: `${startPercent}%`,
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.videoContainer}>
                    <Video
                        source={{ uri: item }}
                        ref={ref}
                        onProgress={handleProgress}
                        muted
                        paused={paused}
                        style={styles.video}
                        resizeMode='cover'
                    />
                    {progress && (
                        <View style={styles.videoControls}>
                            <View style={styles.videoControlButtons}>
                                <TouchableOpacity onPress={() => { ref.current.seek(progress.currentTime - 10) }}>
                                    <Image style={styles.controlIcon} source={require('../../../Assests/Images/backward.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPaused(!paused)}>
                                    <Image style={[styles.controlIcon, styles.playPauseIcon]} source={paused ? require('../../../Assests/Images/play.png') : require('../../../Assests/Images/pause.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { ref.current.seek(progress.currentTime + 10) }}>
                                    <Image style={[styles.controlIcon, styles.forwardIcon]} source={require('../../../Assests/Images/forward.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <Slider
                                    style={styles.progressBar}
                                    minimumValue={0}
                                    maximumValue={progress.duration}
                                    minimumTrackTintColor='red'
                                    maximumTrackTintColor='white'
                                    thumbTintColor='green'
                                    value={progress.currentTime}
                                    onValueChange={handleSliderChange}
                                />
                                {clips.map((clip, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleSliderChange(clip.StartTime)}
                                    />
                                ))}
                                {clips.map((clip, index) => (
                                    <ClipHighlight key={index} clip={clip} progress={progress} />
                                ))}
                            </View>


                        </View>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{title}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Start Time:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{starttime}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>End Time:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{endtime}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{date}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Location:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{selectedLocation}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>City:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{selectedCity}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Person:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField} >{selectedPersons}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Event:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{selectedEvent}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.inputLabel}>Description:</Text>
                    </View>
                    <View style={styles.textInputContainer}>
                        <Text style={[styles.inputField, styles.descriptionField]}>{description} </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default ClipMetadata;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3'
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 15
    },
    videoContainer: {
        width: '100%',
        height: 200,
        marginBottom: 20
    },
    video: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black'
    },
    videoControls: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoControlButtons: {
        flexDirection: 'row',
        marginBottom: 10
    },
    controlIcon: {
        width: 30,
        height: 30,
        tintColor: 'white',

    },
    playPauseIcon: {
        marginLeft: 50
    },
    forwardIcon: {
        marginLeft: 50
    }
    ,
    progressBarContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        bottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        position: 'absolute',

    },
    progressBar: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    progressText: {
        color: 'white'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    inputLabel: {
        width: 100,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginRight: 10
    },
    textInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: 'black',
        paddingRight: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 10,
        paddingHorizontal: 10,
        color: 'black'
    },
    descriptionField: {
        height: 100
    },

    labelContainer: {
        width: 100,
        marginRight: 10,
    },

});