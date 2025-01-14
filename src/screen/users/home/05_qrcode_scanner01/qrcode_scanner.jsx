import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link } from "@react-navigation/native";
import Header from "../../../global/header";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "../../../global/globalStyles";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";
import { MyContext } from "../../../../../context/tokenContext";
import axios from "axios";

function User_qrcode_scanner({ navigation }) {
  const { API_URL, setRequest } = useContext(MyContext);
  const auth = getAuth();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    console.log(data);
    data = JSON.parse(data);

    try {
      const token = await auth.currentUser.getIdToken(true);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `${API_URL}/api/customer/accept/${data.request.requestId}`,
        {},
        { headers }
      );
      // setRequest(response.data.request);
      axios
        .get(`${API_URL}/api/customer/request/${response.data.request._id}`, {
          headers,
        })
        .then((res) => {
          setRequest(res.data);
        })
        .catch((err) => console.log(err));
      console.log("API Response:", response.data);
    } catch (e) {
      console.log("Error:", e.response.data.error);
    }

    // onBtnClick();
  };

  const renderCamera = () => {
    return (
      <View style={styles.container}>
        {hasPermission === null ? (
          <Text>Requesting for camera permission</Text>
        ) : hasPermission === false ? (
          <Text style={{ color: "#fff" }}>
            Camera permission is not granted
          </Text>
        ) : (
          <View
            style={{
              height: "100%",
              width: Dimensions.get("window").width,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{
                height: "100%",
                width: Dimensions.get("window").width,
              }}
            />
          </View>
        )}
      </View>
    );
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not granted</Text>
      </View>
    );
  }
  const onBtnClick = () => {
    navigation.navigate("user_vehicle_pick", {});
  };
  return (
    <SafeAreaView style={globalStyles.view_screen}>
      <View>
        <Header style={styles.overlay} />
        <View style={{ height: Dimensions.get("window").height - 250 }}>
          {renderCamera()}
        </View>

        {/* <TouchableOpacity  style={globalStyles.btn_01} onPress={onBtnClick} >
          <Text style={globalStyles.text_label_btn01}>Cancel</Text>
        </TouchableOpacity> */}

        <Text style={globalStyles.text_label_input}>
          Keep the camera pointing towards the code for its correct reading
        </Text>
        <View style={globalStyles.br_10}></View>
        <Link
          style={globalStyles.link_01}
          to={{ screen: "contactus", params: {} }}
        >
          Contact us
        </Link>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
export default User_qrcode_scanner;
