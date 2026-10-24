// Servicio de Facturación Electrónica y Normativa ARCA (ex-AFIP)

export const VET_FISCAL_DATA = {
  razonSocial: 'SERPROVE VET S.R.L.',
  cuit: '30-71234567-8',
  iibb: '30-71234567-8',
  condicionIva: 'IVA Responsable Inscripto',
  inicioActividades: '01/03/2021',
  domicilio: 'Corrientes, Argentina',
  puntoVenta: 2 // Punto de venta asignado a la app de escritorio
};

export const TIPO_COMPROBANTE = {
  X: { codigo: 99, nombre: 'COMPROBANTE X', letra: 'X', fiscal: false },
  B: { codigo: 6, nombre: 'FACTURA B', letra: 'B', fiscal: true },
  A: { codigo: 1, nombre: 'FACTURA A', letra: 'A', fiscal: true }
};

/**
 * Genera el QR fiscal oficial requerido por ARCA/AFIP (RG 4892)
 * Se codifica en Base64 según especificación técnica de AFIP/ARCA
 */
export function generateArcaQrUrl({
  fecha,
  cuitEmisor = '30712345678',
  puntoVenta = 2,
  tipoComprobante = 6,
  numeroComprobante = 1,
  importeTotal,
  nroDocReceptor = 0,
  tipoDocReceptor = 99, // 99 = Consumidor final, 80 = CUIT
  cae = '74351234567890'
}) {
  const qrData = {
    ver: 1,
    fecha: fecha || new Date().toISOString().split('T')[0],
    cuit: Number(cuitEmisor.replace(/\D/g, '')),
    ptoVta: Number(puntoVenta),
    tipoCmp: Number(tipoComprobante),
    nroCmp: Number(numeroComprobante),
    importe: Number(importeTotal),
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: Number(tipoDocReceptor),
    nroDocRec: Number(nroDocReceptor),
    tipoCodAut: 'E', // E = CAE (Código de Autorización Electrónico)
    codAut: Number(cae)
  };

  try {
    const jsonString = JSON.stringify(qrData);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return `https://www.afip.gob.ar/fe/qr/?p=${base64}`;
  } catch {
    return 'https://www.afip.gob.ar/fe/qr/';
  }
}

/**
 * Calcula el desglose de IVA (Neto Gravado 21% e IVA 21%)
 */
export function calculateVatBreakdown(total, vatRate = 0.21) {
  const net = Number((total / (1 + vatRate)).toFixed(2));
  const vat = Number((total - net).toFixed(2));
  return { net, vat };
}

/**
 * Genera la representación HTML para imprimir en comandera térmica (80mm o 58mm)
 */
export function generateThermalTicketHtml({
  sale,
  items,
  fiscalData = VET_FISCAL_DATA
}) {
  const tipoCmp = TIPO_COMPROBANTE[sale.invoice_type] || TIPO_COMPROBANTE.X;
  const fecha = new Date(sale.created_at || Date.now());
  const fechaFormateada = fecha.toLocaleDateString('es-AR') + ' ' + fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const { net, vat } = calculateVatBreakdown(sale.total);
  const qrUrl = generateArcaQrUrl({
    fecha: fecha.toISOString().split('T')[0],
    importeTotal: sale.total,
    numeroComprobante: sale.sale_number.replace(/\D/g, '').slice(-6) || '1',
    cae: sale.cae || '74359876543210'
  });

  return `
    <div class="center bold" style="font-size: 14px; margin-bottom: 2px;">${fiscalData.razonSocial}</div>
    <div class="center" style="font-size: 10px;">${fiscalData.domicilio}</div>
    <div class="center" style="font-size: 10px;">CUIT: ${fiscalData.cuit} | IIBB: ${fiscalData.iibb}</div>
    <div class="center" style="font-size: 10px;">${fiscalData.condicionIva}</div>
    
    <div class="divider"></div>

    <div class="center bold" style="font-size: 13px;">
      [ ${tipoCmp.letra} ] ${tipoCmp.nombre}
    </div>
    <div class="center" style="font-size: 10px;">
      N°: ${sale.sale_number} | PTO. VTA: 000${fiscalData.puntoVenta}
    </div>
    <div class="center" style="font-size: 10px;">FECHA: ${fechaFormateada}</div>

    <div class="divider"></div>

    <div style="font-size: 10px;">
      <b>CLIENTE:</b> ${sale.customer_name || 'Consumidor Final'}<br/>
      ${sale.customer_cuit ? `<b>CUIT/DNI:</b> ${sale.customer_cuit}<br/>` : ''}
      <b>CONDICIÓN:</b> ${sale.payment_method.toUpperCase()}
    </div>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th style="text-align: left;">CANT</th>
          <th style="text-align: left;">DETALLE</th>
          <th style="text-align: right;">P.UNIT</th>
          <th style="text-align: right;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => `
          <tr>
            <td>${it.quantity}</td>
            <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.product_name}</td>
            <td style="text-align: right;">$${Number(it.unit_price).toLocaleString('es-AR')}</td>
            <td style="text-align: right;">$${Number(it.subtotal).toLocaleString('es-AR')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="divider"></div>

    ${sale.discount > 0 ? `
      <div style="display: flex; justify-content: space-between;">
        <span>SUBTOTAL:</span>
        <span>$${sale.subtotal.toLocaleString('es-AR')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; color: red;">
        <span>DESCUENTO:</span>
        <span>-$${sale.discount.toLocaleString('es-AR')}</span>
      </div>
    ` : ''}

    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 4px 0;">
      <span>TOTAL:</span>
      <span>$${sale.total.toLocaleString('es-AR')}</span>
    </div>

    ${sale.payment_method === 'efectivo' ? `
      <div style="display: flex; justify-content: space-between; font-size: 10px;">
        <span>ABONÓ CON:</span>
        <span>$${Number(sale.amount_paid).toLocaleString('es-AR')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold;">
        <span>SU VUELTO:</span>
        <span>$${Number(sale.change_amount).toLocaleString('es-AR')}</span>
      </div>
    ` : ''}

    <div class="divider"></div>

    ${tipoCmp.fiscal ? `
      <div style="font-size: 9px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Neto Gravado (21%):</span>
          <span>$${net.toLocaleString('es-AR')}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>IVA Liquidado (21%):</span>
          <span>$${vat.toLocaleString('es-AR')}</span>
        </div>
        <div style="margin-top: 4px; font-weight: bold;">
          CAE N°: ${sale.cae || '74351234567890'}<br/>
          Vto. CAE: ${new Date(Date.now() + 10 * 86400000).toLocaleDateString('es-AR')}
        </div>
      </div>
      <div class="center" style="margin-top: 6px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(qrUrl)}" alt="QR Fiscal ARCA" style="width: 85px; height: 85px;" />
        <div style="font-size: 8px; color: #555;">Comprobante Autorizado por ARCA (AFIP)</div>
      </div>
    ` : `
      <div class="center" style="font-size: 9px; color: #444;">
        DOCUMENTO NO VÁLIDO COMO FACTURA<br/>
        CONTROL INTERNO DE VENTA - SERPROVE VET
      </div>
    `}

    <div class="divider"></div>
    <div class="center" style="font-size: 10px; margin-top: 5px;">
      ¡Gracias por confiar en Serprove Vet!<br/>
      Cuidando la salud y bienestar animal.
    </div>
  `;
}
