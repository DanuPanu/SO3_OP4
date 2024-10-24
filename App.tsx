import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import {Button} from 'react-native-paper'
import * as Location from 'expo-location';
import ottoData from './ottoData.json';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearestOtto, setNearestOtto] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Käyttöoikeuksia sijainnille ei myönnetty.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const findNearestOtto = () => {
    if (!location) {
      Alert.alert('Virhe', 'Sijaintia ei ole saatavilla.');
      return;
    }

    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;

    let nearest = null;
    let minDistance = Infinity;

    ottoData.forEach((otto) => {
      const distance = calculateDistance(userLat, userLon, otto.latitude, otto.longitude);
      if (distance < minDistance) {
        nearest = { ...otto, distance };
        minDistance = distance;
      }
    });

    setNearestOtto(nearest);
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : nearestOtto ? (
        <>
          <Text style={styles.teksti}>Lähin Otto-automaatti:</Text>
          <Text style={styles.teksti}>Osoite: {nearestOtto.address}</Text>
          <Text style={styles.teksti}>Postinumero: {nearestOtto.postalCode}</Text>
          <Text style={styles.teksti}>Kaupunki: {nearestOtto.city}</Text>
          <Text style={styles.teksti}>Etäisyys: {nearestOtto.distance.toFixed(2)} km</Text>
          <Button style={styles.button} mode='contained' onPress={() => setNearestOtto(null)}>Etsi uudelleen</Button>
        </>
      ) : (
        <>
          <Text style={styles.teksti}>Paina nappia etsiäksesi lähimmän Otto-automaatin</Text>
          <Button icon="cash-register" style={styles.button} mode='contained' onPress={findNearestOtto}>Etsi lähin Otto-automaatti</Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    padding: 5,
    marginTop: 20,
  },
  teksti: {
    fontSize: 25,
    marginTop: 5,
    textAlign: "center"
  }
});