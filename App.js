import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import Dashboard from './Dashboard';
import Datalogs from './Datalogs';
const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={Dashboard} options={{
          statusBarHidden: true,
          headerShown: false
        }} />
        <Stack.Screen name="Datalogs" component={Datalogs} options={{
          statusBarHidden: true,
          headerShown: false
        }} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}