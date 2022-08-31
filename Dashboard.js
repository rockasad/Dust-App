/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  StyleSheet,
  View,
  Text,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  TouchableHighlight,
  FlatList,
} from "react-native";
import {
  AnimatedGaugeProgress,
  GaugeProgress,
} from "react-native-simple-gauge";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { stringToBytes } from "convert-string";

import BleManager from "react-native-ble-manager";
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import Buffer from "buffer";
import { hideNavigationBar } from "react-native-navigation-bar-color";
import AwesomeAlert from "react-native-awesome-alerts";
import Speedometer from "react-native-cool-speedometer";
import Spinner from "react-native-loading-spinner-overlay";
import { showMessage, hideMessage } from "react-native-flash-message";
// import { Overlay } from 'react-native-elements';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import Modal from "react-native-modal";
const window = Dimensions.get("window");
const screen = Dimensions.get("screen");
const h = window.height;
const w = window.width;
const height1 = window.height;
const width1 = window.width;
import { useNavigation } from "@react-navigation/native";
import { Rating, AirbnbRating } from "react-native-ratings";

const Dashboard = () => {
  // ##################### DUST
  const [peripheralconnect, setPeripheralconnect] = useState([]);

  const [pm1, setPM1] = useState(0);
  const [pm25, setPM25] = useState(0);
  const [pm10, setPM10] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [modalstate, setModalstate] = useState(false);
  const [scansuccess, setScansuccess] = useState(false);

  // const a = route.params;
  // console.log("Dashboard SCREEN = ");
  // console.log(a);
  // if (a != undefined)
  //   console.log(a)
  const navigation = useNavigation();

  // console.log("height1 = ");
  // console.log(height1);
  // console.log("width1 = ");
  // console.log(width1);

  const [messageble, setmessageBle] = useState(""); // logs messages
  const [showAlert1, setshowAlert] = useState(false);
  const [visible, setVisible] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);
  const [listble, setListble] = useState([]);


  const handleStopScan = () => {
    console.log("Scan is stopped");
    setIsScanning(false);
    setshowAlert(false);
    setScansuccess(true);
    // setModalstate(true);
  };

  useEffect(() => {
    // if (modalstate) {
    //   console.log(listble);
    //   // modalstate
    // }
    if (scansuccess) {
      if (listble.length !== 0) {
        setModalstate(true);
        console.log(listble);
      } else {
        setTimeout(() => {
          setScansuccess(false);
        }, 3000);
      }
    }
  }, [scansuccess]);

  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    setStateBluetooth(false);
    console.log("Disconnected from " + data.peripheral);
    setPeripheralconnect([]);
  };

  const handleUpdateValueForCharacteristic = (data) => {
    const buffer = Buffer.Buffer.from(data.value);
    // const sensorData = buffer.readUInt8(1, true);
    const datas = buffer.toString();
    console.log(datas);
    // const len = datas.indexOf("&");
    // const lenend = datas.indexOf("#");
    if (datas.indexOf("#") != -1 && datas.indexOf("$") != -1) {
      const len = datas.indexOf("=");
      const lenend = datas.indexOf("$");
      const value = datas.substring(len + 1, lenend);
      if (datas.indexOf("#PM1=") != -1) {
        setPM1(parseInt(value));
      } else if (datas.indexOf("#PM25=") != -1) {
        setPM25(parseInt(value));
      } else if (datas.indexOf("#PM10=") != -1) {
        setPM10(parseInt(value));
      } else if (datas.indexOf("#TEMP=") != -1) {
        setTemperature(parseFloat(value));
      }
      // console.log(datas);
      // console.log(datas.substring(len + 1, datas.indexOf(",")));

      // console.log(datas.substring(len + 1, lenend));
      // const myArray = datas.substring(len + 1, lenend).split(",");
      // console.log("----------------------------------------");
      // setPM1(parseInt(myArray[0]));
      // setPM25(parseInt(myArray[1]));
      // setPM10(parseInt(myArray[2]));
      // setTemperature(parseFloat(myArray[3]));
      // console.log(myArray[0]);
      // console.log(myArray[1]);
      // console.log(myArray[2]);
      // console.log(myArray[3]);
      console.log("########################################");
    } else if (datas.indexOf("AT+LOG=OK") != -1) {
      var blesplit = messageble.split("#");
      console.log("###########  AT+LOG=OK  ###########");
      // console.log(blesplit);
      const bleName = peripheralconnect.name.substring(
        5,
        peripheralconnect.name.length + 1
      );
      console.log(`bleName :`);
      console.log(bleName);
      blesplit.map((data) => {
        // console.log(`${data} : ${data.length}`);
        var dataHeader = data.substring(data.indexOf("H"), data.indexOf("E"));
        var dataEnd = data.substring(data.indexOf("E"), data.length);
        if (data.length === 27) {
          console.log(`${dataHeader} : ${dataEnd}`);
          var yearLog = dataHeader.substring(1, 5);
          var monthLog = dataHeader.substring(5, 7);
          var dayLog = dataHeader.substring(7, 9);
          var hrLog = dataHeader.substring(9, 11);
          var mnLog = dataHeader.substring(11, 13);
          var pm1Log = dataEnd.substring(1, 4);
          var pm25Log = dataEnd.substring(4, 7);
          var pm10Log = dataEnd.substring(7, 10);
          var tempLog = dataEnd.substring(10, 14);
          var dateAt = `${yearLog}-${monthLog}-${dayLog}`;
          var timeAt = `${hrLog}:${mnLog}:00`;
          axios.post("https://api.dust-rmutl.com/log/addlogsretroact", {
            pm1: pm1Log,
            pm25: pm25Log,
            pm10: pm10Log,
            temperature: tempLog,
            deviceAddress: bleName,
            dateAt: dateAt,
            timeAt: timeAt,
          });
          // console.log(`######## START #########`);
          // console.log(`yearLog : ${yearLog}`);
          // console.log(`monthLog : ${monthLog}`);
          // console.log(`dayLog : ${dayLog}`);
          // console.log(`hrLog : ${hrLog}`);
          // console.log(`mnLog : ${mnLog}`);
          // console.log(`pm1Log : ${pm1Log}`);
          // console.log(`pm25Log : ${pm25Log}`);
          // console.log(`pm10Log : ${pm10Log}`);
          // console.log(`tempLog : ${tempLog}`);
          // console.log(`######## END #########`);
        }
      });
      console.log(`######## INSERT TO DATABASE #########`);
      SENDCOMMAND("AT+LOGAPP=OK");
    } else {
      setmessageBle(messageble + datas);
    }
  };
  const [idperipheral, setPeripheral] = useState("");

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log("No connected peripherals");
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  };
  // useEffect(() => {
  //   // console.log(listble);
  //   // setListble(
  //   //   listble.reduce((acc, current) => {
  //   //     const x = acc.find((item) => item.name === current.name);
  //   //     if (!x) {
  //   //       return acc.concat([current]);
  //   //     } else {
  //   //       return acc;
  //   //     }
  //   //   }, [])
  //   // );
  // }, [listble]);
  const handleDiscoverPeripheral = (peripheral) => {
    // console.log("Got ble peripheral", peripheral);
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
      // } else if (peripheral.name == "Dust_30:AE:A4:07:0D:64") {
    } else if (peripheral.name.indexOf("Dust_") !== -1) {
      // console.log(peripheral.name);
      const found = listble.find((element) => element.name == peripheral.name);
      console.log(`found : ${found}`);
      if (typeof found === "undefined") {
        setListble((oldlistble) => [...oldlistble, peripheral]);
      }
      // console.log(listble)
    }
    peripherals.set(peripheral.id, peripheral);

    // setList(Array.from(peripherals.values()));
    // if()

    // setList(Array.from(peripherals.values()));
    // setList(Array.from(peripherals.values()));
  };

  const renderItem = (item) => {
    const color = item.connected ? "green" : "#fff";
    return (
      // position: "absolute",
      // textAlign: "center",
      // fontSize: 56,
      // marginTop: 10,
      // width: "25%",
      // height: "25%",

      <TouchableHighlight
        onPress={() => {
          setPeripheralconnect(item);
          testPeripheral(item);
          setScansuccess(false);
          setModalstate(false);
          setStateBluetooth(true);
          setPeripheral(item.id);
        }}
      >
        <View style={[styles.row, { backgroundColor: color }]}>
          {/* <View style={[styles.row]}> */}
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              color: "#333333",
              padding: 10,
            }}
            // key={item.name}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: "center",
              color: "#333333",
              padding: 2,
            }}
          >
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: "center",
              color: "#333333",
              padding: 2,
              paddingBottom: 20,
            }}
            // key={item.id}
          >
            {item.id}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      handleDiscoverPeripheral
    );
    bleManagerEmitter.addListener("BleManagerStopScan", handleStopScan);
    bleManagerEmitter.addListener(
      "BleManagerDisconnectPeripheral",
      handleDisconnectedPeripheral
    );
    bleManagerEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      handleUpdateValueForCharacteristic
    );

    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    return () => {
      console.log("unmount");
      bleManagerEmitter.removeListener(
        "BleManagerDiscoverPeripheral",
        handleDiscoverPeripheral
      );
      bleManagerEmitter.removeListener("BleManagerStopScan", handleStopScan);
      bleManagerEmitter.removeListener(
        "BleManagerDisconnectPeripheral",
        handleDisconnectedPeripheral
      );
      bleManagerEmitter.removeListener(
        "BleManagerDidUpdateValueForCharacteristic",
        handleUpdateValueForCharacteristic
      );
    };
  }, [listble, messageble]);

  const SENDCOMMAND = (e) => {
    var service = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    var bakeCharacteristic = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    var crustCharacteristic = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    
    const str = stringToBytes(e);
    BleManager.write(idperipheral, service, crustCharacteristic, str)
      .then(() => {
        // Success code
        console.log("Write: ");
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        SENDCOMMAND("AT+REQ");
        setmessageBle("");
      } catch {}
    }, 60000);
  // }, 60000);
    return () => clearInterval(interval);
  }, []);
  const testPeripheral = (peripheral) => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              setList(Array.from(peripherals.values()));
            }
            console.log("Connected to " + peripheral.id);
            setTimeout(() => {
              BleManager.retrieveServices(peripheral.id).then(
                (peripheralData) => {
                  console.log("Retrieved peripheral services", peripheralData);

                  BleManager.readRSSI(peripheral.id).then((rssi) => {
                    console.log("Retrieved actual RSSI value", rssi);
                    let p = peripherals.get(peripheral.id);
                    if (p) {
                      p.rssi = rssi;
                      peripherals.set(peripheral.id, p);
                      setList(Array.from(peripherals.values()));
                    }
                  });
                }
              );
              // setPeripheral(peripheral.id);

              BleManager.retrieveServices(peripheral.id).then(
                (peripheralInfo) => {
                  console.log(peripheralInfo);
                  var service = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
                  var bakeCharacteristic =
                    "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
                  var crustCharacteristic =
                    "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
                  setTimeout(() => {
                    BleManager.startNotification(
                      peripheral.id,
                      service,
                      bakeCharacteristic,
                      500
                    )
                      .then(() => {
                        console.log("Started notification on " + peripheral.id);
                        setTimeout(() => {
                          const str = stringToBytes("AT+REQ");

                          BleManager.write(
                            peripheral.id,
                            service,
                            crustCharacteristic,
                            str
                          ).then(() => {
                            console.log("Writed NORMAL crust");
                          });
                        }, 1);
                      })
                      .catch((error) => {
                        console.log("Notification error", error);
                      });
                  }, 200);
                }
              );
            }, 900);
          })
          .catch((error) => {
            console.log("Connection error", error);
          });
      }
    }
  };

  // ################################################
  const hideAlert = () => {
    setshowAlert(false);
  };

  useEffect(() => {
    hideNavigationBar();
  }, []);

  const bluetoothFunc = () => {
    if (stateBluetooth) {
      BleManager.disconnect(idperipheral);
      setStateBluetooth(false);
    } else {
      console.log("bluetoothFunc");
      // setshowAlert(true);
      if (!isScanning) {
        BleManager.scan([], 3, true)
          .then((results) => {
            console.log("Scanning...");
            setmessageBle("");
            setList([]);
            setListble([]);
            setshowAlert(true);
            setIsScanning(true);
            setModalstate(false);
            setScansuccess(false);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  };

  const settingFunc = () => {
    console.log("settingFunc");
    // console.log(peripheralconnect == null);
    // console.log(peripheralconnect.length);
    // console.log(typeof(peripheralconnect));

    if (typeof peripheralconnect.length === "undefined") {
      console.log("(typeof peripheralconnect === undefined)");
    } else {
      console.log("22222222222222222222222");
    }
    navigation.navigate("Datalogs", {
      idperipheral: idperipheral,
      bledevice:
        typeof peripheralconnect.length === "undefined"
          ? peripheralconnect
          : null,
    });
  };
  const [stateBluetooth, setStateBluetooth] = useState(false);
  function intMap(x, inMin, inMax, outMin, outMax) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
  return (
    <>
      <ImageBackground
        style={{ width: "100%", height: "100%", backgroundColor: "#f7f8fa" }}
      >
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          {/* Header */}
          <View
            style={{
              width: "100%",
              position: "absolute",
              height: "20%",
              top: 0,
              backgroundColor: "#4385ef",
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              opacity: 3,
            }}
          >
            <Image
              source={require("./assets/img/dustimage/group5.png")}
              style={{
                position: "absolute",
                width: "7%",
                height: "100%",
                top: "5%",
                left: "4%",
                // backgroundColor: "red",
              }}
            ></Image>
            <Image
              source={require("./assets/img/dustimage/logo/cmu-logo.png")}
              style={{
                position: "absolute",
                width: "8%",
                height: "85%",
                top: "5%",
                left: "12%",
                // backgroundColor: "red",
              }}
            ></Image>
            <Image
              source={require("./assets/img/dustimage/logo/dushboy-logo.png")}
              style={{
                position: "absolute",
                width: "8%",
                height: "85%",
                top: "5%",
                left: "22%",
                // backgroundColor: "red",
              }}
            ></Image>
            <TouchableOpacity
              onPress={bluetoothFunc}
              style={{
                position: "absolute",
                width: "5%",
                height: "80%",
                top: "10%",
                right: "5%",
                // backgroundColor: "red",
                zIndex: 1,
              }}
            >
              <Image
                source={
                  !stateBluetooth
                    ? require("./assets/img/dustimage/bluetooth/bt-disconnect.png")
                    : require("./assets/img/dustimage/bluetooth/bt-connect.png")
                }
                style={{
                  width: "100%",
                  height: "100%",
                }}
              ></Image>
            </TouchableOpacity>

            <Text style={styles.headline}>
              {stateBluetooth ? peripheralconnect.name : "Disconnection"}
            </Text>
          </View>

          {/* ================================================ Main */}
          <View
            style={{
              width: "100%",
              position: "absolute",
              height: "70%",
              top: "20%",
              backgroundColor: "#f7f8fa",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: "3%",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                width: "30%",
                height: "60%",
                borderRadius: 25,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    top: "20%",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 20,
                    marginTop: 0,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  PM 1
                </Text>
                <Text
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 50,
                    marginTop: 5,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                >
                  {pm1 ? pm1 : 0}
                </Text>

                <Image
                  source={
                    pm1 <= 25
                      ? require("./assets/img/dustimage/cloud/cloud5.png")
                      : pm1 <= 50
                      ? require("./assets/img/dustimage/cloud/cloud1.png")
                      : pm1 <= 100
                      ? require("./assets/img/dustimage/cloud/cloud2.png")
                      : pm1 <= 200
                      ? require("./assets/img/dustimage/cloud/cloud3.png")
                      : require("./assets/img/dustimage/cloud/cloud4.png")
                  }
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontSize: 56,
                    marginTop: 10,
                    width: "25%",
                    height: "25%",
                    bottom: "5%",
                    alignContent: "center",
                    zIndex: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                ></Image>
              </View>
              <AnimatedGaugeProgress
                size={200}
                width={15}
                fill={intMap(pm1, 0, 200, 0, 100)}
                prefill={intMap(pm1, 0, 200, 0, 100)}
                rotation={90}
                cropDegree={180}
                
                tintColor={
                  pm1 <= 25
                    ? "#4385ef"
                    : pm1 <= 50
                    ? "#04BE1D"
                    : pm1 <= 100
                    ? "#F8D80D"
                    : pm1 <= 200
                    ? "#FF6C46"
                    : "#FF1B0A"
                }
                delay={0}
                duration={0}
                backgroundColor="#b0c4de"
                stroke={[2, 2]} //For a equaly dashed line
                strokeCap="circle"
                style={{ paddingTop: "5%" }}
              />
            </View>
            <View
              style={{
                backgroundColor: "white",
                width: "30%",
                height: "60%",
                borderRadius: 25,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
                marginRight: "2%",
                marginLeft: "2%",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    top: "20%",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 20,
                    marginTop: 0,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  PM 2.5
                </Text>
                <Text
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 50,
                    marginTop: 5,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                >
                  {pm25 ? pm25 : 0}
                </Text>

                <Image
                  
                  source={
                    pm25 <= 25
                      ? require("./assets/img/dustimage/cloud/cloud5.png")
                      : pm25 <= 50
                      ? require("./assets/img/dustimage/cloud/cloud1.png")
                      : pm25 <= 100
                      ? require("./assets/img/dustimage/cloud/cloud2.png")
                      : pm25 <= 200
                      ? require("./assets/img/dustimage/cloud/cloud3.png")
                      : require("./assets/img/dustimage/cloud/cloud4.png")
                  }
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontSize: 56,
                    marginTop: 10,
                    width: "25%",
                    height: "25%",
                    bottom: "5%",
                    alignContent: "center",
                    zIndex: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                ></Image>
              </View>
              <AnimatedGaugeProgress
                size={200}
                width={15}
                fill={intMap(pm25, 0, 200, 0, 100)}
                prefill={intMap(pm25, 0, 200, 0, 100)}
                rotation={90}
                cropDegree={180}
                tintColor={
                  pm25 <= 25
                    ? "#4385ef"
                    : pm25 <= 50
                    ? "#04BE1D"
                    : pm25 <= 100
                    ? "#F8D80D"
                    : pm25 <= 200
                    ? "#FF6C46"
                    : "#FF1B0A"
                }
                delay={0}
                backgroundColor="#b0c4de"
                stroke={[2, 2]} //For a equaly dashed line
                strokeCap="circle"
                style={{ paddingTop: "5%" }}
              />
            </View>
            <View
              style={{
                backgroundColor: "white",
                width: "30%",
                height: "60%",
                borderRadius: 25,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    top: "20%",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 20,
                    marginTop: 0,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  PM 10
                </Text>
                <Text
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontFamily: "TH Niramit AS",
                    fontSize: 50,
                    marginTop: 5,
                    width: "100%",
                    zIndex: 0,
                    height: "100%",
                    color: "#000",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                >
                  {pm10 ? pm10 : 0}
                </Text>

                <Image
                  source={
                    pm10 <= 50
                      ? require("./assets/img/dustimage/cloud/cloud5.png")
                      : pm10 <= 80
                      ? require("./assets/img/dustimage/cloud/cloud1.png")
                      : pm10 <= 120
                      ? require("./assets/img/dustimage/cloud/cloud2.png")
                      : pm10 <= 180
                      ? require("./assets/img/dustimage/cloud/cloud3.png")
                      : require("./assets/img/dustimage/cloud/cloud4.png")
                  }
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    fontSize: 56,
                    marginTop: 10,
                    width: "25%",
                    height: "25%",
                    bottom: "5%",
                    alignContent: "center",
                    zIndex: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                ></Image>
              </View>
              <AnimatedGaugeProgress
                size={200}
                width={15}
                fill={intMap(pm10, 0, 200, 0, 100)}
                prefill={intMap(pm10, 0, 200, 0, 100)}
                rotation={90}
                cropDegree={180}
                tintColor={
                  pm10 <= 50
                    ? "#4385ef"
                    : pm10 <= 80
                    ? "#04BE1D"
                    : pm10 <= 120
                    ? "#F8D80D"
                    : pm10 <= 180
                    ? "#FF6C46"
                    : "#FF1B0A"
                }

                delay={0}
                backgroundColor="#b0c4de"
                stroke={[2, 2]} //For a equaly dashed line
                strokeCap="circle"
                style={{ paddingTop: "5%" }}
              />
            </View>

            <View
              style={{
                backgroundColor: "white",
                color: "white",
                width: "15%",
                height: "20%",
                position: "absolute",
                bottom: "14%",
                left: "3%",
                marginRight: "2%",
                borderRadius: 28,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
              }}
            >
              <View
                style={{
                  width: "20%",
                  height: "100%",
                  position: "absolute",
                  left: "15%",
                  // backgroundColor: "green",
                  alignItems: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlignVertical: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={
                    temperature <= 30
                      ? require("./assets/img/dustimage/temp/temp5.png")
                      : temperature <= 38
                      ? require("./assets/img/dustimage/temp/temp1.png")
                      : temperature <= 45
                      ? require("./assets/img/dustimage/temp/temp2.png")
                      : temperature <= 55
                      ? require("./assets/img/dustimage/temp/temp3.png")
                      : require("./assets/img/dustimage/temp/temp4.png")
                  }
                  style={{
                    position: "absolute",
                    textAlign: "center",
                    right: "0%",
                    width: "80%",
                    height: "80%",
                    // bottom: "5%",
                    alignContent: "center",
                    textAlignVertical: "center",
                    zIndex: 0,
                  }}
                ></Image>
              </View>
              <View
                style={{
                  width: "70%",
                  height: "100%",
                  position: "absolute",
                  right: "0%",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: "50%",
                    position: "absolute",
                    left: "0%",
                    alignItems: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "TH Niramit AS",
                      fontSize: 12,
                      bottom: "0%",
                      color: "#000",
                    }}
                  >
                    อุณหภูมิ
                  </Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: "50%",
                    position: "absolute",
                    bottom: "0%",
                    alignItems: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlignVertical: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "TH Niramit AS",
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {temperature} °C
                  </Text>
                </View>
              </View>
            </View>

            {/* <View
              style={{
                width: "15%",
                height: "15%",
                position: "absolute",
                bottom: "14%",
                // right: "3%",
                marginRight: "2%",
                // backgroundColor: "#5FBEFF",
                // borderRadius: 28,
                // shadowColor: "#D5D8D4",
                // shadowOffset: {
                //   width: 0,
                //   height: 12,
                // },
                // shadowOpacity: 0.58,
                // shadowRadius: 16.0,
                // elevation: 10,
                alignItems: "center",
                justifyContent: "center",
                alignItems: "center",
                textAlignVertical: "center",
              }}
            >
              <AirbnbRating
                showRating={false}
                count={5}
                defaultRating={
                  pm25 <= 25
                    ? 5
                    : pm25 <= 50
                    ? 4
                    : pm25 <= 100
                    ? 3
                    : pm25 <= 200
                    ? 2
                    : 1
                }
                size={16}
                isDisabled={true}
              />
              <Text
                style={{
                  fontFamily: "TH Niramit AS",
                  fontSize: 18,
                  fontWeight: "200",
                  color: "#000",
                }}
              >
                {pm25 <= 25
                  ? "ดีมาก"
                  : pm25 <= 50
                  ? "ดี"
                  : pm25 <= 100
                  ? "ปานกลาง"
                  : pm25 <= 200
                  ? "เริ่มมีผลกระทบต่อสุขภาพ"
                  : "มีผลกระทบต่อสุขภาพ"}
              </Text>
            </View> */}
            <TouchableOpacity
              onPress={settingFunc}
              style={{
                backgroundColor: "#5FBEFF",
                width: "15%",
                height: "15%",
                position: "absolute",
                bottom: "14%",
                right: "3%",
                marginRight: "2%",
                borderRadius: 28,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
                alignItems: "center",
                justifyContent: "center",
                alignItems: "center",
                textAlignVertical: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "TH Niramit AS",
                  fontSize: 15,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                DATALOG {">"}
              </Text>
            </TouchableOpacity>

            {/* <View
              style={{
                backgroundColor: "white",
                color: "white",
                width: "15%",
                height: "15%",
                position: "absolute",
                bottom: "14%",
                right: "3%",
                marginRight: "2%",
                borderRadius: 28,
                shadowColor: "#D5D8D4",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 10,
              }}
            ></View> */}
          </View>
          {/* Footer */}
          <View
            style={{
              width: "100%",
              position: "absolute",
              height: "10%",
              bottom: 0,
              backgroundColor: "#4385ef",
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              opacity: 1,
            }}
          ></View>
          {/* 
            <TouchableOpacity onPress={settingFunc} style={{ width: '15%', height: '18%', position: "absolute", right: 5, bottom: 5 }}>
              <Image source={require('./assets/img/setting-logo3.png')} style={{ width: '100%', height: '100%', position: "absolute", bottom: 5, right: 5 }}></Image>
            </TouchableOpacity> */}
          {/* </View> */}
        </View>
        <Spinner
          visible={showAlert1}
          textContent={"กำลังค้นหาอุปกรณ์"}
          textStyle={styles.spinnerTextStyle}
        />
        <Modal isVisible={modalstate}>
          <View
            style={{
              backgroundColor: "white",
              width: "100%",
              height: "100%",
              borderRadius: 25,
              shadowColor: "#D5D8D4",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.58,
              shadowRadius: 16.0,
              elevation: 10,
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setModalstate(!modalstate);
                setScansuccess(false);
              }}
              style={{
                // backgroundColor: "green",
                position: "absolute",
                width: "10%",
                height: "12%",
                right: "-1%",
                top: "-5%",
                alignContent: "flex-end",
                // zIndex: 0,
                alignItems: "flex-end",
              }}
            >
              <Image
                source={require("./assets/img/dustimage/close1.png")}
                style={{
                  width: "50%",
                  height: "100%",
                  alignContent: "center",
                  zIndex: -1,
                  justifyContent: "center",
                  alignItems: "center",
                  textAlignVertical: "center",
                }}
              ></Image>
            </TouchableOpacity>

            <FlatList
              style={{
                // backgroundColor: "white",
                zIndex: -1,
                width: "100%",
                height: "100%",
              }}
              data={listble}
              renderItem={({ item }) => renderItem(item)}
              // keyExtractor={(item) => item.id}
            />
            {/* <Text>I am the modal content!</Text> */}
          </View>
        </Modal>

        <Modal isVisible={scansuccess}>
          <View
            style={{
              position: "absolute",
              right: "25%",
              backgroundColor: "white",
              width: "50%",
              height: "100%",
              borderRadius: 25,
              shadowColor: "#D5D8D4",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.58,
              shadowRadius: 16.0,
              elevation: 10,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              alignItems: "center",
              textAlignVertical: "center",
            }}
          >
            <Image
              source={require("./assets/img/dustimage/bterror.png")}
              style={{
                width: "40%",
                height: "50%",
                alignContent: "center",
                zIndex: 0,
                justifyContent: "center",
                alignItems: "center",
                textAlignVertical: "center",
                marginBottom: 20,
              }}
            ></Image>
            <Text
              style={{
                fontFamily: "TH Niramit AS",
                fontSize: 20,
                fontWeight: "bold",
                color: "#000",
              }}
            >
              ไม่พบอุปกรณ์
            </Text>
          </View>
        </Modal>

        {/* <Modal isVisible={scansuccess}>
          <View
            style={{
              position:"absolute",
              top:"-5%",
              backgroundColor: "white",
              width: "50%",
              height: "20%",
              borderRadius: 25,
              shadowColor: "#D5D8D4",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.58,
              shadowRadius: 16.0,
              elevation: 10,
              alignContent: "center",
              alignItems: "center",   
              justifyContent: "center",
              alignItems: "center",
              textAlignVertical: "center",   
            }}
          >
            <Image
              source={require("./assets/img/dustimage/bterror.png")}
              style={{
              position:"absolute",
                width: "15%",
                height: "95%",
                left:"15%"
              }}
            ></Image>
            <Text
              style={{
                fontFamily: "TH Niramit AS",
                fontSize: 20,
                fontWeight: "bold",
                color: "#2A3232",
                marginLeft: 5
              }}
            >
              ไม่พบอุปกรณ์
            </Text>
          </View>
        </Modal> */}
      </ImageBackground>
    </>
  );
};

var styles = StyleSheet.create({
  spinnerTextStyle: {
    color: "#FFF",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  headline: {
    position: "absolute",
    textAlign: "center", // <-- the magic
    fontFamily: "Segoe UI",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 0,
    width: "100%",
    zIndex: 0,
    height: "100%",
    color: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    textAlignVertical: "center",
    // backgroundColor: "yellow",
  },
  headgauge: {
    position: "absolute",
    textAlign: "center", // <-- the magic
    fontFamily: "TH Niramit AS",
    fontWeight: "bold",
    fontSize: 22,
    marginTop: 0,
    width: "100%",
    zIndex: 0,
    height: "100%",
    color: "#000",
    justifyContent: "center",
    alignItems: "center",
    textAlignVertical: "center",
    // backgroundColor: "yellow",
  },
  // headerApp :{
  //   borderBottomRightRadius
  // }
});

export default Dashboard;
