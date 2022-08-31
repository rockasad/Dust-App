import React, { useState, useEffect, useCallback } from "react";
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
  Button,
  PixelRatio,
} from "react-native";

import { stringToBytes } from "convert-string";

import moment from "moment";
import axios from "axios";
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
import DatePicker from "react-native-date-picker";
import MonthPicker from "react-native-month-year-picker";
import DateRangePicker from "rn-select-date-range";
import Modal from "react-native-modal";
import { LineChart } from "react-native-chart-kit";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

const window = Dimensions.get("window");
const screen = Dimensions.get("screen");
const h = window.height;
const w = window.width;
const height1 = window.height;
const width1 = window.width;
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

const Datalogs = ({ route }) => {
  const [selectedRange, setRange] = useState({});
  const [date, setDate] = useState(new Date());

  const [datemonth, setDatemonth] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [showm, setShowm] = useState(false);
  const [datem, setDatem] = useState(new Date());
  const showPicker = useCallback((value) => setShowm(value), []);
  const [modalrangeday, setModalrangeday] = useState(false);

  const [daterangestr, setDaterangestr] = useState("01/07/2022 - 01/08/2022");

  const [isLoading, setLoading] = useState(false);
  const [datalog, setDatalog] = useState([]);
  const a = route.params;
  console.log("a.bledevice = ");
  console.log(a.bledevice == null);
  if (a.bledevice == null) {
  } else {
    console.log(
      a.bledevice.name.substring(
        a.bledevice.name.indexOf("Dust_") + 5,
        a.bledevice.name.length
      )
    );
  }
  const [devicename, setDevicename] = useState(
    a.bledevice == null
      ? "x"
      : a.bledevice.name.substring(
          a.bledevice.name.indexOf("Dust_") + 5,
          a.bledevice.name.length
        )
  );
  // const [devicename, setDevicename] = useState("AA:AA:A4:07:0D:64");

  const [datalog1, setDatalog1] = useState([""]);
  const [datalog2, setDatalog2] = useState([0]); // PM1
  const [datalog3, setDatalog3] = useState([0]); // PM2.5
  const [datalog4, setDatalog4] = useState([0]); // PM10

  const [type, setType] = useState("Day");

  const fetchAPI = (path) => {
    console.log(`https://api.dust-rmutl.com/log/${path}`);
    axios.get(`https://api.dust-rmutl.com/log/${path}`).then((response) => {
      // response.text.json();
      console.log("FETCH DATA");
      console.log(response.data.message);
      setDatalog(response.data.message);
      setType(response.data.type);
    });
  };

  const idperipheral = a.idperipheral;
  console.log("idperipheral = " + idperipheral);
  const navigation = useNavigation();

  // ฟังก์ชั่นรายเดือน
  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || datem;
      const year = newDate.toISOString().substring(0, 4);
      const month = newDate.toISOString().substring(5, 7);

      const months1 = [
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "01",
      ];
      fetchAPI(
        `datalog/month/${devicename}/${year}/${months1[parseInt(month) - 1]}`
      );
      showPicker(false);
      // setDate(month + "/" + year);
      setDatemonth(selectedDate);
      // setDate(`${month}/${year}`);
      const years = newDate.toISOString().substring(0, 4);
      const months = newDate.toISOString().substring(5, 7);
      // const months = newDate.toISOString().substring(0, 7).replace("-", "")
      setDaterangestr(`${months1[parseInt(month) - 1]}/${years}`);
    },
    [date, showPicker]
  );
  useEffect(() => {
    var data1 = [""];
    var data2 = [0]; // PM1
    var data3 = [0]; // PM2.5
    var data4 = [0]; // PM10
    try {
      // console.log(datalog.length == 0);
      console.log("datalog.status : ");
      console.log(datalog);
      if (datalog.length !== 0) {
        data1 = [];
        data2 = [];
        data3 = [];
        data4 = [];
        datalog.map((d) => {
          console.log(
            "############################ datalog.type ==== ----------------->"
          );
          console.log(datalog.type);
          console.log(type);
          if (type === "Day") {
            data1.push(d.timeAt);
          } else {
            data1.push(d.dateAt.substring(0, 10));
          }

          data2.push(d.pm1);
          data3.push(d.pm25);
          data4.push(d.pm10);
        });
        // console.log(data1);
        // console.log(data2);
        setDatalog1(data1);
        setDatalog2(data2);
        setDatalog3(data3);
        setDatalog4(data4);
      }else{
        console.log("emtry -------------")
        setDatalog1([""]);
        setDatalog2([0]);
        setDatalog3([0]);
        setDatalog4([0]);
      }
    } catch {
      setDatalog1([""]);
      setDatalog2([0]);
      setDatalog3([0]);
      setDatalog4([0]);
    }

    // console.log(data1);
    // console.log(data2);
  }, [datalog]);
  const SENDCOMMAND = (e) => {
    var service = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    var bakeCharacteristic = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    var crustCharacteristic = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    const str = stringToBytes(e);
    console.log("SENDCOMMAND");
    console.log(idperipheral);
    BleManager.write(idperipheral, service, crustCharacteristic, str)
      .then(() => {
        console.log("Write: ");
      })
      .catch((error) => {
        console.log("error");
        console.log(error);
      });
  };

  const [stateBluetooth, setStateBluetooth] = useState(false);
  console.log("datalog1 = ");
  console.log(datalog1);
  console.log("datalog2 = ");
  console.log(datalog2);
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
              onPress={() => {
                navigation.pop();
              }}
              style={{
                position: "absolute",
                width: "5%",
                height: "80%",
                top: "30%",
                right: "5%",
                // backgroundColor: "red",
                zIndex: 1,
              }}
            >
              <Image
                source={require("./assets/img/dustimage/back.png")}
                style={{
                  width: "80%",
                  height: "40%",
                }}
              ></Image>
            </TouchableOpacity>
          </View>

          {/* ================================================ Main */}
          <View
            style={{
              width: "100%",
              position: "absolute",
              height: "70%",
              top: "20%",
              // backgroundColor: "red",
              // backgroundColor: "#f7f8fa",
              flexDirection: "row",
              justifyContent: "center",
              // backgroundColor: "#f7f",
              // marginTop: "3%",
            }}
          >
            <View
              style={{
                width: "100%",
                position: "absolute",
                height: "18%",
                top: "0%",
                // backgroundColor: "green",
                // backgroundColor: "#f7f8fa",
                flexDirection: "row",
                justifyContent: "center",
                textAlignVertical: "center",
                alignContent: "center",
                alignItems: "center",
                // backgroundColor: "#f7f",
                // marginTop: "3%",
              }}
            >
              <View
                style={{
                  width: "95%",
                  height: "85%",
                  flexDirection: "row",
                  // backgroundColor: "#f7f8fa",
                  // marginTop: 4,
                  // borderRadius: 15,
                  // shadowColor: "#f7f8fa",
                  // shadowOffset: {
                  //   width: 0,
                  //   height: 12,
                  // },
                  // shadowOpacity: 0.58,
                  // shadowRadius: 16.0,
                  // elevation: 4,
                  // justifyContent: "center",
                  // textAlignVertical: "center",
                  // alignContent: "center",
                  // alignItems: "flex-start",
                  // paddingStart: 30,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setType("Day");
                    setOpen(true);
                  }}
                  style={{
                    backgroundColor: "#028881",
                    width: "12%",
                    height: "80%",
                    position: "absolute",
                    bottom: "0%",
                    left: "0%",
                    // marginRight: "2%",
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
                      fontSize: normalize(6),
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    รายวัน
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowm(true);
                    setType("Month");
                  }}
                  style={{
                    backgroundColor: "#028881",
                    width: "12%",
                    height: "80%",
                    position: "absolute",
                    bottom: "0%",
                    left: "13%",
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
                      fontSize: normalize(6),
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    รายเดือน
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    backgroundColor: "#028881",
                    width: "14%",
                    height: "80%",
                    position: "absolute",
                    bottom: "0%",
                    left: "26%",
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
                ></View>

                <TouchableOpacity
                  onPress={() => {
                    setType("Range");
                    setModalrangeday(true);
                  }}
                  style={{
                    backgroundColor: "#028881",
                    width: "14%",
                    height: "80%",
                    position: "absolute",
                    bottom: "0%",
                    left: "26%",
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
                      fontSize: normalize(6),
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    เลือกช่วงวันที่
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "#fffff4",
                    width: "28%",
                    height: "60%",
                    position: "absolute",
                    top: "10%",
                    right: "0%",
                    // marginRight: "2%",
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
                      fontSize: normalize(6),
                      fontWeight: "bold",
                      color: "#3B413A",
                    }}
                  >
                    {/* 01/07/2022 */}
                    {/* 01/07/2022 - 01/08/2022 */}
                    {daterangestr}
                  </Text>
                </View>

                {/* <Button
                  style={{ padding: 10 }}
                  title="เลือกวันที่ต้องการ"
                  onPress={() => setOpen(true)}
                  color="#4385ef"
                /> */}
                <DatePicker
                  modal
                  maximumDate={new Date()}
                  mode="date"
                  open={open}
                  date={date}
                  textColor="black"
                  title="เลือกวันที่ต้องการ"
                  onConfirm={(dates) => {
                    setOpen(false);
                    fetchAPI(
                      `datalog/date/${devicename}/${dates
                        .toISOString()
                        .substring(0, 10)}`
                    );
                    // setDatalog1();

                    // console.log()

                    const months1 = [
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                      "01",
                    ];
                    const years = dates.toISOString().substring(0, 4);
                    const months = dates.toISOString().substring(5, 7);
                    const days = dates.toISOString().substring(8, 10);
                    setDaterangestr(`${days}/${months}/${years}`);
                    setDate(dates);
                  }}
                  onCancel={() => {
                    setOpen(false);
                  }}
                />
                {showm && (
                  <MonthPicker
                    onChange={onValueChange}
                    value={datemonth}
                    minimumDate={new Date(2010, 1)}
                    maximumDate={new Date()}
                    locale="th"
                  />
                )}

                <Modal isVisible={modalrangeday}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalrangeday(false);
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
                        zIndex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        textAlignVertical: "center",
                      }}
                    ></Image>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      try {
                        setModalrangeday(false);
                        if (
                          typeof selectedRange.firstDate !== "undefined" ||
                          typeof selectedRange.secondDate !== "undefined"
                        ) {
                          fetchAPI(
                            `datalog/rangedate/${devicename}/${selectedRange.firstDate}/${selectedRange.secondDate}`
                          );

                          console.log(selectedRange.firstDate);
                          console.log(selectedRange.secondDate);

                          // selectedRange
                          const years1 = selectedRange.firstDate.substring(
                            0,
                            4
                          );
                          const months1 = selectedRange.firstDate.substring(
                            5,
                            7
                          );
                          const days1 = selectedRange.firstDate.substring(
                            8,
                            10
                          );

                          const years2 = selectedRange.secondDate.substring(
                            0,
                            4
                          );
                          const months2 = selectedRange.secondDate.substring(
                            5,
                            7
                          );
                          const days2 = selectedRange.secondDate.substring(
                            8,
                            10
                          );
                          setDaterangestr(
                            `${days1}/${months1}/${years1} - ${days2}/${months2}/${years2}`
                          );
                        }
                      } catch {
                        setModalrangeday(false);
                      }
                    }}
                    style={{
                      // backgroundColor: "green",
                      position: "absolute",
                      width: "10%",
                      height: "12%",
                      right: "-1%",
                      top: "15%",
                      alignContent: "flex-end",
                      // zIndex: 0,
                      alignItems: "flex-end",
                    }}
                  >
                    <Image
                      source={require("./assets/img/dustimage/ok1.png")}
                      style={{
                        width: "50%",
                        height: "100%",
                        alignContent: "center",
                        zIndex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        textAlignVertical: "center",
                      }}
                    ></Image>
                  </TouchableOpacity>
                  <View
                    style={{
                      margin: 50,
                      position: "relative",
                      // justifyContent: "center",
                      // alignItems: "center",
                      // textAlignVertical: "center",
                      backgroundColor: "white",
                      // width: "100%",
                      // height: "100%",
                      // borderRadius: 25,
                      // shadowColor: "#D5D8D4",
                      // shadowOffset: {
                      //   width: 0,
                      //   height: 12,
                      // },
                      // shadowOpacity: 0.58,
                      // shadowRadius: 16.0,
                      // elevation: 10,
                      // alignContent: "center",
                      // alignItems: "center",
                    }}
                  >
                    <DateRangePicker
                      onSelectDateRange={(range) => {
                        console.log("### range ###");
                        console.log(range);
                        // {{main}}/log/datalog/rangedate/AA:AA:A4:07:0D:64/2022-08-01/2022-08-02
                        // fetchAPI(
                        //   `datalog/rangedate/${devicename}/${range.firstDate}/${range.secondDate}`
                        // );
                        // const years = dates.toISOString().substring(0, 4);
                        // const months = dates.toISOString().substring(5, 7);
                        // const days = dates.toISOString().substring(8, 10);
                        setRange(range);
                      }}
                      blockSingleDateSelection={true}
                      responseFormat="YYYY-MM-DD"
                      maxDate={moment()}
                      minDate={moment().subtract(100, "days")}
                      selectedDateContainerStyle={
                        styles.selectedDateContainerStyle
                      }
                      selectedDateStyle={styles.selectedDateStyle}
                    />
                  </View>
                </Modal>
                {/* <DatePicker date={date} onDateChange={setDate} /> */}
              </View>
            </View>
            <View
              style={{
                width: "100%",
                position: "absolute",
                height: "82%",
                bottom: "0%",
                zIndex: -1,
                // backgroundColor: "blue",
                // backgroundColor: "#f7f8fa",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <LineChart
                // data={{
                //   labels: datalog1,
                //   datasets: [
                //     {
                //       data: datalog2,
                //     },
                //   ],
                // }}
                data={{
                  labels: datalog1,
                  // labels: ()=> ,
                  datasets: [
                    {
                      data: datalog2,
                      strokeWidth: 2,
                      color: (opacity = 1) => `rgba(255,0,0,${opacity})`, // optional
                    },
                    {
                      data: datalog3,
                      strokeWidth: 2,
                      color: (opacity = 1) => `rgba(0,0,102, ${opacity})`, // optional
                    },
                    {
                      data: datalog4,
                      strokeWidth: 2,
                      color: (opacity = 1) => `rgba(0,102,0, ${opacity})`, // optional
                    },
                  ],
                  legend: ["PM1", "PM2.5", "PM10"],
                }}
                // data={{
                //   labels: [""],
                //   // labels: ()=> ,
                //   datasets: [
                //     {
                //       data: [0],
                //     },
                //   ],
                // }}
                width={Dimensions.get("window").width} // from react-native
                height={Dimensions.get("window").height * 0.49}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                  backgroundColor: "#4385ef",
                  backgroundGradientFrom: "#4385ef",
                  backgroundGradientTo: "#438fef",
                  decimalPlaces: 2, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "1",
                    // stroke: "#fff",
                    stroke: "#4385ef",
                  },
                }}
                bezier
                style={{
                  marginVertical: 0,
                  borderRadius: 16,
                  position: "absolute",
                  bottom: "2%",
                }}
              />
            </View>
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
        </View>
        {/* <Spinner
          visible={showAlert1}
          textContent={"กำลังค้นหาอุปกรณ์"}
          textStyle={styles.spinnerTextStyle}
        /> */}
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
  selectedDateContainerStyle: {
    height: 35,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
  },
  selectedDateStyle: {
    fontWeight: "bold",
    color: "white",
  },
  // headerApp :{
  //   borderBottomRightRadius
  // }
});
export default Datalogs;
