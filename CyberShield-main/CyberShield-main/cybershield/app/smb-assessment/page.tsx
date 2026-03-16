'use client';

import { useState } from 'react';

const INDUSTRIES = [
  "Technology & Software Development",
  "Healthcare & Medical",
  "Finance & Banking",
  "Retail & E-commerce",
  "Manufacturing",
  "Education",
  "Professional Services",
  "Hospitality & Tourism",
  "Real Estate",
  "Legal Services",
  "Other"
];

const EMPLOYEE_COUNTS = [
  "1-10",
  "10-20",
  "21-50",
  "51-100",
  "101-250",
  "251-500",
  "500+"
];

const SECURITY_PRIORITIES = [
  "Data Protection & Privacy",
  "Employee Training & Awareness",
  "Network Security",
  "Compliance & Regulations",
  "Incident Response",
  "Access Control",
  "Cloud Security",
  "Ransomware Protection"
];

// CSV Parsing and Validation Functions
const parseCSV = (content: string) => {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV file must contain headers and at least one row');
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
  
  return { headers, rows };
};

const validateEmployeeCSV = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('Employee CSV must contain at least one employee');
    return { valid: false, errors };
  }
  
  data.forEach((row, index) => {
    if (!row.email && !row.Email) {
      errors.push(`Row ${index + 2}: Missing email column`);
    } else {
      const email = row.email || row.Email;
      if (!email.includes('@')) {
        errors.push(`Row ${index + 2}: Invalid email format - ${email}`);
      }
    }
    
    if (!row.name && !row.Name) {
      errors.push(`Row ${index + 2}: Missing name column`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

const validateAssetCSV = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('Asset CSV must contain at least one asset');
    return { valid: false, errors };
  }
  
  data.forEach((row, index) => {
    if (!row.url && !row.URL) {
      errors.push(`Row ${index + 2}: Missing URL column`);
    } else {
      const url = row.url || row.URL;
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        errors.push(`Row ${index + 2}: Invalid URL format - ${url}`);
      }
    }
    
    if (!row.asset_type && !row.type && !row.Type) {
      errors.push(`Row ${index + 2}: Missing asset_type column`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

const normalizeEmployee = (row: any) => ({
  name: row.name || row.Name || 'N/A',
  email: row.email || row.Email || '',
  role: row.role || row.Role || 'Employee'
});

const normalizeAsset = (row: any) => ({
  url: row.url || row.URL || '',
  asset_type: row.asset_type || row.type || row.Type || 'Website'
});

export default function SMBAssessment() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    company_url: '',
    industry: '',
    employee_count: '',
    contact_name: '',
    contact_email: '',
    security_priorities: [] as string[],
  });
  const [files, setFiles] = useState({
    employees: null as File | null,
    assets: null as File | null,
  });
  const [result, setResult] = useState<any>(null);
  const [csvData, setCSVData] = useState({
    employees: null as any[] | null,
    assets: null as any[] | null,
  });
  const [validationErrors, setValidationErrors] = useState({
    employees: [] as string[],
    assets: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityToggle = (priority: string) => {
    setFormData(prev => ({
      ...prev,
      security_priorities: prev.security_priorities.includes(priority)
        ? prev.security_priorities.filter(p => p !== priority)
        : [...prev.security_priorities, priority]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'employees' | 'assets') => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const file = e.currentTarget.files[0];
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Read and parse CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const { rows } = parseCSV(content);
          
          let validation;
          let normalizedData;
          
          if (fileType === 'employees') {
            validation = validateEmployeeCSV(rows);
            normalizedData = rows.map(normalizeEmployee);
          } else {
            validation = validateAssetCSV(rows);
            normalizedData = rows.map(normalizeAsset);
          }
          
          if (!validation.valid) {
            setValidationErrors(prev => ({
              ...prev,
              [fileType]: validation.errors
            }));
            setCSVData(prev => ({
              ...prev,
              [fileType]: null
            }));
          } else {
            setValidationErrors(prev => ({
              ...prev,
              [fileType]: []
            }));
            setCSVData(prev => ({
              ...prev,
              [fileType]: normalizedData
            }));
          }
        } catch (error) {
          setValidationErrors(prev => ({
            ...prev,
            [fileType]: [error instanceof Error ? error.message : 'Failed to parse CSV']
          }));
          setCSVData(prev => ({
            ...prev,
            [fileType]: null
          }));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const employees = csvData.employees ?? [];
      const assets = csvData.assets ?? [];

      if (employees.length === 0 && assets.length === 0) {
        throw new Error('Please upload at least one employee CSV or one asset CSV before submitting.');
      }

      const requestData = {
        company_name: formData.company_name,
        industry: formData.industry,
        employee_count: formData.employee_count,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        security_priorities: formData.security_priorities,
        employees_data: employees,
        assets_data: assets
      };

      const response = await fetch(`${backendUrl}/smb/report/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error while generating report');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    padding: '0.875rem 1rem',
    fontSize: '0.95rem',
    border: '1px solid #8994a9',
    borderRadius: '6px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    outline: 'none' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const inputFocusStyle = {
    borderColor: '#07d2f8',
    boxShadow: '0 0 0 2px rgba(7, 210, 248, 0.1)',
  };

  const labelStyles = {
    display: 'block',
    color: '#fff',
    marginBottom: '0.5rem',
    fontWeight: '500' as const,
    fontSize: '0.95rem',
  };

  const containerStyles = {
    marginBottom: '1.5rem',
  };

  if (result) {
    return (
      <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Success Message */}
          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '2px solid #4caf50',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#4caf50', marginTop: 0, marginBottom: '1rem' }}>✅ Report Generated Successfully!</h2>
            <p style={{ color: '#8994a9', marginBottom: '1.5rem' }}>
              Your SMB security assessment report has been created and is ready for download.
            </p>
          </div>

          {/* Report Summary */}
          <div style={{
            backgroundColor: 'rgba(6, 6, 8, 0.6)',
            border: '1px solid #8994a9',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#07d2f8', marginTop: 0 }}>Report Summary for {result.summary.company_name}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{
                backgroundColor: 'rgba(7, 210, 248, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #07d2f8'
              }}>
                <p style={{ color: '#8994a9', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Employees Scanned</p>
                <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{result.summary.total_employees}</p>
              </div>

              <div style={{
                backgroundColor: 'rgba(7, 210, 248, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #07d2f8'
              }}>
                <p style={{ color: '#8994a9', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Assets Scanned</p>
                <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{result.summary.total_assets}</p>
              </div>

              <div style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #f44336'
              }}>
                <p style={{ color: '#8994a9', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Breached Emails Found</p>
                <p style={{ color: '#f44336', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{result.summary.breached_emails}</p>
              </div>

              <div style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #f44336'
              }}>
                <p style={{ color: '#8994a9', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Insecure Assets</p>
                <p style={{ color: '#f44336', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{result.summary.insecure_assets}</p>
              </div>
            </div>

            <p style={{ color: '#8994a9', fontSize: '0.9rem', margin: 0 }}>
              Report ID: <span style={{ color: '#07d2f8', fontWeight: 'bold' }}>{result.report_id}</span> | 
              Generated: {result.summary.timestamp}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                setResult(null);
                setStep(1);
                setFormData({
                  company_name: '',
                  company_url: '',
                  industry: '',
                  employee_count: '',
                  contact_name: '',
                  contact_email: '',
                  security_priorities: [],
                });
                setFiles({ employees: null, assets: null });
              }}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#07d2f8',
                color: '#060608',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00b8d4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#07d2f8'}
            >
              Create Another Assessment
            </button>
            <button
              onClick={() => {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                if (result.report_id && backendUrl) {
                  window.open(`${backendUrl}/smb/download/${result.report_id}`, '_blank');
                }
              }}
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: 'transparent',
                color: '#07d2f8',
                border: '2px solid #07d2f8',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(7, 210, 248, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            SMB Security Assessment
          </h1>
          <p style={{
            color: '#8994a9',
            fontSize: '1.1rem',
            marginBottom: '2rem'
          }}>
            Get a comprehensive security analysis for your organization
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #f44336',
              color: '#f44336',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              maxWidth: '600px',
              margin: '0 auto 1.5rem',
              fontSize: '0.95rem'
            }}>
              {error}
            </div>
          )}

          {/* Progress Indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  backgroundColor: s <= step ? '#07d2f8' : '#1a1a1a',
                  color: s <= step ? '#060608' : '#8994a9',
                  border: `2px solid ${s <= step ? '#07d2f8' : '#8994a9'}`,
                  transition: 'all 0.3s'
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Company Information */}
          {step === 1 && (
            <div style={{
              backgroundColor: 'rgba(6, 6, 8, 0.6)',
              border: '1px solid #8994a9',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#07d2f8', marginTop: 0 }}>Company Information</h2>

              <div style={containerStyles}>
                <label style={labelStyles}>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  required
                  style={inputStyles}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={containerStyles}>
                <label style={labelStyles}>Company URL *</label>
                <input
                  type="url"
                  name="company_url"
                  value={formData.company_url}
                  onChange={handleInputChange}
                  placeholder="https://www.yourcompany.com"
                  required
                  style={inputStyles}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={containerStyles}>
                <label style={labelStyles}>Industry *</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  style={{...inputStyles, cursor: 'pointer'}}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select an industry...</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div style={containerStyles}>
                <label style={labelStyles}>Number of Employees *</label>
                <select
                  name="employee_count"
                  value={formData.employee_count}
                  onChange={handleInputChange}
                  required
                  style={{...inputStyles, cursor: 'pointer'}}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select employee count...</option>
                  {EMPLOYEE_COUNTS.map(count => (
                    <option key={count} value={count} style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.company_name || !formData.company_url || !formData.industry || !formData.employee_count}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: (!formData.company_name || !formData.company_url || !formData.industry || !formData.employee_count) ? '#666' : '#07d2f8',
                    color: '#060608',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (!formData.company_name || !formData.company_url || !formData.industry || !formData.employee_count) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!formData.company_name || !formData.company_url || !formData.industry || !formData.employee_count)) {
                      e.currentTarget.style.backgroundColor = '#00b8d4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!formData.company_name || !formData.company_url || !formData.industry || !formData.employee_count)) {
                      e.currentTarget.style.backgroundColor = '#07d2f8';
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Priorities */}
          {step === 2 && (
            <div style={{
              backgroundColor: 'rgba(6, 6, 8, 0.6)',
              border: '1px solid #8994a9',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#07d2f8', marginTop: 0 }}>Contact & Security Priorities</h2>

              <div style={containerStyles}>
                <label style={labelStyles}>Contact Name *</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  placeholder="Full name of primary contact"
                  required
                  style={inputStyles}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={containerStyles}>
                <label style={labelStyles}>Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="company@example.com"
                  required
                  style={inputStyles}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#8994a9';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyles}>Security Priorities * (Select at least 2)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {SECURITY_PRIORITIES.map(priority => (
                    <label
                      key={priority}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: formData.security_priorities.includes(priority) ? 'rgba(7, 210, 248, 0.2)' : '#1a1a1a',
                        border: `1px solid ${formData.security_priorities.includes(priority) ? '#07d2f8' : '#8994a9'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!formData.security_priorities.includes(priority)) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#07d2f8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!formData.security_priorities.includes(priority)) {
                          (e.currentTarget as HTMLElement).style.borderColor = '#8994a9';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.security_priorities.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                        style={{ marginRight: '0.75rem', cursor: 'pointer', accentColor: '#07d2f8' }}
                      />
                      <span style={{ color: '#fff', fontSize: '0.9rem' }}>{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    color: '#07d2f8',
                    border: '2px solid #07d2f8',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(7, 210, 248, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.contact_name || !formData.contact_email || formData.security_priorities.length < 2}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: (!formData.contact_name || !formData.contact_email || formData.security_priorities.length < 2) ? '#666' : '#07d2f8',
                    color: '#060608',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (!formData.contact_name || !formData.contact_email || formData.security_priorities.length < 2) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!formData.contact_name || !formData.contact_email || formData.security_priorities.length < 2)) {
                      e.currentTarget.style.backgroundColor = '#00b8d4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!formData.contact_name || !formData.contact_email || formData.security_priorities.length < 2)) {
                      e.currentTarget.style.backgroundColor = '#07d2f8';
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: File Upload */}
          {step === 3 && (
            <div style={{
              backgroundColor: 'rgba(6, 6, 8, 0.6)',
              border: '1px solid #8994a9',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h2 style={{ color: '#07d2f8', marginTop: 0 }}>Upload Security Data</h2>
              <p style={{ color: '#8994a9', fontSize: '0.95rem', marginBottom: '2rem' }}>
                Upload at least one CSV (employees or assets) so we can run the assessment.
              </p>

              <div style={containerStyles}>
                <label style={labelStyles}>Employee List (CSV)</label>
                <p style={{ color: '#8994a9', fontSize: '0.85rem', marginBottom: '0.75rem', margin: 0 }}>
                  Columns: name, email, role
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'employees')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#1a1a1a',
                    border: `1px dashed ${validationErrors.employees.length > 0 ? '#f44336' : '#8994a9'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box' as const,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#07d2f8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = validationErrors.employees.length > 0 ? '#f44336' : '#8994a9'}
                />
                {validationErrors.employees.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    {validationErrors.employees.map((error, idx) => (
                      <p key={idx} style={{ color: '#f44336', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        ❌ {error}
                      </p>
                    ))}
                  </div>
                )}
                {files.employees && csvData.employees && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={{ color: '#4caf50', marginTop: 0, fontSize: '0.9rem' }}>
                      ✓ {files.employees.name} - {csvData.employees.length} employees
                    </p>
                  </div>
                )}
              </div>

              <div style={containerStyles}>
                <label style={labelStyles}>Asset List (CSV)</label>
                <p style={{ color: '#8994a9', fontSize: '0.85rem', marginBottom: '0.75rem', margin: 0 }}>
                  Columns: url, asset_type
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'assets')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#1a1a1a',
                    border: `1px dashed ${validationErrors.assets.length > 0 ? '#f44336' : '#8994a9'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box' as const,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#07d2f8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = validationErrors.assets.length > 0 ? '#f44336' : '#8994a9'}
                />
                {validationErrors.assets.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    {validationErrors.assets.map((error, idx) => (
                      <p key={idx} style={{ color: '#f44336', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        ❌ {error}
                      </p>
                    ))}
                  </div>
                )}
                {files.assets && csvData.assets && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={{ color: '#4caf50', marginTop: 0, fontSize: '0.9rem' }}>
                      ✓ {files.assets.name} - {csvData.assets.length} assets
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    color: '#07d2f8',
                    border: '1px solid #07d2f8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(7, 210, 248, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    backgroundColor: loading ? '#666' : '#07d2f8',
                    color: '#060608',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#00b8d4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = loading ? '#666' : '#07d2f8';
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
