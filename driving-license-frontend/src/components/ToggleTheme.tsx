import React from 'react';
import { Switch } from '@headlessui/react';

interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, setEnabled, label }) => {
  return (
    <div className="flex items-center space-x-4">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled ? 'bg-main-green' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
        />
      </Switch>
      <span className="text-main-darkBlue font-semibold">{label}</span>
    </div>
  );
};

export default Toggle;