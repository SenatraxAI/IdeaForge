import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToMarkdown = (idea: any) => {
    if (!idea) return;

    let content = `# ${idea.title || 'Untitled Idea'}\n\n`;
    content += `**Score:** ${idea.score || 0}/100\n`;
    content += `**Status:** ${idea.status || 'Draft'}\n\n`;

    content += `## Core Specification\n`;
    content += `### The Problem\n${idea.forgeSpec?.problem || 'N/A'}\n\n`;
    content += `### The Solution\n${idea.forgeSpec?.solution || 'N/A'}\n\n`;
    content += `### Target Audience\n${idea.forgeSpec?.targetAudience || 'N/A'}\n\n`;
    content += `### Revenue Model\n${idea.forgeSpec?.revenueModel || 'N/A'}\n\n`;

    if (idea.deepDive) {
        content += `## Investor Deep Dive\n`;
        content += `### Executive Summary\n${idea.deepDive.executiveSummary || 'N/A'}\n\n`;

        if (idea.deepDive.problemAnalysis) {
            content += `### Problem Analysis\n`;
            content += `- **Statement:** ${idea.deepDive.problemAnalysis.statement}\n`;
            content += `- **Evidence:** ${idea.deepDive.problemAnalysis.evidence}\n`;
            content += `- **Urgency:** ${idea.deepDive.problemAnalysis.urgency}\n\n`;
        }

        if (idea.deepDive.solutionArchitecture) {
            content += `### Solution Architecture\n`;
            content += `- **Value Prop:** ${idea.deepDive.solutionArchitecture.valueProposition}\n`;
            content += `- **Features:** ${(idea.deepDive.solutionArchitecture.keyFeatures || []).join(', ')}\n`;
            content += `- **Technical:** ${idea.deepDive.solutionArchitecture.technicalApproach}\n\n`;
        }
    }

    if (idea.roadmap) {
        content += `## Evolution Roadmap\n`;
        idea.roadmap.forEach((item: any, i: number) => {
            content += `### Phase ${i + 1}: ${item.phase}\n`;
            content += `- **Objective:** ${item.task}\n`;
            if (item.details) content += `- **Details:** ${item.details}\n`;
            content += `\n`;
        });
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(idea.title || 'Idea').replace(/\s+/g, '_')}_Spec.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create a temporary clone for PDF generation to handle styling
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Force light background for print
        onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById(elementId);
            if (el) {
                // Remove dark mode classes from root and element to ensure light mode rendering
                clonedDoc.documentElement.classList.remove('dark');
                clonedDoc.documentElement.classList.add('light');
                el.classList.remove('dark');

                // FORCE EXPLICIT STYLES for the export container
                el.style.backgroundColor = '#ffffff';
                el.style.color = '#000000';
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.display = 'block';
                el.style.width = '1200px';

                // Add a style tag to the cloned document to override all dark: classes, force text color, AND force opacity
                const style = clonedDoc.createElement('style');
                style.innerHTML = `
                    #${elementId} {
                        background-color: white !important;
                        color: black !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                    }
                    /* Force visibility on all common animated containers */
                    #${elementId} div, #${elementId} section, #${elementId} p, #${elementId} span, #${elementId} h1, #${elementId} h2, #${elementId} h3, #${elementId} li {
                        opacity: 1 !important;
                        visibility: visible !important;
                        transform: none !important;
                        color: black !important;
                        fill: black !important;
                    }
                    /* Hide UI elements that don't belong in a report */
                    button, .lucide, [title*="Discuss"], [title*="Refine"], .flex.items-center.gap-2 button {
                        display: none !important;
                    }
                    /* Specifically target Tailwind dark mode text and backgrounds to be high contrast */
                    .dark\\:text-white, .dark\\:text-slate-400, .dark\\:text-slate-300, .dark\\:text-slate-100 {
                        color: black !important;
                    }
                    .dark\\:bg-white\\/5, .dark\\:bg-\\[\\#0a0c10\\], .dark\\:bg-\\[\\#0f172a\\]\\/40 {
                        background-color: transparent !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    /* High contrast for the numbered circles */
                    .w-12.h-12.bg-purple-600, .w-12.h-12.bg-emerald-600, .w-12.h-12.bg-cyan-600, .w-12.h-12.bg-orange-600, .w-12.h-12.bg-red-600, .w-12.h-12.bg-indigo-600 {
                        background-color: #334155 !important; /* slate-700 */
                        color: white !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .bg-purple-50, .bg-emerald-50, .bg-cyan-50, .bg-orange-50, .bg-red-50, .bg-indigo-50 {
                        background-color: #f8fafc !important; /* slate-50 */
                    }
                    /* Ensure headers are bold and black */
                    h1, h2, h3, h4 {
                        color: black !important;
                        font-weight: 900 !important;
                    }
                    /* Roadmap Specific Fixes */
                    .group\\/roadmap, [class*="group/roadmap"] {
                        background: white !important;
                        background-image: none !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .group\\/roadmap h2, .group\\/roadmap p {
                        color: #0f172a !important;
                    }
                    /* Roadmap Nodes (Circles) */
                    .group\\/roadmap button.rounded-full {
                        background-color: #f1f5f9 !important; /* slate-100 */
                        border: 2px solid #334155 !important;
                        color: #0f172a !important;
                        box-shadow: none !important;
                    }
                    /* Roadmap Labels & Descriptions */
                    .group\\/roadmap .bg-white\\/80, 
                    .group\\/roadmap .dark\\:bg-\\[\\#0a0c10\\]\\/80,
                    .group\\/roadmap .bg-white\\/90,
                    .group\\/roadmap .dark\\:bg-\\[\\#0a0c10\\]\\/90 {
                        background-color: white !important;
                        color: black !important;
                        border: 1px solid #e2e8f0 !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                    }
                    /* Ensure ALL text in roadmap is black */
                    .group\\/roadmap * {
                        color: black !important;
                        text-shadow: none !important;
                    }
                    /* Hide the gradient pulse and background effects */
                    .group\\/roadmap .bg-blue-600\\/5,
                    .group\\/roadmap .bg-\\[radial-gradient\\] {
                        display: none !important;
                    }
                `;
                clonedDoc.head.appendChild(style);

                // Find all elements that might have been transitioned by framer-motion and force them to be visible
                const allElements = el.getElementsByTagName('*');
                for (let i = 0; i < allElements.length; i++) {
                    const node = allElements[i] as HTMLElement;
                    if (node.style) {
                        node.style.opacity = '1';
                        node.style.visibility = 'visible';
                        node.style.transform = 'none';
                    }
                }
            }
        }
    } as any);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Handle multi-page
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(`${filename.replace(/\s+/g, '_')}_Report.pdf`);
};
