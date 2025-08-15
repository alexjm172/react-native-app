/**
 * @format
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
