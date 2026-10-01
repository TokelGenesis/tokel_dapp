import type React from 'react';

// Props that make a clickable non-button element work like a button for the keyboard (Enter, Space) and for
// screen readers. Nothing when there is no action.
const pressable = (onPress?: () => void) =>
  onPress
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: onPress,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPress();
          }
        },
      }
    : {};

export default pressable;
