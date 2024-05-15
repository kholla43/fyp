import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';


const Metadata = ({ route, navigation }) => {
    const { item } = route.params;
    const inputRef = useRef(null);
    const [starttime, setstarttime] = useState(item.StartTime);
    const [endtime, setendtime] = useState(item.EndTime);
    const [title, setTitle] = useState(item.Title);
    const persons = item.PersonName
    const locations = item.LocationTitle
    const cities = item.CityName
    const events = item.EventTitle

    const [selectedPersons, setSelectedPersons] = useState(persons);
    const [selectedLocation, setSelectedLocation] = useState(locations);
    const [selectedCity, setSelectedCity] = useState(cities);
    const [selectedEvent, setSelectedEvent] = useState(events);
    const [description, setdescription] = useState(item.Description);
    const [date, setDate] = useState(item.Date);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
    const ref = useRef();



    useEffect(() => {
        setPaused(true);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    const convertTimeToSeconds = (time) => {
        if (!time) return null;
        const [minutes, seconds] = time.split(':').map(Number);
        return minutes * 60 + seconds;
    };
    const handleProgress = (data) => {
        const currentTimeInSeconds = data.currentTime;
        const startTimeInSeconds = convertTimeToSeconds(starttime);
        const endTimeInSeconds = convertTimeToSeconds(endtime);
    
        setProgress({
            currentTime: currentTimeInSeconds,
            duration: data.seekableDuration
        });
    
        if (!paused && currentTimeInSeconds < startTimeInSeconds) {
            setstarttime(formatTime(currentTimeInSeconds));
        }
    
        if (paused && currentTimeInSeconds === startTimeInSeconds) {
            setPaused(false);
        }
    
        if (startTimeInSeconds && currentTimeInSeconds < startTimeInSeconds) {
            ref.current.seek(startTimeInSeconds);
        }
    
        if (startTimeInSeconds && endTimeInSeconds && currentTimeInSeconds >= endTimeInSeconds) {
            setPaused(true); 
        }
    };
    
    

    const handleSliderChange = (value) => {
        const formattedTime = formatTime(value);
    
       
        if (starttime === '' || endtime !== '') {
            setstarttime(formattedTime);
        } else {
            setendtime(formattedTime);
        }
    
        const endTimeInSeconds = convertTimeToSeconds(endtime);
    
        if (endTimeInSeconds && value >= endTimeInSeconds) {
            ref.current.seek(endTimeInSeconds);
            setPaused(true);
        } else {
            setPaused(false);
            setProgress(prevState => ({
                ...prevState,
                currentTime: value
            }));
            ref.current.seek(value);
        }
    };
    
    
   

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TouchableOpacity
                    style={styles.videoContainer}
                    onPress={() => setPaused(!paused)}
                >
                    <Video
                        source={{ uri: item.VideoPath }}
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
                            <Text style={styles.progressText}> {item.StartTime}</Text>

                                <Slider
                                    style={styles.progressBar}
                                    minimumValue={0}
                                    maximumValue={progress.duration}
                                    minimumTrackTintColor='red'
                                    maximumTrackTintColor='white'
                                    value={progress.currentTime}
                                    onValueChange={handleSliderChange}
                                />
                            <Text style={styles.progressText}>{item.EndTime}</Text>

                            </View>
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{title}</Text> 
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Start Time:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{item.StartTime}</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>End Time:</Text>
                    <View style={styles.textInputContainer}>
                        <Text style={styles.inputField}>{item.EndTime}</Text> 
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

export default Metadata;

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
