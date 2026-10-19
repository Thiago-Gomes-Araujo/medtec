'use client';

import React from 'react';
import ExecutiveDossierModal from './ExecutiveDossierModal';

interface PresentationPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: number;
}

export default function PresentationPitchModal({ isOpen, onClose, initialTab = 0 }: PresentationPitchModalProps) {
  return (
    <ExecutiveDossierModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab={initialTab}
    />
  );
}
