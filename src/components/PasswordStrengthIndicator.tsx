import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pwd: string): StrengthResult => {
    let score = 0;
    const suggestions: string[] = [];

    if (!pwd) {
      return {
        score: 0,
        label: 'Enter a password',
        color: '#ccc',
        suggestions: []
      };
    }

    // Length check
    if (pwd.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (pwd.length >= 12) score += 1;

    // Lowercase check
    if (/[a-z]/.test(pwd)) score += 1;
    else suggestions.push('Add lowercase letters');

    // Uppercase check
    if (/[A-Z]/.test(pwd)) score += 1;
    else suggestions.push('Add uppercase letters');

    // Number check
    if (/\d/.test(pwd)) score += 1;
    else suggestions.push('Add numbers');

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;
    else suggestions.push('Add special characters (!@#$%^&*)');

    // Determine strength label and color
    let label = '';
    let color = '';

    if (score <= 2) {
      label = 'Weak';
      color = '#dc3545';
    } else if (score <= 4) {
      label = 'Fair';
      color = '#ffc107';
    } else if (score <= 5) {
      label = 'Good';
      color = '#28a745';
    } else {
      label = 'Strong';
      color = '#20c997';
    }

    return { score, label, color, suggestions };
  };

  const strength = calculateStrength(password);
  const barWidth = `${(strength.score / 6) * 100}%`;

  if (!password) {
    return null;
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{
        height: '6px',
        background: '#e9ecef',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          height: '100%',
          width: barWidth,
          background: strength.color,
          transition: 'all 0.3s ease'
        }} />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: '600',
          color: strength.color
        }}>
          Password Strength: {strength.label}
        </span>
        <span style={{
          fontSize: '11px',
          color: '#6c757d'
        }}>
          {strength.score}/6
        </span>
      </div>

      {strength.suggestions.length > 0 && (
        <div style={{
          fontSize: '11px',
          color: '#6c757d',
          lineHeight: '1.4'
        }}>
          <strong>Suggestions:</strong>
          <ul style={{
            margin: '4px 0 0 0',
            paddingLeft: '20px'
          }}>
            {strength.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
