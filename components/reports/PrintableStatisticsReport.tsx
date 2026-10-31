"use client";

import React from "react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ReportCounts {
  courriersArrivee: number;
  courriersDepart: number;
  servicesCourants: number;
  situations: number;
  archives: number;
  archivesCatA: number;
  archivesCatB: number;
  courriersCat3: number;
  courriersCat3S: number;
  plaintes: number;
  procesVerbaux: number;
}

interface MetricRow {
  id: string;
  label: string;
  value: number;
  included: boolean;
}

interface PrintableStatisticsReportProps {
  counts: ReportCounts;
  activeMetrics: MetricRow[];
  totalActif: number;
  isAdmin: boolean;
  reportDate: string; // e.g. "31 octobre 2026"
}

// ─── Configuration facilement modifiable sans toucher au code JSX ─────────────
const SIGNATURE_CONFIG = {
  officerGrade: "Le capitaine",
  officerName: "TSINJOBSEY Ysgabert,",
  officerTitle: "Commandant de la Compagnie de Sécurité Intérieure",
  officerLocation: "de Sakaraha",
  city: "Sakaraha",
};

// ─── Styles réutilisables ─────────────────────────────────────────────────────
const S = {
  // Cellule d'en-tête de colonne
  thCol: {
    border: "0.5pt solid #000000",
    padding: "4pt 6pt",
    fontWeight: "bold" as const,
    fontSize: "8pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.2pt",
    backgroundColor: "#f0f0f0",
    color: "#000000",
  },
  // Cellule de données
  td: {
    border: "0.5pt solid #000000",
    padding: "4pt 6pt",
    fontSize: "9pt",
    color: "#000000",
  },
  // Cellule de titre de tableau (pleine largeur)
  tableTitle: {
    border: "0.5pt solid #000000",
    padding: "5pt 8pt",
    textAlign: "left" as const,
    fontWeight: "bold" as const,
    fontSize: "10pt",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3pt",
    backgroundColor: "#e8e8e8",
    color: "#000000",
  },
};

// ─── Composant principal ──────────────────────────────────────────────────────

export function PrintableStatisticsReport({
  counts,
  activeMetrics,
  totalActif,
  reportDate,
}: PrintableStatisticsReportProps) {
  return (
    <div
      id="printable-report"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10pt",
        color: "#000000",
        backgroundColor: "#ffffff",
        width: "100%",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EN-TÊTE INSTITUTIONNEL                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8mm",
          width: "100%",
        }}
      >
        {/* ── BLOC GAUCHE ─────────────────────────────────────────────── */}
        <div
          style={{
            width: "55%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* COMMANDEMENT DES FORMATIONS SPÉCIALISÉES */}
          <p
            style={{
              fontWeight: "bold",
              fontSize: "9pt",
              textTransform: "uppercase",
              margin: "0 0 4.20pt 0",
              letterSpacing: "0.2pt",
              lineHeight: "1.2",
            }}
          >
            COMMANDEMENT DES FORMATIONS SPÉCIALISÉES
          </p>
          {/* Trait 1 */}
          <div
            style={{
              width: "38mm",
              height: "0.5pt",
              backgroundColor: "#000000",
              margin: "0 0 6pt 0",
            }}
          />

          {/* GROUPEMENT DE SÉCURITÉ INTÉRIEURE */}
          <p
            style={{
              fontWeight: "bold",
              fontSize: "9pt",
              textTransform: "uppercase",
              margin: "0 0 5pt 0",
              letterSpacing: "0.2pt",
              lineHeight: "1.2",
            }}
          >
            GROUPEMENT DE SÉCURITÉ INTÉRIEURE
          </p>
          {/* Trait 2 */}
          <div
            style={{
              width: "38mm",
              height: "0.5pt",
              backgroundColor: "#000000",
              margin: "0 0 6pt 0",
            }}
          />

          {/* COMPAGNIE DE SÉCURITÉ INTÉRIEURE — sans trait */}
          <p
            style={{
              fontWeight: "bold",
              fontSize: "9pt",
              textTransform: "uppercase",
              margin: "0 0 5pt 0",
              letterSpacing: "0.2pt",
              lineHeight: "1.2",
            }}
          >
            COMPAGNIE DE SÉCURITÉ INTÉRIEURE
          </p>

          {/* SAKARAHA — sans trait */}
          <p
            style={{
              fontWeight: "bold",
              fontSize: "9pt",
              textTransform: "uppercase",
              margin: "0 0 5pt 0",
              letterSpacing: "0.2pt",
              lineHeight: "1.2",
            }}
          >
            SAKARAHA
          </p>

          {/* Trait 3 */}
          <div
            style={{
              width: "38mm",
              height: "0.5pt",
              backgroundColor: "#000000",
              margin: "0 0 6pt 0",
            }}
          />
        </div>

        {/* ── BLOC DROIT ──────────────────────────────────────────────── */}
        <div
          style={{
            width: "38%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* REPOBLIKAN'I MADAGASIKARA */}
          <p
            style={{
              fontWeight: "bold",
              fontSize: "9pt",
              textTransform: "uppercase",
              margin: "0 0 2pt 0",
              letterSpacing: "0.2pt",
              lineHeight: "1.2",
            }}
          >
            REPOBLIKAN&apos;I MADAGASIKARA
          </p>

          {/* Devise en italique */}
          <p
            style={{
              fontStyle: "italic",
              fontSize: "9pt",
              margin: "0 0 5pt 0",
              lineHeight: "1.2",
            }}
          >
            Fitaviana – Tanindrazana – Fandrosoana
          </p><br />

          {/* Trait sous la devise */}
          <div
            style={{
              width: "38mm",
              height: "0.5pt",
              backgroundColor: "#000000",
              margin: "0 0 0 0",
            }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TITRE DU RAPPORT                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          width: "100%",
          border: "0.8pt solid #888888",
          backgroundColor: "#efefef",
          padding: "7pt 12pt",
          textAlign: "center",
          marginBottom: "8mm",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            fontWeight: "bold",
            fontSize: "15pt",
            textTransform: "uppercase",
            margin: "0",
            letterSpacing: "0.5pt",
            color: "#000000",
          }}
        >
          RAPPORT STATISTIQUE OFFICIEL D&apos;ACTIVITÉ
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABLEAU 1 : RÉCAPITULATIF DES CHIFFRES OFFICIELS                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "0.5pt solid #000000",
          marginBottom: "8mm",
          fontSize: "9pt",
          pageBreakInside: "avoid",
        }}
      >
        <thead>
          {/* Titre du tableau */}
          <tr>
            <th colSpan={4} style={S.tableTitle}>
              RÉCAPITULATIF DES CHIFFRES OFFICIELS
            </th>
          </tr>
          {/* En-têtes de colonnes */}
          <tr>
            <th
              style={{
                ...S.thCol,
                textAlign: "left",
                width: "37%",
              }}
            >
              REGISTRE / CATÉGORIE
            </th>
            <th
              style={{
                ...S.thCol,
                textAlign: "center",
                width: "25%",
              }}
            >
              STATUT INCLUSION
            </th>
            <th
              style={{
                ...S.thCol,
                textAlign: "center",
                width: "20%",
              }}
            >
              VOLUME ENREGISTRÉ
            </th>
            <th
              style={{
                ...S.thCol,
                textAlign: "center",
                width: "18%",
              }}
            >
              PART RELATIVE (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {activeMetrics.map((row) => {
            const pct =
              totalActif > 0 && row.included
                ? ((row.value / totalActif) * 100).toFixed(1) + " %"
                : "0,0 %";
            return (
              <tr key={row.id}>
                <td
                  style={{
                    ...S.td,
                    textAlign: "left",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    ...S.td,
                    textAlign: "center",
                  }}
                >
                  {row.included ? "Inclus" : "Exclu"}
                </td>
                <td
                  style={{
                    ...S.td,
                    textAlign: "center",
                  }}
                >
                  {row.value}
                </td>
                <td
                  style={{
                    ...S.td,
                    textAlign: "center",
                  }}
                >
                  {pct}
                </td>
              </tr>
            );
          })}
        </tbody>
        {/* TOTAL ACTIF */}
        <tfoot>
          <tr>
            <td
              style={{
                ...S.td,
                textAlign: "left",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.3pt",
                backgroundColor: "#f4f4f4",
              }}
            >
              TOTAL ACTIF
            </td>
            <td
              style={{
                ...S.td,
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "#f4f4f4",
              }}
            >
              {activeMetrics.filter((r) => r.included).length} modules
            </td>
            <td
              style={{
                ...S.td,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "10pt",
                backgroundColor: "#f4f4f4",
              }}
            >
              {totalActif}
            </td>
            <td
              style={{
                ...S.td,
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "#f4f4f4",
              }}
            >
              100 %
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABLEAU 2 : VENTILATION DÉTAILLÉE PAR SOUS-REGISTRE               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "0.5pt solid #000000",
          marginBottom: "14mm",
          fontSize: "9pt",
          pageBreakInside: "avoid",
        }}
      >
        <thead>
          {/* Titre du tableau */}
          <tr>
            <th colSpan={2} style={S.tableTitle}>
              VENTILATION DÉTAILLÉE PAR SOUS-REGISTRE
            </th>
          </tr>
          {/* En-têtes de colonnes */}
          <tr>
            <th
              style={{
                ...S.thCol,
                textAlign: "left",
                width: "75%",
              }}
            >
              SOUS-REGISTRE
            </th>
            <th
              style={{
                ...S.thCol,
                textAlign: "center",
                width: "25%",
              }}
            >
              NOMBRE ENREGISTRÉ
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Archives Catégorie A (durée de conservation ≤ 3 ans)
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.archivesCatA}
            </td>
          </tr>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Archives Catégorie B (durée de conservation ≤ 10 ans)
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.archivesCatB}
            </td>
          </tr>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Courriers Arrivée Ordinaires ({counts.courriersCat3}/{counts.courriersArrivee})
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.courriersCat3}
            </td>
          </tr>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Courriers Arrivée Secrets ({counts.courriersCat3S}/{counts.courriersArrivee})
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.courriersCat3S}
            </td>
          </tr>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Flux Courriers Global (Reçus + Envoyés)
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.courriersArrivee + counts.courriersDepart}
            </td>
          </tr>
          <tr>
            <td style={{ ...S.td, textAlign: "left" }}>
              Opérations de Sécurité Intérieure (Services courants + Situations d&apos;armes)
            </td>
            <td style={{ ...S.td, textAlign: "center" }}>
              {counts.servicesCourants + counts.situations}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BLOC DE SIGNATURE                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: "4%",
        }}
      >
        <div
          style={{
            width: "52%",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 2pt 0",
              fontSize: "9pt",
              color: "#000000",
              lineHeight: "1.5",
            }}
          >
            À {SIGNATURE_CONFIG.city}, le {reportDate}
          </p>
          <p
            style={{
              margin: "0 0 1pt 0",
              fontSize: "9pt",
              color: "#000000",
              lineHeight: "1.5",
            }}
          >
            {SIGNATURE_CONFIG.officerGrade} {SIGNATURE_CONFIG.officerName}
          </p>
          <p
            style={{
              margin: "0 0 1pt 0",
              fontSize: "9pt",
              color: "#000000",
              lineHeight: "1.5",
            }}
          >
            {SIGNATURE_CONFIG.officerTitle}
          </p>
          <p
            style={{
              margin: "0 0 0 0",
              fontSize: "9pt",
              color: "#000000",
              lineHeight: "1.5",
            }}
          >
            {SIGNATURE_CONFIG.officerLocation}
          </p>

          {/* Espace pour la signature manuscrite (~18mm) */}
          <div style={{ height: "18mm" }} />

          {/* Trait de signature centré */}
          <div
            style={{
              width: "60mm",
              height: "0.5pt",
              backgroundColor: "#000000",
              margin: "0 auto",
            }}
          />
        </div>
      </div>
    </div>
  );
}
