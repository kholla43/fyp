import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import LocationModal from './LocationModal';
import PersonModal from './PersonModal';
import EventModal from './EventModal';
import DBMetadata from '../DB/DBMetadata';
import LinearGradient from 'react-native-linear-gradient';
const Metadata = ({ route, navigation }) => {
    const { item } = route.params;
    const [starttime, setstarttime] = useState('');
    const [endtime, setendtime] = useState('');
    const [title, setTitle] = useState('');
    const [person, setperson] = useState('');
    const [selectedPersons, setSelectedPersons] = useState([]);
    const [location, setlocation] = useState('');
    const [selectedLocation, setSelectedLocation] = useState([]);
    
    
    const [event, setEvent] = useState('');
    const [selectedEvent, setSelectedEvent] = useState([]);
    const [description, setdescription] = useState('');
    const [locationmodalVisible, setlocationModalVisible] = useState(false);
    const [personmodalVisible, setPersonModalVisible] = useState(false);
    
    const [eventmodalVisible, setEventModalVisible] = useState(false);
    const [paused, setPaused] = useState(true);
    const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
    const [date, setDate] = useState(null);
    const [showModel, setShowModel] = useState(false);
    const inputRef = useRef(null);
    const ref = useRef(null);
    const dbMetadata = new DBMetadata();
    const colors = ['#4c669f', '#3b5998', '#192f6a'];

    const [titleError, setTitleError] = useState('');
    const [starttimeError, setStarttimeError] = useState('');
    const [endtimeError, setEndtimeError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [eventError, setEventError] = useState('');
    const [dateError, setDateError] = useState('');
    const [personError, setPersonError] = useState('');
    const [descError, setDescError] = useState('');
    useEffect(() => {
        setPaused(true);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleDate = (event, selectedDate) => {
        if (event.type === 'set') {
            const currentDate = selectedDate || date;
            setDate(currentDate);
        }
        setShowModel(false);
    };

    const handleProgress = (data) => {
        setProgress({
            currentTime: data.currentTime,
            duration: data.seekableDuration
        });
    };

    const handleSliderChange = (value) => {
        const formattedTime = formatTime(value);
        if (starttime === '') {
            setstarttime(formattedTime);
        } else if (endtime === '') {
            setendtime(formattedTime);
        } else {
            setstarttime(formattedTime);
            setendtime('');
        }
        setProgress(prevState => ({
            ...prevState,
            currentTime: value
        }));
        ref.current.seek(value);
    };

    const validateTime = (time) => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const validateFields = () => {
        let isValid = true;

        if (!title) {
            setTitleError('Title is required');
            isValid = false;
        } else {
            setTitleError('');
        }

        if (!starttime) {
            setStarttimeError('Start time is required');
            isValid = false;
        } else {
            if (!validateTime(starttime)) {
                setStarttimeError('Start time is invalid format');
            }
            else {
                setStarttimeError('');
            }
        }

        if (!endtime) {
            setEndtimeError('End time is required');
            isValid = false;
        } else {
            if (!validateTime(endtime)) {
                setEndtimeError('End time is invalid format');
            }
            else {
                setEndtimeError('');
            }
        }
        if (!date) {
            setDateError('Date is required');
            isValid = false;
        } else {
            setDateError('');
        }
        if (!description) {
            setDescError('Description is required');
            isValid = false;
        } else {
            setDescError('');
        }
        if (selectedPersons.length === 0) {
            setPersonError('Person is required');
        }
        else {
            setPersonError('');
        }
        if (!selectedLocation.length) {
            setLocationError('Location is required');
            isValid = false;
        } else {
            setLocationError('');
        }
        if (!selectedEvent.length) {
            setEventError('Event is required');
            isValid = false;
        } else {
            setEventError('');
        }
        return isValid;
    };

    const handleSave = () => {
        if (!validateFields()) {
            return;
        }
        const parsedDate = new Date(date);
        const formattedDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()}`;

        const metadata = {
            starttime,
            endtime,
            date: formattedDate,
            title,
            description,
            uri: item
        };
        dbMetadata.insertMetadata(metadata, selectedPersons, selectedLocation, selectedEvent, () => {
            console.log("successfully insert");
        });
        navigation.navigate('VideoEditor', { item: item });
    };

    const handleLocationModalDone = (locations) => {
            const formattedLocations = locations.map(location => ({
                Title: location.Title,
                Id: location.Id
            }));
            setSelectedLocation(formattedLocations);
            
       
    };
    
    

    const handlePersonModalDone = (persons) => {
        const formattedPersons = persons.map(person => ({
            Name: person.Name,
            Id: person.Id
        }));
        setSelectedPersons(formattedPersons);
    };


    const handleEventModalDone = (events) => {
        const formattedEvent = events.map(event => ({
            Title: event.Title,
            Id: event.Id
        }));
        setSelectedEvent(formattedEvent);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TouchableOpacity
                    style={styles.videoContainer}
                    onPress={() => setPaused(!paused)}
                >
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
                                <Text style={styles.progressText}>{formatTime(progress.currentTime)}</Text>
                                <Slider
                                    style={styles.progressBar}
                                    minimumValue={0}
                                    maximumValue={progress.duration}
                                    minimumTrackTintColor='red'
                                    maximumTrackTintColor='white'
                                    value={progress.currentTime}
                                    onValueChange={handleSliderChange}
                                />
                                <Text style={styles.progressText}>{formatTime(progress.duration)}</Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput style={styles.inputField} placeholder='Enter title' placeholderTextColor={'black'} value={title} onChangeText={value => setTitle(value)} />
                    </View>
                    <Text style={styles.errorMessage}>{titleError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Start Time:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput style={styles.inputField} placeholder='00:00' placeholderTextColor={'black'} value={starttime} onChangeText={value => setstarttime(value)} />
                    </View>
                    <Text style={styles.errorMessage}>{starttimeError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>End Time:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput style={styles.inputField} placeholder='00:00' placeholderTextColor={'black'} value={endtime} onChangeText={value => setendtime(value)} />
                    </View>
                    <Text style={styles.errorMessage}>{endtimeError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date:</Text>
                    <View style={styles.textInputContainer}>

                        <TextInput
                            ref={inputRef}
                            style={styles.inputField}
                            placeholder='12/12/2024'
                            placeholderTextColor={'black'}
                            value={date ? date.toLocaleDateString() : ''}
                            onFocus={() => setShowModel(true)}
                        />
                        {showModel && (
                            <DateTimePicker
                                mode='date'
                                value={date || new Date()}
                                onChange={handleDate}
                                display='spinner'
                                style={{ backgroundColor: "white" }}
                            />
                        )}
                        <TouchableOpacity onPress={() => setShowModel(true)}>
                            <Image source={require('../../../Assests/Images/calendar.png')} style={styles.dotIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.errorMessage}>{dateError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Location:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Enter Location' placeholderTextColor={'black'} value={selectedLocation.length > 0 ? selectedLocation.map(location => location.Title).join(', ') : ''}
                            style={styles.inputField}
                            onChangeText={value => setlocation(value)}
                            editable={false}
                            multiline={true}
                        />
                        <TouchableOpacity onPress={() => setlocationModalVisible(true)}>
                            <Image source={require('../../../Assests/Images/dot.png')} style={styles.dotIcon} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.errorMessage}>{locationError}</Text>
                    <LocationModal locationmodalVisible={locationmodalVisible} setLocationModalVisible={setlocationModalVisible} onDone={handleLocationModalDone} />
                </View>
               

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Person:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Enter Person' placeholderTextColor={'black'}
                            style={styles.inputField}
                            value={selectedPersons.length > 0 ? selectedPersons.map(person => person.Name).join(', ') : ''}
                            onChangeText={value => setperson(value)}
                            editable={false}
                            multiline={true}
                        />
                        <TouchableOpacity onPress={() => setPersonModalVisible(true)}>
                            <Image source={require('../../../Assests/Images/dot.png')} style={styles.dotIcon} />
                        </TouchableOpacity>
                    </View>
                    <PersonModal personmodalVisible={personmodalVisible} setPersonModalVisible={setPersonModalVisible} onDone={handlePersonModalDone} />
                    <Text style={styles.errorMessage}>{personError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Event:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Enter Event' placeholderTextColor={'black'}
                            style={styles.inputField}
                            value={selectedEvent.length > 0 ? selectedEvent.map(event => event.Title).join(', ') : ''}
                            onChangeText={value => setEvent(value)}
                            editable={false}
                            multiline={true}
                        />
                        <TouchableOpacity onPress={() => setEventModalVisible(true)}>
                            <Image source={require('../../../Assests/Images/dot.png')} style={styles.dotIcon} />
                        </TouchableOpacity>
                    </View>
                    <EventModal eventmodalVisible={eventmodalVisible} setEventModalVisible={setEventModalVisible} onDone={handleEventModalDone} />
                    <Text style={styles.errorMessage}>{eventError}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description:</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder='Enter Description' placeholderTextColor={'black'} multiline={true}
                            value={description} style={[styles.inputField, styles.descriptionField]} onChangeText={value => setdescription(value)}
                        />
                    </View>
                    <Text style={styles.errorMessage}>{descError}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>SAVE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white'
    },
    scrollViewContent: {
        flexGrow: 1
    },
    videoContainer: {
        height: 200,
        marginBottom: 16,
        backgroundColor: 'black',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoControls: {
        position: 'absolute',
        left: 0,
        right: 0,
        padding: 10,

    },
    videoControlButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 50
    },
    controlIcon: {
        width: 24,
        height: 24,
        tintColor: 'white'
    },
    playPauseIcon: {
        width: 32,
        height: 32,
    },
    forwardIcon: {
        transform: [{ rotate: '360deg' }],
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
    },
    progressText: {
        color: 'white',
        marginHorizontal: 5,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: 'black'
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputField: {
        flex: 1,
        padding: 8,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: 'lightgray',
        color: 'black'
    },
    errorMessage: {
        color: 'red',

    },
    dotIcon: {
        width: 24,
        height: 24,
        tintColor: 'black',
        marginLeft: 8,
    },
    button: {
        borderRadius: 25,
        width: '100%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 16,
    },
});

export default Metadata;
