import React, { useState, useEffect } from "react";
import { StyleSheet, Switch, Dimensions, View } from "react-native";
import { Gyroscope } from "expo-sensors";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";

Gyroscope.setUpdateInterval(200);

export default function App() {
  const [subscription, setSubscription] = useState(null);
  const [isSmall, setIsSmall] = useState(false);
  const toggleSwitch = () => setIsSmall((previousState) => !previousState);
  const ballDimension = useSharedValue(Dimensions.get("screen").width / 10);

  //to model a ball rolling nicely, we need to use equations of motion, with the gyroscope data
  //being the force applying acceleration along x/y axis, and then deriving velocity and ultimately position
  const [ballMovementData, setBallMovementData] = useState({
    accX: 0,
    accY: 0,
    velocityX: 0,
    velocityY: 0,
  });

  const ballPositionX = useSharedValue(0);
  const ballPositionY = useSharedValue(0);

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData) => {
        setBallMovementData((previousMovementData) => ({
          accX: previousMovementData.accX + gyroscopeData.y * 2,
          accY: previousMovementData.accY + gyroscopeData.x * 2,
          velocityX:
            previousMovementData.velocityX +
            (previousMovementData.accX + gyroscopeData.y * 2),
          velocityY:
            previousMovementData.velocityY +
            (previousMovementData.accY + gyroscopeData.x * 2),
        }));
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    ballPositionX.value = withTiming(
      ballPositionX.value + ballMovementData.velocityX
    );
    ballPositionY.value = withTiming(
      ballPositionY.value + ballMovementData.velocityY
    );
  }, [ballMovementData]);

  useEffect(() => {
    ballDimension.value = withTiming(
      isSmall
        ? Dimensions.get("screen").width / 10
        : Dimensions.get("screen").width / 3
    );
  }, [isSmall]);

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isSmall ? "#f5dd4b" : "#f4f3f4"}
        style={{ position: "absolute", bottom: 25, left: 25 }}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isSmall}
      />
      <Animated.View
        style={{
          width: ballDimension,
          height: ballDimension,
          borderRadius: ballDimension,
          backgroundColor: "blue",
          transform: [
            { translateX: ballPositionX },
            { translateY: ballPositionY },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
