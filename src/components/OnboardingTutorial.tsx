import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  target?: string;
}

const OnboardingTutorial = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem(`briconomy_tutorial_${user?.id}`);
    if (!hasSeenTutorial && user) {
      setShowTutorial(true);
    }
  }, [user]);

  const getTutorialSteps = (): TutorialStep[] => {
    const userType = user?.userType || 'tenant';

    const tutorialsByRole: Record<string, TutorialStep[]> = {
      admin: [
        {
          title: 'Welcome to Briconomy Admin',
          description: 'Manage your entire property management system from this dashboard.',
          icon: '👋'
        },
        {
          title: 'User Management',
          description: 'Create and manage users (managers, caretakers, tenants) from the Users page.',
          icon: '👥'
        },
        {
          title: 'System Security',
          description: 'Monitor security alerts and configure system settings from the Security page.',
          icon: '🔒'
        },
        {
          title: 'Reports & Analytics',
          description: 'Generate system-wide reports and view performance metrics.',
          icon: '📊'
        },
        {
          title: 'Announcements',
          description: 'Send announcements to all users or specific user groups.',
          icon: '📢'
        }
      ],
      manager: [
        {
          title: 'Welcome to Briconomy Manager',
          description: 'Manage your properties, leases, and tenants efficiently.',
          icon: '👋'
        },
        {
          title: 'Properties Management',
          description: 'View and manage your assigned properties from the Properties page.',
          icon: '🏢'
        },
        {
          title: 'Lease Management',
          description: 'Create, renew, and terminate leases from the Leases page.',
          icon: '📄'
        },
        {
          title: 'Payment Tracking',
          description: 'Monitor tenant payments and generate invoices from the Payments page.',
          icon: '💰'
        },
        {
          title: 'Maintenance Oversight',
          description: 'Assign maintenance tasks to caretakers and track completion.',
          icon: '🔧'
        }
      ],
      caretaker: [
        {
          title: 'Welcome to Briconomy Caretaker',
          description: 'Manage your maintenance tasks and schedules efficiently.',
          icon: '👋'
        },
        {
          title: 'Your Tasks',
          description: 'View your assigned tasks on the Tasks page and update their status.',
          icon: '📋'
        },
        {
          title: 'Maintenance Requests',
          description: 'See maintenance requests from tenants and update progress.',
          icon: '🔧'
        },
        {
          title: 'Schedule',
          description: 'View your work schedule and upcoming appointments.',
          icon: '📅'
        },
        {
          title: 'Work History',
          description: 'Track your completed tasks and performance metrics.',
          icon: '📈'
        }
      ],
      tenant: [
        {
          title: 'Welcome to Briconomy',
          description: 'Your one-stop platform for managing your rental experience.',
          icon: '👋'
        },
        {
          title: 'Payments',
          description: 'View your rent payments, due dates, and payment history.',
          icon: '💳'
        },
        {
          title: 'Maintenance Requests',
          description: 'Submit maintenance issues with photos and track their status.',
          icon: '🔧'
        },
        {
          title: 'Lease Information',
          description: 'View your lease details and renewal options.',
          icon: '📄'
        },
        {
          title: 'AI Assistant',
          description: 'Use the chatbot for quick answers about rent, maintenance, and more.',
          icon: '🤖'
        },
        {
          title: 'Profile & Settings',
          description: 'Update your profile, manage payment methods, and view documents.',
          icon: '⚙️'
        }
      ]
    };

    return tutorialsByRole[userType] || tutorialsByRole.tenant;
  };

  const steps = getTutorialSteps();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem(`briconomy_tutorial_${user?.id}`, 'true');
    setShowTutorial(false);
  };

  if (!showTutorial || !user) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Progress bar */}
        <div style={{
          height: '4px',
          background: '#e9ecef',
          borderRadius: '2px',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#162F1B',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step indicator */}
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#6c757d',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Step {currentStep + 1} of {steps.length}
        </div>

        {/* Icon */}
        <div style={{
          fontSize: '72px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {steps[currentStep].icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          {steps[currentStep].title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#6c757d',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          {steps[currentStep].description}
        </p>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              padding: '12px 24px',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              background: '#fff',
              color: '#495057',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            Skip Tour
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '12px 32px',
              border: 'none',
              borderRadius: '8px',
              background: '#162F1B',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0f1f12';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#162F1B';
            }}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>

        {/* Step dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep ? '#162F1B' : '#dee2e6',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingTutorial;
