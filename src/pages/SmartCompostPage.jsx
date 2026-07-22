import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { DashboardCard } from '@/components/common/DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Fan, Droplets, RefreshCw } from 'lucide-react';
import { rtdbService } from '@/services/rtdbService';

export const SmartCompostPage = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [relays, setRelays] = useState({ fan: false, pump: false });

  useEffect(() => {
    // Listen to live telemetry from RTDB node devices/SCV-COMP-001
    const unsubscribe = rtdbService.listenDeviceTelemetry('SCV-COMP-001', (data) => {
      if (data) {
        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }
        if (data.relay) {
          setRelays(data.relay);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const tempVal = telemetry?.compostTemperature ?? telemetry?.temp ?? 48.5;
  const soilMoistureVal = telemetry?.soilMoisture ?? telemetry?.moisture ?? 55.0;
  const humidityVal = telemetry?.airHumidity ?? telemetry?.humidity ?? 62.4;
  const gasVal = telemetry?.gas ?? telemetry?.gasPpm ?? 142;

  const sensorList = [
    { name: 'DS18B20 Compost Sensor', value: `${tempVal}°C` },
    { name: 'Capacitive Soil Moisture Sensor', value: `${soilMoistureVal}%` },
    { name: 'DHT22 Air Humidity Sensor', value: `${humidityVal}%` },
    { name: 'MQ-135 Gas / Air Quality Sensor', value: `${gasVal} ppm` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Compost Bin Monitoring"
        description="Real-time compost telemetry (DS18B20, DHT22, Capacitive Moisture, MQ-135) & relay control."
        actions={
          <Button variant="default" size="sm" className="gap-2">
            <Sprout className="w-4 h-4" />
            <span>New Compost Batch</span>
          </Button>
        }
      />

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Compost Temp" value={`${tempVal}°C`} subtext="Target: 45°C - 55°C" iconName="Flame" color="amber" />
        <DashboardCard title="Soil Moisture" value={`${soilMoistureVal}%`} subtext="Target: 50% - 60%" iconName="Droplets" color="blue" />
        <DashboardCard title="Ambient Humidity" value={`${humidityVal}%`} subtext="Target: 50% - 70%" iconName="Wind" color="emerald" />
        <DashboardCard title="Fermentation Gas" value={`${gasVal} ppm`} subtext="MQ-135 Gas sensor" iconName="Activity" color="purple" />
      </div>

      {/* Actuators / Control Panel Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Bin #1 Actuator Relay Controls" description="Manual overrides for ESP32 fan & water pump">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Fan className={`w-5 h-5 ${relays.fan ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ventilation Fan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto mode active (Triggered at &gt;50°C)</p>
                </div>
              </div>
              <Badge variant={relays.fan ? 'success' : 'secondary'}>
                {relays.fan ? 'ON (Auto)' : 'OFF (Standby)'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Water Pump Sprinkler</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto mode active (Triggered at &lt;45% moisture)</p>
                </div>
              </div>
              <Badge variant={relays.pump ? 'success' : 'secondary'}>
                {relays.pump ? 'ON (Active)' : 'OFF (Standby)'}
              </Badge>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Telemetry Details (Live RTDB)" description="Sensors mounted on ESP32 Compost Node (devices/SCV-COMP-001)">
          <div className="space-y-2">
            {sensorList.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
