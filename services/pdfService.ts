import { jsPDF } from 'jspdf';
import { Student, Meal, Assessment, ProfessionalProfile } from '../types';

// --- PALETA DE CORES (Idêntica ao Tailwind do App) ---
const COLORS = {
  bg: [248, 249, 252],        // #F8F9FC (Fundo da página)
  white: [255, 255, 255],     // #FFFFFF
  slate900: [15, 23, 42],     // Texto Principal
  slate600: [71, 85, 105],    // Texto Secundário
  slate400: [148, 163, 184],  // Texto Terciário / Labels
  slate200: [226, 232, 240],  // Bordas
  slate100: [241, 245, 249],  // Fundos leves
  emerald500: [16, 185, 129], // Destaque Principal
  emerald50: [236, 253, 245], // Fundo Destaque
  blue500: [59, 130, 246],    // Refeição Livre
  blue50: [239, 246, 255],    // Fundo Refeição Livre
  purple500: [139, 92, 246],  // Acentos roxos
  divider: [241, 245, 249]
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

export const generatePDF = (student: Student, assessment: Assessment, meals: Meal[], profile: ProfessionalProfile | null): boolean => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Margens e Layout
    const margin = 14; // Margem lateral menor para aproveitar espaço
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 14;

    // --- FUNÇÕES AUXILIARES DE DESENHO ---

    const setFill = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
    const setText = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
    const setDraw = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);

    const drawCard = (x: number, y: number, w: number, h: number, color: number[] = COLORS.white) => {
        // Sombra suave simulada (apenas uma borda inferior direita mais grossa cinza claro)
        setFill([235, 238, 245]); // Sombra
        doc.roundedRect(x + 0.5, y + 0.5, w, h, 3, 3, 'F');
        
        // Cartão principal
        setFill(color);
        setDraw(COLORS.slate200);
        doc.setLineWidth(0.1);
        doc.roundedRect(x, y, w, h, 3, 3, 'FD'); // Fill and Draw
    };

    const drawBadge = (text: string, x: number, y: number, bg: number[], textCol: number[]) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const w = doc.getTextWidth(text) + 6;
        const h = 6;
        
        setFill(bg);
        doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
        
        setText(textCol);
        doc.text(text, x + 3, y + 4.2);
        return w; // Retorna largura para posicionamento relativo
    };

    const checkPageBreak = (heightNeeded: number) => {
        if (currentY + heightNeeded > pageHeight - margin) {
            drawFooter();
            doc.addPage();
            // Redesenha fundo
            setFill(COLORS.bg);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            currentY = margin;
            return true;
        }
        return false;
    };

    const drawFooter = () => {
        const footerY = pageHeight - 8;
        doc.setFontSize(8);
        setText(COLORS.slate400);
        doc.setFont("helvetica", "normal");
        const text = profile?.name ? `Plano elaborado por ${profile.name}` : 'Nutfy - Planejamento Nutricional';
        doc.text(text, margin, footerY);
        doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });
    };

    // --- INÍCIO DA RENDERIZAÇÃO ---

    // 1. Fundo da Página (Cinza muito claro #F8F9FC)
    setFill(COLORS.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // 2. Cabeçalho (Card Branco)
    const headerH = 40;
    drawCard(margin, currentY, contentWidth, headerH);

    // Logo (Círculo ou Imagem)
    if (profile && profile.logoUrl) {
        try {
            // Logo reduzida para 20x20 e centralizada verticalmente no header (y+10)
            doc.addImage(profile.logoUrl, 'PNG', margin + 5, currentY + 10, 20, 20);
        } catch (e) {
            // Fallback se imagem falhar (Círculo menor)
            setFill(COLORS.slate100);
            doc.circle(margin + 15, currentY + 20, 10, 'F');
        }
    } else {
        // Fallback sem logo (Círculo menor)
        setFill(COLORS.emerald500);
        doc.circle(margin + 15, currentY + 20, 10, 'F');
        setText(COLORS.white);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(profile?.name?.[0] || "N", margin + 15, currentY + 24, { align: 'center' });
    }

    // Texto do Profissional
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setText(COLORS.slate900);
    // Ajustado X para +35 já que a logo é menor
    doc.text(profile?.name || "Nutricionista", margin + 35, currentY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(COLORS.slate600);
    let subY = currentY + 20;
    if (profile?.title) {
        doc.text(profile.title, margin + 35, subY);
        subY += 4;
    }
    if (profile?.registration) {
        doc.text(profile.registration, margin + 35, subY);
    }

    // Título do Documento (Direita)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText(COLORS.slate600); // Alterado para cor neutra escura
    doc.text("PLANO ALIMENTAR PERSONALIZADO", pageWidth - margin - 5, currentY + 15, { align: 'right' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(COLORS.slate400);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 5, currentY + 21, { align: 'right' });

    currentY += headerH + 6;

    // 3. Resumo do Paciente e Metas (Card Branco)
    const patientH = 35;
    drawCard(margin, currentY, contentWidth, patientH);

    const colW = contentWidth / 4;
    const labelsY = currentY + 10;
    const valuesY = currentY + 22;

    const drawStat = (label: string, value: string, col: number) => {
        const x = margin + (col * colW) + (colW / 2);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        setText(COLORS.slate400);
        doc.text(label.toUpperCase(), x, labelsY, { align: 'center' });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        setText(COLORS.slate900);
        doc.text(value, x, valuesY, { align: 'center' });
    };

    drawStat("Paciente", student.name.split(' ')[0], 0);
    drawStat("Peso Atual", `${assessment.weight} kg`, 1);
    drawStat("Meta Diária", `${assessment.calorieGoal} kcal`, 2);
    
    // Objetivo (pode ser longo, truncar se precisar)
    const obj = student.anamnesis?.objective || assessment.objective || "Saúde";
    drawStat("Objetivo", obj.length > 15 ? obj.substring(0, 15) + '...' : obj, 3);
    
    // Divisores Verticais
    setDraw(COLORS.slate100);
    doc.setLineWidth(0.2);
    doc.line(margin + colW, currentY + 8, margin + colW, currentY + patientH - 8);
    doc.line(margin + (colW*2), currentY + 8, margin + (colW*2), currentY + patientH - 8);
    doc.line(margin + (colW*3), currentY + 8, margin + (colW*3), currentY + patientH - 8);

    currentY += patientH + 10;

    // 4. Lista de Refeições
    // Título da Seção
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setText(COLORS.slate900);
    doc.text("Roteiro Diário", margin + 2, currentY);
    currentY += 6;

    meals.forEach((meal, index) => {
        // Calcular altura necessária
        let contentH = 0;
        const foodLines: any[] = [];
        
        // Processar alimentos para saber altura
        if (meal.foods && meal.foods.length > 0) {
            meal.foods.forEach(f => {
                const line1 = `${f.quantity} ${f.name}`;
                // Quebra texto se muito longo
                const splitL1 = doc.splitTextToSize(line1, contentWidth - 40);
                
                const line2 = f.substitutions ? `Opção: ${f.substitutions}` : '';
                const splitL2 = line2 ? doc.splitTextToSize(line2, contentWidth - 40) : [];
                
                foodLines.push({ l1: splitL1, l2: splitL2, cal: f.calories });
                
                contentH += (splitL1.length * 5) + 2; // Altura linha 1
                if (splitL2.length > 0) contentH += (splitL2.length * 4) + 2; // Altura linha 2
                contentH += 3; // Espaçamento entre itens
            });
        } else {
             // Descrição livre
             const desc = meal.description || "Sem descrição.";
             const splitDesc = doc.splitTextToSize(desc, contentWidth - 20);
             foodLines.push({ l1: splitDesc, isDesc: true });
             contentH += (splitDesc.length * 5) + 5;
        }

        const cardHeaderH = 14;
        const cardPadding = 10;
        const totalCardH = cardHeaderH + contentH + cardPadding + 5; // +5 folga

        checkPageBreak(totalCardH + 5);

        const isFree = meal.type === 'free';
        
        // Desenha Cartão da Refeição
        // Se for livre, fundo azul bem claro, senão branco
        drawCard(margin, currentY, contentWidth, totalCardH, isFree ? COLORS.blue50 : COLORS.white);

        // Header do Cartão
        const headerY = currentY + 9;
        
        // Badge de Horário
        const timeW = drawBadge(meal.time, margin + 5, currentY + 4, isFree ? COLORS.white : COLORS.slate100, COLORS.slate600);

        // Nome da Refeição
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        setText(COLORS.slate900);
        doc.text(meal.name + (isFree ? " (Livre)" : ""), margin + 5 + timeW + 4, headerY);

        // Total Calorias (Direita)
        if (!isFree) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            setText(COLORS.emerald500);
            doc.text(`${meal.calories} kcal`, pageWidth - margin - 8, headerY, { align: 'right' });
        }

        // Linha Divisória Fina
        setDraw(isFree ? [219, 234, 254] : COLORS.slate100);
        doc.setLineWidth(0.1);
        doc.line(margin + 5, currentY + 13, pageWidth - margin - 5, currentY + 13);

        // Renderizar Alimentos
        let itemY = currentY + 20;

        foodLines.forEach((item) => {
            if (item.isDesc) {
                // Descrição texto corrido
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                setText(COLORS.slate600);
                doc.text(item.l1, margin + 8, itemY);
                itemY += (item.l1.length * 5);
            } else {
                // Bullet point customizado
                setFill(COLORS.emerald500);
                doc.circle(margin + 8, itemY - 1.5, 1, 'F');

                // Nome Alimento + Qtd
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                setText(COLORS.slate900);
                doc.text(item.l1, margin + 12, itemY);
                
                const h1 = item.l1.length * 5;
                
                // Opção / Substituição
                if (item.l2 && item.l2.length > 0) {
                    const subY = itemY + h1 - 1; // Pequeno ajuste
                    doc.setFont("helvetica", "italic"); // Italic para substituição
                    doc.setFontSize(8);
                    setText(COLORS.slate600);
                    // Icone visual "flecha" ou texto
                    doc.text(item.l2, margin + 12, subY);
                    itemY += h1 + (item.l2.length * 4) + 2; 
                } else {
                    itemY += h1 + 2;
                }
            }
        });

        currentY += totalCardH + 4; // Margem para o próximo cartão
    });

    // 5. Observações Finais (Se houver)
    const notes = student.anamnesis?.generalNotes || assessment.notes || "";
    if (notes) {
        const noteTitleH = 10;
        const splitNotes = doc.splitTextToSize(notes, contentWidth - 20);
        const noteContentH = splitNotes.length * 5;
        const totalNoteH = noteTitleH + noteContentH + 15;

        checkPageBreak(totalNoteH);
        
        drawCard(margin, currentY, contentWidth, totalNoteH, COLORS.white);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        setText(COLORS.slate900);
        doc.text("Observações Gerais", margin + 8, currentY + 10);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setText(COLORS.slate600);
        doc.text(splitNotes, margin + 8, currentY + 18);
    }

    drawFooter();

    // Salvar
    const dateStr = new Date(assessment.date).toISOString().split('T')[0];
    const safeName = student.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    doc.save(`Plano-${safeName}-${dateStr}.pdf`);
    
    return true;

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return false;
  }
};