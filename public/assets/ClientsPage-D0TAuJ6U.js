import{c as Je,u as We,b as et,r as p,j as e,P as Te,F as ye,S as Pe,a as ue,X as tt,A as rt,m as L,z as E}from"./index-BSegEAYo.js";import{S as Le,a as de,B as g,K as I,I as Se,C as Ie,M as O}from"./index-DSRin02B.js";import{A as st,P as Ae,M as it}from"./phone-DHezU-nW.js";import{P as De}from"./pencil-0SOV1CGZ.js";import{P as G}from"./plus-mxtm17d-.js";import{C as Ue}from"./clipboard-list-DgmJbS_T.js";import{R as Fe,U as ce}from"./user-Cxd4O-r8.js";import{F as Oe}from"./factory-6YraJx49.js";import{T as Me}from"./trash-2-CJS-W46n.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=Je("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]),A={RECUE:{label:"Reçue",type:"info",next:"EN_PRODUCTION",action:"Lancer en production"},EN_PRODUCTION:{label:"En production",type:"warn",next:"PRETE",action:"Marquer prête"},PRETE:{label:"Prête",type:"ok",next:"LIVREE",action:"Marquer livrée"},LIVREE:{label:"Livrée",type:"neutral",next:null},ANNULEE:{label:"Annulée",type:"err",next:null}};function qe(i,c,r){const x=$=>`${Number($).toLocaleString("fr-FR")} ${(r==null?void 0:r.devise)??"F"}`,w=new Date(i.dateLivraison).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),h=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),z=i.montantTotal-i.acompte,m=i.lignes.map($=>`
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${$.produit.nom}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${$.quantite}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${x($.prixUnitaire)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${x($.sousTotal)}</td>
    </tr>
  `).join(""),C=`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon de commande ${i.reference}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2744; background: white; padding: 40px; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; }
    .company-name { font-size: 26px; font-weight: 800; color: ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; letter-spacing: -0.5px; }
    .company-info { font-size: 12px; color: #666; margin-top: 6px; line-height: 1.6; }
    .doc-title { text-align: right; }
    .doc-title h2 { font-size: 22px; font-weight: 700; color: ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; }
    .doc-title .ref { font-size: 13px; color: #888; margin-top: 4px; }
    .doc-title .date { font-size: 12px; color: #888; margin-top: 2px; }
    .section { display: flex; gap: 24px; margin-bottom: 32px; }
    .box { flex: 1; background: #f8f9fc; border-radius: 10px; padding: 16px; }
    .box-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 10px; }
    .box-content { font-size: 14px; color: #1a2744; line-height: 1.7; }
    .box-content strong { font-weight: 700; font-size: 16px; }
    .livraison-date { background: ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}15; border-left: 4px solid ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; }
    thead th { padding: 12px; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    tbody tr:hover { background: #f8f9fc; }
    .totaux { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }
    .total-row.grand-total { font-size: 17px; font-weight: 800; color: ${(r==null?void 0:r.couleurPrincipale)??"#1a2744"}; border-bottom: none; padding-top: 12px; }
    .total-row.acompte { color: #16a34a; }
    .total-row.reste { color: ${z>0?"#dc2626":"#16a34a"}; font-weight: 700; }
    .notes-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px; margin-bottom: 32px; font-size: 13px; color: #92400e; }
    .footer { margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end; }
    .signature-box { text-align: center; }
    .signature-line { width: 200px; border-bottom: 2px solid #ccc; margin-bottom: 8px; height: 60px; }
    .signature-label { font-size: 11px; color: #999; }
    .footer-note { font-size: 11px; color: #aaa; text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; }
    .statut-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ${i.statut==="LIVREE"?"#dcfce7":i.statut==="PRETE"?"#d1fae5":i.statut==="EN_PRODUCTION"?"#fef3c7":"#dbeafe"}; color: ${i.statut==="LIVREE"?"#166534":i.statut==="PRETE"?"#065f46":i.statut==="EN_PRODUCTION"?"#92400e":"#1e40af"}; }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${(r==null?void 0:r.nom)??"Delice Pro"}</div>
      <div class="company-info">
        ${r!=null&&r.adresse?r.adresse+"<br>":""}
        ${r!=null&&r.telephone?"Tél : "+r.telephone+"<br>":""}
        ${r!=null&&r.email?r.email:""}
      </div>
    </div>
    <div class="doc-title">
      <h2>BON DE COMMANDE</h2>
      <div class="ref">${i.reference} &nbsp; <span class="statut-badge">${A[i.statut].label}</span></div>
      <div class="date">Émis le ${h}</div>
    </div>
  </div>

  <div class="section">
    <div class="box">
      <div class="box-title">Client</div>
      <div class="box-content">
        <strong>${c.nom}</strong><br>
        ${c.entreprise?c.entreprise+"<br>":""}
        ${c.telephone?"📞 "+c.telephone+"<br>":""}
        ${c.email?"✉ "+c.email+"<br>":""}
        ${c.adresse?c.adresse:""}
      </div>
    </div>
    <div class="box livraison-date">
      <div class="box-title">📅 Date de livraison</div>
      <div class="box-content">
        <strong>${w}</strong>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th style="text-align:center;">Quantité</th>
        <th style="text-align:right;">Prix unitaire</th>
        <th style="text-align:right;">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      ${m}
    </tbody>
  </table>

  <div class="totaux">
    <div class="total-row grand-total">
      <span>Total</span>
      <span>${x(i.montantTotal)}</span>
    </div>
    ${i.acompte>0?`
    <div class="total-row acompte">
      <span>Acompte versé</span>
      <span>- ${x(i.acompte)}</span>
    </div>
    <div class="total-row reste">
      <span>Reste à payer</span>
      <span>${z>0?x(z):"Soldé ✓"}</span>
    </div>`:""}
  </div>

  ${i.notes?`<div class="notes-box"><strong>Notes :</strong> ${i.notes}</div>`:""}

  <div class="footer">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Signature du client</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Signature ${(r==null?void 0:r.nom)??""}</div>
    </div>
  </div>

  <div class="footer-note">
    Document généré par Delice Pro — ${h}
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`,T=window.open("","_blank");T&&(T.document.write(C),T.document.close())}function Ve(i,c,r){const x=(r==null?void 0:r.couleurPrincipale)??"#1a2744",w=new Date(i.dateLivraison).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),h=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),z=i.lignes.map(T=>`
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-weight:500;">${T.produit.nom}</td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:18px;font-weight:700;color:${x};">${T.quantite}</td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:center;">
        <div style="width:24px;height:24px;border:2px solid #ccc;border-radius:4px;margin:0 auto;"></div>
      </td>
    </tr>
  `).join(""),m=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Bon de livraison ${i.reference}</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif;color:#1a2744;background:white;padding:40px;font-size:14px; }
    .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid ${x}; }
    .company-name { font-size:24px;font-weight:800;color:${x}; }
    .company-info { font-size:12px;color:#666;margin-top:6px;line-height:1.6; }
    .doc-title { text-align:right; }
    .doc-title h2 { font-size:20px;font-weight:700;color:${x}; }
    .doc-ref { font-size:13px;color:#888;margin-top:4px; }
    .parties { display:flex;gap:20px;margin-bottom:28px; }
    .box { flex:1;background:#f8f9fc;border-radius:10px;padding:16px; }
    .box-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px; }
    .box-nom { font-size:16px;font-weight:700; }
    .box-info { font-size:12px;color:#666;margin-top:4px;line-height:1.6; }
    table { width:100%;border-collapse:collapse;margin-bottom:24px; }
    thead tr { background:${x}; }
    thead th { padding:11px 12px;color:white;font-size:11px;text-transform:uppercase;font-weight:600;text-align:left; }
    thead th:nth-child(2),thead th:nth-child(3) { text-align:center; }
    .info-livraison { background:${x}15;border-left:4px solid ${x};border-radius:8px;padding:16px;margin-bottom:24px; }
    .info-livraison-date { font-size:16px;font-weight:700;color:${x}; }
    .signatures { display:flex;justify-content:space-between;margin-top:48px; }
    .sig-box { text-align:center; }
    .sig-line { width:200px;border-bottom:2px solid #ccc;height:60px;margin-bottom:8px; }
    .sig-label { font-size:11px;color:#999; }
    .footer-note { text-align:center;font-size:11px;color:#bbb;margin-top:32px;padding-top:16px;border-top:1px solid #eee; }
    @media print { body{padding:20px} @page{margin:12mm} }
  </style></head><body>
  <div class="header">
    <div>
      <div class="company-name">${(r==null?void 0:r.nom)??"Delice Pro"}</div>
      <div class="company-info">
        ${r!=null&&r.adresse?r.adresse+"<br>":""}
        ${r!=null&&r.telephone?"Tél : "+r.telephone+"<br>":""}
        ${(r==null?void 0:r.email)??""}
      </div>
    </div>
    <div class="doc-title">
      <h2>BON DE LIVRAISON</h2>
      <div class="doc-ref">${i.reference}</div>
      <div class="doc-ref" style="margin-top:2px;font-size:11px;color:#aaa;">Émis le ${h}</div>
    </div>
  </div>

  <div class="parties">
    <div class="box">
      <div class="box-title">Livré à</div>
      <div class="box-nom">${c.nom}</div>
      <div class="box-info">
        ${c.entreprise?c.entreprise+"<br>":""}
        ${c.telephone?"Tél : "+c.telephone+"<br>":""}
        ${c.adresse??""}
      </div>
    </div>
    <div class="box" style="background:${x}10;border-left:4px solid ${x}">
      <div class="box-title">📅 Date de livraison</div>
      <div class="info-livraison-date">${w}</div>
      ${i.notes?`<div class="box-info" style="margin-top:8px">Note : ${i.notes}</div>`:""}
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Désignation</th>
      <th style="text-align:center">Quantité</th>
      <th style="text-align:center">✓ Reçu</th>
    </tr></thead>
    <tbody>${z}</tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Livré par</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Reçu par ${c.nom}</div>
    </div>
  </div>
  <div class="footer-note">Document généré par Delice Pro — ${h}</div>
  <script>window.onload = () => window.print();<\/script>
</body></html>`,C=window.open("","_blank");C&&(C.document.write(m),C.document.close())}function Be(i,c,r){const x=y=>`${Number(y).toLocaleString("fr-FR")} ${(r==null?void 0:r.devise)??"F"}`,w=(r==null?void 0:r.couleurPrincipale)??"#1a2744",h=new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),z=new Date(i.dateLivraison).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}),m=i.montantTotal-i.acompte,C=`FAC-${i.reference}`,T=i.lignes.map(y=>`
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${y.produit.nom}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${y.quantite}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${x(y.prixUnitaire)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${x(y.sousTotal)}</td>
    </tr>
  `).join(""),$=`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Facture ${C}</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif;color:#1a2744;background:white;padding:40px;font-size:14px; }
    .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid ${w}; }
    .company-name { font-size:24px;font-weight:800;color:${w}; }
    .company-info { font-size:12px;color:#666;margin-top:6px;line-height:1.6; }
    .doc-title { text-align:right; }
    .doc-title h2 { font-size:20px;font-weight:700;color:${w}; }
    .doc-ref { font-size:13px;color:#888;margin-top:4px; }
    .parties { display:flex;gap:20px;margin-bottom:28px; }
    .box { flex:1;background:#f8f9fc;border-radius:10px;padding:16px; }
    .box-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px; }
    .box-nom { font-size:16px;font-weight:700; }
    .box-info { font-size:12px;color:#666;margin-top:4px;line-height:1.6; }
    table { width:100%;border-collapse:collapse;margin-bottom:24px; }
    thead tr { background:${w}; }
    thead th { padding:11px 12px;color:white;font-size:11px;text-transform:uppercase;font-weight:600;text-align:left; }
    tbody tr:nth-child(even) { background:#f8f9fc; }
    .totaux { margin-left:auto;width:280px;margin-bottom:32px; }
    .total-row { display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555; }
    .total-final { font-size:17px;font-weight:800;color:${w};border-bottom:none;padding-top:10px; }
    .acompte { color:#16a34a; }
    .reste-row { color:${m>0?"#dc2626":"#16a34a"};font-weight:700; }
    .solde-box { text-align:center;padding:16px;border-radius:10px;margin-bottom:24px;
      background:${m<=0?"#dcfce7":"#fee2e2"};
      border:2px solid ${m<=0?"#16a34a":"#dc2626"}; }
    .solde-label { font-size:12px;font-weight:600;color:${m<=0?"#166534":"#991b1b"}; }
    .solde-montant { font-size:24px;font-weight:800;color:${m<=0?"#166534":"#dc2626"};margin-top:4px; }
    .signatures { display:flex;justify-content:space-between;margin-top:40px; }
    .sig-box { text-align:center; }
    .sig-line { width:200px;border-bottom:2px solid #ccc;height:60px;margin-bottom:8px; }
    .sig-label { font-size:11px;color:#999; }
    .footer-note { text-align:center;font-size:11px;color:#bbb;margin-top:32px;padding-top:16px;border-top:1px solid #eee; }
    .mention { font-size:11px;color:#999;margin-top:24px;line-height:1.7; }
    @media print { body{padding:20px} @page{margin:12mm} }
  </style></head><body>
  <div class="header">
    <div>
      <div class="company-name">${(r==null?void 0:r.nom)??"Delice Pro"}</div>
      <div class="company-info">
        ${r!=null&&r.adresse?r.adresse+"<br>":""}
        ${r!=null&&r.telephone?"Tél : "+r.telephone+"<br>":""}
        ${(r==null?void 0:r.email)??""}
      </div>
    </div>
    <div class="doc-title">
      <h2>FACTURE</h2>
      <div class="doc-ref">N° ${C}</div>
      <div class="doc-ref" style="margin-top:2px;font-size:11px;color:#aaa;">Date : ${h}</div>
    </div>
  </div>

  <div class="parties">
    <div class="box">
      <div class="box-title">Facturé à</div>
      <div class="box-nom">${c.nom}</div>
      <div class="box-info">
        ${c.entreprise?c.entreprise+"<br>":""}
        ${c.telephone?"Tél : "+c.telephone+"<br>":""}
        ${c.email?c.email+"<br>":""}
        ${c.adresse??""}
      </div>
    </div>
    <div class="box">
      <div class="box-title">Détails facture</div>
      <div class="box-info">
        Référence commande : <strong>${i.reference}</strong><br>
        Date livraison : <strong>${z}</strong><br>
        Date facture : <strong>${h}</strong>
      </div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Désignation</th>
      <th style="text-align:center">Qté</th>
      <th style="text-align:right">Prix unitaire</th>
      <th style="text-align:right">Montant</th>
    </tr></thead>
    <tbody>${T}</tbody>
  </table>

  <div class="totaux">
    <div class="total-row total-final"><span>Total</span><span>${x(i.montantTotal)}</span></div>
    ${i.acompte>0?`
    <div class="total-row acompte"><span>Acompte versé</span><span>− ${x(i.acompte)}</span></div>
    <div class="total-row reste-row"><span>Reste à payer</span><span>${x(m)}</span></div>
    `:""}
  </div>

  <div class="solde-box">
    <div class="solde-label">${m<=0?"✅ FACTURE SOLDÉE":"⚠ RESTE À PAYER"}</div>
    <div class="solde-montant">${m<=0?"Payé intégralement":x(m)}</div>
  </div>

  ${i.notes?`<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px;margin-bottom:24px;font-size:13px;color:#92400e;"><strong>Notes :</strong> ${i.notes}</div>`:""}

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Signature ${(r==null?void 0:r.nom)??""}</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Signature client</div>
    </div>
  </div>

  <div class="mention">
    Merci pour votre confiance. Ce document vaut facture et reçu de paiement selon les conditions convenues.
    ${(r==null?void 0:r.nom)??"Delice Pro"} — ${(r==null?void 0:r.adresse)??""} — ${(r==null?void 0:r.telephone)??""}
  </div>
  <div class="footer-note">Document généré par Delice Pro — ${h}</div>
  <script>window.onload = () => window.print();<\/script>
</body></html>`,M=window.open("","_blank");M&&(M.document.write($),M.document.close())}function ft(){const{company:i}=We(),c=et(),r=t=>`${Number(t).toLocaleString("fr-FR")} ${(i==null?void 0:i.devise)??"F"}`,[x,w]=p.useState([]),[h,z]=p.useState([]),[m,C]=p.useState([]),[T,$]=p.useState([]),[M,y]=p.useState(!0),[n,X]=p.useState(null),_e=h.filter(t=>t.client.id===(n==null?void 0:n.id)),[Z,f]=p.useState(null),[j,S]=p.useState(null),[be,k]=p.useState(null),[a,J]=p.useState(null),[U,q]=p.useState(""),[N,V]=p.useState("PARTICULIER"),[W,B]=p.useState(""),[ee,_]=p.useState(""),[te,H]=p.useState(""),[re,Q]=p.useState(""),[se,Y]=p.useState(""),[ot,He]=p.useState(!1),[at,Qe]=p.useState(""),[lt,Ye]=p.useState(""),[nt,dt]=p.useState(!1),[xe,me]=p.useState(""),[ie,he]=p.useState(0),[ve,fe]=p.useState(""),[oe,ae]=p.useState([{produitId:"",quantite:1,prixUnitaire:0}]),F=async()=>{y(!0);try{const[t,l,u,R]=await Promise.all([L.get("/clients"),L.get("/commandes-client"),L.get("/produits"),L.get("/recettes")]),s=t.data.success?t.data.data:[],d=l.data.success?l.data.data:[],o=s.map(b=>{const v=d.filter(D=>D.client.id===b.id);return{...b,caTotal:v.reduce((D,ne)=>D+ne.montantTotal,0),caEncours:v.filter(D=>!["LIVREE","ANNULEE"].includes(D.statut)).reduce((D,ne)=>D+(ne.montantTotal-ne.acompte),0)}});if(w(o),z(d),u.data.success&&C(u.data.data),R.success&&$(R.data),n){const b=o.find(v=>v.id===n.id);b&&X(b)}}finally{y(!1)}};p.useEffect(()=>{F()},[]);const je=h.filter(t=>["RECUE","EN_PRODUCTION","PRETE"].includes(t.statut)).length,Ke=h.filter(t=>t.statut!=="ANNULEE").reduce((t,l)=>t+l.montantTotal,0),Ne=h.filter(t=>!["LIVREE","ANNULEE"].includes(t.statut)).reduce((t,l)=>t+(l.montantTotal-l.acompte),0),we=h.filter(t=>!["LIVREE","ANNULEE"].includes(t.statut)&&new Date(t.dateLivraison)<new Date).length,P=()=>{q(""),V("PARTICULIER"),B(""),_(""),H(""),Q(""),Y("")},Ee=t=>{S(t),q(t.nom),V(t.type),B(t.telephone??""),_(t.email??""),H(t.adresse??""),Q(t.entreprise??""),Y(t.notes??""),f("edit")},Ce=()=>({nom:U,type:N,telephone:W||void 0,email:ee||void 0,adresse:te||void 0,entreprise:re||void 0,notes:se||void 0}),Ge=async()=>{if(!U.trim()){E.error("Le nom est requis");return}try{await L.post("/clients",Ce()),E.success(`Client "${U}" créé !`),f(null),P(),F()}catch{}},$e=async()=>{if(j)try{await L.put(`/clients/${j.id}`,Ce()),E.success("Client mis à jour !"),f(null),S(null),P(),F()}catch{}},Xe=async()=>{if(j)try{await L.delete(`/clients/${j.id}`),E.success("Client supprimé"),f(null),S(null),(n==null?void 0:n.id)===j.id&&X(null),F()}catch{}},K=()=>{me(""),he(0),fe(""),ae([{produitId:"",quantite:1,prixUnitaire:0}])},pe=(t,l,u)=>{ae(R=>R.map((s,d)=>{if(d!==t)return s;const o={...s,[l]:u};if(l==="produitId"){const b=m.find(v=>v.id===u);b&&(o.prixUnitaire=b.prixVente)}return o}))},ke=oe.filter(t=>t.produitId&&t.quantite>0).reduce((t,l)=>t+l.quantite*l.prixUnitaire,0),Ze=async()=>{if(!n)return;if(!xe){E.error("Indiquez la date de livraison");return}const t=oe.filter(l=>l.produitId&&l.quantite>0&&l.prixUnitaire>0);if(!t.length){E.error("Ajoutez au moins un produit");return}try{await L.post("/commandes-client",{clientId:n.id,dateLivraison:xe,acompte:ie,notes:ve||void 0,lignes:t}),E.success("Commande créée !"),k(null),K(),F()}catch{}},le=async(t,l)=>{var u;try{await L.put(`/commandes-client/${t.id}/statut`,{statut:l}),E.success(`→ ${(u=A[l])==null?void 0:u.label}`),F(),(a==null?void 0:a.id)===t.id&&J({...t,statut:l})}catch{}},Re=async t=>{var s;await le(t,"EN_PRODUCTION");const l=new Map,u=[];for(const d of t.lignes){const o=m.find(v=>v.id===d.produit.id);if(!(o!=null&&o.recetteId)){u.push(d.produit.nom);continue}const b=o.recetteId;l.has(b)||l.set(b,{recetteId:o.recetteId,recetteNom:((s=o.recette)==null?void 0:s.nom)??"Recette inconnue",produits:[]}),l.get(b).produits.push({produitId:o.id,nom:d.produit.nom,quantite:d.quantite,grammage:o.grammage})}const R=Array.from(l.values());c("/production",{state:{fromCommande:!0,commandeId:t.id,referenceCommande:t.reference,nomClient:t.client.nom,recettesGroupees:R,sansProduit:u}}),u.length>0&&E(`⚠ ${u.join(", ")} n'ont pas de recette liée`,{duration:5e3}),E.success(`Production lancée — ${R.length} recette(s) à fabriquer`)},ze=t=>{c("/ventes",{state:{fromCommande:!0,commandeId:t.id,referenceCommande:t.reference,nomClient:t.client.nom,clientId:t.client.id,acompte:t.acompte??0,montantTotal:t.montantTotal,lignes:t.lignes.map(l=>({produitId:l.produit.id,nom:l.produit.nom,quantite:l.quantite,prixUnitaire:l.prixUnitaire}))}}),E.success("Caisse pré-remplie avec la commande !")};if(n){const t=_e,l=t.filter(s=>s.statut!=="ANNULEE").reduce((s,d)=>s+d.montantTotal,0),u=t.filter(s=>!["LIVREE","ANNULEE"].includes(s.statut)).reduce((s,d)=>s+(d.montantTotal-d.acompte),0),R=t.filter(s=>["RECUE","EN_PRODUCTION","PRETE"].includes(s.statut)).length;return e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[e.jsx("button",{onClick:()=>X(null),className:"p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)]",children:e.jsx(st,{size:16})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Le,{children:n.nom}),e.jsx(de,{type:n.type==="PROFESSIONNEL"?"info":"neutral",children:n.type==="PROFESSIONNEL"?"Pro":"Particulier"})]}),n.entreprise&&e.jsx("div",{className:"text-sm text-[var(--color-text-2)] mt-0.5",children:n.entreprise})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(g,{variant:"outline",size:"sm",icon:e.jsx(De,{size:13}),onClick:()=>Ee(n),children:"Modifier"}),e.jsx(g,{size:"sm",icon:e.jsx(G,{size:13}),onClick:()=>{K(),k("create")},children:"Nouvelle commande"})]})]}),e.jsxs("div",{className:"flex gap-4 mb-5 flex-wrap",children:[n.telephone&&e.jsxs("a",{href:`tel:${n.telephone}`,className:"flex items-center gap-1.5 text-sm text-[var(--color-text-2)] hover:text-[var(--color-primary)]",children:[e.jsx(Ae,{size:13}),n.telephone]}),n.email&&e.jsxs("a",{href:`mailto:${n.email}`,className:"flex items-center gap-1.5 text-sm text-[var(--color-text-2)] hover:text-[var(--color-primary)]",children:[e.jsx(it,{size:13}),n.email]}),n.adresse&&e.jsx("span",{className:"text-sm text-[var(--color-text-2)]",children:n.adresse})]}),e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5",children:[e.jsx(I,{label:"Total commandes",value:t.length}),e.jsx(I,{label:"En cours",value:R,deltaType:R>0?"warn":"neutral"}),e.jsx(I,{label:"CA total",value:r(l)}),e.jsx(I,{label:"À encaisser",value:r(u),deltaType:u>0?"warn":"neutral"})]}),n.notes&&e.jsx(Se,{type:"info",children:n.notes}),e.jsx(Ie,{title:"Commandes",className:"mt-4",children:t.length===0?e.jsxs("div",{className:"flex flex-col items-center py-12 gap-3 text-[var(--color-text-3)]",children:[e.jsx(Ue,{size:36,opacity:.3}),e.jsx("p",{children:"Aucune commande."}),e.jsx(g,{size:"sm",icon:e.jsx(G,{size:13}),onClick:()=>{K(),k("create")},children:"Créer une commande"})]}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsx("tr",{className:"border-b border-[var(--color-border)]",children:["Réf.","Livraison","Produits","Montant","Acompte","Reste","Statut","Actions"].map(s=>e.jsx("th",{className:"text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]",children:s},s))})}),e.jsx("tbody",{children:t.sort((s,d)=>new Date(d.dateLivraison).getTime()-new Date(s.dateLivraison).getTime()).map(s=>{const d=A[s.statut],o=!["LIVREE","ANNULEE"].includes(s.statut)&&new Date(s.dateLivraison)<new Date,b=s.montantTotal-s.acompte;return e.jsxs("tr",{className:`border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] ${o?"bg-red-50/40":""}`,children:[e.jsxs("td",{className:"px-3 py-3",children:[e.jsx("div",{className:"font-mono text-xs font-bold text-[var(--color-primary)]",children:s.reference}),o&&e.jsx("div",{className:"text-[10px] text-red-500 font-medium",children:"⚠ En retard"})]}),e.jsx("td",{className:"px-3 py-3 whitespace-nowrap text-[var(--color-text-2)]",children:new Date(s.dateLivraison).toLocaleDateString("fr-FR")}),e.jsx("td",{className:"px-3 py-3 text-[var(--color-text-2)] max-w-[160px] truncate",children:s.lignes.map(v=>`${v.quantite}× ${v.produit.nom}`).join(", ")}),e.jsx("td",{className:"px-3 py-3 font-semibold",children:r(s.montantTotal)}),e.jsx("td",{className:"px-3 py-3 text-[var(--color-ok)]",children:s.acompte>0?r(s.acompte):"—"}),e.jsx("td",{className:"px-3 py-3 font-medium",style:{color:b>0?"var(--color-err)":"var(--color-ok)"},children:b>0?r(b):"Soldé"}),e.jsx("td",{className:"px-3 py-3",children:e.jsx(de,{type:d.type,children:d.label})}),e.jsx("td",{className:"px-3 py-3",children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx("button",{onClick:()=>{J(s),k("detail")},className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)]",title:"Voir le détail",children:e.jsx(Ue,{size:12})}),e.jsx("button",{onClick:()=>qe(s,n,i),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-blue-50 hover:border-blue-300",title:"Bon de commande",children:e.jsx(Te,{size:12,className:"text-blue-500"})}),["PRETE","LIVREE"].includes(s.statut)&&e.jsx("button",{onClick:()=>Ve(s,n,i),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-purple-50 hover:border-purple-300",title:"Bon de livraison",children:e.jsx(ye,{size:12,className:"text-purple-500"})}),["PRETE","LIVREE"].includes(s.statut)&&e.jsx("button",{onClick:()=>Be(s,n,i),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-orange-50 hover:border-orange-300",title:"Imprimer la facture",children:e.jsx(Fe,{size:12,className:"text-orange-500"})}),s.statut==="RECUE"&&e.jsx("button",{onClick:()=>Re(s),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-orange-50 hover:border-orange-300",title:"Lancer en production",children:e.jsx(Oe,{size:12,className:"text-orange-500"})}),s.statut==="PRETE"&&e.jsx("button",{onClick:()=>ze(s),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-green-50 hover:border-green-300",title:"Créer la vente en caisse",children:e.jsx(Pe,{size:12,className:"text-green-600"})}),d.next&&e.jsx("button",{onClick:()=>le(s,d.next),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-green-50 hover:border-green-300",title:d.action,children:e.jsx(ue,{size:12,className:"text-[var(--color-ok)]"})}),!["LIVREE","ANNULEE"].includes(s.statut)&&e.jsx("button",{onClick:()=>le(s,"ANNULEE"),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-red-50 hover:border-red-300",title:"Annuler",children:e.jsx(tt,{size:12,className:"text-[var(--color-err)]"})})]})})]},s.id)})})]})})}),e.jsx(O,{open:be==="create",onClose:()=>{k(null),K()},title:`Nouvelle commande — ${n.nom}`,size:"lg",footer:e.jsxs(e.Fragment,{children:[e.jsx(g,{variant:"outline",onClick:()=>{k(null),K()},children:"Annuler"}),e.jsx(g,{onClick:Ze,children:"Créer la commande"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Date de livraison *"}),e.jsx("input",{className:"input",type:"date",value:xe,onChange:s=>me(s.target.value)})]}),e.jsxs("div",{children:[e.jsxs("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:["Acompte (",(i==null?void 0:i.devise)??"F",")"]}),e.jsx("input",{className:"input",type:"number",min:"0",value:ie,onChange:s=>he(Number(s.target.value))})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-2",children:"Produits commandés *"}),e.jsxs("div",{className:"mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700",children:["💡 Les produits marqués ",e.jsx("strong",{children:'"à produire"'})," ne sont pas encore en stock — ils seront fabriqués avant la livraison."]}),e.jsx("div",{className:"space-y-2",children:oe.map((s,d)=>e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("select",{className:"input flex-1 text-sm",value:s.produitId,onChange:o=>pe(d,"produitId",o.target.value),children:[e.jsx("option",{value:"",children:"Choisir un produit..."}),m.map(o=>e.jsxs("option",{value:o.id,children:[o.nom," — ",r(o.prixVente),o.stockActuel>0?` (stock: ${o.stockActuel} pcs)`:" (à produire)"]},o.id))]}),e.jsx("input",{className:"input w-20 text-center text-sm",type:"number",min:"1",placeholder:"Qté",value:s.quantite||"",onChange:o=>pe(d,"quantite",parseInt(o.target.value)||0)}),e.jsx("input",{className:"input w-28 text-sm",type:"number",placeholder:"Prix",value:s.prixUnitaire||"",onChange:o=>pe(d,"prixUnitaire",Number(o.target.value))}),e.jsx("button",{onClick:()=>ae(o=>o.filter((b,v)=>v!==d)),disabled:oe.length===1,className:"p-2 rounded-lg border border-[var(--color-border)] hover:bg-red-50",children:e.jsx(Me,{size:12,className:"text-[var(--color-err)]"})})]},d))}),e.jsxs("div",{className:"mt-2 flex gap-2",children:[e.jsxs("button",{onClick:()=>ae(s=>[...s,{produitId:"",quantite:1,prixUnitaire:0}]),className:"flex-1 flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-dashed border-[var(--color-border-2)] justify-center text-[var(--color-text-2)]",children:[e.jsx(G,{size:12})," Ajouter une ligne"]}),e.jsxs("button",{onClick:()=>{Qe(""),Ye(""),He(!0)},className:"flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-dashed border-[var(--color-primary)] justify-center text-[var(--color-primary)] font-medium hover:bg-[var(--color-bg-2)]",children:[e.jsx(G,{size:12})," Nouveau produit"]})]})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-[var(--color-bg-2)] rounded-xl border border-[var(--color-border)]",children:[e.jsxs("div",{className:"text-sm",children:[e.jsx("span",{className:"text-[var(--color-text-2)]",children:"Total : "}),e.jsx("span",{className:"font-bold text-[var(--color-primary)]",children:r(ke)})]}),ie>0&&e.jsxs("div",{className:"text-sm",children:[e.jsx("span",{className:"text-[var(--color-text-2)]",children:"Reste : "}),e.jsx("span",{className:"font-bold text-[var(--color-err)]",children:r(ke-ie)})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Notes"}),e.jsx("input",{className:"input",value:ve,onChange:s=>fe(s.target.value),placeholder:"Occasion, allergies..."})]})]})}),e.jsx(O,{open:be==="detail",onClose:()=>{k(null),J(null)},title:`Commande ${(a==null?void 0:a.reference)??""}`,size:"lg",footer:e.jsxs("div",{className:"flex justify-between w-full",children:[e.jsx(g,{variant:"outline",onClick:()=>{k(null),J(null)},children:"Fermer"}),e.jsxs("div",{className:"flex gap-2",children:[a&&e.jsx(g,{variant:"outline",icon:e.jsx(Te,{size:14}),onClick:()=>qe(a,n,i),children:"Bon de commande"}),a&&["PRETE","LIVREE"].includes(a.statut)&&e.jsx(g,{variant:"outline",icon:e.jsx(ye,{size:14}),onClick:()=>Ve(a,n,i),children:"Bon de livraison"}),a&&["PRETE","LIVREE"].includes(a.statut)&&e.jsx(g,{variant:"outline",icon:e.jsx(Fe,{size:14}),onClick:()=>Be(a,n,i),children:"Facture"}),(a==null?void 0:a.statut)==="RECUE"&&e.jsx(g,{icon:e.jsx(Oe,{size:14}),onClick:()=>{k(null),Re(a)},children:"Lancer en production"}),(a==null?void 0:a.statut)==="PRETE"&&e.jsx(g,{icon:e.jsx(Pe,{size:14}),onClick:()=>{k(null),ze(a)},children:"Créer la vente"}),a&&A[a.statut].next&&a.statut!=="RECUE"&&e.jsx(g,{icon:e.jsx(ue,{size:14}),onClick:()=>le(a,A[a.statut].next),children:A[a.statut].action})]})]}),children:a&&(()=>{const s=A[a.statut],d=a.montantTotal-a.acompte;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(de,{type:s.type,children:s.label}),e.jsxs("div",{className:"text-sm text-[var(--color-text-2)]",children:["Livraison : ",e.jsx("strong",{children:new Date(a.dateLivraison).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})})]})]}),e.jsxs("div",{className:"space-y-1",children:[a.lignes.map(o=>e.jsxs("div",{className:"flex justify-between py-2 border-b border-[var(--color-border)] last:border-0 text-sm",children:[e.jsxs("span",{children:[o.produit.nom," ",e.jsxs("span",{className:"text-[var(--color-text-3)]",children:["× ",o.quantite]})]}),e.jsx("span",{className:"font-medium",children:r(o.sousTotal)})]},o.id)),e.jsxs("div",{className:"flex justify-between pt-2 font-bold",children:[e.jsx("span",{children:"Total"}),e.jsx("span",{children:r(a.montantTotal)})]}),a.acompte>0&&e.jsxs("div",{className:"flex justify-between text-sm text-[var(--color-ok)]",children:[e.jsx("span",{children:"Acompte"}),e.jsxs("span",{children:["- ",r(a.acompte)]})]}),e.jsxs("div",{className:`flex justify-between text-sm font-bold ${d>0?"text-[var(--color-err)]":"text-[var(--color-ok)]"}`,children:[e.jsx("span",{children:"Reste à payer"}),e.jsx("span",{children:d>0?r(d):"Soldé ✓"})]})]}),a.notes&&e.jsxs("div",{className:"p-3 bg-[var(--color-bg-2)] rounded-lg text-sm text-[var(--color-text-2)]",children:[e.jsx("span",{className:"font-medium",children:"Notes : "}),a.notes]}),e.jsx("div",{className:"flex items-center gap-1 flex-wrap",children:["RECUE","EN_PRODUCTION","PRETE","LIVREE"].map((o,b,v)=>e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("div",{className:`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${a.statut===o?"border-[var(--color-primary)] bg-[var(--color-bg-2)] text-[var(--color-primary)]":"border-[var(--color-border)] text-[var(--color-text-3)]"}`,children:A[o].label}),b<v.length-1&&e.jsx(ue,{size:12,className:"text-[var(--color-text-3)]"})]},o))})]})})()}),e.jsx(O,{open:Z==="edit",onClose:()=>{f(null),P()},title:`Modifier — ${j==null?void 0:j.nom}`,footer:e.jsxs(e.Fragment,{children:[e.jsx(g,{variant:"outline",onClick:()=>{f(null),P()},children:"Annuler"}),e.jsx(g,{onClick:$e,children:"Enregistrer"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-2",children:"Type"}),e.jsx("div",{className:"flex gap-3",children:[["PARTICULIER","Particulier",ce],["PROFESSIONNEL","Professionnel",ge]].map(([s,d,o])=>e.jsxs("button",{type:"button",onClick:()=>V(s),className:`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${N===s?"border-[var(--color-primary)] bg-[var(--color-bg-2)]":"border-[var(--color-border)]"}`,children:[e.jsx(o,{size:15,style:{color:N===s?"var(--color-primary)":"var(--color-text-3)"}}),e.jsx("span",{className:`text-sm font-medium ${N===s?"text-[var(--color-primary)]":"text-[var(--color-text-2)]"}`,children:d})]},s))})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Nom *"}),e.jsx("input",{className:"input",value:U,onChange:s=>q(s.target.value),placeholder:"Nom complet"})]}),N==="PROFESSIONNEL"&&e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Entreprise"}),e.jsx("input",{className:"input",value:re,onChange:s=>Q(s.target.value)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Téléphone"}),e.jsx("input",{className:"input",type:"tel",value:W,onChange:s=>B(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Email"}),e.jsx("input",{className:"input",type:"email",value:ee,onChange:s=>_(s.target.value)})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Adresse"}),e.jsx("input",{className:"input",value:te,onChange:s=>H(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Notes"}),e.jsx("input",{className:"input",value:se,onChange:s=>Y(s.target.value),placeholder:"Allergies, préférences..."})]})]})})]})}return e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center justify-between mb-6 flex-wrap gap-3",children:[e.jsx(Le,{children:"Clients"}),e.jsx(g,{size:"sm",icon:e.jsx(G,{size:14}),onClick:()=>{P(),f("create")},children:"Nouveau client"})]}),e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5",children:[e.jsx(I,{label:"Total clients",value:x.length}),e.jsx(I,{label:"Commandes en cours",value:je,deltaType:je>0?"warn":"neutral"}),e.jsx(I,{label:"CA total",value:r(Ke)}),e.jsx(I,{label:"À encaisser",value:r(Ne),deltaType:Ne>0?"warn":"neutral"})]}),we>0&&e.jsxs("div",{className:"mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700",children:[e.jsx(rt,{size:16,className:"flex-shrink-0 text-red-500"}),e.jsxs("span",{children:[e.jsxs("strong",{children:[we," commande(s) en retard"]})," — date de livraison dépassée !"]})]}),e.jsx(Ie,{title:"Liste des clients",children:M?e.jsx("div",{className:"flex justify-center py-12",children:e.jsx("div",{className:"w-6 h-6 rounded-full border-4 border-t-transparent animate-spin",style:{borderColor:"var(--color-primary)"}})}):x.length===0?e.jsxs("div",{className:"flex flex-col items-center py-16 gap-3 text-[var(--color-text-3)]",children:[e.jsx(ce,{size:40,opacity:.3}),e.jsx("p",{children:"Aucun client."})]}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsx("tr",{className:"border-b border-[var(--color-border)]",children:["Client","Type","Contact","Commandes","CA total","À encaisser","Actions"].map(t=>e.jsx("th",{className:"text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]",children:t},t))})}),e.jsx("tbody",{children:x.map(t=>{var l;return e.jsxs("tr",{className:"border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] cursor-pointer",onClick:()=>X(t),children:[e.jsxs("td",{className:"px-3 py-3",children:[e.jsx("div",{className:"font-semibold text-[var(--color-primary)]",children:t.nom}),t.entreprise&&e.jsx("div",{className:"text-xs text-[var(--color-text-3)]",children:t.entreprise})]}),e.jsx("td",{className:"px-3 py-3",children:e.jsx(de,{type:t.type==="PROFESSIONNEL"?"info":"neutral",children:t.type==="PROFESSIONNEL"?"Pro":"Particulier"})}),e.jsx("td",{className:"px-3 py-3",children:t.telephone?e.jsxs("div",{className:"flex items-center gap-1 text-[var(--color-text-2)]",children:[e.jsx(Ae,{size:11}),t.telephone]}):"—"}),e.jsx("td",{className:"px-3 py-3 text-center font-bold text-[var(--color-primary)]",children:((l=t._count)==null?void 0:l.commandes)??0}),e.jsx("td",{className:"px-3 py-3 font-medium",children:r(t.caTotal??0)}),e.jsx("td",{className:"px-3 py-3",children:(t.caEncours??0)>0?e.jsx("span",{className:"font-medium text-[var(--color-warn)]",children:r(t.caEncours??0)}):"—"}),e.jsx("td",{className:"px-3 py-3",onClick:u=>u.stopPropagation(),children:e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>Ee(t),className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)]",children:e.jsx(De,{size:13})}),e.jsx("button",{onClick:()=>{S(t),f("delete")},className:"p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-red-50 hover:border-red-300",children:e.jsx(Me,{size:13,className:"text-[var(--color-err)]"})})]})})]},t.id)})})]})})}),e.jsx(O,{open:Z==="create",onClose:()=>{f(null),P()},title:"Nouveau client",footer:e.jsxs(e.Fragment,{children:[e.jsx(g,{variant:"outline",onClick:()=>{f(null),P()},children:"Annuler"}),e.jsx(g,{onClick:Ge,children:"Créer"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-2",children:"Type"}),e.jsx("div",{className:"flex gap-3",children:[["PARTICULIER","Particulier",ce],["PROFESSIONNEL","Professionnel",ge]].map(([t,l,u])=>e.jsxs("button",{type:"button",onClick:()=>V(t),className:`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${N===t?"border-[var(--color-primary)] bg-[var(--color-bg-2)]":"border-[var(--color-border)]"}`,children:[e.jsx(u,{size:15,style:{color:N===t?"var(--color-primary)":"var(--color-text-3)"}}),e.jsx("span",{className:`text-sm font-medium ${N===t?"text-[var(--color-primary)]":"text-[var(--color-text-2)]"}`,children:l})]},t))})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Nom *"}),e.jsx("input",{className:"input",value:U,onChange:t=>q(t.target.value),placeholder:"Nom complet"})]}),N==="PROFESSIONNEL"&&e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Entreprise"}),e.jsx("input",{className:"input",value:re,onChange:t=>Q(t.target.value)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Téléphone"}),e.jsx("input",{className:"input",type:"tel",value:W,onChange:t=>B(t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Email"}),e.jsx("input",{className:"input",type:"email",value:ee,onChange:t=>_(t.target.value)})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Adresse"}),e.jsx("input",{className:"input",value:te,onChange:t=>H(t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Notes"}),e.jsx("input",{className:"input",value:se,onChange:t=>Y(t.target.value),placeholder:"Allergies, préférences..."})]})]})}),e.jsx(O,{open:Z==="edit",onClose:()=>{f(null),S(null),P()},title:`Modifier — ${j==null?void 0:j.nom}`,footer:e.jsxs(e.Fragment,{children:[e.jsx(g,{variant:"outline",onClick:()=>{f(null),S(null),P()},children:"Annuler"}),e.jsx(g,{onClick:$e,children:"Enregistrer"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-2",children:"Type"}),e.jsx("div",{className:"flex gap-3",children:[["PARTICULIER","Particulier",ce],["PROFESSIONNEL","Professionnel",ge]].map(([t,l,u])=>e.jsxs("button",{type:"button",onClick:()=>V(t),className:`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${N===t?"border-[var(--color-primary)] bg-[var(--color-bg-2)]":"border-[var(--color-border)]"}`,children:[e.jsx(u,{size:15,style:{color:N===t?"var(--color-primary)":"var(--color-text-3)"}}),e.jsx("span",{className:`text-sm font-medium ${N===t?"text-[var(--color-primary)]":"text-[var(--color-text-2)]"}`,children:l})]},t))})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Nom *"}),e.jsx("input",{className:"input",value:U,onChange:t=>q(t.target.value),placeholder:"Nom complet"})]}),N==="PROFESSIONNEL"&&e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Entreprise"}),e.jsx("input",{className:"input",value:re,onChange:t=>Q(t.target.value)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Téléphone"}),e.jsx("input",{className:"input",type:"tel",value:W,onChange:t=>B(t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Email"}),e.jsx("input",{className:"input",type:"email",value:ee,onChange:t=>_(t.target.value)})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Adresse"}),e.jsx("input",{className:"input",value:te,onChange:t=>H(t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-2)] block mb-1",children:"Notes"}),e.jsx("input",{className:"input",value:se,onChange:t=>Y(t.target.value),placeholder:"Allergies, préférences..."})]})]})}),e.jsx(O,{open:Z==="delete",onClose:()=>{f(null),S(null)},title:"Supprimer",size:"sm",footer:e.jsxs(e.Fragment,{children:[e.jsx(g,{variant:"outline",onClick:()=>{f(null),S(null)},children:"Annuler"}),e.jsx(g,{variant:"danger",onClick:Xe,children:"Supprimer"})]}),children:e.jsxs(Se,{type:"warn",children:["Supprimer ",e.jsx("strong",{children:j==null?void 0:j.nom})," ? Ses commandes seront conservées."]})})]})}export{ft as default};
