"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth/context";
import { api } from "@/lib/api/endpoints";
import { Badge } from "@/components/ui/Badge";
import {
  IconChart,
  IconInbox,
  IconOutbox,
  IconClipboard,
  IconSword,
  IconArchive,
  IconScale,
  IconScroll,
  IconDownload,
  IconPrinter,
  IconRefresh,
} from "@/components/ui/Icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type ChartType = "bar" | "pie" | "line";
type PeriodFilter = "all" | "30d" | "7d";

interface MetricConfig {
  id: string;
  label: string;
  color: string;
  adminOnly?: boolean;
  value: number;
  categorieA?: number;
  categorieB?: number;
}

const COLORS = [
  "#24563B", // CSI Vert inst
  "#059669", // Emeraude
  "#d97706", // Ambre
  "#2563eb", // Bleu
  "#7c3aed", // Violet
  "#dc2626", // Rouge
  "#0891b2", // Cyan
];

export default function StatistiquesPage() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  // Sélecteur de données : quels modules afficher
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, boolean>>({
    courriersArrivee: true,
    courriersDepart: true,
    servicesCourants: true,
    situations: true,
    archives: true,
    plaintes: true,
    procesVerbaux: true,
  });

  // Données brutes
  const [counts, setCounts] = useState({
    courriersArrivee: 0,
    courriersDepart: 0,
    servicesCourants: 0,
    situations: 0,
    archives: 0,
    archivesCatA: 0,
    archivesCatB: 0,
    courriersCat3: 0,
    courriersCat3S: 0,
    plaintes: 0,
    procesVerbaux: 0,
  });

  // Chargement des données réelles
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [arrRes, depRes, servRes, sitRes, docRes, docCatARes, docCatBRes, arrCat3Res, arrCat3SRes] =
        await Promise.all([
          api.courriersArrivee.list(0, 1),
          api.courriersDepart.list(0, 1),
          api.servicesCourants.list(0, 1),
          api.situations.list(0, 1),
          api.documents.list(0, 1),
          api.documents.list(0, 1, "A"),
          api.documents.list(0, 1, "B"),
          api.courriersArrivee.list(0, 1, "/3"),
          api.courriersArrivee.list(0, 1, "/3S"),
        ]);

      let plaintesTotal = 0;
      let pvTotal = 0;

      if (isAdmin) {
        try {
          const [plRes, pvRes] = await Promise.all([
            api.plaintes.list(0, 1),
            api.procesVerbaux.list(0, 1),
          ]);
          plaintesTotal = plRes.total;
          pvTotal = pvRes.total;
        } catch {
          // Si pas les droits
        }
      }

      setCounts({
        courriersArrivee: arrRes.total,
        courriersDepart: depRes.total,
        servicesCourants: servRes.total,
        situations: sitRes.total,
        archives: docRes.total,
        archivesCatA: docCatARes.total,
        archivesCatB: docCatBRes.total,
        courriersCat3: arrCat3Res.total,
        courriersCat3S: arrCat3SRes.total,
        plaintes: plaintesTotal,
        procesVerbaux: pvTotal,
      });
    } catch (err) {
      console.error("Erreur de récupération des statistiques :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadStats();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  // Définition des modules de métriques disponibles
  const allMetricDefinitions: MetricConfig[] = useMemo(() => {
    const list: MetricConfig[] = [
      {
        id: "courriersArrivee",
        label: "Courriers Reçus (/3 & /3S)",
        color: "#24563B",
        value: counts.courriersArrivee,
        categorieA: counts.courriersCat3,
        categorieB: counts.courriersCat3S,
      },
      {
        id: "courriersDepart",
        label: "Courriers Envoyés (/2 & /2S)",
        color: "#059669",
        value: counts.courriersDepart,
      },
      {
        id: "servicesCourants",
        label: "Services Courants (Missions)",
        color: "#2563eb",
        value: counts.servicesCourants,
      },
      {
        id: "situations",
        label: "Prises d'Arme & Dotations",
        color: "#d97706",
        value: counts.situations,
      },
      {
        id: "archives",
        label: "Pièces Numérisées / Archives",
        color: "#7c3aed",
        value: counts.archives,
        categorieA: counts.archivesCatA,
        categorieB: counts.archivesCatB,
      },
    ];

    if (isAdmin) {
      list.push(
        {
          id: "plaintes",
          label: "Plaintes & Dénonciations",
          color: "#dc2626",
          value: counts.plaintes,
          adminOnly: true,
        },
        {
          id: "procesVerbaux",
          label: "Procès-Verbaux Judiciaires",
          color: "#0891b2",
          value: counts.procesVerbaux,
          adminOnly: true,
        }
      );
    }

    return list;
  }, [counts, isAdmin]);

  // Filtrage des métriques sélectionnées par l'utilisateur
  const activeMetrics = useMemo(() => {
    return allMetricDefinitions.filter((m) => selectedMetrics[m.id]);
  }, [allMetricDefinitions, selectedMetrics]);

  // Données formatées pour le BarChart et LineChart
  const chartData = useMemo(() => {
    return activeMetrics.map((m) => ({
      name: m.label.split(" (")[0], // Nom raccourci
      fullName: m.label,
      total: m.value,
      color: m.color,
    }));
  }, [activeMetrics]);

  // Données pour le PieChart
  const pieData = useMemo(() => {
    return activeMetrics
      .filter((m) => m.value > 0)
      .map((m) => ({
        name: m.label.split(" (")[0],
        value: m.value,
        color: m.color,
      }));
  }, [activeMetrics]);

  // Total cumulé affiché
  const totalActif = useMemo(() => {
    return activeMetrics.reduce((sum, item) => sum + item.value, 0);
  }, [activeMetrics]);

  // Toggle d'une métrique individuelle
  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sélectionner tout / désélectionner tout
  const selectAll = (status: boolean) => {
    const updated: Record<string, boolean> = {};
    allMetricDefinitions.forEach((m) => {
      updated[m.id] = status;
    });
    setSelectedMetrics(updated);
  };

  // ─── TÉLÉCHARGEMENT DU RAPPORT CSV ───
  const handleDownloadCSV = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR").replace(/\//g, "-");
    const filename = `Rapport_Statistiques_CSI_Sakaraha_${dateStr}.csv`;

    let csvContent = "data:text/csv;charset=utf-8,﻿"; // BOM UTF-8 pour Excel
    csvContent += "RAPPORT STATISTIQUE D'ACTIVITÉ - CSI SAKARAHA\n";
    csvContent += `Date d'extraction : ${now.toLocaleString("fr-FR")}\n`;
    csvContent += `Généré par : ${user?.nom_utilisateur || "Agent"} (${user?.role || "UTILISATEUR"})\n\n`;
    csvContent += "Registre / Module;Total Enregistrements;Part (%)\n";

    activeMetrics.forEach((m) => {
      const pct = totalActif > 0 ? ((m.value / totalActif) * 100).toFixed(1) : "0.0";
      csvContent += `"${m.label}";${m.value};${pct}%\n`;
    });

    csvContent += `\nTOTAL CUMULÉ;${totalActif};100%\n`;
    csvContent += `\nVentilation Spécifique :\n`;
    csvContent += `Archives Catégorie A (3 ans);;${counts.archivesCatA}\n`;
    csvContent += `Archives Catégorie B (10 ans);;${counts.archivesCatB}\n`;
    csvContent += `Courriers Arrivée Ordinaires (/3);;${counts.courriersCat3}\n`;
    csvContent += `Courriers Arrivée Secrets (/3S);;${counts.courriersCat3S}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── IMPRESSION / EXPORT PDF DU RAPPORT OFFICIEL ───
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── En-tête de la page ── */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center cursor-pointer logo-spin-hover" title="CSI Sakaraha">
              <Image
                src="/logo.png"
                alt="Logo CSI Sakaraha"
                width={48}
                height={48}
                className="object-contain w-full h-full drop-shadow-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--csi-vert-deep)]">
                  Statistiques &amp; Rapports d'Activité
                </h1>
                <Badge variant="default">CSI Sakaraha</Badge>
              </div>
              <p className="text-xs text-[var(--csi-text-secondary)] mt-0.5">
                Tableaux graphiques dynamiques et extraction de rapports officiels
              </p>
            </div>
          </div>

          {/* Boutons d'exportation de rapport */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadStats}
              disabled={isLoading}
              title="Rafraîchir les données"
              className="p-2 border border-[var(--csi-border)] hover:bg-[var(--csi-bg)] text-[var(--csi-text-secondary)] hover:text-[var(--csi-text-primary)] rounded-xl transition-colors"
            >
              <IconRefresh size={16} />
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={isLoading || totalActif === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-[var(--csi-surface)] hover:bg-[var(--csi-bg)] border border-[var(--csi-border)] text-xs font-semibold text-[var(--csi-text-primary)] rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <IconDownload size={14} className="text-[var(--csi-vert-inst)]" />
              <span>Rapport CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={isLoading || totalActif === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--csi-vert-deep)] hover:bg-[var(--csi-vert-hover)] text-xs font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95"
            >
              <IconPrinter size={14} />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>

        {/* ── Zone de Contrôle & Choix d'affichage (Filtres) ── */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--csi-border-subtle)]">
            <div>
              <span className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider block">
                Personnalisation de l'affichage
              </span>
              <span className="text-[11px] text-[var(--csi-text-secondary)]">
                Cochez les registres à inclure et choisissez le modèle de graphique souhaité
              </span>
            </div>

            {/* Type de Chart : Barres / Camembert / Courbe */}
            <div className="flex items-center gap-1 bg-[var(--csi-bg)] p-1 rounded-xl border border-[var(--csi-border)] self-start md:self-auto">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "bar"
                    ? "bg-[var(--csi-surface)] text-[var(--csi-vert-deep)] shadow-xs font-semibold"
                    : "text-[var(--csi-text-secondary)] hover:text-[var(--csi-text-primary)]"
                }`}
              >
                📊 Histogramme
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "pie"
                    ? "bg-[var(--csi-surface)] text-[var(--csi-vert-deep)] shadow-xs font-semibold"
                    : "text-[var(--csi-text-secondary)] hover:text-[var(--csi-text-primary)]"
                }`}
              >
                🥧 Répartition
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "line"
                    ? "bg-[var(--csi-surface)] text-[var(--csi-vert-deep)] shadow-xs font-semibold"
                    : "text-[var(--csi-text-secondary)] hover:text-[var(--csi-text-primary)]"
                }`}
              >
                📈 Courbe
              </button>
            </div>
          </div>

          {/* Cases à cocher des modules à afficher */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-[var(--csi-text-secondary)] uppercase mr-1">
              Registres :
            </span>

            {allMetricDefinitions.map((m) => {
              const isChecked = !!selectedMetrics[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMetric(m.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isChecked
                      ? "bg-[var(--csi-vert-light)] border-[var(--csi-vert-inst)] text-[var(--csi-vert-deep)] shadow-2xs"
                      : "bg-[var(--csi-surface)] border-[var(--csi-border)] text-[var(--csi-text-secondary)] hover:border-[var(--csi-border-subtle)]"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: isChecked ? m.color : "#9ca3af" }}
                  />
                  <span>{m.label.split(" (")[0]}</span>
                  <span className="text-[10px] opacity-75 font-bold">({m.value})</span>
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => selectAll(true)}
                className="text-[11px] text-[var(--csi-vert-inst)] hover:underline font-medium"
              >
                Tout cocher
              </button>
              <span className="text-[var(--csi-border)]">•</span>
              <button
                onClick={() => selectAll(false)}
                className="text-[11px] text-[var(--csi-text-secondary)] hover:underline font-medium"
              >
                Tout décocher
              </button>
            </div>
          </div>
        </div>

        {/* ── Cartes Synthèses Clés ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[var(--csi-text-secondary)] uppercase tracking-wider block">
              Volume Total Sélectionné
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[var(--csi-vert-deep)]">
                {isLoading ? "…" : totalActif}
              </span>
              <span className="text-xs text-[var(--csi-text-secondary)]">actes</span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[var(--csi-text-secondary)] uppercase tracking-wider block">
              Flux Courriers Global
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[var(--csi-text-primary)]">
                {isLoading ? "…" : counts.courriersArrivee + counts.courriersDepart}
              </span>
              <span className="text-xs text-[var(--csi-text-secondary)]">
                ({counts.courriersArrivee} reçus / {counts.courriersDepart} envoyés)
              </span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[var(--csi-text-secondary)] uppercase tracking-wider block">
              Archives Catégorie A vs B
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-700">
                {isLoading ? "…" : counts.archives}
              </span>
              <span className="text-xs text-[var(--csi-text-secondary)]">
                (A: {counts.archivesCatA} | B: {counts.archivesCatB})
              </span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4">
            <span className="text-[11px] font-bold text-[var(--csi-text-secondary)] uppercase tracking-wider block">
              Opérations de Sécurité
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-blue-700">
                {isLoading ? "…" : counts.servicesCourants + counts.situations}
              </span>
              <span className="text-xs text-[var(--csi-text-secondary)]">
                ({counts.servicesCourants} serv. / {counts.situations} armes)
              </span>
            </div>
          </div>
        </div>

        {/* ── ZONE DE GRAPHIQUE INTERACTIF (RECHARTS) ── */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--csi-border-subtle)]">
            <div className="flex items-center gap-2">
              <IconChart size={18} className="text-[var(--csi-vert-inst)]" />
              <h2 className="text-sm font-bold text-[var(--csi-text-primary)] uppercase tracking-wide">
                Visualisation Graphique
              </h2>
            </div>
            <span className="text-xs text-[var(--csi-text-secondary)]">
              {activeMetrics.length} registre(s) affiché(s)
            </span>
          </div>

          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-3 text-[var(--csi-text-secondary)]">
              <div className="w-8 h-8 border-2 border-[var(--csi-vert-inst)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Chargement et calcul des métriques...</p>
            </div>
          ) : activeMetrics.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-[var(--csi-bg)] rounded-xl border border-dashed border-[var(--csi-border)]">
              <p className="text-sm font-semibold text-[var(--csi-text-primary)]">
                Aucun registre sélectionné
              </p>
              <p className="text-xs text-[var(--csi-text-secondary)] mt-1">
                Veuillez cocher au moins un registre ci-dessus pour afficher le graphique.
              </p>
              <button
                onClick={() => selectAll(true)}
                className="mt-3 px-4 py-1.5 bg-[var(--csi-vert-inst)] text-white text-xs font-semibold rounded-lg"
              >
                Tout sélectionner
              </button>
            </div>
          ) : (
            <div className="w-full h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#4b5563", fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [val + " actes", "Total"]}
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : chartType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [val + " actes", "Volume"]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [val + " actes", "Total"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#24563B"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#24563B" }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Tableau Détaillé du Rapport Imprimable ── */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl overflow-hidden shadow-xs print:border-none print:shadow-none">
          <div className="p-4 border-b border-[var(--csi-border)] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--csi-vert-deep)] uppercase tracking-wider">
              Récapitulatif des Chiffres Officiels
            </h3>
            <span className="text-[11px] text-[var(--csi-text-secondary)]">
              Base de données CSI Sakaraha certifiée
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--csi-bg)] text-[var(--csi-text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--csi-border)]">
                <tr>
                  <th className="py-3 px-4">Registre / Catégorie</th>
                  <th className="py-3 px-4 text-center">Statut Inclusion</th>
                  <th className="py-3 px-4 text-right">Volume Enregistré</th>
                  <th className="py-3 px-4 text-right">Part Relative (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--csi-border-subtle)]">
                {allMetricDefinitions.map((m) => {
                  const isChecked = !!selectedMetrics[m.id];
                  const pct = totalActif > 0 && isChecked ? ((m.value / totalActif) * 100).toFixed(1) : "—";

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-[var(--csi-vert-light)] transition-colors ${
                        !isChecked ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-[var(--csi-text-primary)] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <span>{m.label}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={isChecked ? "success" : "neutral"}>
                          {isChecked ? "Inclus" : "Exclu"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--csi-vert-deep)]">
                        {m.value}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--csi-text-secondary)]">
                        {pct !== "—" ? `${pct} %` : pct}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[var(--csi-bg)] font-bold border-t border-[var(--csi-border)]">
                <tr>
                  <td className="py-3.5 px-4 text-[var(--csi-vert-deep)] uppercase">
                    Total Actif
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-[var(--csi-text-secondary)]">
                    {activeMetrics.length} modules
                  </td>
                  <td className="py-3.5 px-4 text-right text-base text-[var(--csi-vert-deep)]">
                    {totalActif}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--csi-vert-deep)]">
                    100 %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Pied de page pour impression officielle (masqué à l'écran, affiché au print) ── */}
        <div className="hidden print:block pt-8 text-center text-xs text-gray-500 border-t border-gray-300">
          <p className="font-semibold uppercase tracking-wider text-black">
            Gendarmerie Nationale de Madagascar — Compagnie de Sakaraha
          </p>
          <p className="mt-1">
            Certifié exact et conforme aux registres numériques en vigueur.
          </p>
          <div className="mt-8 flex justify-between px-12">
            <div>
              <p className="font-medium underline">Le Gestionnaire des Registres :</p>
              <p className="mt-12 font-bold">{user?.nom_utilisateur || "L'Agent Habilité"}</p>
            </div>
            <div>
              <p className="font-medium underline">Le Commandant de Brigade / CSI :</p>
              <p className="mt-12 font-bold">Pour Ordre et Visa</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
