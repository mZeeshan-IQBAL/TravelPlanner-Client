// Simple PDF export utility without external dependencies
// Uses browser's native print functionality with custom CSS for PDF generation

export const exportTripToPDF = (trip) => {
  if (!trip) return;

  // Create a new window for PDF content
  const printWindow = window.open('', '_blank');
  
  const pdfContent = generatePDFHTML(trip);
  
  printWindow.document.write(pdfContent);
  printWindow.document.close();
  
  // Wait for content to load then trigger print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};

const generatePDFHTML = (trip) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: trip.budget?.currency || 'USD'
    }).format(amount || 0);
  };

  // Calculate total costs
  const totalItineraryCost = (trip.itinerary || [])
    .reduce((sum, item) => sum + (item.cost || 0), 0);

  const totalBudget = trip.budget?.totalEstimated || 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${trip.title} - Trip Itinerary</title>
  <style>
    @media print {
      @page {
        margin: 1in;
        size: A4;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    
    .header {
      border-bottom: 3px solid #3B82F6;
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
    
    .header h1 {
      margin: 0;
      color: #1E40AF;
      font-size: 2.5rem;
      font-weight: bold;
    }
    
    .header .subtitle {
      color: #6B7280;
      font-size: 1.1rem;
      margin-top: 5px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section h2 {
      color: #1E40AF;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .info-card {
      background: #F9FAFB;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3B82F6;
    }
    
    .info-card h3 {
      margin: 0 0 10px 0;
      color: #1F2937;
      font-size: 1.1rem;
    }
    
    .info-card p {
      margin: 5px 0;
      color: #6B7280;
      font-size: 0.95rem;
    }
    
    .itinerary-day {
      margin-bottom: 25px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .day-header {
      background: #3B82F6;
      color: white;
      padding: 15px 20px;
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .day-items {
      padding: 20px;
    }
    
    .itinerary-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    
    .itinerary-item:last-child {
      border-bottom: none;
    }
    
    .item-info {
      flex: 1;
    }
    
    .item-title {
      font-weight: bold;
      color: #1F2937;
      margin-bottom: 5px;
    }
    
    .item-details {
      color: #6B7280;
      font-size: 0.9rem;
    }
    
    .item-cost {
      font-weight: bold;
      color: #059669;
      font-size: 1.1rem;
    }
    
    .budget-summary {
      background: #FEF3C7;
      border: 2px solid #F59E0B;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .budget-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1.1rem;
    }
    
    .budget-row.total {
      border-top: 2px solid #F59E0B;
      padding-top: 10px;
      font-weight: bold;
      color: #92400E;
    }
    
    .weather-card {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .notes-section {
      background: #F0F9FF;
      border: 1px solid #0EA5E9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 0.9rem;
    }
    
    @media screen {
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3B82F6;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        z-index: 1000;
      }
      
      .print-button:hover {
        background: #1D4ED8;
      }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">📄 Print/Save as PDF</button>
  
  <div class="header">
    <h1>${trip.title}</h1>
    <div class="subtitle">
      ${trip.country?.name || 'Unknown Destination'} • 
      Generated on ${new Date().toLocaleDateString()}
    </div>
  </div>

  <div class="section">
    <h2>📍 Destination Information</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>Country Details</h3>
        <p><strong>Country:</strong> ${trip.country?.name || 'N/A'}</p>
        <p><strong>Capital:</strong> ${trip.country?.capital || 'N/A'}</p>
        <p><strong>Region:</strong> ${trip.country?.region || 'N/A'}</p>
        ${trip.country?.languages?.length > 0 ? `<p><strong>Languages:</strong> ${trip.country.languages.join(', ')}</p>` : ''}
      </div>
      
      <div class="info-card">
        <h3>Trip Dates</h3>
        <p><strong>Start Date:</strong> ${formatDate(trip.plannedDates?.startDate)}</p>
        <p><strong>End Date:</strong> ${formatDate(trip.plannedDates?.endDate)}</p>
        ${trip.plannedDates?.startDate && trip.plannedDates?.endDate ? 
          `<p><strong>Duration:</strong> ${Math.ceil((new Date(trip.plannedDates.endDate) - new Date(trip.plannedDates.startDate)) / (1000 * 60 * 60 * 24)) + 1} days</p>` : 
          ''
        }
      </div>
    </div>
    
    ${trip.weather?.current ? `
      <div class="weather-card">
        <h3 style="margin-top: 0;">🌤️ Weather Information</h3>
        <p style="margin: 0; font-size: 1.2rem;">
          ${trip.weather.current.description} • ${trip.weather.current.temperature}°C
        </p>
        ${trip.weather.current.humidity ? `<p style="margin: 5px 0 0 0;">Humidity: ${trip.weather.current.humidity}%</p>` : ''}
      </div>
    ` : ''}
  </div>

  ${trip.notes ? `
    <div class="section">
      <h2>📝 Notes</h2>
      <div class="notes-section">
        <p>${trip.notes.replace(/\n/g, '<br>')}</p>
      </div>
    </div>
  ` : ''}

  ${trip.itinerary && trip.itinerary.length > 0 ? `
    <div class="section page-break">
      <h2>📅 Detailed Itinerary</h2>
      ${generateItineraryHTML(trip.itinerary)}
    </div>
  ` : ''}

  <div class="section">
    <h2>💰 Budget Summary</h2>
    <div class="budget-summary">
      <div class="budget-row">
        <span>Estimated Budget:</span>
        <span>${formatCurrency(totalBudget)}</span>
      </div>
      <div class="budget-row">
        <span>Planned Itinerary Costs:</span>
        <span>${formatCurrency(totalItineraryCost)}</span>
      </div>
      <div class="budget-row total">
        <span>Remaining Budget:</span>
        <span>${formatCurrency(totalBudget - totalItineraryCost)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Generated by Travel Planner • ${new Date().toLocaleString()}</p>
    <p>This itinerary was created to help you plan your perfect trip!</p>
  </div>
</body>
</html>`;
};

const generateItineraryHTML = (itinerary) => {
  // Group items by day
  const itemsByDay = itinerary.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  // Sort items within each day by time
  Object.keys(itemsByDay).forEach(day => {
    itemsByDay[day].sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  });

  return Object.keys(itemsByDay)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(day => {
      const items = itemsByDay[day];
      return `
        <div class="itinerary-day">
          <div class="day-header">
            📅 Day ${day}
          </div>
          <div class="day-items">
            ${items.map(item => `
              <div class="itinerary-item">
                <div class="item-info">
                  <div class="item-title">${item.title}</div>
                  <div class="item-details">
                    ${item.location ? `📍 ${item.location}` : ''}
                    ${item.startTime ? `🕒 ${item.startTime}` : ''}
                    ${item.endTime ? ` - ${item.endTime}` : ''}
                    ${item.notes ? `<br>💡 ${item.notes}` : ''}
                  </div>
                </div>
                ${item.cost ? `<div class="item-cost">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.cost)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
};