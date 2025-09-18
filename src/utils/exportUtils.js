import { format } from 'date-fns';

// CSV Export Utilities
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export Utilities (using jsPDF)
export const exportToPDF = async (reportsData, filename = 'reports') => {
  try {
    // Check if jsPDF is available
    let jsPDF;
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.jsPDF;
    } catch (importError) {
      console.warn('jsPDF not available, falling back to browser print');
      return exportToPDFFallback(reportsData, filename);
    }
    
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth = pageWidth - 40) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 7);
    };
    
    // Helper function to add a new page if needed
    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Business Reports', 20, yPosition);
    
    // Date and time
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 20, yPosition + 10);
    
    yPosition += 20;
    
    // Executive KPIs Section
    if (reportsData.executiveKPIs?.kpis) {
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Executive KPIs', 20, yPosition);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const kpis = reportsData.executiveKPIs.kpis;
      const kpiData = [
        ['Metric', 'Value', 'Change', 'Trend'],
        ['Bookings', kpis.bookings.value, `${kpis.bookings.change}% ${kpis.bookings.period}`, kpis.bookings.trend],
        ['Revenue', `$${kpis.revenue.value.toLocaleString()}`, `${kpis.revenue.change}% ${kpis.revenue.period}`, kpis.revenue.trend],
        ['Utilisation', `${kpis.utilisation.value}%`, `${kpis.utilisation.change} pp ${kpis.utilisation.period}`, kpis.utilisation.trend],
        ['Deposit Conversion', `${kpis.depositConversion.value}%`, `${kpis.depositConversion.change}% ${kpis.depositConversion.period}`, kpis.depositConversion.trend],
        ['On-time Payments', `${kpis.onTimePayments.value}%`, `${kpis.onTimePayments.change}% ${kpis.onTimePayments.period}`, kpis.onTimePayments.trend],
        ['Cancellation Rate', `${kpis.cancellationRate.value}%`, `${kpis.cancellationRate.change}% ${kpis.cancellationRate.period}`, kpis.cancellationRate.trend]
      ];
      
      // Add table
      doc.autoTable({
        head: [kpiData[0]],
        body: kpiData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 9 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    // Historical Data Section
    if (reportsData.historicalData?.historicalData) {
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Historical Performance', 20, yPosition);
      
      const historicalData = reportsData.historicalData.historicalData;
      const historicalTableData = [
        ['Month', 'Bookings', 'Revenue (AUD)'],
        ...historicalData.map(item => [
          item.month,
          item.bookings.toString(),
          `$${item.revenue.toLocaleString()}`
        ])
      ];
      
      doc.autoTable({
        head: [historicalTableData[0]],
        body: historicalTableData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 9 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    // Pipeline Data Section
    if (reportsData.pipelineData?.pipelineData) {
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Upcoming Pipeline', 20, yPosition);
      
      const pipelineData = reportsData.pipelineData.pipelineData;
      const pipelineTableData = [
        ['Month', 'Bookings', 'Revenue (AUD)'],
        ...pipelineData.map(item => [
          item.month,
          item.bookings.toString(),
          `$${item.revenue.toLocaleString()}`
        ])
      ];
      
      doc.autoTable({
        head: [pipelineTableData[0]],
        body: pipelineTableData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 9 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }
    
    // Payment Analysis Section
    if (reportsData.paymentAnalysis?.paymentData) {
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Payment Analysis', 20, yPosition);
      
      const paymentData = reportsData.paymentAnalysis.paymentData;
      
      // Payment timeliness
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Payment Timeliness', 20, yPosition);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition = addText(`On-time: ${paymentData.onTime}%`, 20, yPosition);
      yPosition = addText(`Overdue: ${paymentData.overdue}%`, 20, yPosition);
      
      yPosition += 10;
      
      // Payment aging
      if (paymentData.aging) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        yPosition = addText('Payment Aging', 20, yPosition);
        
        const agingTableData = [
          ['Age Bucket', 'Count', 'Amount (AUD)'],
          ...paymentData.aging.map(item => [
            item.bucket,
            item.count.toString(),
            `$${item.amount.toLocaleString()}`
          ])
        ];
        
        doc.autoTable({
          head: [agingTableData[0]],
          body: agingTableData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] },
          styles: { fontSize: 9 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;
      }
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages} - Generated by BMS Pro`,
        pageWidth - 60,
        pageHeight - 10
      );
    }
    
    // Try to import autoTable if available
    try {
      const autoTable = (await import('jspdf-autotable')).default;
      // Use autoTable for better table formatting if available
    } catch (autoTableError) {
      console.warn('jspdf-autotable not available, using basic table formatting');
    }
    
    // Save the PDF
    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

// Fallback PDF export using browser print functionality
export const exportToPDFFallback = (reportsData, filename = 'reports') => {
  try {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Business Reports - ${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-label { font-weight: bold; color: #666; }
            .metric-value { font-size: 1.2em; color: #333; }
            .trend-up { color: #10b981; }
            .trend-down { color: #ef4444; }
            .trend-neutral { color: #6b7280; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Business Reports</h1>
          <p><strong>Generated:</strong> ${timestamp}</p>
          
          ${reportsData.executiveKPIs?.kpis ? `
            <h2>Executive KPIs</h2>
            <div>
              <div class="metric">
                <div class="metric-label">Bookings</div>
                <div class="metric-value">${reportsData.executiveKPIs.kpis.bookings.value}</div>
                <div class="trend-${reportsData.executiveKPIs.kpis.bookings.trend}">
                  ${reportsData.executiveKPIs.kpis.bookings.change > 0 ? '+' : ''}${reportsData.executiveKPIs.kpis.bookings.change}% ${reportsData.executiveKPIs.kpis.bookings.period}
                </div>
              </div>
              <div class="metric">
                <div class="metric-label">Revenue</div>
                <div class="metric-value">$${reportsData.executiveKPIs.kpis.revenue.value.toLocaleString()} AUD</div>
                <div class="trend-${reportsData.executiveKPIs.kpis.revenue.trend}">
                  ${reportsData.executiveKPIs.kpis.revenue.change > 0 ? '+' : ''}${reportsData.executiveKPIs.kpis.revenue.change}% ${reportsData.executiveKPIs.kpis.revenue.period}
                </div>
              </div>
              <div class="metric">
                <div class="metric-label">Utilisation</div>
                <div class="metric-value">${reportsData.executiveKPIs.kpis.utilisation.value}%</div>
                <div class="trend-${reportsData.executiveKPIs.kpis.utilisation.trend}">
                  ${reportsData.executiveKPIs.kpis.utilisation.change > 0 ? '+' : ''}${reportsData.executiveKPIs.kpis.utilisation.change} pp ${reportsData.executiveKPIs.kpis.utilisation.period}
                </div>
              </div>
            </div>
          ` : ''}
          
          ${reportsData.historicalData?.historicalData ? `
            <h2>Historical Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue (AUD)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData.historicalData.historicalData.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td>${item.bookings}</td>
                    <td>$${item.revenue.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          ${reportsData.pipelineData?.pipelineData ? `
            <h2>Upcoming Pipeline</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue (AUD)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData.pipelineData.pipelineData.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td>${item.bookings}</td>
                    <td>$${item.revenue.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error with fallback PDF export:', error);
    alert('PDF export not available. Please use CSV export instead.');
  }
};

// Export all reports data as CSV bundle
export const exportAllReportsAsCSV = (reportsData) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  // Export Executive KPIs
  if (reportsData.executiveKPIs?.kpis) {
    const kpiData = Object.entries(reportsData.executiveKPIs.kpis).map(([key, value]) => ({
      metric: key,
      value: value.value,
      change: value.change,
      period: value.period,
      trend: value.trend
    }));
    exportToCSV(kpiData, `executive_kpis_${timestamp}`, ['metric', 'value', 'change', 'period', 'trend']);
  }
  
  // Export Historical Data
  if (reportsData.historicalData?.historicalData) {
    exportToCSV(reportsData.historicalData.historicalData, `historical_data_${timestamp}`);
  }
  
  // Export Pipeline Data
  if (reportsData.pipelineData?.pipelineData) {
    exportToCSV(reportsData.pipelineData.pipelineData, `pipeline_data_${timestamp}`);
  }
  
  // Export Funnel Data
  if (reportsData.funnelData?.funnelData) {
    exportToCSV(reportsData.funnelData.funnelData, `funnel_data_${timestamp}`);
  }
  
  // Export Payment Analysis
  if (reportsData.paymentAnalysis?.paymentData) {
    const paymentData = [
      { metric: 'onTime', value: reportsData.paymentAnalysis.paymentData.onTime },
      { metric: 'overdue', value: reportsData.paymentAnalysis.paymentData.overdue }
    ];
    exportToCSV(paymentData, `payment_timeliness_${timestamp}`, ['metric', 'value']);
    
    if (reportsData.paymentAnalysis.paymentData.aging) {
      exportToCSV(reportsData.paymentAnalysis.paymentData.aging, `payment_aging_${timestamp}`);
    }
  }
  
  // Export Cancellation Reasons
  if (reportsData.cancellationReasons?.cancellationData) {
    exportToCSV(reportsData.cancellationReasons.cancellationData, `cancellation_reasons_${timestamp}`);
  }
};

// Generate summary statistics
export const generateSummaryStats = (reportsData) => {
  const summary = {
    generatedAt: new Date().toISOString(),
    totalBookings: 0,
    totalRevenue: 0,
    averageUtilisation: 0,
    conversionRate: 0
  };
  
  // Calculate totals from historical data
  if (reportsData.historicalData?.historicalData) {
    const historical = reportsData.historicalData.historicalData;
    summary.totalBookings = historical.reduce((sum, item) => sum + item.bookings, 0);
    summary.totalRevenue = historical.reduce((sum, item) => sum + item.revenue, 0);
  }
  
  // Calculate average utilisation
  if (reportsData.executiveKPIs?.kpis?.utilisation) {
    summary.averageUtilisation = reportsData.executiveKPIs.kpis.utilisation.value;
  }
  
  // Calculate conversion rate from funnel data
  if (reportsData.funnelData?.funnelData) {
    const funnel = reportsData.funnelData.funnelData;
    const requests = funnel[0]?.count || 0;
    const completed = funnel[funnel.length - 1]?.count || 0;
    summary.conversionRate = requests > 0 ? Math.round((completed / requests) * 100) : 0;
  }
  
  return summary;
};
