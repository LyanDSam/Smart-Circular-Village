import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { DashboardCard } from '@/components/common/DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Fan, Droplets } from 'lucide-react';
import { SENSOR_OVERVIEW } from '@/constants/mockData';

export const SmartCompostPage = () => {
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
        <DashboardCard title="Compost Temp" value="48.5°C" subtext="Target: 45°C - 55°C" iconName="Flame" color="amber" />
        <DashboardCard title="Soil Moisture" value="55.0%" subtext="Target: 50% - 60%" iconName="Droplets" color="blue" />
        <DashboardCard title="Ambient Humidity" value="62.4%" subtext="Target: 50% - 70%" iconName="Wind" color="emerald" />
        <DashboardCard title="Fermentation Gas" value="142 ppm" subtext="MQ-135 Gas sensor" iconName="Activity" color="purple" />
      </div>

      {/* Actuators / Control Panel Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Bin #1 Actuator Relay Controls" description="Manual overrides for ESP32 fan & water pump">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Fan className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ventilation Fan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto mode active (Triggered at &gt;50°C)</p>
                </div>
              </div>
              <Badge variant="success">ON (Auto)</Badge>
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
              <Badge variant="secondary">OFF (Standby)</Badge>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Telemetry Details" description="Sensors mounted on ESP32 Compost Node">
          <div className="space-y-2">
            {SENSOR_OVERVIEW.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
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
