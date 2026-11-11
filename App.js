import registerRootComponent from 'expo/src/launch/registerRootComponent';
import { ExpoRoot } from 'expo-router';

export default function App() {
  const ctx = require.context('./apps/mobile/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

