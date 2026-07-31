import React from 'react';
import { TeacherPrintResponse } from '../../types/api/timetable';
import { dayLabel } from '../../lib/timetable-days';

interface TeacherTimeTablePDFTemplateProps {
  data: TeacherPrintResponse;
  campusName?: string;
}

export const TeacherTimeTablePDFTemplate: React.FC<TeacherTimeTablePDFTemplateProps> = ({ data, campusName = 'RILLS' }) => {
  const periodNumbers = Array.from(
    new Set<number>(data.days.flatMap((d) => d.periods.map((p) => p.period_number)))
  ).sort((a, b) => a - b);

  const timeLabelForPeriod = (periodNumber: number): string =>
    data.days.flatMap((d) => d.periods).find((p) => p.period_number === periodNumber)?.time_label || '';

  return (
    <div style={{ boxSizing: 'border-box', padding: '32px', backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'sans-serif', width: '1040px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #15803d', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#15803d', margin: '0 0 4px 0', letterSpacing: '-0.03em' }}>{campusName}</h1>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Teacher Time Table
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 2px 0' }}>{data.teacher.name}</p>
        </div>
      </div>

      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
            <th style={{ width: '90px', padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day</th>
            {periodNumbers.map((p) => (
              <th key={p} style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                <div>P{p}</div>
                <div style={{ fontSize: '9px', fontWeight: 500, opacity: 0.8 }}>{timeLabelForPeriod(p)}</div>
              </th>
            ))}
            <th style={{ width: '60px', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>Free</th>
          </tr>
        </thead>
        <tbody>
          {data.days.map((day, idx) => (
            <tr key={day.day_of_week} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
              <td style={{ padding: '10px 12px', fontWeight: 900, borderBottom: '1px solid #f1f5f9' }}>{dayLabel(day.day_of_week)}</td>
              {periodNumbers.map((p) => {
                const period = day.periods.find((dp) => dp.period_number === p);
                return (
                  <td key={p} style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', overflow: 'hidden', wordBreak: 'break-word' }}>
                    {period?.subject_label ? (
                      <>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{period.subject_label}</div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{period.level_section_label}</div>
                      </>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>-</span>
                    )}
                  </td>
                );
              })}
              <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', fontWeight: 900, color: '#15803d' }}>
                {day.free_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '180px', height: '2px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Prepared By</p>
        </div>
      </div>
    </div>
  );
};
