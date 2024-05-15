import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import LocationModal from './LocationModal';
import CityModal from './CityModal';
import PersonModal from './PersonModal';
import EventModal from './EventModal';
import DBMetadata from '../DB/DBMetadata';
import LinearGradient from 'react-native-linear-gradient';

const EditMetadata = ({ route, navigation }) => {
    const { item } = route.params;
    const inputRef = useRef(null);
    const [showModel, setShowModel] = useState(false);
    const [starttime, setStarttime] = useState(item.StartTime);
    const [endtime, setEndtime] = useState(item.EndTime);
    const [title, setTitle] = useState(item.Title);
    const [persons, setPersons] = useState(item.PersonName);
    const [locations, setLocations] = useState(item.LocationTitle);
    const [cities, setCities] = useState(item.CityName);
    const [events, setEvents] = useState(item.EventTitle);

    const [selectedPersons, setSelectedPersons] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);

    const [selectedPersonIDs, setSelectedPersonIDs] = useState([]);
    const [selectedLocationIDs, setSelectedLocationIDs] = useState([]);
    const [selectedCityIDs, setSelectedCityIDs] = useState([]);
    const [selectedEventIDs, setSelectedEventIDs] = useState([]);

    const [description, setDescription] = useState(item.Description);
    const [date, setDate] = useState(new Date(item.Date));

    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [personModalVisible, setPersonModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
    const ref = useRef();
    const dbMetadata = new DBMetadata();
    const colors = ['#4c669f', '#3b5998', '#192f6a'];

    const [titleError, setTitleError] = useState('');
    const [starttimeError, setStarttimeError] = useState('');
    const [endtimeError, setEndtimeError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [eventError, setEventError] = useState('');
    const [dateError, setDateError] = useState('');
    const [personError, setPersonError] = useState('');
    const [cityError, setCityError] = useState('');
    const [descError, setDescError] = useState('');

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
            } else {
                setStarttimeError('');
            }
        }

        if (!endtime) {
            setEndtimeError('End time is required');
            isValid = false;
        } else {
            if (!validateTime(endtime)) {
                setEndtimeError('End time is invalid format');
            } else {
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
        } else {
            setPersonError('');
        }

        if (selectedLocations.length === 0) {
            setLocationError('Location is required');
            isValid = false;
        } else {
            setLocationError('');
        }

        if (selectedCities.length === 0) {
            setCityError('City is required');
            isValid = false;
        } else {
            setCityError('');
        }

        if (selectedEvents.length === 0) {
            setEventError('Event is required');
            isValid = false;
        } else {
            setEventError('');
        }

        return isValid;
    };

    useEffect(() => {
        fetchMetadata();
        setPaused(true);
    }, []);

    const fetchMetadata = () => {
        dbMetadata.getMetadataById(item.Id, (metadata) => {
            const {
                Title,
                StartTime,
                EndTime,
                Date,
                Description,
                EventIds,
                EventTitles,
                LocationIds,
                LocationTitles,
                PersonIds,
                PersonNames,
                CityIds,
                CityNames
            } = metadata[0];

            setTitle(Title);
            setStarttime(StartTime);
            setEndtime(EndTime);
            setDate(new Date(Date));
            setDescription(Description);

            setSelectedPersonIDs(PersonIds.split(','));
            setSelectedLocationIDs(LocationIds.split(','));
            setSelectedCityIDs(CityIds.split(','));
            setSelectedEventIDs(EventIds.split(','));

            setSelectedPersons(PersonNames.split(','));
            setSelectedLocations(LocationTitles.split(','));
            setSelectedCities(CityNames.split(','));
            setSelectedEvents(EventTitles.split(','));
        });
    };

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
            setStarttime(formattedTime);
        } else if (endtime === '') {
            setEndtime(formattedTime);
        } else {
            setStarttime(formattedTime);
            setEndtime('');
        }
        setProgress(prevState => ({
            ...prevState,
            currentTime: value
        }));
        ref.current.seek(value);
    };

    const handleUpdate = () => {
        const parsedDate = new Date(date);

        const formattedDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()}`;

        const metadata = {
            Id: item.Id,
            Title: title,
            StartTime: starttime,
            EndTime: endtime,
            Date: formattedDate,
            Description: description,
            VideoPath: item.VideoPath,
            EventIds: selectedEventIDs.join(','),
            EventTitles: selectedEvents.join(','),
            LocationIds: selectedLocationIDs.join(','),
            LocationTitles: selectedLocations.join(','),
            PersonIds: selectedPersonIDs.join(','),
            PersonNames: selectedPersons.join(','),
            CityIds: selectedCityIDs.join(','),
            CityNames: selectedCities.join(',')
        };

        dbMetadata.updateMetadata(metadata, selectedPersonIDs, selectedLocationIDs, selectedEventIDs, selectedCityIDs, () => {
            console.log("Successfully updated");
        });

        navigation.navigate('VideoEditor', { item: item });
    };

    const handleLocationModalDone = (locations) => {
        const selectedLocationTitles = locations.map(location => location.Title).join(', ');
        const selectedLocationIds = locations.map(location => location.Id);
        setSelectedLocations(selectedLocationTitles.split(','));
        setSelectedLocationIDs(selectedLocationIds);
        setLocationModalVisible(false);
    };

    const handlePersonModalDone = (persons) => {
        const selectedPersonNames = persons.map(person => person.Name).join(', ');
        const selectedPersonIds = persons.map(person => person.Id);
        setSelectedPersons(selectedPersonNames.split(','));
        setSelectedPersonIDs(selectedPersonIds);
        setPersonModalVisible(false);
    };

    const handleCityModalDone = (cities) => {
        const selectedCityNames = cities.map(city => city.Name).join(', ');
        const selectedCityIds = cities.map(city => city.Id);
        setSelectedCities(selectedCityNames.split(','));
        setSelectedCityIDs(selectedCityIds);
        setCityModalVisible(false);
    };

    const handleEventModalDone = (events) => {
        const selectedEventTitles = events.map(event => event.Title).join(', ');
        const selectedEventIds = events.map(event => event.Id);
        setSelectedEvents(selectedEventTitles.split(','));
        setSelectedEventIDs(selectedEventIds);
        setEventModalVisible(false);
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={colors} style={styles.gradient}>
                <Text style={styles.label}>Title:</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    ref={inputRef}
                />
                {titleError ? <Text style={styles.error}>{titleError}</Text> : null}

                <Text style={styles.label}>Start Time:</Text>
                <TextInput
                    style={styles.input}
                    value={starttime}
                    onChangeText={setStarttime}
                    ref={inputRef}
                    placeholder="HH:MM"
                />
                {starttimeError ? <Text style={styles.error}>{starttimeError}</Text> : null}

                <Text style={styles.label}>End Time:</Text>
                <TextInput
                    style={styles.input}
                    value={endtime}
                    onChangeText={setEndtime}
                    ref={inputRef}
                    placeholder="HH:MM"
                />
                {endtimeError ? <Text style={styles.error}>{endtimeError}</Text> : null}

                <Text style={styles.label}>Date:</Text>
                <TouchableOpacity onPress={() => setShowModel(true)}>
                    <Text style={styles.dateInput}>{date.toDateString()}</Text>
                </TouchableOpacity>
                {showModel && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDate}
                    />
                )}
                {dateError ? <Text style={styles.error}>{dateError}</Text> : null}

                <Text style={styles.label}>Description:</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    ref={inputRef}
                />
                {descError ? <Text style={styles.error}>{descError}</Text> : null}

                <Text style={styles.label}>Persons:</Text>
                <TouchableOpacity onPress={() => setPersonModalVisible(true)}>
                    <Text style={styles.input}>{selectedPersons.join(', ')}</Text>
                </TouchableOpacity>
                {personError ? <Text style={styles.error}>{personError}</Text> : null}

                <Text style={styles.label}>Locations:</Text>
                <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
                    <Text style={styles.input}>{selectedLocations.join(', ')}</Text>
                </TouchableOpacity>
                {locationError ? <Text style={styles.error}>{locationError}</Text> : null}

                <Text style={styles.label}>Cities:</Text>
                <TouchableOpacity onPress={() => setCityModalVisible(true)}>
                    <Text style={styles.input}>{selectedCities.join(', ')}</Text>
                </TouchableOpacity>
                {cityError ? <Text style={styles.error}>{cityError}</Text> : null}

                <Text style={styles.label}>Events:</Text>
                <TouchableOpacity onPress={() => setEventModalVisible(true)}>
                    <Text style={styles.input}>{selectedEvents.join(', ')}</Text>
                </TouchableOpacity>
                {eventError ? <Text style={styles.error}>{eventError}</Text> : null}

                <Video
                    source={{ uri: `file://${item.VideoPath}` }}
                    ref={ref}
                    paused={paused}
                    onProgress={handleProgress}
                    style={styles.video}
                    resizeMode="contain"
                />

                <Slider
                    value={progress.currentTime}
                    minimumValue={0}
                    maximumValue={progress.duration}
                    onValueChange={handleSliderChange}
                    style={styles.slider}
                />

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => {
                        if (validateFields()) {
                            handleUpdate();
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            </LinearGradient>

            {locationModalVisible && (
                <LocationModal
                    visible={locationModalVisible}
                    onDone={handleLocationModalDone}
                    onClose={() => setLocationModalVisible(false)}
                    selectedLocations={selectedLocationIDs}
                />
            )}
            {personModalVisible && (
                <PersonModal
                    visible={personModalVisible}
                    onDone={handlePersonModalDone}
                    onClose={() => setPersonModalVisible(false)}
                    selectedPersons={selectedPersonIDs}
                />
            )}
            {cityModalVisible && (
                <CityModal
                    visible={cityModalVisible}
                    onDone={handleCityModalDone}
                    onClose={() => setCityModalVisible(false)}
                    selectedCities={selectedCityIDs}
                />
            )}
            {eventModalVisible && (
                <EventModal
                    visible={eventModalVisible}
                    onDone={handleEventModalDone}
                    onClose={() => setEventModalVisible(false)}
                    selectedEvents={selectedEventIDs}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    gradient: {
        borderRadius: 10,
        padding: 10,
    },
    label: {
        fontSize: 16,
        marginVertical: 8,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    dateInput: {
        fontSize: 16,
        padding: 8,
        color: '#333',
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 4,
    },
    video: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
        marginVertical: 16,
    },
    slider: {
        width: '100%',
        marginVertical: 16,
    },
    updateButton: {
        backgroundColor: '#4c669f',
        padding: 16,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditMetadata;
