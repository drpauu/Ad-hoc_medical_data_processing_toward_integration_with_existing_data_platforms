import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

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
    checkpoints: true,
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/tests/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
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

  const handleDownloadPdf = async () => {
    // 1) Crear instancia de jsPDF en formato A4 (unidades en puntos)
    const doc = new jsPDF({ format: 'a4', unit: 'pt' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    let cursorY = margin;
  
    // 2) Dibujar los gráficos si están seleccionados
    if (selectedTables.checkpoint_data) {
      const canvas1 = await html2canvas(grafic_checkpoints.current, {
        backgroundColor: null,
        scale: 2,
      });
      const img1 = canvas1.toDataURL('image/png');
      const props1 = doc.getImageProperties(img1);
      const h1 = (props1.height * usableWidth) / props1.width;
  
      doc.addImage(img1, 'PNG', margin, cursorY, usableWidth, h1);
      cursorY += h1 + 10;
    }
  
    if (selectedTables.test_data) {
      const canvas2 = await html2canvas(grafic_data.current, {
        backgroundColor: null,
        scale: 2,
      });
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
  
    // 3) Definir todas las tablas disponibles con su clave y su id en el DOM
    const tables = [
      { key: 'test',           id: 'test-table' },
      { key: 'antropometric',  id: 'antropometric-table' },
      { key: 'comments',       id: 'comments-table' },
      { key: 'basal',          id: 'basal-table' },
      { key: 'final',          id: 'final-table' },
      { key: 'rest',           id: 'rest-table' },
      { key: 'computed1',      id: 'computed1-table' },
      { key: 'average',        id: 'average-table' },
      { key: 'periodic',       id: 'periodic-table' },
      { key: 'checkpoints',    id: 'checkpoints-table' },
    ];
  
    // 4) Recorrer cada tabla; si está seleccionada, extraerla y volcarla al PDF
    for (const { key, id } of tables) {
      if (!selectedTables[key]) continue;
  
      // 4.2) Obtener el contenedor y luego el <table> interno
      const container = document.getElementById(id);
      const tableTag = container?.querySelector('table') || null;
  
      // 4.3) Caso “basal”: tabla generada manualmente con encabezados combinados
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
              test.initial.spo != null
                ? `${test.initial.spo} ${t('units.percent')}`
                : t('defaults.noData'),
              test.initial.hr != null
                ? `${test.initial.hr} ${t('units.ppm')}`
                : t('defaults.noData'),
              (test.initial.hr != null && test.test.age != null)
                ? `${((test.initial.hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`
                : t('defaults.noData'),
              test.initial.d != null
                ? `${test.initial.d} ${t('units.borg')}`
                : t('defaults.noData'),
              test.initial.f != null
                ? `${test.initial.f} ${t('units.borg')}`
                : t('defaults.noData'),
              test.test.o2 != null
                ? `${test.test.o2} ${t('units.liters')}`
                : t('defaults.noData')
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
  
      // 4.4) Caso “rest”: tabla generada manualmente con encabezados combinados
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
              test.final.half_rest_spo != null
                ? `${test.final.half_rest_spo} ${t('units.percent')}`
                : t('defaults.noData'),
              test.final.half_rest_hr != null
                ? `${test.final.half_rest_hr} ${t('units.ppm')}`
                : t('defaults.noData'),
              halfRestHrPercent,
              test.final.end_rest_spo != null
                ? `${test.final.end_rest_spo} ${t('units.percent')}`
                : t('defaults.noData'),
              test.final.end_rest_hr != null
                ? `${test.final.end_rest_hr} ${t('units.ppm')}`
                : t('defaults.noData'),
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
  
      // 4.5) Caso “computed1”: tabla generada manualmente en dos secciones
      if (key === 'computed1') {
        const approxHeight = 120;
        if (cursorY + approxHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
  
        // 4.5.1) Cálculos básicos: Enright, trabajo, saturaciones y pulsos
        const weight = test.test.weight ?? 0;
        const height = test.test.height ?? 0;
        const age = test.test.age ?? 0;
        const actualDistance = test.final.meters ?? 0;
  
        const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
        let enrightPercent = 0;
        if (enrightD > 0) {
          enrightPercent = (actualDistance / enrightD) * 100;
        }
        const sixMWWork = actualDistance * weight;
  
        const data6MW = (test.data || []).filter(d => d.p === 1);
        let lowestSpo2 = 999;
        data6MW.forEach(d => {
          if (typeof d.s === 'number' && d.s < lowestSpo2) {
            lowestSpo2 = d.s;
          }
        });
        const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;
  
        let maxTestHr = 0;
        data6MW.forEach(d => {
          if (typeof d.h === 'number' && d.h > maxTestHr) {
            maxTestHr = d.h;
          }
        });
        let maxTestHrPercent = 0;
        if (age < 220 && maxTestHr > 0) {
          maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
        }
  
        const row1 = [
          enrightD
            ? `${enrightD.toFixed(1)} ${t('units.mts')}`
            : t('defaults.noData'),
          enrightPercent
            ? `${enrightPercent.toFixed(1)} ${t('units.percent')}`
            : t('defaults.noData'),
          sixMWWork
            ? `${sixMWWork} ${t('units.mts')}*kg`
            : t('defaults.noData'),
          dsp
            ? `${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})`
            : t('defaults.noData'),
          maxTestHr
            ? `${maxTestHr} ${t('units.ppm')}`
            : t('defaults.noData'),
          maxTestHrPercent
            ? `${maxTestHrPercent.toFixed(1)} ${t('units.percent')}`
            : t('defaults.noData')
        ];
  
        // 4.5.2) Cálculos de paradas, promedio, mínimo y velocidad
        const stopsArray = test.stops || [];
        const stopsText = stopsArray
          .map(stop => `${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`)
          .join('\n');
        const stopsTimeSum = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);
  
        let sumSpo2 = 0, countSpo2 = 0;
        data6MW.forEach(d => {
          if (typeof d.s === 'number') {
            sumSpo2 += d.s;
            countSpo2++;
          }
        });
        const avgSpo2 = countSpo2 ? sumSpo2 / countSpo2 : null;
  
        let sumHr = 0, countHr = 0;
        data6MW.forEach(d => {
          if (typeof d.h === 'number') {
            sumHr += d.h;
            countHr++;
          }
        });
        const avgHr = countHr ? sumHr / countHr : null;
  
        let minSpo2 = null;
        data6MW.forEach(d => {
          if (typeof d.s === 'number') {
            if (minSpo2 == null || d.s < minSpo2) {
              minSpo2 = d.s;
            }
          }
        });
  
        const finalMeters = test.final.meters ?? 0;
        const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;
  
        const row2 = [
          stopsText || t('defaults.noData'),
          stopsTimeSum
            ? `${stopsTimeSum}"`
            : t('defaults.noData'),
          avgSpo2 != null
            ? `${avgSpo2.toFixed(1)} ${t('units.percent')}`
            : t('defaults.noData'),
          avgHr != null
            ? `${avgHr.toFixed(1)} ${t('units.ppm')}`
            : t('defaults.noData'),
          minSpo2 != null
            ? `${minSpo2} ${t('units.percent')}`
            : t('defaults.noData'),
          sixmwSpeed
            ? `${sixmwSpeed.toFixed(1)} ${t('units.mts')}/s`
            : t('defaults.noData')
        ];
  
        // 4.5.3) Dibujar sección 1 de “computed1”
        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4 },
          head: [
            [
              {
                content: t('tableTitles.computedValues'),
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
              t('tableHeaders.computed.enrightD'),
              t('tableHeaders.computed.enrightPercent'),
              t('tableHeaders.computed.sixMWWork'),
              t('tableHeaders.computed.dsp'),
              t('tableHeaders.computed.maxTestHr'),
              t('tableHeaders.computed.maxTestHrPercent')
            ]
          ],
          body: [row1],
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
  
        // 4.5.4) Dibujar sección 2 de “computed1”
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
              t('tableHeaders.computed.stops'),
              t('tableHeaders.computed.stopsTime'),
              t('tableHeaders.computed.avgSpo2'),
              t('tableHeaders.computed.avgHr'),
              t('tableHeaders.computed.minTestSpo2'),
              t('tableHeaders.computed.sixMwSpeed')
            ]
          ],
          body: [row2],
          didParseCell: (data) => {
            if (data.cell.section === 'head') {
              data.cell.styles.fillColor = [131, 195, 194];
              data.cell.styles.textColor = 255;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
        cursorY = doc.lastAutoTable.finalY + 10;
        continue;
      }
  
      // 4.6) Caso genérico para el resto de tablas:
      //     test, antropometric, comments, final, average, periodic, checkpoints
      //     Sólo si existe <table> y tiene filas.
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
          alternateRowStyles: { fillColor: [245, 245, 245] },
          didParseCell: (data) => {
            if (data.cell.section === 'head') {
              // Primera fila de cabecera: título de la tabla
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [0, 64, 124];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 10;          // Tamaño de letra mayor
                data.cell.styles.halign = 'center';      // Centrado horizontal
                data.cell.styles.valign = 'middle';      // Centrado vertical
              }
              // Segunda fila de cabecera: nombres de columnas
              else {
                data.cell.styles.fillColor = [131, 195, 194];
                data.cell.styles.textColor = 255;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 8;           // Tamaño de letra estándar
                data.cell.styles.halign = 'center';
              }
            }
          }
        });        
        cursorY = doc.lastAutoTable.finalY + 10;
      }
      // Si no existe <table> o no tiene filas, se omite sin error.
    }
  
    // 5) Guardar el PDF con nombre dinámico
    doc.save(`Test_${id}_report.pdf`);
  };
  
  

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // --- TEST ---
    if (selectedTables.test) {
      const testSheetData = [
        [
          t('tableHeaders.test.date'),
          t('tableHeaders.test.time'),
          t('tableHeaders.test.coneDistance'),
          t('tableHeaders.test.id')
        ],
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

    // --- ANTROPOMETRIC ---
    if (selectedTables.antropometric) {
      const antropometricData = [
        [
          t('tableHeaders.antropometric.name'),
          t('tableHeaders.antropometric.gender'),
          t('tableHeaders.antropometric.age'),
          t('tableHeaders.antropometric.weightHeight'),
          t('tableHeaders.antropometric.imc')
        ],
        [
          test.test.name ?? t('defaults.noData'),
          test.test.gender ?? t('defaults.noData'),
          test.test.age ? `${test.test.age}` : t('defaults.noData'),
          (test.test.weight != null && test.test.height != null)
            ? `${test.test.weight} Kg - ${test.test.height} Cms`
            : t('defaults.noData'),
          (test.test.weight != null && test.test.height != null)
            ? `${(test.test.weight / ((test.test.height / 100) ** 2)).toFixed(1)}`
            : t('defaults.noData')
        ]
      ];
      const wsAntro = XLSX.utils.aoa_to_sheet(antropometricData);
      XLSX.utils.book_append_sheet(wb, wsAntro, t('tableTitles.antropometricValues'));
    }

    // --- COMMENTS ---
    if (selectedTables.comments) {
      const commentsData = [
        [t('tableTitles.comments')],
        [test.final.comment?.trim() || t('defaults.noData')]
      ];
      const wsComments = XLSX.utils.aoa_to_sheet(commentsData);
      XLSX.utils.book_append_sheet(wb, wsComments, t('tableTitles.comments'));
    }

    // --- BASAL ---
    if (selectedTables.basal) {
      const basalData = [
        [
          t('tableHeaders.basal.saturation'),
          t('tableHeaders.basal.heartRate'),
          t('tableHeaders.basal.hrPercentage'),
          t('tableHeaders.basal.dyspnea'),
          t('tableHeaders.basal.fatigue'),
          t('tableHeaders.basal.o2')
        ],
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
      ];
      const wsBasal = XLSX.utils.aoa_to_sheet(basalData);
      XLSX.utils.book_append_sheet(wb, wsBasal, t('tableTitles.basalValues'));
    }

    // --- FINAL ---
    if (selectedTables.final) {
      const finalData = [
        [
          t('tableHeaders.final.meters'),
          t('tableHeaders.final.dyspnea'),
          t('tableHeaders.final.fatigue')
        ],
        [
          test.final.meters != null ? `${test.final.meters} ${t('units.mts')}` : t('defaults.noData'),
          test.final.d != null ? `${test.final.d} ${t('units.borg')}` : t('defaults.noData'),
          test.final.f != null ? `${test.final.f} ${t('units.borg')}` : t('defaults.noData')
        ]
      ];
      const wsFinal = XLSX.utils.aoa_to_sheet(finalData);
      XLSX.utils.book_append_sheet(wb, wsFinal, t('tableTitles.finalValues'));
    }

    // --- REST VALUES ---
    if (selectedTables.rest) {
      const restData = [
        [
          t('tableHeaders.rest.halfRestSpo'),
          t('tableHeaders.rest.halfRestHr'),
          t('tableHeaders.rest.halfRestHrPercentage'),
          t('tableHeaders.rest.restEndSpo'),
          t('tableHeaders.rest.restEndHr'),
          t('tableHeaders.rest.restEndHrPercentage')
        ]
      ];
      let halfRestHrPercent = t('defaults.noData');
      if (test.final.half_rest_hr != null && test.test.age != null) {
        halfRestHrPercent = `${((test.final.half_rest_hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`;
      }
      let endRestHrPercent = t('defaults.noData');
      if (test.final.end_rest_hr != null && test.test.age != null) {
        endRestHrPercent = `${((test.final.end_rest_hr / (220 - test.test.age)) * 100).toFixed(1)} ${t('units.percent')}`;
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

    // --- COMPUTED VALUES ---
    if (selectedTables.computed1) {
      const weight = test.test.weight ?? 0;
      const height = test.test.height ?? 0;
      const age = test.test.age ?? 0;
      const actualDistance = test.final.meters ?? 0;

      const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
      let enrightPercent = 0;
      if (enrightD > 0) {
        enrightPercent = (actualDistance / enrightD) * 100;
      }
      const sixMWWork = actualDistance * weight;

      const data6MW = (test.data || []).filter(d => d.p === 1);
      let lowestSpo2 = 999;
      data6MW.forEach(d => {
        if (typeof d.s === 'number' && d.s < lowestSpo2) {
          lowestSpo2 = d.s;
        }
      });
      const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;

      let maxTestHr = 0;
      data6MW.forEach(d => {
        if (typeof d.h === 'number' && d.h > maxTestHr) {
          maxTestHr = d.h;
        }
      });
      let maxTestHrPercent = 0;
      if (age < 220 && maxTestHr > 0) {
        maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
      }

      const computedSheetData = [
        [
          t('tableHeaders.computed.enrightD'),
          t('tableHeaders.computed.enrightPercent'),
          t('tableHeaders.computed.sixMWWork'),
          t('tableHeaders.computed.dsp'),
          t('tableHeaders.computed.maxTestHr'),
          t('tableHeaders.computed.maxTestHrPercent')
        ],
        [
          enrightD ? `${enrightD.toFixed(1)} ${t('units.mts')}` : t('defaults.noData'),
          enrightPercent ? `${enrightPercent.toFixed(1)} ${t('units.percent')}` : t('defaults.noData'),
          sixMWWork ? `${sixMWWork} ${t('units.mts')}*kg` : t('defaults.noData'),
          dsp ? `${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})` : t('defaults.noData'),
          maxTestHr ? `${maxTestHr} ${t('units.ppm')}` : t('defaults.noData'),
          maxTestHrPercent ? `${maxTestHrPercent.toFixed(1)} ${t('units.percent')}` : t('defaults.noData')
        ]
      ];
      const wsComputed = XLSX.utils.aoa_to_sheet(computedSheetData);
      XLSX.utils.book_append_sheet(wb, wsComputed, t('tableTitles.computedValues'));

      // Second computed block (stops, avg, min, speed)
      const stopsArray = test.stops || [];
      const stopsText = stopsArray
        .map(stop => `${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`)
        .join('\n');
      const stopsTimeSum = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

      let sumSpo2 = 0, countSpo2 = 0;
      data6MW.forEach(d => {
        if (typeof d.s === 'number') {
          sumSpo2 += d.s;
          countSpo2++;
        }
      });
      const avgSpo2 = countSpo2 ? sumSpo2 / countSpo2 : null;

      let sumHr = 0, countHr = 0;
      data6MW.forEach(d => {
        if (typeof d.h === 'number') {
          sumHr += d.h;
          countHr++;
        }
      });
      const avgHr = countHr ? sumHr / countHr : null;

      let minSpo2 = null;
      data6MW.forEach(d => {
        if (typeof d.s === 'number') {
          if (minSpo2 == null || d.s < minSpo2) {
            minSpo2 = d.s;
          }
        }
      });

      const finalMeters = test.final.meters ?? 0;
      const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;

      const computedSheetData2 = [
        [
          t('tableHeaders.computed.stops'),
          t('tableHeaders.computed.stopsTime'),
          t('tableHeaders.computed.avgSpo2'),
          t('tableHeaders.computed.avgHr'),
          t('tableHeaders.computed.minTestSpo2'),
          t('tableHeaders.computed.sixMwSpeed')
        ],
        [
          stopsText || t('defaults.noData'),
          stopsTimeSum || t('defaults.noData'),
          avgSpo2 != null ? `${avgSpo2.toFixed(1)} ${t('units.percent')}` : t('defaults.noData'),
          avgHr != null ? `${avgHr.toFixed(1)} ${t('units.ppm')}` : t('defaults.noData'),
          minSpo2 != null ? `${minSpo2} ${t('units.percent')}` : t('defaults.noData'),
          sixmwSpeed ? `${sixmwSpeed.toFixed(1)} ${t('units.mts')}/s` : t('defaults.noData')
        ]
      ];
      const wsComputed2 = XLSX.utils.aoa_to_sheet(computedSheetData2);
      XLSX.utils.book_append_sheet(wb, wsComputed2, t('tableTitles.computedValues') + ' 2');
    }

    // --- AVERAGE VALUES ---
    if (selectedTables.average) {
      const avgHeaders = [
        t('tableHeaders.average.avgFirstMin'),
        t('tableHeaders.average.avgSecondMin'),
        t('tableHeaders.average.avgThirdMin'),
        t('tableHeaders.average.avgFourthMin'),
        t('tableHeaders.average.avgFifthMin'),
        t('tableHeaders.average.avgSixthMin')
      ];
      const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
      const avgSpo2Array = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let sumS = 0, countS = 0;
        subset.forEach(sItem => {
          if (typeof sItem.s === 'number') {
            sumS += sItem.s;
            countS++;
          }
        });
        avgSpo2Array.push(countS ? sumS / countS : null);
      }
      const avgHrArray = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let sumH = 0, countH = 0;
        subset.forEach(hItem => {
          if (typeof hItem.h === 'number') {
            sumH += hItem.h;
            countH++;
          }
        });
        avgHrArray.push(countH ? sumH / countH : null);
      }
      const averageSheet = [
        avgHeaders,
        avgSpo2Array.map(v => v != null ? `${v.toFixed(1)} ${t('units.percent')}` : t('defaults.noData')),
        avgHrArray.map(v => v != null ? `${v.toFixed(0)} ${t('units.ppm')}` : t('defaults.noData')),
      ];
      const wsAverage = XLSX.utils.aoa_to_sheet(averageSheet);
      XLSX.utils.book_append_sheet(wb, wsAverage, t('tableTitles.averageValues'));
    }

    // --- PERIODIC VALUES ---
    if (selectedTables.periodic) {
      const periodicHeaders = [
        t('tableHeaders.periodic.min1'),
        t('tableHeaders.periodic.min2'),
        t('tableHeaders.periodic.min3'),
        t('tableHeaders.periodic.min4'),
        t('tableHeaders.periodic.min5'),
        t('tableHeaders.periodic.min6')
      ];
      const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
      const lastSpo2Array = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let lastPoint = null;
        subset.forEach(current => {
          if (!lastPoint || current.t > lastPoint.t) {
            lastPoint = current;
          }
        });
        lastSpo2Array.push(lastPoint ? lastPoint.s : null);
      }
      const lastHrArray = [];
      for (let min = 1; min <= 6; min++) {
        const start = (min - 1) * 60;
        const end = min * 60;
        const subset = dataP1.filter(d => d.t >= start && d.t < end);
        let lastPoint = null;
        subset.forEach(current => {
          if (!lastPoint || current.t > lastPoint.t) {
            lastPoint = current;
          }
        });
        lastHrArray.push(lastPoint ? lastPoint.h : null);
      }
      const periodicSheet = [
        periodicHeaders,
        lastSpo2Array.map(v => v != null ? `${v} ${t('units.percent')}` : t('defaults.noData')),
        lastHrArray.map(v => v != null ? `${v} ${t('units.ppm')}` : t('defaults.noData')),
      ];
      const wsPeriodic = XLSX.utils.aoa_to_sheet(periodicSheet);
      XLSX.utils.book_append_sheet(wb, wsPeriodic, t('tableTitles.periodicValues'));
    }

    // --- CHECKPOINTS ---
    if (selectedTables.checkpoints) {
      const cpHeaders = [
        t('tableHeaders.checkpoints.meters'),
        t('tableHeaders.checkpoints.time'),
        t('tableHeaders.checkpoints.heartRate'),
        t('tableHeaders.checkpoints.saturation')
      ];
      const cpData = [];
      (test.pascon || []).forEach(cp => {
        const coneDist = test.test?.cone_distance ?? 30;
        const totalMeters = (cp.n + 1) * coneDist;
        cpData.push([
          `${totalMeters} ${t('units.mts')}`,
          `${cp.t} "`,
          `${cp.h} ${t('units.ppm')}`,
          `${cp.s} ${t('units.percent')}`
        ]);
      });
      const checkpointsSheet = [cpHeaders, ...cpData];
      const wsCheckpoints = XLSX.utils.aoa_to_sheet(checkpointsSheet);
      XLSX.utils.book_append_sheet(wb, wsCheckpoints, t('tableTitles.checkpoints'));
    }

    XLSX.writeFile(wb, `Test_${id}_data.xlsx`);
  };

  const handleTableSelection = (tableName) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  if (loading) return <div>{t('testDetails.loading')}</div>;
  if (error) return <div>{t('testDetails.error', { message: error.message })}</div>;
  if (!test) return <div>{t('testDetails.noData')}</div>;

  // Prepare chart data
  const testData = test.data || [];
  const spoData = testData.map(item => ({ x: item.t, y: item.s }));
  const hrData = testData.map(item => ({ x: item.t, y: item.h }));
  const checkpointTimes = test.pascon.map(item => item.t);
  const checkpointSpo = test.pascon.map(item => item.s);
  const checkpointHr = test.pascon.map(item => item.h);

  const spoXValues = spoData.map(d => d.x);
  const hrXValues = hrData.map(d => d.x);
  const spo2HrXMin = (spoXValues.length || hrXValues.length) ? Math.min(...spoXValues, ...hrXValues) : 0;
  const spo2HrXMax = (spoXValues.length || hrXValues.length) ? Math.max(...spoXValues, ...hrXValues) : 10;

  const spo2HrOptions = {
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: `${t('units.time')} (s)` },
        min: spo2HrXMin,
        max: spo2HrXMax,
      },
      y: {
        title: { display: true, text: t('units.value') },
        ticks: { stepSize: 1 },
      }
    },
    hover: { mode: 'nearest', intersect: true },
    plugins: {
      tooltip: {
        mode: 'nearest',
        intersect: true,
        callbacks: {
          label: function(tooltipItem) {
            let label = tooltipItem.dataset.label || '';
            if (label) label += ': ';
            label += Math.round(tooltipItem.raw * 100) / 100;
            return label;
          }
        }
      }
    }
  };

  const cpXMin = checkpointTimes.length ? Math.min(...checkpointTimes) : 0;
  const cpXMax = checkpointTimes.length ? Math.max(...checkpointTimes) : 10;

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: `${t('units.time')} (s)` },
        min: cpXMin,
        max: cpXMax,
      },
      y: {
        title: { display: true, text: t('units.value') },
        ticks: { stepSize: 1 },
      }
    },
    hover: { mode: 'nearest', intersect: true },
    plugins: {
      tooltip: {
        mode: 'nearest',
        intersect: true,
        callbacks: {
          label: function(tooltipItem) {
            let label = tooltipItem.dataset.label || '';
            if (label) label += ': ';
            label += Math.round(tooltipItem.raw * 100) / 100;
            return label;
          }
        }
      }
    }
  };

  const spo2HrData = {
    labels: spoData.map(d => d.x),
    datasets: [
      {
        label: 'SPO₂',
        data: spoData.map(d => d.y),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        hoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      },
      {
        label: 'HR',
        data: hrData.map(d => d.y),
        borderColor: 'rgba(255,99,132,1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        hoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(255,99,132,1)',
      }
    ]
  };

  const checkpointData = {
    labels: checkpointTimes,
    datasets: [
      {
        label: t('charts.checkpoints'),
        data: checkpointSpo,
        borderColor: 'blue',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        pointRadius: 5,
      },
      {
        label: t('charts.testData'),
        data: checkpointHr,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        pointRadius: 5,
      },
    ],
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleDownloadPdf}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#00407C',
          color: '#FFFFFF',
          padding: '10px 20px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Open Sans, sans-serif',
          fontWeight: '700',
          textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
          zIndex: 9999
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {t('buttons.downloadPdf')}
      </button>

      <button
        onClick={handleDownloadExcel}
        style={{
          position: 'absolute',
          top: 40,
          right: 0,
          backgroundColor: '#83C3C2',
          color: '#FFFFFF',
          padding: '10px 20px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Open Sans, sans-serif',
          fontWeight: '700',
          textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
          zIndex: 9999
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {t('buttons.downloadExcel')}
      </button>

      <div style={{ marginTop: '80px', marginBottom: '20px' }}>
        <h2>{t('selectTables.header')}</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.checkpoint_data}
              onChange={() => handleTableSelection('checkpoint_data')}
            />{' '}
            {t('charts.checkpoints')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.test_data}
              onChange={() => handleTableSelection('test_data')}
            />{' '}
            {t('charts.testData')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.test}
              onChange={() => handleTableSelection('test')}
            />{' '}
            {t('selectTables.test')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.antropometric}
              onChange={() => handleTableSelection('antropometric')}
            />{' '}
            {t('selectTables.antropometricValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.comments}
              onChange={() => handleTableSelection('comments')}
            />{' '}
            {t('selectTables.comments')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.basal}
              onChange={() => handleTableSelection('basal')}
            />{' '}
            {t('selectTables.basalValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.final}
              onChange={() => handleTableSelection('final')}
            />{' '}
            {t('selectTables.finalValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.rest}
              onChange={() => handleTableSelection('rest')}
            />{' '}
            {t('selectTables.restValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.computed1}
              onChange={() => handleTableSelection('computed1')}
            />{' '}
            {t('selectTables.computedValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.average}
              onChange={() => handleTableSelection('average')}
            />{' '}
            {t('selectTables.averageValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.periodic}
              onChange={() => handleTableSelection('periodic')}
            />{' '}
            {t('selectTables.periodicValues')}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTables.checkpoints}
              onChange={() => handleTableSelection('checkpoints')}
            />{' '}
            {t('selectTables.checkpoints')}
          </label>
        </div>
      </div>

      {selectedTables.checkpoint_data && (
        <div ref={grafic_checkpoints} style={{ marginBottom: '30px' }}>
          <h3>{t('charts.checkpoints')}</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <Line
              data={checkpointData}
              options={{
                ...chartOptions,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      )}

      {selectedTables.test_data && (
        <div ref={grafic_data} style={{ marginBottom: '30px' }}>
          <h3>{t('charts.testData')} (SPO₂/HR)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <Line
              data={spo2HrData}
              options={{
                ...spo2HrOptions,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      )}

      <div ref={contentRef} style={{ marginTop: '30px' }}>
        {selectedTables.test && (
          <div id="test-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="5" className="table-title">
                    {t('tableTitles.test')}
                  </th>
                </tr>
                <tr>
                  <th>{t('tableHeaders.test.date')}</th>
                  <th>{t('tableHeaders.test.time')}</th>
                  <th>{t('tableHeaders.test.coneDistance')}</th>
                  <th>{t('tableHeaders.test.id')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {test.test.date
                      ? test.test.date.split('T')[0]
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.date
                      ? test.test.date.split('T')[1].split('.')[0]
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.cone_distance != null
                      ? `${test.test.cone_distance} ${t('units.mts')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.tid != null
                      ? test.test.tid
                      : t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.antropometric && (
          <div id="antropometric-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="5" className="table-title">
                    {t('tableTitles.antropometricValues')}
                  </th>
                </tr>
                <tr>
                  <th>{t('tableHeaders.antropometric.name')}</th>
                  <th>{t('tableHeaders.antropometric.gender')}</th>
                  <th>{t('tableHeaders.antropometric.age')}</th>
                  <th>{t('tableHeaders.antropometric.weightHeight')}</th>
                  <th>{t('tableHeaders.antropometric.imc')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{test.test.name ?? t('defaults.noData')}</td>
                  <td>{test.test.gender ?? t('defaults.noData')}</td>
                  <td>
                    {test.test.age != null
                      ? `${test.test.age}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.weight != null && test.test.height != null
                      ? `${test.test.weight} Kg - ${test.test.height} Cms`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.weight != null && test.test.height != null
                      ? `${(test.test.weight /
                          ((test.test.height / 100) ** 2)).toFixed(1)}`
                      : t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.comments && (
          <div id="comments-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="1" className="table-title">
                    {t('tableTitles.comments')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ whiteSpace: 'pre-line' }}>
                    {test.final.comment?.trim() || t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.basal && (
          <div id="basal-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">
                    {t('tableTitles.basalValues')}
                  </th>
                </tr>
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
                  <td>
                    {test.initial.spo != null
                      ? `${test.initial.spo} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.initial.hr != null
                      ? `${test.initial.hr} ${t('units.ppm')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.initial.hr != null && test.test.age != null
                      ? `${((test.initial.hr /
                          (220 - test.test.age)) *
                          100).toFixed(1)} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.initial.d != null
                      ? `${test.initial.d} ${t('units.borg')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.initial.f != null
                      ? `${test.initial.f} ${t('units.borg')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.test.o2 != null
                      ? `${test.test.o2} ${t('units.liters')}`
                      : t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.final && (
          <div id="final-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="3" className="table-title">
                    {t('tableTitles.finalValues')}
                  </th>
                </tr>
                <tr>
                  <th>{t('tableHeaders.final.meters')}</th>
                  <th>{t('tableHeaders.final.dyspnea')}</th>
                  <th>{t('tableHeaders.final.fatigue')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {test.final.meters != null
                      ? `${test.final.meters} ${t('units.mts')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.d != null
                      ? `${test.final.d} ${t('units.borg')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.f != null
                      ? `${test.final.f} ${t('units.borg')}`
                      : t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.rest && (
          <div id="rest-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">
                    {t('tableTitles.restValues')}
                  </th>
                </tr>
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
                  <td>
                    {test.final.half_rest_spo != null
                      ? `${test.final.half_rest_spo} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.half_rest_hr != null
                      ? `${test.final.half_rest_hr} ${t('units.ppm')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.half_rest_hr != null && test.test.age != null
                      ? `${((test.final.half_rest_hr /
                          (220 - test.test.age)) *
                          100).toFixed(1)} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.end_rest_spo != null
                      ? `${test.final.end_rest_spo} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.end_rest_hr != null
                      ? `${test.final.end_rest_hr} ${t('units.ppm')}`
                      : t('defaults.noData')}
                  </td>
                  <td>
                    {test.final.end_rest_hr != null && test.test.age != null
                      ? `${((test.final.end_rest_hr /
                          (220 - test.test.age)) *
                          100).toFixed(1)} ${t('units.percent')}`
                      : t('defaults.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedTables.computed1 && (
          <div id="computed1-table" className="formatted-table">
            <table>
              <thead>
                <tr>
                  <th colSpan="6" className="table-title">
                    {t('tableTitles.computedValues')}
                  </th>
                </tr>
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

                  const enrightD = (2.11 * height) - (2.29 * weight) - (5.78 * age) + 667;
                  let enrightPercent = 0;
                  if (enrightD > 0) {
                    enrightPercent = (actualDistance / enrightD) * 100;
                  }
                  const sixMWWork = actualDistance * weight;

                  const data6MW = (test.data || []).filter(d => d.p === 1);
                  let lowestSpo2 = 999;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number' && d.s < lowestSpo2) {
                      lowestSpo2 = d.s;
                    }
                  });
                  const dsp = lowestSpo2 < 999 ? actualDistance * (lowestSpo2 / 100) : 0;

                  let maxTestHr = 0;
                  data6MW.forEach(d => {
                    if (typeof d.h === 'number' && d.h > maxTestHr) {
                      maxTestHr = d.h;
                    }
                  });
                  let maxTestHrPercent = 0;
                  if (age < 220 && maxTestHr > 0) {
                    maxTestHrPercent = (maxTestHr / (220 - age)) * 100;
                  }

                  return (
                    <tr>
                      <td>
                        {enrightD
                          ? `${enrightD.toFixed(1)} ${t('units.mts')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {enrightPercent
                          ? `${enrightPercent.toFixed(1)} ${t('units.percent')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {sixMWWork
                          ? `${sixMWWork} ${t('units.mts')}*kg`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {dsp
                          ? `${dsp.toFixed(1)} ${t('units.mts')}/min(${t('units.percent')})`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {maxTestHr
                          ? `${maxTestHr} ${t('units.ppm')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {maxTestHrPercent
                          ? `${maxTestHrPercent.toFixed(1)} ${t('units.percent')}`
                          : t('defaults.noData')}
                      </td>
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
                  const data6MW = (test.data || []).filter(d => d.p === 1);
                  const stopsArray = test.stops || [];
                  const stopsText = stopsArray
                    .map(stop => `${stop.time}" ${t('tableHeaders.computed.stopsTime')}: ${stop.len}"`)
                    .join('\n');
                  const stopsTimeSum = stopsArray.reduce((sum, s) => sum + (s.len ?? 0), 0);

                  let sumSpo2 = 0, countSpo2 = 0;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number') {
                      sumSpo2 += d.s;
                      countSpo2++;
                    }
                  });
                  const avgSpo2 = countSpo2 ? sumSpo2 / countSpo2 : null;

                  let sumHr = 0, countHr = 0;
                  data6MW.forEach(d => {
                    if (typeof d.h === 'number') {
                      sumHr += d.h;
                      countHr++;
                    }
                  });
                  const avgHr = countHr ? sumHr / countHr : null;

                  let minSpo2 = null;
                  data6MW.forEach(d => {
                    if (typeof d.s === 'number') {
                      if (minSpo2 == null || d.s < minSpo2) {
                        minSpo2 = d.s;
                      }
                    }
                  });

                  const finalMeters = test.final.meters ?? 0;
                  const sixmwSpeed = finalMeters ? (finalMeters / 360) : 0;

                  return (
                    <tr>
                      <td style={{ whiteSpace: 'pre-line' }}>
                        {stopsText || t('defaults.noData')}
                      </td>
                      <td>
                        {stopsTimeSum
                          ? `${stopsTimeSum}"`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {avgSpo2 != null
                          ? `${avgSpo2.toFixed(1)} ${t('units.percent')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {avgHr != null
                          ? `${avgHr.toFixed(1)} ${t('units.ppm')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {minSpo2 != null
                          ? `${minSpo2} ${t('units.percent')}`
                          : t('defaults.noData')}
                      </td>
                      <td>
                        {sixmwSpeed
                          ? `${sixmwSpeed.toFixed(1)} ${t('units.mts')}/s`
                          : t('defaults.noData')}
                      </td>
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
                <tr>
                  <th colSpan="6" className="table-title">
                    {t('tableTitles.averageValues')}
                  </th>
                </tr>
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
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgSpo2Array = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let sumS = 0, countS = 0;
                      subset.forEach(sItem => {
                        if (typeof sItem.s === 'number') {
                          sumS += sItem.s;
                          countS++;
                        }
                      });
                      avgSpo2Array.push(countS ? sumS / countS : null);
                    }
                    return avgSpo2Array.map((val, idx) => (
                      <td key={`avgS-${idx}`}>
                        {val != null ? `${val.toFixed(1)} ${t('units.percent')}` : t('defaults.noData')}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const avgHrArray = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let sumH = 0, countH = 0;
                      subset.forEach(hItem => {
                        if (typeof hItem.h === 'number') {
                          sumH += hItem.h;
                          countH++;
                        }
                      });
                      avgHrArray.push(countH ? sumH / countH : null);
                    }
                    return avgHrArray.map((val, idx) => (
                      <td key={`avgH-${idx}`}>
                        {val != null ? `${val.toFixed(0)} ${t('units.ppm')}` : t('defaults.noData')}
                      </td>
                    ));
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
                <tr>
                  <th colSpan="6" className="table-title">
                    {t('tableTitles.periodicValues')}
                  </th>
                </tr>
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
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const lastSpo2Array = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let lastPoint = null;
                      subset.forEach(current => {
                        if (!lastPoint || current.t > lastPoint.t) {
                          lastPoint = current;
                        }
                      });
                      lastSpo2Array.push(lastPoint ? lastPoint.s : null);
                    }
                    return lastSpo2Array.map((val, idx) => (
                      <td key={`lastSpO2-${idx}`}>
                        {val != null ? `${val} ${t('units.percent')}` : t('defaults.noData')}
                      </td>
                    ));
                  })()}
                </tr>
                <tr>
                  {(() => {
                    const dataP1 = (test.data || []).filter(d => d.p === 1 && d.t >= 0 && d.t < 360);
                    const lastHrArray = [];
                    for (let min = 1; min <= 6; min++) {
                      const start = (min - 1) * 60;
                      const end = min * 60;
                      const subset = dataP1.filter(d => d.t >= start && d.t < end);
                      let lastPoint = null;
                      subset.forEach(current => {
                        if (!lastPoint || current.t > lastPoint.t) {
                          lastPoint = current;
                        }
                      });
                      lastHrArray.push(lastPoint ? lastPoint.h : null);
                    }
                    return lastHrArray.map((val, idx) => (
                      <td key={`lastHr-${idx}`}>
                        {val != null ? `${val} ${t('units.ppm')}` : t('defaults.noData')}
                      </td>
                    ));
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
                <tr>
                  <th colSpan="4" className="table-title">
                    {t('tableTitles.checkpoints')}
                  </th>
                </tr>
                <tr>
                  <th>{t('tableHeaders.checkpoints.meters')}</th>
                  <th>{t('tableHeaders.checkpoints.time')}</th>
                  <th>{t('tableHeaders.checkpoints.heartRate')}</th>
                  <th>{t('tableHeaders.checkpoints.saturation')}</th>
                </tr>
              </thead>
              <tbody>
                {(test.pascon || []).map((cp, idx) => {
                  const coneDist = test.test?.cone_distance ?? 30;
                  const totalMeters = (cp.n + 1) * coneDist;
                  return (
                    <tr key={idx}>
                      <td>{`${totalMeters} ${t('units.mts')}`}</td>
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
          .formatted-table {
            margin-top: 20px;
            font-family: var(--font-sans);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: var(--border-radius);
            overflow: hidden;
          }
          .table-title {
            background-color: var(--color-primary);
            color: #fff;
            font-weight: 700;
            font-size: 1.2em;
            text-transform: uppercase;
            height: 45px;
            line-height: 45px;
            padding: 0 12px;
          }
          th, td {
            padding: 12px;
            text-align: center;
          }
          th {
            background-color: var(--color-secondary);
            color: #fff;
            font-weight: 700;
            text-transform: uppercase;
          }
          td {
            background-color: #fff;
            color: var(--color-text-dark);
          }
          tr:nth-child(even) td {
            background-color: var(--color-bg-light);
          }
        `}
        </style>
      </div>
    </div>
  );
};

export default TestDetails;
