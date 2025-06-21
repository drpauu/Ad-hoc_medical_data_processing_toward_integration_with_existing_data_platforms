import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import '../styles/checkbox-list.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '8px',
        verticalAlign: 'middle'
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div
        style={{
          borderRadius: '50%',
          border: '1px solid #555',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#555',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        ℹ
      </div>
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            whiteSpace: 'normal',
            zIndex: 1000,
            width: '200px',
            fontSize: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

const tooltipLabel = (ctx) => {
  let label = ctx.dataset.label || '';
  if (label) label += ': ';
  const val = typeof ctx.parsed === 'object' ? ctx.parsed.y : ctx.parsed;
  label += Math.round(val * 100) / 100;
  return label;
};

const TestDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentRef = useRef(null);
  const grafic_checkpoints = useRef(null);
  const grafic_data = useRef(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTables, setSelectedTables] = useState({
    checkpoint_data: true,
    test_data: true,
    test: true,
    antropometric: true,
    comments: true,
    basal: true,
    final: true,
    rest: true,
    computed1: true,
    average: true,
    periodic: true,
    checkpoints: true
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/tests/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setTest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching test details:', err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  const handleEditAnthro = async (field) => {
    if (!test) return;
    const baseTestData = test.test || {};
    const currentValue = baseTestData[field];
    const labelMap = {
      name: t('tableHeaders.antropometric.name'),
      gender: t('tableHeaders.antropometric.gender'),
      age: t('tableHeaders.antropometric.age'),
      weight: t('tableHeaders.antropometric.weight'),
      height: t('tableHeaders.antropometric.height')
    };
    const campoLabel = labelMap[field] || field;
    let parsedValue;
    if (field === 'gender') {
      const isHome = window.confirm(
        t('prompts.selectGender') || 'És Home? (Cancel = Dona)'
      );
      parsedValue = isHome ? 'Home' : 'Dona';
    } else {
      const inputDefault = currentValue != null ? String(currentValue) : '';
      const newValue = window.prompt(`${campoLabel}:`, inputDefault);
      if (newValue === null) return;
      if (String(newValue).trim() === String(currentValue).trim()) return;
      if (!window.confirm(t('confirmations.modifyField', { field: campoLabel }))) {
        return;
      }
      if (field === 'name') {
        parsedValue = newValue.trim();
      } else {
        const numero = Number(newValue);
        if (isNaN(numero)) {
          alert(t('errors.invalidNumber'));
          return;
        }
        parsedValue = numero;
      }
    }
    try {
      const updatedTestData = {
        ...baseTestData,
        [field]: parsedValue
      };
      const fullPayload = {
        ...test,
        test: updatedTestData
      };
      const response = await fetch(
        `http://localhost:5000/api/tests/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullPayload)
        }
      );
      if (response.status === 404) {
        throw new Error('Ruta no encontrada (404). Verifica que tu backend exponga PUT /api/tests/:id');
      }
      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.message) errMsg += `: ${errData.message}`;
        } catch {}
        throw new Error(errMsg);
      }
      setTest(fullPayload);
    } catch (err) {
      console.error('Error updating field:', err);
      alert(`${t('errors.updateFailed')}\n${err.message}`);
    }
  };

  const handleDownloadPdf = async () => {
    const doc = new jsPDF({ format: 'a4', unit: 'pt' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    let cursorY = margin;

    if (selectedTables.checkpoint_data) {
      const canvas1 = await html2canvas(grafic_checkpoints.current, { backgroundColor: null, scale: 2 });
      const img1 = canvas1.toDataURL('image/png');
      const props1 = doc.getImageProperties(img1);
      const h1 = (props1.height * usableWidth) / props1.width;
      doc.addImage(img1, 'PNG', margin, cursorY, usableWidth, h1);
      cursorY += h1 + 10;
    }

    if (selectedTables.test_data) {
      const canvas2 = await html2canvas(grafic_data.current, { backgroundColor: null, scale: 2 });
      const img2 = canvas2.toDataURL('image/png');
      const props2 = doc.getImageProperties(img2);
      const h2 = (props2.height * usableWidth) / props2.width;
      if (cursorY + h2 > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.addImage(img2, 'PNG', margin, cursorY, usableWidth, h2);
      cursorY += h2 + 10;
    }

    const tables = [
      { key: 'test', id: 'test-table' },
      { key: 'antropometric', id: 'antropometric-table' },
      { key: 'comments', id: 'comments-table' },
      { key: 'basal', id: 'basal-table' },
      { key: 'final', id: 'final-table' },
      { key: 'rest', id: 'rest-table' },
      { key: 'computed1', id: 'computed1-table' },
      { key: 'average', id: 'average-table' },
      { key: 'periodic', id: 'periodic-table' },
      { key: 'checkpoints', id: 'checkpoints-table' }
    ];

    for (const { key, id } of tables) {
      if (!selectedTables[key]) continue;
      const container = document.getElementById(id);
      const tableTag = container?.querySelector('table') || null;

      if (key === 'basal') {
        const approxHeight = 100;
        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          head: [
            [
              {
                content: t('tableTitles.basalValues'),
                colSpan: 6,
                styles: {
                  fillColor: [0, 64, 124],
                  textColor: 255,
                  fontStyle: 'bold',
                  halign: 'center',
                  fontSize: 10
                }
              }
            ],
            [
              t('tableHeaders.basal.saturation'),
              t('tableHeaders.basal.heartRate'),
              t('tableHeaders.basal.hrPercentage'),
              t('tableHeaders.basal.dyspnea'),
              t('tableHeaders.basal.fatigue'),
              t('tableHeaders.basal.o2')
            ]
          ],
          body: [
            [
              test.initial.spo != null ? `${test.initial.spo} ${t('units.percent')}` : t('defaults.noData'),
              test.initial.hr != null ? `${test.initial.hr} ${t('units.ppm')}` : t('defaults.noData'),
              (test.initial.hr != null && test.test.age != null)
                ? `${((test.initial.hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`
                : t('defaults.noData'),
              test.initial.d != null ? `${test.initial.d} ${t('units.borg')}` : t('defaults.noData'),
              test.initial.f != null ? `${test.initial.f} ${t('units.borg')}` : t('defaults.noData'),
              test.test.o2 != null ? `${test.test.o2} ${t('units.liters')}` : t('defaults.noData')
            ]
          ],
          didParseCell: (data) => {
            if (data.cell.section === 'head') {
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [0, 64, 124];
                data.cell.styles.textColor = 255;
              } else {
                data.cell.styles.fillColor = [131, 195, 194];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;
        continue;
      }

      if (key === 'rest') {
        const approxHeight = 100;
        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        const halfRestHrPercent = (test.final.half_rest_hr != null && test.test.age != null)
          ? `${((test.final.half_rest_hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`
          : t('defaults.noData');
        const endRestHrPercent = (test.final.end_rest_hr != null && test.test.age != null)
          ? `${((test.final.end_rest_hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`
          : t('defaults.noData');
        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          head: [
            [
              {
                content: t('tableTitles.restValues'),
                colSpan: 6,
                styles: {
                  fillColor: [0, 64, 124],
                  textColor: 255,
                  fontStyle: 'bold',
                  halign: 'center',
                  fontSize: 10
                }
              }
            ],
            [
              t('tableHeaders.rest.halfRestSpo'),
              t('tableHeaders.rest.halfRestHr'),
              t('tableHeaders.rest.halfRestHrPercentage'),
              t('tableHeaders.rest.restEndSpo'),
              t('tableHeaders.rest.restEndHr'),
              t('tableHeaders.rest.restEndHrPercentage')
            ]
          ],
          body: [
            [
              test.final.half_rest_spo != null ? `${test.final.half_rest_spo} ${t('units.percent')}` : t('defaults.noData'),
              test.final.half_rest_hr != null ? `${test.final.half_rest_hr} ${t('units.ppm')}` : t('defaults.noData'),
              halfRestHrPercent,
              test.final.end_rest_spo != null ? `${test.final.end_rest_spo} ${t('units.percent')}` : t('defaults.noData'),
              test.final.end_rest_hr != null ? `${test.final.end_rest_hr} ${t('units.ppm')}` : t('defaults.noData'),
              endRestHrPercent
            ]
          ],
          didParseCell: (data) => {
            if (data.cell.section === 'head') {
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [0, 64, 124];
                data.cell.styles.textColor = 255;
              } else {
                data.cell.styles.fillColor = [131, 195, 194];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;
        continue;
      }

      if (key === 'computed1') {
        const approxHeight = 120;
        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }

        const weight = test.test.weight ?? 0;
        const height = test.test.height ?? 0;
        const age = test.test.age ?? 0;
        const actualDistance = test.final.meters ?? 0;
        const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
        let enrightPercent = 0;
        if (enrightD > 0) enrightPercent = (actualDistance / enrightD) * 100;
        const sixMWWork = actualDistance * weight;
        const data6MW = (test.data || []).filter(d => d.p === 1);
        let lowestSpo2 = 999;
        data6MW.forEach(d => {
          if (typeof d.s === 'number' && d.s < lowestSpo2) lowestSpo2 = d.s;
        });
        const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;
        let maxTestHr = 0;
        data6MW.forEach(d => {
          if (typeof d.h === 'number' && d.h > maxTestHr) maxTestHr = d.h;
        });
        let maxTestHrPercent = 0;
        if (age < 220 && maxTestHr > 0) maxTestHrPercent = (maxTestHr / (220 - age)) * 100;

        const row1 = [
          enrightD ? `${enrightD.toFixed(1)} ${t('units.mts')}` : t('defaults.noData'),
          enrightPercent ? `${enrightPercent.toFixed(1)} ${t('units.percent')}` : t('defaults.noData'),
          sixMWWork ? `${sixMWWork} ${t('units.mts')}*kg` : t('defaults.noData'),
          dsp ? `${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})` : t('defaults.noData'),
          maxTestHr ? `${maxTestHr} ${t('units.ppm')}` : t('defaults.noData'),
          maxTestHrPercent ? `${maxTestHrPercent.toFixed(1)} ${t('units.percent')}` : t('defaults.noData')
        ];

        const stopsArray = test.stops || [];
        const stopsText = stopsArray.map(stop => `${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`).join('\n');
        const stopsTimeSum = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

        let sumSpo2 = 0, countSpo2 = 0;
        data6MW.forEach(d => { if (typeof d.s === 'number') { sumSpo2 += d.s; countSpo2++; } });
        const avgSpo2 = countSpo2 ? sumSpo2 / countSpo2 : null;

        let sumHr = 0, countHr = 0;
        data6MW.forEach(d => { if (typeof d.h === 'number') { sumHr += d.h; countHr++; } });
        const avgHr = countHr ? sumHr / countHr : null;

        let minSpo2 = null;
        data6MW.forEach(d => { if (typeof d.s === 'number') { if (minSpo2 == null || d.s < minSpo2) minSpo2 = d.s; } });
        const finalMeters = test.final.meters ?? 0;
        const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;

        const row2 = [
          stopsText || t('defaults.noData'),
          stopsTimeSum ? `${stopsTimeSum}"` : t('defaults.noData'),
          avgSpo2 != null ? `${avgSpo2.toFixed(1)} ${t('units.percent')}` : t('defaults.noData'),
          avgHr != null ? `${avgHr.toFixed(1)} ${t('units.ppm')}` : t('defaults.noData'),
          minSpo2 != null ? `${minSpo2} ${t('units.percent')}` : t('defaults.noData'),
          sixmwSpeed ? `${sixmwSpeed.toFixed(1)} ${t('units.mts')}/s` : t('defaults.noData')
        ];

        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          head: [[{ content: t('tableTitles.computedValues'), colSpan: 6, styles: { fillColor: [0,64,124], textColor:255, fontStyle:'bold', halign:'center', fontSize:10 } }], [
            t('tableHeaders.computed.enrightD'),
            t('tableHeaders.computed.enrightPercent'),
            t('tableHeaders.computed.sixMWWork'),
            t('tableHeaders.computed.dsp'),
            t('tableHeaders.computed.maxTestHr'),
            t('tableHeaders.computed.maxTestHrPercent')
          ]],
          body: [row1],
          didParseCell: data => {
            if (data.cell.section === 'head') {
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [0,64,124];
                data.cell.styles.textColor = 255;
              } else {
                data.cell.styles.fillColor = [131,195,194];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;

        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          head: [[
            t('tableHeaders.computed.stops'),
            t('tableHeaders.computed.stopsTime'),
            t('tableHeaders.computed.avgSpo2'),
            t('tableHeaders.computed.avgHr'),
            t('tableHeaders.computed.minTestSpo2'),
            t('tableHeaders.computed.sixMwSpeed')
          ]],
          body: [row2],
          didParseCell: data => {
            if (data.cell.section === 'head') {
              data.cell.styles.fillColor = [131,195,194];
              data.cell.styles.textColor = 255;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;
        continue;
      }

      if (tableTag && tableTag.rows && tableTag.rows.length > 0) {
        const approxHeight = 100;
        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        autoTable(doc, {
          html: tableTag,
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          alternateRowStyles: { fillColor: [245,245,245] },
          didParseCell: data => {
            if (data.cell.section === 'head') {
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [0,64,124];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 10;
                data.cell.styles.halign = 'center';
                data.cell.styles.valign = 'middle';
              } else {
                data.cell.styles.fillColor = [131,195,194];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 8;
                data.cell.styles.halign = 'center';
              }
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;
      }
    }

    doc.save(`Test_${id}_report.pdf`);
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    if (selectedTables.test) {
      const testSheetData = [
        [t('tableHeaders.test.date'), t('tableHeaders.test.time'), t('tableHeaders.test.coneDistance'), t('tableHeaders.test.id')],
        [
          test.test.date ? test.test.date.split('T')[0] : t('defaults.noData'),
          test.test.date ? test.test.date.split('T')[1].split('.')[0] : t('defaults.noData'),
          test.test.cone_distance != null ? `${test.test.cone_distance} ${t('units.mts')}` : t('defaults.noData'),
          test.test.hash || t('defaults.noData')
        ]
      ];
      const wsTest = XLSX.utils.aoa_to_sheet(testSheetData);
      XLSX.utils.book_append_sheet(wb, wsTest, t('tableTitles.test'));
    }

    if (selectedTables.antropometric) {
      const antropometricData = [
        [t('tableHeaders.antropometric.name'), t('tableHeaders.antropometric.gender'), t('tableHeaders.antropometric.age'), t('tableHeaders.antropometric.weightHeight'), t('tableHeaders.antropometric.imc')],
        [
          test.test.name ?? t('defaults.noData'),
          test.test.gender ?? t('defaults.noData'),
          test.test.age ? `${test.test.age}` : t('defaults.noData'),
          (test.test.weight != null && test.test.height != null) ? `${test.test.weight} Kg - ${test.test.height} cm` : t('defaults.noData'),
          (test.test.weight != null && test.test.height != null) ? `${(test.test.weight/((test.test.height/100)**2)).toFixed(1)}` : t('defaults.noData')
        ]
      ];
      const wsAntro = XLSX.utils.aoa_to_sheet(antropometricData);
      XLSX.utils.book_append_sheet(wb, wsAntro, t('tableTitles.antropometricValues'));
    }

    if (selectedTables.comments) {
      const commentsData = [[t('tableTitles.comments')], [test.final.comment?.trim() || t('defaults.noData')]];
      const wsComments = XLSX.utils.aoa_to_sheet(commentsData);
      XLSX.utils.book_append_sheet(wb, wsComments, t('tableTitles.comments'));
    }

    if (selectedTables.basal) {
      const basalData = [
        [t('tableHeaders.basal.saturation'), t('tableHeaders.basal.heartRate'), t('tableHeaders.basal.hrPercentage'), t('tableHeaders.basal.dyspnea'), t('tableHeaders.basal.fatigue'), t('tableHeaders.basal.o2')],
        [
          test.initial.spo != null ? `${test.initial.spo} ${t('units.percent')}` : t('defaults.noData'),
          test.initial.hr != null ? `${test.initial.hr} ${t('units.ppm')}` : t('defaults.noData'),
          (test.initial.hr != null && test.test.age != null) ? `${((test.initial.hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}` : t('defaults.noData'),
          test.initial.d != null ? `${test.initial.d} ${t('units.borg')}` : t('defaults.noData'),
          test.initial.f != null ? `${test.initial.f} ${t('units.borg')}` : t('defaults.noData'),
          test.test.o2 != null ? `${test.test.o2} ${t('units.liters')}` : t('defaults.noData')
        ]
      ];
      const wsBasal = XLSX.utils.aoa_to_sheet(basalData);
      XLSX.utils.book_append_sheet(wb, wsBasal, t('tableTitles.basalValues'));
    }

    if (selectedTables.final) {
      const finalData = [
        [t('tableHeaders.final.meters'), t('tableHeaders.final.dyspnea'), t('tableHeaders.final.fatigue')],
        [
          test.final.meters != null ? `${test.final.meters} ${t('units.mts')}` : t('defaults.noData'),
          test.final.d != null ? `${test.final.d} ${t('units.borg')}` : t('defaults.noData'),
          test.final.f != null ? `${test.final.f} ${t('units.borg')}` : t('defaults.noData')
        ]
      ];
      const wsFinal = XLSX.utils.aoa_to_sheet(finalData);
      XLSX.utils.book_append_sheet(wb, wsFinal, t('tableTitles.finalValues'));
    }

    if (selectedTables.rest) {
      const restData = [[t('tableHeaders.rest.halfRestSpo'), t('tableHeaders.rest.halfRestHr'), t('tableHeaders.rest.halfRestHrPercentage'), t('tableHeaders.rest.restEndSpo'), t('tableHeaders.rest.restEndHr'), t('tableHeaders.rest.restEndHrPercentage')]];
      let halfRestHrPercent = t('defaults.noData');
      if (test.final.half_rest_hr != null && test.test.age != null) {
        halfRestHrPercent = `${((test.final.half_rest_hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}`;
      }
      let endRestHrPercent = t('defaults.noData');
      if (test.final.end_rest_hr != null && test.test.age != null) {
        endRestHrPercent = `${((test.final.end_rest_hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}`;
      }
      restData.push([
        test.final.half_rest_spo != null ? `${test.final.half_rest_spo} ${t('units.percent')}` : t('defaults.noData'),
        test.final.half_rest_hr != null ? `${test.final.half_rest_hr} ${t('units.ppm')}` : t('defaults.noData'),
        halfRestHrPercent,
        test.final.end_rest_spo != null ? `${test.final.end_rest_spo} ${t('units.percent')}` : t('defaults.noData'),
        test.final.end_rest_hr != null ? `${test.final.end_rest_hr} ${t('units.ppm')}` : t('defaults.noData'),
        endRestHrPercent
      ]);
      const wsRest = XLSX.utils.aoa_to_sheet(restData);
      XLSX.utils.book_append_sheet(wb, wsRest, t('tableTitles.restValues'));
    }

    if (selectedTables.computed1) {
      const weight = test.test.weight ?? 0;
      const height = test.test.height ?? 0;
      const age = test.test.age ?? 0;
      const actualDistance = test.final.meters ?? 0;
      const enrightD = (2.11*height) - (2.29*weight) - (5.78*age) + 667;
      let enrightPercent=0; if(enrightD>0) enrightPercent=(actualDistance/enrightD)*100;
      const sixMWWork=actualDistance*weight;
      const data6MW=(test.data||[]).filter(d=>d.p===1);
      let lowestSpo2=999; data6MW.forEach(d=>{ if(typeof d.s==='number'&&d.s<lowestSpo2) lowestSpo2=d.s; });
      const dsp=lowestSpo2<999? actualDistance*(lowestSpo2/100):0;
      let maxTestHr=0; data6MW.forEach(d=>{ if(typeof d.h==='number'&&d.h>maxTestHr) maxTestHr=d.h; });
      let maxTestHrPercent=0; if(age<220&&maxTestHr>0) maxTestHrPercent=(maxTestHr/(220-age))*100;
      const computedSheetData=[[t('tableHeaders.computed.enrightD'),t('tableHeaders.computed.enrightPercent'),t('tableHeaders.computed.sixMWWork'),t('tableHeaders.computed.dsp'),t('tableHeaders.computed.maxTestHr'),t('tableHeaders.computed.maxTestHrPercent')],[enrightD?`${enrightD.toFixed(1)} ${t('units.mts')}`:t('defaults.noData'),enrightPercent?`${enrightPercent.toFixed(1)} ${t('units.percent')}`:t('defaults.noData'),sixMWWork?`${sixMWWork} ${t('units.mts')}*kg`:t('defaults.noData'),dsp?`${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})`:t('defaults.noData'),maxTestHr?`${maxTestHr} ${t('units.ppm')}`:t('defaults.noData'),maxTestHrPercent?`${maxTestHrPercent.toFixed(1)} ${t('units.percent')}`:t('defaults.noData')]];
      const wsComputed = XLSX.utils.aoa_to_sheet(computedSheetData);
      XLSX.utils.book_append_sheet(wb, wsComputed, t('tableTitles.computedValues'));

      const stopsArr=test.stops||[];
      const stopsTxt=stopsArr.map(stop=>`${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`).join('\n');
      const stopsSum=stopsArr.reduce((s,v)=>s+(v.len||0),0);
      let sumS=0,cntS=0; data6MW.forEach(d=>{ if(typeof d.s==='number'){ sumS+=d.s; cntS++; } });
      const avgS=cntS?sumS/cntS:null;
      let sumH=0,cntH=0; data6MW.forEach(d=>{ if(typeof d.h==='number'){ sumH+=d.h; cntH++; } });
      const avgH=cntH?sumH/cntH:null;
      let minSp=null; data6MW.forEach(d=>{ if(typeof d.s==='number'){ if(minSp==null||d.s<minSp) minSp=d.s; } });
      const spd= (test.final.meters??0)/360;
      const computedSheetData2=[[t('tableHeaders.computed.stops'),t('tableHeaders.computed.stopsTime'),t('tableHeaders.computed.avgSpo2'),t('tableHeaders.computed.avgHr'),t('tableHeaders.computed.minTestSpo2'),t('tableHeaders.computed.sixMwSpeed')],[stopsTxt||t('defaults.noData'),stopsSum?`${stopsSum}"`:t('defaults.noData'),avgS!=null?`${avgS.toFixed(1)} ${t('units.percent')}`:t('defaults.noData'),avgH!=null?`${avgH.toFixed(1)} ${t('units.ppm')}`:t('defaults.noData'),minSp!=null?`${minSp} ${t('units.percent')}`:t('defaults.noData'),spd?`${spd.toFixed(1)} ${t('units.mts')}/s`:t('defaults.noData')]];
      const wsComputed2 = XLSX.utils.aoa_to_sheet(computedSheetData2);
      XLSX.utils.book_append_sheet(wb, wsComputed2, t('tableTitles.computedValues')+' 2');
    }

    if (selectedTables.average) {
      const hdrs=[t('tableHeaders.average.avgFirstMin'),t('tableHeaders.average.avgSecondMin'),t('tableHeaders.average.avgThirdMin'),t('tableHeaders.average.avgFourthMin'),t('tableHeaders.average.avgFifthMin'),t('tableHeaders.average.avgSixthMin')];
      const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
      const arrS=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(d=>d.t>=s&&d.t<e);let sm=0,c=0;sub.forEach(x=>{if(typeof x.s==='number'){sm+=x.s;c++;}});arrS.push(c?sm/c:null);}
      const arrH=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(d=>d.t>=s&&d.t<e);let sm=0,c=0;sub.forEach(x=>{if(typeof x.h==='number'){sm+=x.h;c++;}});arrH.push(c?sm/c:null);}
      const avgSheet=[hdrs,arrS.map(v=>v!=null?`${v.toFixed(1)} ${t('units.percent')}`:t('defaults.noData')),arrH.map(v=>v!=null?`${v.toFixed(0)} ${t('units.ppm')}`:t('defaults.noData'))];
      const wsAvg=XLSX.utils.aoa_to_sheet(avgSheet);XLSX.utils.book_append_sheet(wb,wsAvg,t('tableTitles.averageValues'));
    }

    if (selectedTables.periodic) {
      const ph=[t('tableHeaders.periodic.min1'),t('tableHeaders.periodic.min2'),t('tableHeaders.periodic.min3'),t('tableHeaders.periodic.min4'),t('tableHeaders.periodic.min5'),t('tableHeaders.periodic.min6')];
      const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
      const lstS=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(d=>d.t>=s&&d.t<e);let lp=null;sub.forEach(x=>{if(!lp||x.t>lp.t)lp=x;});lstS.push(lp?lp.s:null);}
      const lstH=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(d=>d.t>=s&&d.t<e);let lp=null;sub.forEach(x=>{if(!lp||x.t>lp.t)lp=x;});lstH.push(lp?lp.h:null);}
      const perSheet=[ph,lstS.map(v=>v!=null?`${v} ${t('units.percent')}`:t('defaults.noData')),lstH.map(v=>v!=null?`${v} ${t('units.ppm')}`:t('defaults.noData'))];
      const wsPer=XLSX.utils.aoa_to_sheet(perSheet);XLSX.utils.book_append_sheet(wb,wsPer,t('tableTitles.periodicValues'));
    }

    if (selectedTables.checkpoints) {
      const ch=[t('tableHeaders.checkpoints.meters'),t('tableHeaders.checkpoints.time'),t('tableHeaders.checkpoints.heartRate'),t('tableHeaders.checkpoints.saturation')];
      const rows=(test.pascon||[]).map(cp=>{
        const cd=test.test?.cone_distance??30;return [`${(cp.n+1)*cd} ${t('units.mts')}`,`${cp.t} "`,`${cp.h} ${t('units.ppm')}`,`${cp.s} ${t('units.percent')}`];
      });
      const cpSheet=[ch,...rows];
      const wsCh=XLSX.utils.aoa_to_sheet(cpSheet);XLSX.utils.book_append_sheet(wb,wsCh,t('tableTitles.checkpoints'));
    }

    XLSX.writeFile(wb,`Test_${id}_data.xlsx`);
  };

  const handleTableSelection = tableName => {
    setSelectedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  if (loading) return <div>{t('testDetails.loading')}</div>;
  if (error) return <div>{t('testDetails.error',{ message:error.message })}</div>;
  if (!test) return <div>{t('testDetails.noData')}</div>;

  const testData=test.data||[];
  const spoData=testData.map(item=>({x:item.t,y:item.s}));
  const hrData=testData.map(item=>({x:item.t,y:item.h}));
  const cpTimes=test.pascon.map(item=>item.t);
  const cpSpo=test.pascon.map(item=>item.s);
  const cpHr=test.pascon.map(item=>item.h);

  const allX=[...spoData.map(d=>d.x),...hrData.map(d=>d.x),...cpTimes];
  const gMin=allX.length?Math.min(...allX):0;
  const gMax=allX.length?Math.max(...allX):10;
  const cpMin=cpTimes.length?Math.min(...cpTimes):gMin;
  const cpMax=cpTimes.length?Math.max(...cpTimes):gMax;

  const spo2HrOptions={
    scales:{
      x:{type:'linear',title:{display:true,text:`${t('units.time')} (s)`},min:gMin,max:gMax,ticks:{stepSize:1}},
      y:{title:{display:true,text:t('units.value')},ticks:{stepSize:1}}
    },
    hover:{mode:'nearest',intersect:true},
    plugins:{tooltip:{mode:'nearest',intersect:true,callbacks:{label:tooltipLabel}}}
  };

  const restOptions=spo2HrOptions;
  const spo2HrData={
    datasets:[
      {label:'SPO₂',data:spoData,borderColor:'rgba(75,192,192,1)',backgroundColor:'rgba(75,192,192,0.2)',segment:{borderColor:ctx=>{const x0=ctx.p0.parsed.x,x1=ctx.p1.parsed.x;return x0>=cpMin&&x1<=cpMax?'rgba(75,192,192,1)':'rgba(75,192,192,0.5)'}},pointRadius:0,hoverRadius:8,pointBackgroundColor:'rgba(75,192,192,1)',pointBorderColor:'rgba(75,192,192,1)',pointHoverBackgroundColor:'rgba(75,192,192,1)'},
      {label:t('charts.cor'),data:hrData,borderColor:'rgba(255,99,132,1)',backgroundColor:'rgba(255,99,132,0.2)',segment:{borderColor:ctx=>{const x0=ctx.p0.parsed.x,x1=ctx.p1.parsed.x;return x0>=cpMin&&x1<=cpMax?'rgba(255,99,132,1)':'rgba(255,99,132,0.5)'}},pointRadius:0,hoverRadius:8,pointBackgroundColor:'rgba(255,99,132,1)',pointBorderColor:'rgba(255,99,132,1)',pointHoverBackgroundColor:'rgba(255,99,132,1)'}
    ]
  };

  const checkpointData={labels:cpTimes,datasets:[{label:'SPO₂',data:cpSpo,borderColor:'blue',backgroundColor:'rgba(54,162,235,0.2)',fill:false,pointRadius:5},{label:t('charts.cor'),data:cpHr,borderColor:'red',backgroundColor:'rgba(255,99,132,0.2)',fill:false,pointRadius:5}]};

  return (
    <div style={{position:'relative'}}>
      <button
        onClick={handleDownloadPdf}
        style={{position:'absolute',top:0,right:0,backgroundColor:'#00407C',color:'#FFFFFF',padding:'10px 20px',cursor:'pointer',border:'none',borderRadius:'4px',fontFamily:'Open Sans, sans-serif',fontWeight:'700',textTransform:'uppercase',transition:'opacity 0.2s ease',zIndex:9999}}
        onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}
      >
        {t('buttons.downloadPdf')}
      </button>
      <button
        onClick={handleDownloadExcel}
        style={{position:'absolute',top:40,right:0,backgroundColor:'#83C3C2',color:'#FFFFFF',padding:'10px 20px',cursor:'pointer',border:'none',borderRadius:'4px',fontFamily:'Open Sans, sans-serif',fontWeight:'700',textTransform:'uppercase',transition:'opacity 0.2s ease',zIndex:9999}}
        onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}
      >
        {t('buttons.downloadExcel')}
      </button>
      <div style={{marginTop:'80px',marginBottom:'20px'}}>
        <h2>{t('selectTables.header')}</h2>
        <ul className="checkbox-list">
          {[
            {key:'checkpoint_data',label:t('charts.checkpoints')},
            {key:'test_data',label:t('charts.testData')},
            {key:'test',label:t('selectTables.test')},
            {key:'antropometric',label:t('selectTables.antropometricValues')},
            {key:'comments',label:t('selectTables.comments')},
            {key:'basal',label:t('selectTables.basalValues')},
            {key:'final',label:t('selectTables.finalValues')},
            {key:'rest',label:t('selectTables.restValues')},
            {key:'computed1',label:t('selectTables.computedValues')},
            {key:'average',label:t('selectTables.averageValues')},
            {key:'periodic',label:t('selectTables.periodicValues')},
            {key:'checkpoints',label:t('selectTables.checkpoints')}
          ].map(item=>(
            <li key={item.key} className="checkbox-item">
              <label>
                <input type="checkbox" checked={selectedTables[item.key]} onChange={()=>handleTableSelection(item.key)} />
                <span className="custom-checkbox" />
                <span className="checkbox-label">{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      {selectedTables.checkpoint_data && (
        <div ref={grafic_checkpoints} style={{marginBottom:'30px'}}>
          <h2 style={{display:'flex',alignItems:'center'}}>
            {t('charts.checkpoints')}
            <InfoTooltip text={t('charts.checkpointsInfo')} />
          </h2>
          <div style={{height:'300px',width:'100%'}}><Line data={checkpointData} options={{...restOptions,maintainAspectRatio:false}}/></div>
        </div>
      )}
      {selectedTables.test_data && (
        <div ref={grafic_data} style={{marginBottom:'30px'}}>
          <h2 style={{display:'flex',alignItems:'center'}}>
            {t('charts.testData')}
            <InfoTooltip text={t('charts.testDataInfo')} />
          </h2>
          <div style={{height:'300px',width:'100%'}}><Line data={spo2HrData} options={{...spo2HrOptions,maintainAspectRatio:false}}/></div>
        </div>
      )}
      <div ref={contentRef} style={{marginTop:'30px'}}>
        {selectedTables.test && (
          <div id="test-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="4" className="table-title">{t('tableTitles.test')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.test.date')}</th>
                  <th>{t('tableHeaders.test.time')}</th>
                  <th>{t('tableHeaders.test.coneDistance')}</th>
                  <th>{t('tableHeaders.test.id')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.test.date?test.test.date.split('T')[0]:t('defaults.noData')}</td>
                  <td>{test.test.date?test.test.date.split('T')[1].split('.')[0]:t('defaults.noData')}</td>
                  <td>{test.test.cone_distance!=null?`${test.test.cone_distance} ${t('units.mts')}`:t('defaults.noData')}</td>
                  <td>{test.test.tid||t('defaults.noData')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.antropometric && (
          <div id="antropometric-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.antropometricValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.antropometric.name')}</th>
                  <th>{t('tableHeaders.antropometric.gender')}</th>
                  <th>{t('tableHeaders.antropometric.age')}</th>
                  <th>{t('tableHeaders.antropometric.weight')}</th>
                  <th>{t('tableHeaders.antropometric.height')}</th>
                  <th>{t('tableHeaders.antropometric.imc')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{position:'relative'}}>{test.test.name||t('defaults.noData')}</td>
                  <td style={{position:'relative'}}>{test.test.gender||t('defaults.noData')}</td>
                  <td style={{position:'relative'}}>
                    {test.test.age!=null?test.test.age:t('defaults.noData')}
                    <button onClick={()=>handleEditAnthro('age')} className="edit-button" title={t('buttons.edit')}>✎</button>
                  </td>
                  <td style={{position:'relative'}}>
                    {test.test.weight!=null?`${test.test.weight} Kg`:t('defaults.noData')}
                    <button onClick={()=>handleEditAnthro('weight')} className="edit-button" title={t('buttons.edit')}>✎</button>
                  </td>
                  <td style={{position:'relative'}}>
                    {test.test.height!=null?`${test.test.height} Cms`:t('defaults.noData')}
                    <button onClick={()=>handleEditAnthro('height')} className="edit-button" title={t('buttons.edit')}>✎</button>
                  </td>
                  <td>
                    {test.test.weight!=null&&test.test.height!=null?((test.test.weight/((test.test.height/100)**2)).toFixed(1)):t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.comments && (
          <div id="comments-table" className="formatted-table">
            <table>
              <thead><tr><th className="table-title">{t('tableTitles.comments')}</th></tr></thead>
              <tbody><tr><td style={{whiteSpace:'pre-line'}}>{test.final.comment?.trim()||t('defaults.noData')}</td></tr></tbody>
            </table>
          </div>
        )}
        {selectedTables.basal && (
          <div id="basal-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.basalValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.basal.saturation')}</th>
                  <th>{t('tableHeaders.basal.heartRate')}</th>
                  <th>{t('tableHeaders.basal.hrPercentage')}</th>
                  <th>{t('tableHeaders.basal.dyspnea')}</th>
                  <th>{t('tableHeaders.basal.fatigue')}</th>
                  <th>{t('tableHeaders.basal.o2')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.initial.spo!=null?`${test.initial.spo} ${t('units.percent')}`:t('defaults.noData')}</td>
                  <td>{test.initial.hr!=null?`${test.initial.hr} ${t('units.ppm')}`:t('defaults.noData')}</td>
                  <td>{test.initial.hr!=null&&test.test.age!=null?`${((test.initial.hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                  <td>{test.initial.d!=null?`${test.initial.d} ${t('units.borg')}`:t('defaults.noData')}</td>
                  <td>{test.initial.f!=null?`${test.initial.f} ${t('units.borg')}`:t('defaults.noData')}</td>
                  <td>{test.test.o2!=null?`${test.test.o2} ${t('units.liters')}`:t('defaults.noData')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.final && (
          <div id="final-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="3" className="table-title">{t('tableTitles.finalValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.final.meters')}</th>
                  <th>{t('tableHeaders.final.dyspnea')}</th>
                  <th>{t('tableHeaders.final.fatigue')}</th>
                </tr>
              </thead>
              <tbody>  
                <tr>
                  <td>{test.final.meters!=null?`${test.final.meters} ${t('units.mts')}`:t('defaults.noData')}</td>
                  <td>{test.final.d!=null?`${test.final.d} ${t('units.borg')}`:t('defaults.noData')}</td>
                  <td>{test.final.f!=null?`${test.final.f} ${t('units.borg')}`:t('defaults.noData')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.rest && (
          <div id="rest-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.restValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.rest.halfRestSpo')}</th>
                  <th>{t('tableHeaders.rest.halfRestHr')}</th>
                  <th>{t('tableHeaders.rest.halfRestHrPercentage')}</th>
                  <th>{t('tableHeaders.rest.restEndSpo')}</th>
                  <th>{t('tableHeaders.rest.restEndHr')}</th>
                  <th>{t('tableHeaders.rest.restEndHrPercentage')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.final.half_rest_spo!=null?`${test.final.half_rest_spo} ${t('units.percent')}`:t('defaults.noData')}</td>
                  <td>{test.final.half_rest_hr!=null?`${test.final.half_rest_hr} ${t('units.ppm')}`:t('defaults.noData')}</td>
                  <td>{test.final.half_rest_hr!=null&&test.test.age!=null?`${((test.final.half_rest_hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                  <td>{test.final.end_rest_spo!=null?`${test.final.end_rest_spo} ${t('units.percent')}`:t('defaults.noData')}</td>
                  <td>{test.final.end_rest_hr!=null?`${test.final.end_rest_hr} ${t('units.ppm')}`:t('defaults.noData')}</td>
                  <td>{test.final.end_rest_hr!=null&&test.test.age!=null?`${((test.final.end_rest_hr/(220-test.test.age))*100).toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.computed1 && (
          <div id="computed1-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.computedValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.computed.enrightD')}</th>
                  <th>{t('tableHeaders.computed.enrightPercent')}</th>
                  <th>{t('tableHeaders.computed.sixMWWork')}</th>
                  <th>{t('tableHeaders.computed.dsp')}</th>
                  <th>{t('tableHeaders.computed.maxTestHr')}</th>
                  <th>{t('tableHeaders.computed.maxTestHrPercent')}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const weight = test.test.weight ?? 0;
                  const height = test.test.height ?? 0;
                  const age = test.test.age ?? 0;
                  const actualDistance = test.final.meters ?? 0;
                  const enrightD = (2.11*height)-(2.29*weight)-(5.78*age)+667;
                  let enrightPercent=0; if(enrightD>0) enrightPercent=(actualDistance/enrightD)*100;
                  const sixMWWork=actualDistance*weight;
                  const data6MW=(test.data||[]).filter(d=>d.p===1);
                  let lowestSpo2=999; data6MW.forEach(d=>{ if(typeof d.s==='number'&&d.s<lowestSpo2)lowestSpo2=d.s; });
                  const dsp=lowestSpo2<999?actualDistance*(lowestSpo2/100):0;
                  let maxTestHr=0; data6MW.forEach(d=>{ if(typeof d.h==='number'&&d.h>maxTestHr)maxTestHr=d.h; });
                  let maxTestHrPercent=0; if(age<220&&maxTestHr>0)maxTestHrPercent=(maxTestHr/(220-age))*100;
                  return (
                    <tr>
                      <td>{enrightD?`${enrightD.toFixed(1)} ${t('units.mts')}`:t('defaults.noData')}</td>
                      <td>{enrightPercent?`${enrightPercent.toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                      <td>{sixMWWork?`${sixMWWork} ${t('units.mts')}*kg`:t('defaults.noData')}</td>
                      <td>{dsp?`${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})`:t('defaults.noData')}</td>
                      <td>{maxTestHr?`${maxTestHr} ${t('units.ppm')}`:t('defaults.noData')}</td>
                      <td>{maxTestHrPercent?`${maxTestHrPercent.toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                    </tr>
                  );
                })()}
              </tbody>
              <thead>
                <tr>
                  <th>{t('tableHeaders.computed.stops')}</th>
                  <th>{t('tableHeaders.computed.stopsTime')}</th>
                  <th>{t('tableHeaders.computed.avgSpo2')}</th>
                  <th>{t('tableHeaders.computed.avgHr')}</th>
                  <th>{t('tableHeaders.computed.minTestSpo2')}</th>
                  <th>{t('tableHeaders.computed.sixMwSpeed')}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const data6MW=(test.data||[]).filter(d=>d.p===1);
                  const stopsArr=test.stops||[];
                  const stopsTxt=stopsArr.map(stop=>`${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`).join('\n');
                  const stopsSum=stopsArr.reduce((s,v)=>s+(v.len||0),0);
                  let sumS=0,cntS=0; data6MW.forEach(d=>{ if(typeof d.s==='number'){sumS+=d.s;cntS++;}});const avgS=cntS?sumS/cntS:null;
                  let sumH=0,cntH=0; data6MW.forEach(d=>{ if(typeof d.h==='number'){sumH+=d.h;cntH++;}});const avgH=cntH?sumH/cntH:null;
                  let minSp=null; data6MW.forEach(d=>{ if(typeof d.s==='number'){ if(minSp==null||d.s<minSp)minSp=d.s; }});const spd=(test.final.meters??0)/360;
                  return (
                    <tr>
                      <td style={{whiteSpace:'pre-line'}}>{stopsTxt||t('defaults.noData')}</td>
                      <td>{stopsSum?`${stopsSum}"`:t('defaults.noData')}</td>
                      <td>{avgS!=null?`${avgS.toFixed(1)} ${t('units.percent')}`:t('defaults.noData')}</td>
                      <td>{avgH!=null?`${avgH.toFixed(1)} ${t('units.ppm')}`:t('defaults.noData')}</td>
                      <td>{minSp!=null?`${minSp} ${t('units.percent')}`:t('defaults.noData')}</td>
                      <td>{spd?`${spd.toFixed(1)} ${t('units.mts')}/s`:t('defaults.noData')}</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.average && (
          <div id="average-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.averageValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.average.avgFirstMin')}</th>
                  <th>{t('tableHeaders.average.avgSecondMin')}</th>
                  <th>{t('tableHeaders.average.avgThirdMin')}</th>
                  <th>{t('tableHeaders.average.avgFourthMin')}</th>
                  <th>{t('tableHeaders.average.avgFifthMin')}</th>
                  <th>{t('tableHeaders.average.avgSixthMin')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(() => {
                    const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
                    const arr=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(x=>x.t>=s&&x.t<e);let sm=0,c=0;sub.forEach(x=>{if(typeof x.s==='number'){sm+=x.s;c++;}});arr.push(c?`${(sm/c).toFixed(1)} ${t('units.percent')}`:t('defaults.noData'));}return arr.map((v,i)=><td key={i}>{v}</td>);
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
                    const arr=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(x=>x.t>=s&&x.t<e);let sm=0,c=0;sub.forEach(x=>{if(typeof x.h==='number'){sm+=x.h;c++;}});arr.push(c?`${Math.round(sm/c)} ${t('units.ppm')}`:t('defaults.noData'));}return arr.map((v,i)=><td key={i}>{v}</td>);
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.periodic && (
          <div id="periodic-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="6" className="table-title">{t('tableTitles.periodicValues')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.periodic.min1')}</th>
                  <th>{t('tableHeaders.periodic.min2')}</th>
                  <th>{t('tableHeaders.periodic.min3')}</th>
                  <th>{t('tableHeaders.periodic.min4')}</th>
                  <th>{t('tableHeaders.periodic.min5')}</th>
                  <th>{t('tableHeaders.periodic.min6')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(() => {
                    const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
                    const arr=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(x=>x.t>=s&&x.t<e);let lp=null;sub.forEach(x=>{if(!lp||x.t>lp.t)lp=x;});arr.push(lp?`${lp.s} ${t('units.percent')}`:t('defaults.noData'));}return arr.map((v,i)=><td key={i}>{v}</td>);
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const d1=(test.data||[]).filter(d=>d.p===1&&d.t>=0&&d.t<360);
                    const arr=[];for(let m=1;m<=6;m++){const s=(m-1)*60,e=m*60,sub=d1.filter(x=>x.t>=s&&x.t<e);let lp=null;sub.forEach(x=>{if(!lp||x.t>lp.t)lp=x;});arr.push(lp?`${lp.h} ${t('units.ppm')}`:t('defaults.noData'));}return arr.map((v,i)=><td key={i}>{v}</td>);
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {selectedTables.checkpoints && (
          <div id="checkpoints-table" className="formatted-table">
            <table>
              <thead>
                <tr><th colSpan="4" className="table-title">{t('tableTitles.checkpoints')}</th></tr>
                <tr>
                  <th>{t('tableHeaders.checkpoints.meters')}</th>
                  <th>{t('tableHeaders.checkpoints.time')}</th>
                  <th>{t('tableHeaders.checkpoints.heartRate')}</th>
                  <th>{t('tableHeaders.checkpoints.saturation')}</th>
                </tr>
              </thead>
              <tbody>
                {test.pascon.map((cp,idx)=>{
                  const cd=test.test?.cone_distance??30;
                  const tm=(cp.n+1)*cd;
                  return (
                    <tr key={idx}>
                      <td>{`${tm} ${t('units.mts')}`}</td>
                      <td>{`${cp.t} "`}</td>
                      <td>{`${cp.h} ${t('units.ppm')}`}</td>
                      <td>{`${cp.s} ${t('units.percent')}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <style jsx>{`
          :global(:root) {
            --color-primary: #00407C;
            --color-secondary: #83C3C2;
            --color-bg-light: #F5F5F5;
            --color-text-dark: #4D4D4D;
            --border-radius: 4px;
            --font-sans: 'Open Sans', sans-serif;
          }
          .formatted-table { margin-top:20px; font-family:var(--font-sans); }
          table { width:100%; border-collapse:collapse; margin-bottom:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1); border-radius:var(--border-radius); overflow:hidden; }
          .table-title { background-color:var(--color-primary); color:#fff; font-weight:700; font-size:1.2em; text-transform:uppercase; height:45px; line-height:45px; padding:0 12px; }
          th, td { padding:12px; text-align:center; }
          th { background-color:var(--color-secondary); color:#fff; font-weight:700; text-transform:uppercase; }
          td { background-color:#fff; color:var(--color-text-dark); }
          tr:nth-child(even) td { background-color:var(--color-bg-light); }
          .edit-button { background:none; border:none; cursor:pointer; margin-left:6px; color:var(--color-secondary); font-size:0.9em; vertical-align:middle; padding:2px 4px; border-radius:var(--border-radius); transition:background-color 0.2s ease; }
          .edit-button:hover { background-color:var(--color-bg-light); color:var(--color-primary); }
        `}</style>
      </div>
    </div>
  );
};

export default TestDetails;
