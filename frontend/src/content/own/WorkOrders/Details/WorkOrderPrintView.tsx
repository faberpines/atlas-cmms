import WorkOrder from '../../../../models/owns/workOrder';
import { Task } from '../../../../models/owns/tasks';
import Labor from '../../../../models/owns/labor';
import { useContext } from 'react';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import { useTranslation } from 'react-i18next';
import { durationToHours, getHoursAndMinutesAndSeconds } from '../../../../utils/formatters';
import AdditionalCost from '../../../../models/owns/additionalCost';
import PartQuantity from '../../../../models/owns/partQuantity';

interface WorkOrderPrintViewProps {
  workOrder: WorkOrder;
  tasks: Task[];
  labors: Labor[];
  additionalCosts: AdditionalCost[];
  partQuantities: PartQuantity[];
}

const FOOD_SAFETY_CHECKS = [
  'All tools have been picked up and accounted for',
  'All chemicals have been cleaned up and properly stored/put away',
  'Equipment has been left in a safe and operational readiness condition',
  'Work area is clean and free from food safety hazards'
];

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 1,
  borderBottom: '2px solid #333',
  marginTop: 18,
  marginBottom: 8,
  paddingBottom: 3
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#666',
  textTransform: 'uppercase',
  marginBottom: 1
};

const valueStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 8
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 11
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '4px 6px',
  backgroundColor: '#f5f5f5',
  fontWeight: 700
};

const tdStyle: React.CSSProperties = {
  padding: '4px 6px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top'
};

export default function WorkOrderPrintView({
  workOrder,
  tasks,
  labors,
  additionalCosts,
  partQuantities
}: WorkOrderPrintViewProps) {
  const { getFormattedDate, getUserNameById, getFormattedCurrency } =
    useContext(CompanySettingsContext);
  const { t }: { t: any } = useTranslation();

  const isComplete = workOrder.status === 'COMPLETE';

  const getLaborCost = (labor: Labor): number => {
    const [hours, minutes] = getHoursAndMinutesAndSeconds(labor.duration);
    return Number((labor.hourlyRate * (hours + minutes / 60)).toFixed(2));
  };

  const assignedLabors = labors.filter((l) => !l.logged);
  const totalLaborCost = assignedLabors.reduce(
    (acc, l) => (l.includeToTotalTime ? acc + getLaborCost(l) : acc),
    0
  );
  const totalExtraCost = additionalCosts.reduce(
    (acc, c) => (c.includeToTotalCost ? acc + c.cost : acc),
    0
  );

  const statusLabels: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETE: 'Complete'
  };

  const priorityLabels: Record<string, string> = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    NONE: 'None'
  };

  return (
    <div
      id="wo-print-view"
      style={{
        display: 'none',
        fontFamily: 'Arial, sans-serif',
        color: '#222',
        padding: '20px 30px',
        maxWidth: 780,
        margin: '0 auto'
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #333', paddingBottom: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{workOrder.title}</div>
          {workOrder.customId && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>ID: {workOrder.customId}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 11,
            backgroundColor: isComplete ? '#d4edda' : '#fff3cd',
            color: isComplete ? '#155724' : '#856404',
            border: `1px solid ${isComplete ? '#c3e6cb' : '#ffeeba'}`
          }}>
            {statusLabels[workOrder.status] ?? workOrder.status}
          </div>
          {workOrder.priority && workOrder.priority !== 'NONE' && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#666' }}>
              Priority: <strong>{priorityLabels[workOrder.priority] ?? workOrder.priority}</strong>
            </div>
          )}
          <div style={{ marginTop: 4, fontSize: 10, color: '#888' }}>
            Printed: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {workOrder.description && (
        <div style={{ marginBottom: 10 }}>
          <div style={labelStyle}>Description</div>
          <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{workOrder.description}</div>
        </div>
      )}

      {/* ── Details Grid ── */}
      <div style={sectionTitle}>Work Order Details</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px' }}>
        {workOrder.asset && (
          <div>
            <div style={labelStyle}>Asset</div>
            <div style={valueStyle}>{workOrder.asset.name}</div>
          </div>
        )}
        {workOrder.location && (
          <div>
            <div style={labelStyle}>Location</div>
            <div style={valueStyle}>{workOrder.location.name}</div>
          </div>
        )}
        {workOrder.category && (
          <div>
            <div style={labelStyle}>Category</div>
            <div style={valueStyle}>{workOrder.category.name}</div>
          </div>
        )}
        {workOrder.team && (
          <div>
            <div style={labelStyle}>Team</div>
            <div style={valueStyle}>{workOrder.team.name}</div>
          </div>
        )}
        {workOrder.primaryUser && (
          <div>
            <div style={labelStyle}>Primary Worker</div>
            <div style={valueStyle}>{getUserNameById(workOrder.primaryUser.id)}</div>
          </div>
        )}
        {workOrder.assignedTo?.length > 0 && (
          <div>
            <div style={labelStyle}>Assigned To</div>
            <div style={valueStyle}>
              {workOrder.assignedTo.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
            </div>
          </div>
        )}
        {workOrder.dueDate && (
          <div>
            <div style={labelStyle}>Due Date</div>
            <div style={valueStyle}>{getFormattedDate(workOrder.dueDate)}</div>
          </div>
        )}
        {workOrder.estimatedStartDate && (
          <div>
            <div style={labelStyle}>Est. Start Date</div>
            <div style={valueStyle}>{getFormattedDate(workOrder.estimatedStartDate)}</div>
          </div>
        )}
        {!!workOrder.estimatedDuration && (
          <div>
            <div style={labelStyle}>Est. Duration</div>
            <div style={valueStyle}>{workOrder.estimatedDuration}h</div>
          </div>
        )}
        <div>
          <div style={labelStyle}>Created</div>
          <div style={valueStyle}>{getFormattedDate(workOrder.createdAt)}</div>
        </div>
        {workOrder.createdBy && (
          <div>
            <div style={labelStyle}>Created By</div>
            <div style={valueStyle}>{getUserNameById(workOrder.createdBy)}</div>
          </div>
        )}
      </div>

      {/* ── Tasks ── */}
      {tasks.length > 0 && (
        <>
          <div style={sectionTitle}>Tasks / Checklist</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Task</th>
                <th style={{ ...thStyle, width: 100 }}>Status</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={tdStyle}>{task.taskBase.label}</td>
                  <td style={tdStyle}>{task.value !== undefined ? String(task.value) : '—'}</td>
                  <td style={tdStyle}>{task.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Labor ── */}
      {assignedLabors.length > 0 && (
        <>
          <div style={sectionTitle}>Labor</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Technician</th>
                <th style={{ ...thStyle, width: 80 }}>Time</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {assignedLabors.map((labor) => (
                <tr key={labor.id}>
                  <td style={tdStyle}>
                    {labor.assignedTo ? `${labor.assignedTo.firstName} ${labor.assignedTo.lastName}` : '—'}
                  </td>
                  <td style={tdStyle}>{durationToHours(labor.duration)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{getFormattedCurrency(getLaborCost(labor))}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 700 }} colSpan={2}>Total</td>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{getFormattedCurrency(totalLaborCost)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* ── Parts ── */}
      {partQuantities.length > 0 && (
        <>
          <div style={sectionTitle}>Parts Used</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Part</th>
                <th style={{ ...thStyle, width: 80, textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {partQuantities.map((pq) => (
                <tr key={pq.id}>
                  <td style={tdStyle}>{pq.part?.name ?? '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{pq.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Additional Costs ── */}
      {additionalCosts.length > 0 && (
        <>
          <div style={sectionTitle}>Additional Costs</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {additionalCosts.map((c) => (
                <tr key={c.id}>
                  <td style={tdStyle}>{c.description}</td>
                  <td style={tdStyle}>{getFormattedDate(c.createdAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{getFormattedCurrency(c.cost)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...tdStyle, fontWeight: 700 }} colSpan={2}>Total</td>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{getFormattedCurrency(totalExtraCost)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* ── Food Safety Sign-Off ── */}
      <div style={sectionTitle}>Food Safety Sign-Off</div>
      <div style={{
        border: isComplete ? '1px solid #c3e6cb' : '1px solid #ffeeba',
        borderRadius: 4,
        padding: '10px 14px',
        backgroundColor: isComplete ? '#f0fff4' : '#fffbf0'
      }}>
        {FOOD_SAFETY_CHECKS.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
            <div style={{
              width: 16,
              height: 16,
              border: '2px solid ' + (isComplete ? '#28a745' : '#999'),
              borderRadius: 3,
              flexShrink: 0,
              marginTop: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isComplete ? '#28a745' : 'white'
            }}>
              {isComplete && (
                <span style={{ color: 'white', fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>
              )}
            </div>
            <span style={{ fontSize: 12 }}>{item}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 11, color: isComplete ? '#155724' : '#856404', fontStyle: 'italic' }}>
          {isComplete
            ? `All food safety items confirmed upon completion on ${getFormattedDate(workOrder.completedOn)}.`
            : 'Food safety sign-off required before closing this work order.'}
        </div>
      </div>

      {/* ── Completion Info ── */}
      {isComplete && (
        <>
          <div style={sectionTitle}>Completion Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px' }}>
            {workOrder.completedBy && (
              <div>
                <div style={labelStyle}>Completed By</div>
                <div style={valueStyle}>{`${workOrder.completedBy.firstName} ${workOrder.completedBy.lastName}`}</div>
              </div>
            )}
            {workOrder.completedOn && (
              <div>
                <div style={labelStyle}>Completed On</div>
                <div style={valueStyle}>{getFormattedDate(workOrder.completedOn)}</div>
              </div>
            )}
            {workOrder.feedback && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={labelStyle}>Feedback</div>
                <div style={{ fontSize: 12 }}>{workOrder.feedback}</div>
              </div>
            )}
          </div>
          {workOrder.signature && (
            <div style={{ marginTop: 10 }}>
              <div style={labelStyle}>Signature</div>
              <img src={workOrder.signature} style={{ height: 80, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
