import { jsPDF } from 'jspdf';
import { Student, Meal, Assessment } from '../types';
import { storageService } from './storageService';

// --- CONFIGURAÇÃO DE DESIGN (IDV UI STYLE) ---
const THEME = {
  bg: [248, 249, 252],        // #F8F9FC
  white: [255, 255, 255],     // #FFFFFF
  primary: [42, 127, 95],     // #2A7F5F
  textMain: [30, 41, 59],     // #1E293B
  textSecondary: [71, 85, 105], // #475569
  textLight: [148, 163, 184], // #94A3B8
  shadow: [226, 232, 240],    // #E2E8F0
  divider: [241, 245, 249],   // #F1F5F9
  freeMealBg: [247, 250, 255] // #F7FAFF
};

// --- HELPER: CALCULAR IDADE ---
const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 'N/A';
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return isNaN(age) ? 'N/A' : age.toString();
};

export const generatePDF = (student: Student, assessment: Assessment, meals: Meal[]): boolean => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Critical safety check: if page dimensions are invalid, abort immediately
    if (!isFinite(pageWidth) || !isFinite(pageHeight) || pageWidth <= 0 || pageHeight <= 0) {
        console.error("Invalid page dimensions");
        return false;
    }

    const profile = storageService.getProfile();
    
    // Configurações de Layout
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 20;

    // --- SAFETY WRAPPERS ---
    
    const safeText = (text: string | string[] | number | undefined | null, x: number, y: number, options?: any) => {
        if (!isFinite(x) || !isFinite(y)) return;
        try {
            if (Array.isArray(text)) {
                doc.text(text, x, y, options);
            } else {
                const str = (text === null || text === undefined) ? '' : String(text);
                doc.text(str, x, y, options);
            }
        } catch (e) { console.warn("safeText failed", e); }
    };

    const safeRoundedRect = (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => {
         if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h) || !isFinite(rx) || !isFinite(ry)) return;
         if (w <= 0 || h <= 0) return;
         try {
            doc.roundedRect(x, y, w, h, rx, ry, style);
         } catch (e) { console.warn("safeRoundedRect failed", e); }
    };

    const safeRect = (x: number, y: number, w: number, h: number, style: string) => {
        if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) return;
        if (w <= 0 || h <= 0) return;
        try {
            doc.rect(x, y, w, h, style);
        } catch (e) { console.warn("safeRect failed", e); }
    };

    const safeCircle = (x: number, y: number, r: number, style: string) => {
        if (!isFinite(x) || !isFinite(y) || !isFinite(r) || r < 0) return;
        try {
            doc.circle(x, y, r, style);
        } catch (e) { console.warn("safeCircle failed", e); }
    };

    const safeLine = (x1: number, y1: number, x2: number, y2: number) => {
        if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) return;
        try {
            doc.line(x1, y1, x2, y2);
        } catch (e) { console.warn("safeLine failed", e); }
    };

    const safeAddImage = (imageData: string, format: string, x: number, y: number, w: number, h: number) => {
        if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) return;
        if (w <= 0 || h <= 0) return;
        try {
            doc.addImage(imageData, format, x, y, w, h);
        } catch (e) { console.warn("safeAddImage failed", e); }
    };

    const safeSetFillColor = (c: number[]) => {
        if (c && c.length === 3 && isFinite(c[0]) && isFinite(c[1]) && isFinite(c[2])) {
            doc.setFillColor(c[0], c[1], c[2]);
        }
    };

    const safeSetTextColor = (c: number[]) => {
        if (c && c.length === 3 && isFinite(c[0]) && isFinite(c[1]) && isFinite(c[2])) {
            doc.setTextColor(c[0], c[1], c[2]);
        }
    };
    
    const safeSetDrawColor = (r: number, g: number, b: number) => {
        if (isFinite(r) && isFinite(g) && isFinite(b)) {
            doc.setDrawColor(r, g, b);
        }
    };

    const safeSplitText = (text: string, maxWidth: number): string[] => {
        if (!text) return [];
        if (!isFinite(maxWidth) || maxWidth <= 0) return [text];
        try {
            return doc.splitTextToSize(text, maxWidth);
        } catch (e) {
            return [text]; // Fallback
        }
    };

    const addY = (val: number) => {
        if (isFinite(val)) currentY += val;
    };

    // --- DRAWING FUNCTIONS ---

    const drawCard = (y: number, height: number, fillColor: number[] = THEME.white, withShadow: boolean = true) => {
        if (!isFinite(y) || !isFinite(height) || height <= 0) return;

        if (withShadow) {
            safeSetFillColor(THEME.shadow);
            safeRoundedRect(margin + 1, y + 2, contentWidth, height, 8, 8, 'F'); 
        }
        safeSetFillColor(fillColor);
        safeSetDrawColor(240, 240, 240);
        safeRoundedRect(margin, y, contentWidth, height, 6, 6, 'FD'); 
    };

    let pageNumber = 1;
    const drawFooter = (pageNum: number) => {
        const footerY = pageHeight - 15;
        safeSetDrawColor(THEME.divider[0], THEME.divider[1], THEME.divider[2]);
        safeLine(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        doc.setFontSize(8);
        doc.setTextColor(154, 154, 154);
        doc.setFont("helvetica", "normal");
        
        const footerText = profile?.name ? `Plano gerado por ${profile.name}` : 'Nutfy';
        safeText(footerText, margin, footerY);
        safeText(`Página ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
    };

    const checkPageBreak = (heightNeeded: number) => {
        const h = isFinite(heightNeeded) ? heightNeeded : 0;
        if (currentY + h > pageHeight - margin) {
            drawFooter(pageNumber);
            doc.addPage();
            safeSetFillColor(THEME.bg);
            safeRect(0, 0, pageWidth, pageHeight, 'F');
            currentY = 20;
            pageNumber++;
            return true;
        }
        return false;
    };

    // --- RENDER EXECUTION ---

    // 1. Background
    safeSetFillColor(THEME.bg);
    safeRect(0, 0, pageWidth, pageHeight, 'F');

    // 2. Header
    const headerHeight = 50;
    drawCard(currentY, headerHeight);

    // Logo
    if (profile && profile.logoUrl) {
        try {
            const imgProps = doc.getImageProperties(profile.logoUrl);
            const ratio = (imgProps.height && imgProps.height > 0) ? (imgProps.width / imgProps.height) : 1;
            const logoH = 24;
            const logoW = logoH * ratio;
            
            if (isFinite(logoW) && isFinite(logoH)) {
                safeAddImage(profile.logoUrl, 'PNG', margin + 10, currentY + 13, logoW, logoH);
            } else {
                throw new Error("Invalid logo dimensions");
            }
        } catch (e) { 
            safeSetFillColor(THEME.primary);
            safeCircle(margin + 22, currentY + 25, 12, 'F');
        }
    } else {
        safeSetFillColor(THEME.primary);
        safeCircle(margin + 22, currentY + 25, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        safeText(profile?.name?.[0] || "N", margin + 22, currentY + 30, { align: 'center' });
    }

    // Professional Info
    const textX = margin + 50; 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    safeSetTextColor(THEME.textMain);
    safeText(profile?.name || "Nutricionista", textX, currentY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    safeSetTextColor(THEME.textSecondary);
    let subInfoY = currentY + 26;
    if (profile?.registration) {
        safeText(profile.registration, textX, subInfoY);
        subInfoY += 5;
    }
    
    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    safeSetTextColor(THEME.primary);
    safeText("PLANO ALIMENTAR", pageWidth - margin - 10, currentY + 20, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    safeSetTextColor(THEME.textLight);
    safeText(`Criado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 10, currentY + 26, { align: 'right' });

    addY(headerHeight + 10);

    // 3. Patient Info
    const patientInfoHeight = 45;
    drawCard(currentY, patientInfoHeight);

    const labelsY = currentY + 15;
    const valuesY = currentY + 25;
    const colWidth = contentWidth / 4;

    const drawPatientMetric = (label: string, value: string, colIndex: number) => {
        const x = margin + (colWidth * colIndex) + (colWidth / 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        safeSetTextColor(THEME.textLight);
        safeText(label.toUpperCase(), x, labelsY, { align: 'center' });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        safeSetTextColor(THEME.textMain);
        const safeValue = (value === undefined || value === null) ? '-' : String(value);
        safeText(safeValue, x, valuesY, { align: 'center' });
    };

    drawPatientMetric("Paciente", student.name.split(' ')[0], 0);
    drawPatientMetric("Idade", `${calculateAge(student.birthDate)} anos`, 1);
    drawPatientMetric("Peso Atual", `${assessment.weight} kg`, 2);
    drawPatientMetric("Objetivo", student.anamnesis?.objective || assessment.objective || "Saúde", 3);

    addY(patientInfoHeight + 10);

    // 4. Nutritional Summary
    const totalCalories = meals
        .filter(m => m.type === 'normal')
        .reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
    const calorieGoal = Number(assessment.calorieGoal) || 0;

    const summaryHeight = 40;
    drawCard(currentY, summaryHeight);
    
    safeSetDrawColor(THEME.divider[0], THEME.divider[1], THEME.divider[2]);
    safeLine(pageWidth / 2, currentY + 5, pageWidth / 2, currentY + summaryHeight - 5);

    // Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    safeSetTextColor(THEME.textSecondary);
    safeText("Meta Diária Calculada", margin + 20, currentY + 15);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    safeSetTextColor(THEME.primary);
    safeText(`${calorieGoal} kcal`, margin + 20, currentY + 28);

    // Planned
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    safeSetTextColor(THEME.textSecondary);
    safeText("Total Planejado", (pageWidth / 2) + 20, currentY + 15);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const diff = totalCalories - calorieGoal;
    if (diff > 200) doc.setTextColor(239, 68, 68);
    else if (diff < -200) doc.setTextColor(245, 158, 11);
    else safeSetTextColor(THEME.textMain);
    
    safeText(`${totalCalories} kcal`, (pageWidth / 2) + 20, currentY + 28);

    addY(summaryHeight + 15);

    // 5. Meals
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    safeSetTextColor(THEME.textMain);
    safeText("ROTEIRO ALIMENTAR", margin + 2, currentY);
    addY(8);

    meals.forEach((meal) => {
        let foodsHeight = 0;
        let foodLines: any[] = []; 

        if (meal.foods && meal.foods.length > 0) {
            meal.foods.forEach(f => {
                const line1 = `${f.quantity} ${f.name}`;
                const line2 = f.substitutions ? `Substituição: ${f.substitutions}` : '';
                foodLines.push({ l1: line1, l2: line2, cal: f.calories });
                foodsHeight += line2 ? 14 : 10; 
                foodsHeight += 4; 
            });
        } else {
             const descLines = safeSplitText(meal.description || '', contentWidth - 40);
             foodsHeight = (descLines.length * 5) + 10;
        }
        
        let descExtraHeight = 0;
        let descExtraLines: string[] = [];
        if (meal.description && meal.foods && meal.foods.length > 0) {
            descExtraLines = safeSplitText(`Obs: ${meal.description}`, contentWidth - 40);
            descExtraHeight = (descExtraLines.length * 5) + 10;
        }

        const cardHeaderHeight = 25; 
        const cardTotalHeight = cardHeaderHeight + foodsHeight + descExtraHeight + 10;

        checkPageBreak(cardTotalHeight + 10);

        const isFree = meal.type === 'free';
        drawCard(currentY, cardTotalHeight, isFree ? THEME.freeMealBg : THEME.white);

        safeSetFillColor(isFree ? [219, 234, 254] : [236, 253, 245]); 
        safeRoundedRect(margin + 10, currentY + 8, 30, 8, 2, 2, 'F'); 
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        if (isFree) doc.setTextColor(37, 99, 235);
        else doc.setTextColor(5, 150, 105);
        
        safeText(meal.time || '--:--', margin + 25, currentY + 13.5, { align: 'center' });

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        safeSetTextColor(THEME.textMain);
        safeText(meal.name + (isFree ? " (Livre)" : ""), margin + 45, currentY + 14);

        if (!isFree) {
            doc.setFontSize(10);
            safeSetTextColor(THEME.textLight);
            safeText(`${meal.calories} kcal`, pageWidth - margin - 15, currentY + 14, { align: 'right' });
        }

        safeSetDrawColor(THEME.divider[0], THEME.divider[1], THEME.divider[2]);
        safeLine(margin + 10, currentY + 22, pageWidth - margin - 10, currentY + 22);

        let itemY = currentY + 32;

        if (meal.foods && meal.foods.length > 0) {
            foodLines.forEach((item, idx) => {
                safeSetFillColor(THEME.primary);
                safeCircle(margin + 15, itemY - 1, 1.5, 'F');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                safeSetTextColor(THEME.textMain);
                safeText(String(item.l1), margin + 22, itemY);

                if (!isFree && Number(item.cal) > 0) {
                     doc.setFont("helvetica", "normal");
                     doc.setFontSize(8);
                     safeSetTextColor(THEME.textLight);
                     safeText(`~${item.cal} kcal`, pageWidth - margin - 15, itemY, { align: 'right' });
                }

                if (item.l2) {
                    itemY += 5;
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(9);
                    safeSetTextColor(THEME.textSecondary);
                    safeText(String(item.l2), margin + 22, itemY);
                    itemY += 4; 
                } else {
                    itemY += 4; 
                }
                
                if (idx < foodLines.length - 1) {
                    itemY += 4;
                    safeSetDrawColor(248, 250, 252);
                    safeLine(margin + 22, itemY - 4, pageWidth - margin - 22, itemY - 4);
                } else {
                    itemY += 4;
                }
            });
        } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            safeSetTextColor(THEME.textSecondary);
            const lines = safeSplitText(meal.description || "Nenhuma informação adicional.", contentWidth - 40);
            safeText(lines, margin + 15, itemY);
        }

        if (descExtraLines.length > 0) {
             const noteHeight = (descExtraLines.length * 5) + 6;
             safeSetFillColor([248, 250, 252]);
             safeRoundedRect(margin + 10, currentY + cardTotalHeight - noteHeight - 5, contentWidth - 20, noteHeight, 4, 4, 'F'); 
             
             doc.setFont("helvetica", "normal");
             doc.setFontSize(8);
             safeSetTextColor(THEME.textSecondary);
             safeText(descExtraLines, margin + 15, currentY + cardTotalHeight - noteHeight);
        }

        addY(cardTotalHeight + 10);
    });

    // 6. Notes
    if (student.anamnesis?.generalNotes || assessment.notes) {
        const notes = student.anamnesis?.generalNotes || assessment.notes || "";
        if (notes) {
            const noteLines = safeSplitText(notes, contentWidth - 30);
            const notesHeight = (noteLines.length * 6) + 30;
            
            checkPageBreak(notesHeight);
            drawCard(currentY, notesHeight);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            safeSetTextColor(THEME.textMain);
            safeText("OBSERVAÇÕES DO NUTRICIONISTA", margin + 15, currentY + 15);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            safeSetTextColor(THEME.textSecondary);
            safeText(noteLines, margin + 15, currentY + 25);
        }
    }

    drawFooter(pageNumber);

    const dateStr = new Date(assessment.date).toISOString().split('T')[0];
    const safeName = student.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    doc.save(`Plano-${safeName}-${dateStr}.pdf`);
    
    return true;

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return false;
  }
};