import React from 'react';
import { JourneyPhase } from '@/graphql/operations';

interface CurrentPhasePanelProps {
  phase: Pick<JourneyPhase, 'key' | 'descriptionKey' | 'icon'>;
}

const CurrentPhasePanel: React.FC<CurrentPhasePanelProps> = () => {

  return (
    <div>
      {/* TODO: dynamically render the actual form/upload/map for phase.key */}
    </div>
  );
};

export default CurrentPhasePanel;
