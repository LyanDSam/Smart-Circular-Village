import { getDatabase } from 'firebase/database';
import { app } from './config';

/**
 * Firebase Realtime Database (RTDB) Instance
 * Used for live IoT telemetry state and relay actuation.
 */
export const rtdb = getDatabase(app);
