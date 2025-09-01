import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#162F1B',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px'
          }}>
            B
          </div>
          <span>Briconomy</span>
        </div>
        <Link 
          to="/" 
          style={{
            background: '#FF894D',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          Logout
        </Link>
      </div>
      
      <div style={{
        padding: '16px',
        paddingBottom: '80px'
      }}>
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '4px'
          }}>
            Admin Dashboard
          </div>
          <div style={{
            color: '#6c757d',
            fontSize: '14px'
          }}>
            System overview and management
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderLeft: '3px solid #162F1B'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              156
            </div>
            <div style={{
              color: '#6c757d',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Users
            </div>
          </div>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderLeft: '3px solid #FF894D'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              24
            </div>
            <div style={{
              color: '#6c757d',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Properties
            </div>
          </div>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderLeft: '3px solid #162F1B'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              99.9%
            </div>
            <div style={{
              color: '#6c757d',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Uptime
            </div>
          </div>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            borderLeft: '3px solid #FF894D'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              245ms
            </div>
            <div style={{
              color: '#6c757d',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Response
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '16px',
            color: '#2c3e50',
            marginBottom: '12px'
          }}>
            System Performance
          </h3>
          <div style={{
            height: '180px',
            background: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontSize: '12px',
            textAlign: 'center',
            padding: '10px'
          }}>
            Chart.js Performance Analytics
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <Link 
            to="#" 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: '#162F1B',
              borderRadius: '10px',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              U
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              Users
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              lineHeight: '1.3'
            }}>
              Manage system users
            </div>
          </Link>
          
          <Link 
            to="#" 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: '#FF894D',
              borderRadius: '10px',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              S
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              Security
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              lineHeight: '1.3'
            }}>
              System security
            </div>
          </Link>
          
          <Link 
            to="#" 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: '#162F1B',
              borderRadius: '10px',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              O
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              Operations
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              lineHeight: '1.3'
            }}>
              Performance & health
            </div>
          </Link>
          
          <Link 
            to="#" 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: '#FF894D',
              borderRadius: '10px',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              R
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '4px'
            }}>
              Reports
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              lineHeight: '1.3'
            }}>
              Analytics & insights
            </div>
          </Link>
        </div>
      </div>
      
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '390px',
        background: '#ffffff',
        borderTop: '1px solid #e9ecef',
        padding: '12px 0',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <Link 
          to="/admin" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            color: '#162F1B',
            background: 'rgba(22, 47, 27, 0.1)',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'currentColor',
            borderRadius: '4px',
            marginBottom: '4px',
            opacity: '0.7'
          }}></div>
          <div style={{
            fontSize: '10px',
            fontWeight: '500'
          }}>
            Dashboard
          </div>
        </Link>
        
        <Link 
          to="#" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            color: '#6c757d',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'currentColor',
            borderRadius: '4px',
            marginBottom: '4px',
            opacity: '0.7'
          }}></div>
          <div style={{
            fontSize: '10px',
            fontWeight: '500'
          }}>
            Users
          </div>
        </Link>
        
        <Link 
          to="#" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            color: '#6c757d',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'currentColor',
            borderRadius: '4px',
            marginBottom: '4px',
            opacity: '0.7'
          }}></div>
          <div style={{
            fontSize: '10px',
            fontWeight: '500'
          }}>
            Security
          </div>
        </Link>
        
        <Link 
          to="#" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            color: '#6c757d',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'currentColor',
            borderRadius: '4px',
            marginBottom: '4px',
            opacity: '0.7'
          }}></div>
          <div style={{
            fontSize: '10px',
            fontWeight: '500'
          }}>
            Reports
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;