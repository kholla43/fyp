import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Modal } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import DBMetadata from '../DB/DBMetadata';
import { useIsFocused } from '@react-navigation/native';
import Share from 'react-native-share';
import FFmpegKit from 'react-native-ffmpeg';
import FFmpeg from 'react-native-ffmpeg';
import RNFetchBlob from 'react-native-fetch-blob';
const VideoEditor = ({ route, navigation }) => {
    const { item } = route.params;
    const [clicked, setClicked] = useState(false);
    const [paused, setPaused] = useState(true);
    const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
    const [metadata, setMetadata] = useState([]);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [modalVisible3, setModalVisible3] = useState(false);
    const isFocused = useIsFocused();
    const ref = useRef();
    const dbMetadata = new DBMetadata();

    useEffect(() => {
        if (isFocused) {
            getMetadata();
        }

    }, [isFocused]);

    const getMetadata = () => {
        dbMetadata.getMetadata(item, (metadata) => {
            setMetadata(metadata);
        });
    };

    const handleDelete = (id) => {
        dbMetadata.deleteMetadata(id, () => {
        });
        getMetadata();
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('ViewMetadata', { item: item })}>
                    <Text style={styles.title}>{item.Title}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('EditMetadata', { item: item })}>
                        <Image source={require('../../../Assests/Images/edit.png')} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.Id)}>
                        <Image source={require('../../../Assests/Images/delete.png')} style={[styles.icon, { marginLeft: 10 }]} />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.time}>{item.StartTime}-{item.EndTime}</Text>

        </View>
    );

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleThumbnailPress = () => {
        setClicked(true);
        setPaused(false);
    };

    const handleSave = () => {
        navigation.navigate('Metadata', { item: item });
    };

    const handleProgress = (data) => {
        setProgress({
            currentTime: data.currentTime,
            duration: data.seekableDuration
        });
    };

    const handleSliderChange = (value) => {
        ref.current.seek(value);
    };

    const handleShare = async () => {
        setModalVisible3(false);
        try {
            const options = {
                title: 'Share Video',
                message: 'Check out this video',
                url: item,
                type: 'video/mp4',
            };
            await Share.open(options);
        } catch (error) {
            console.error('Error sharing video:', error);
        }
    };


    const closeModal = () => {
        setModalVisible3(false);
    };

    const handleSaveHeader = () => {
        setModalVisible2(true);
        setModalVisible3(false)
    };


    const handleConfirmSave = async () => {
        try {
            const videoFilePath = item.replace('file://', '');
    
            const videoFileExists = await RNFetchBlob.fs.exists(videoFilePath);
            if (videoFileExists) {
                console.log('Video file exists:', videoFilePath);
    
                const metadataArray = metadata.map(currentMetadata => ({
                    Title: currentMetadata.Title,
                    Starttime: currentMetadata.StartTime,
                    Endtime: currentMetadata.EndTime,
                    Date: currentMetadata.Date,
                    People: currentMetadata.PersonName,
                    Location: currentMetadata.LocationTitle,
                    Event: currentMetadata.EventTitle,
                    City: currentMetadata.CityName,
                    Description: currentMetadata.Description
                }));
    
                let ffmpegCommand = `-y -i "${videoFilePath}"`;
                metadataArray.forEach(metadataObj => {
                    Object.entries(metadataObj).forEach(([key, value]) => {
                        ffmpegCommand += ` -metadata ${key}="${value}"`; 
                    });
                });
    
                ffmpegCommand += ` -codec copy "${videoFilePath.replace('.mp4', '')}_modified.mp4"`;
    
                console.log("FFmpeg command:", ffmpegCommand);
    
                FFmpegKit.executeAsync(ffmpegCommand).then(async (executionId) => {
                    console.log(`FFmpeg command executed with executionId: ${executionId}`);
    
                    const outputFilePath = `"${videoFilePath.replace('.mp4', '')}_modified.mp4"`;
    
                    const modifiedFileExists = await RNFetchBlob.fs.exists(outputFilePath);
                    if (modifiedFileExists) {
                        await RNFetchBlob.fs.mv(outputFilePath, videoFilePath); 
                        console.log("Metadata added to original file successfully");
                    } else {
                        console.error("Modified file does not exist");
                    }
                }).catch(error => {
                    console.error('Error executing FFmpeg command:', error);
                });
            } else {
                console.log('Video file does not exist:', videoFilePath);
            }
        } catch (error) {
            console.error('Error adding metadata to original file:', error);
        }
    
        setModalVisible2(false);
    };
    
    
    
    const handleCancelSave = () => {
        setModalVisible2(false);
    };


    const toggleModalVisibility = () => {
        setModalVisible3(!modalVisible3);

    };
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.rectangleBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../../Assests/Images/back.png')} style={styles.backArrow} />
                    </TouchableOpacity>
                    <Text style={styles.player}>Video Player</Text>
                </View>
                <TouchableOpacity onPress={toggleModalVisibility}>
                    <Image source={require('../../../Assests/Images/dot.png')} style={styles.menuIcon} />
                </TouchableOpacity>

            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible3}
                onRequestClose={closeModal}
            >
                <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible3(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleSaveHeader()}>
                            <Image source={require('../../../Assests/Images/save.png')} style={styles.saveicon} />
                            <Text style={styles.optionText}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalOption} onPress={() => handleShare()}>
                            <Image source={require('../../../Assests/Images/share.png')} style={styles.saveicon} />
                            <Text style={styles.optionText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>



            <View style={{ flex: 1, borderWidth: 2, marginTop: 10 }}>
                <TouchableOpacity
                    style={{ width: '100%', height: 200 }}
                    onPress={handleThumbnailPress}
                >
                    {clicked ? (
                        <Video
                            source={{ uri: item }}
                            ref={ref}
                            onProgress={handleProgress}
                            muted
                            paused={paused}
                            style={{ width: '100%', height: 200 }}
                            resizeMode='cover'
                        />
                    ) : (
                        <Image source={{ uri: item }} style={{ width: '100%', height: 200 }} />
                    )}
                    {clicked && (
                        <View
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => { ref.current.seek(progress.currentTime - 10) }}>
                                    <Image style={{ width: 30, height: 30, tintColor: 'white' }}
                                        source={require('../../../Assests/Images/backward.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setPaused(!paused)}>
                                    <Image style={{ width: 30, height: 30, tintColor: 'white', marginLeft: 50 }}
                                        source={paused ? require('../../../Assests/Images/play.png') : require('../../../Assests/Images/pause.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { ref.current.seek(progress.currentTime + 10) }}>
                                    <Image style={{ width: 30, height: 30, tintColor: 'white', marginLeft: 50 }}
                                        source={require('../../../Assests/Images/forward.png')} />
                                </TouchableOpacity>
                            </View>
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    position: 'absolute',
                                    bottom: 10,
                                    paddingLeft: 20,
                                    paddingRight: 20
                                }}>
                                <Text style={{ color: 'white' }}>{formatTime(progress.currentTime)}</Text>
                                <Slider
                                    style={{ width: 250, height: 40 }}
                                    minimumValue={0}
                                    maximumValue={progress.duration}
                                    minimumTrackTintColor='red'
                                    maximumTrackTintColor='white'
                                    value={progress.currentTime}
                                    onValueChange={handleSliderChange}
                                />
                                <Text style={{ color: 'white' }}>{formatTime(progress.duration)}</Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.viewMetadataButton} onPress={() => navigation.navigate('ClipMetadata', { item: item })}>
                    <Text style={styles.buttonText}>View Metadata</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.plusButton} onPress={handleSave}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={metadata}
                renderItem={renderItem}
                keyExtractor={(item, index) => (item && item.Id ? item.Id.toString() : index.toString())}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible2}
                onRequestClose={() => setModalVisible2(false)}
            >
                <View style={styles.modalContainer2}>
                    <View style={styles.modalContent2}>
                        <Text style={{ fontSize: 15, color: 'black' }}>Do you want to save data in database as well as header?</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#007bff', borderWidth: 2, borderColor: '#007bff', margin: 10, width: 70, height: 50 }} onPress={handleConfirmSave}>
                                <Text style={{ color: 'white' }}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#007bff', borderWidth: 2, borderColor: '#007bff', margin: 10, width: 70, height: 50 }} onPress={handleCancelSave}>
                                <Text style={{ color: 'white' }}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default VideoEditor;

const styles = StyleSheet.create({
    rectangleBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3f51b5',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    backArrow: {
        width: 16,
        height: 19,
        tintColor: 'white',
    },
    menuDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 17,
    },
    menuIcon: {
        width: 25,
        height: 20,
        tintColor: 'white',
    },
    player: {
        color: 'white',
        fontSize: 20,
        marginLeft: 30,
        fontWeight: 'bold'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 50,
        marginRight: 10
    },
    viewMetadataButton: {
        backgroundColor: 'blue',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginRight: 10,
    },
    plusButton: {
        backgroundColor: 'blue',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15
    },
    item: {
        padding: 10,
        marginTop: 10
    },
    title: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',

    },
    time: {
        fontSize: 20,
        color: 'black',
        borderBottomWidth: 1,

    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',

    },
    modalContainer: {
        width: 150,
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    modalIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    modalText: {
        fontSize: 16,
        color: 'black'
    },
    closeButton: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        padding: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent2: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalOption: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 5,
        paddingVertical: 10,
        marginBottom: 10,
    },
    optionText: {
        fontSize: 17,
        color: 'black',
    },
    saveicon: {
        marginTop: 5,
        width: 18,
        height: 18,
        marginRight: 10,
    }
});
