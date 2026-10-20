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
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Palette monochrome et contrastes élégants
const MONO_COLORS = [
  "#18181b", // zinc-900 (noir profond)
  "#3f3f46", // zinc-700
  "#52525b", // zinc-600
  "#71717a", // zinc-500
  "#a1a1aa", // zinc-400
  "#27272a", // zinc-800
  "#404040", // neutral-700
];

export default function StatistiquesPage() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("fr-FR"));
  }, []);

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

  // Définition des modules de métriques disponibles avec icônes noir et blanc
  const allMetricDefinitions: MetricConfig[] = useMemo(() => {
    const list: MetricConfig[] = [
      {
        id: "courriersArrivee",
        label: "Courriers Reçus (/3 & /3S)",
        color: MONO_COLORS[0],
        value: counts.courriersArrivee,
        categorieA: counts.courriersCat3,
        categorieB: counts.courriersCat3S,
        icon: IconInbox,
      },
      {
        id: "courriersDepart",
        label: "Courriers Envoyés (/2 & /2S)",
        color: MONO_COLORS[1],
        value: counts.courriersDepart,
        icon: IconOutbox,
      },
      {
        id: "servicesCourants",
        label: "Services Courants (Missions)",
        color: MONO_COLORS[2],
        value: counts.servicesCourants,
        icon: IconClipboard,
      },
      {
        id: "situations",
        label: "Prises d'Arme & Dotations",
        color: MONO_COLORS[3],
        value: counts.situations,
        icon: IconSword,
      },
      {
        id: "archives",
        label: "Pièces Numérisées / Archives",
        color: MONO_COLORS[4],
        value: counts.archives,
        categorieA: counts.archivesCatA,
        categorieB: counts.archivesCatB,
        icon: IconArchive,
      },
    ];

    if (isAdmin) {
      list.push(
        {
          id: "plaintes",
          label: "Plaintes & Dénonciations",
          color: MONO_COLORS[5],
          value: counts.plaintes,
          adminOnly: true,
          icon: IconScale,
        },
        {
          id: "procesVerbaux",
          label: "Procès-Verbaux Judiciaires",
          color: MONO_COLORS[6],
          value: counts.procesVerbaux,
          adminOnly: true,
          icon: IconScroll,
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
        {/* ── En-tête officiel imprimable uniquement (Masqué à l'écran, affiché au print) ── */}
        <div className="hidden print:block mb-8 border-b-2 border-[#24563B] pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-gray-800">
                REPOBLIKAN&apos;I MADAGASIKARA
              </p>
              <p className="text-[10px] text-gray-600 italic">
                Fitiavana — Tanindrazana — Fandrosoana
              </p>
              <div className="mt-2 text-[10px] text-gray-700 leading-tight">
                <p className="font-semibold">MINISTÈRE DES FORCES ARMÉES</p>
                <p>GENDARMERIE NATIONALE</p>
                <p>COMMANDEMENT DE LA GENDARMERIE</p>
                <p>GROUPEMENT DE SAKARAHA</p>
                <p className="font-bold text-[#24563B]">CSI SAKARAHA</p>
              </div>
            </div>

            <div className="text-right text-[10px] text-gray-600">
              <p>Sakaraha{currentDate ? `, le ${currentDate}` : ""}</p>
              <p className="mt-1">
                Généré par : <span className="font-semibold text-gray-900">{user?.nom_utilisateur || "Agent Habilité"}</span>
              </p>
              <p>Rôle : {user?.role || "UTILISATEUR"}</p>
            </div>
          </div>

          <div className="mt-5 text-center bg-[#24563B] text-white py-2.5 px-4 rounded">
            <h1 className="text-sm font-bold uppercase tracking-wider">
              RAPPORT STATISTIQUE OFFICIEL D&apos;ACTIVITÉ
            </h1>
            <p className="text-[10px] opacity-90 mt-0.5">
              Synthèse des registres numériques certifiés — Circonscription de Sécurité Intérieure
            </p>
          </div>
        </div>

        {/* ── En-tête de la page à l'écran (Masqué à l'impression) ── */}
        <div className="print:hidden bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
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
                <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                  Statistiques &amp; Rapports d&apos;Activité
                </h1>
                <Badge variant="neutral">CSI Sakaraha</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tableaux graphiques dynamiques et extraction certifiée des registres
              </p>
            </div>
          </div>

          {/* Boutons d'exportation de rapport (Noir et Blanc épuré) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadStats}
              disabled={isLoading}
              title="Rafraîchir les données"
              className="p-2 border border-zinc-200 hover:border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-800 rounded-xl transition-all shadow-2xs active:scale-95"
            >
              <IconRefresh size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={handleDownloadCSV}
              disabled={isLoading || totalActif === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 text-xs font-semibold text-zinc-900 rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <IconDownload size={14} className="text-zinc-700" />
              <span>Rapport CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={isLoading || totalActif === 0}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black text-xs font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95 hover:shadow-md"
            >
              <IconPrinter size={14} className="text-white" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>

        {/* ── Zone de Contrôle & Choix d'affichage (Filtres Monochrome) ── */}
        <div className="print:hidden bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                Personnalisation de l&apos;affichage
              </span>
              <span className="text-[11px] text-zinc-500">
                Filtrez les registres à inclure et basculez entre les visualisations
              </span>
            </div>

            {/* Sélecteur de Graphique Noir & Blanc */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start md:self-auto">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "bar"
                    ? "bg-zinc-900 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <IconChart size={13} className={chartType === "bar" ? "text-white" : "text-zinc-600"} />
                <span>Histogramme</span>
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "pie"
                    ? "bg-zinc-900 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span className="text-xs leading-none">●</span>
                <span>Répartition</span>
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  chartType === "line"
                    ? "bg-zinc-900 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span className="text-xs leading-none">〰</span>
                <span>Courbe</span>
              </button>
            </div>
          </div>

          {/* Cases à cocher des modules avec Icônes Noir et Blanc */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mr-1">
              Registres :
            </span>

            {allMetricDefinitions.map((m) => {
              const isChecked = !!selectedMetrics[m.id];
              const MetricIcon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMetric(m.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isChecked
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-2xs hover:bg-black"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  <MetricIcon size={14} className={isChecked ? "text-white" : "text-zinc-500"} />
                  <span>{m.label.split(" (")[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isChecked ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {m.value}
                  </span>
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => selectAll(true)}
                className="text-[11px] text-zinc-700 hover:text-black font-semibold hover:underline"
              >
                Tout cocher
              </button>
              <span className="text-zinc-300">•</span>
              <button
                onClick={() => selectAll(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 hover:underline"
              >
                Tout décocher
              </button>
            </div>
          </div>
        </div>

        {/* ── Cartes Synthèses Clés (Design monochrome moderne & icônes N&B) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4.5 hover:shadow-xs transition-shadow print:rounded-lg print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block print:text-[10px]">
                Volume Sélectionné
              </span>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <IconChart size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 tracking-tight print:text-xl">
                {isLoading ? "…" : totalActif}
              </span>
              <span className="text-xs text-zinc-500 font-medium print:text-[10px]">actes au total</span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4.5 hover:shadow-xs transition-shadow print:rounded-lg print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block print:text-[10px]">
                Flux Courriers
              </span>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <IconInbox size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 tracking-tight print:text-xl">
                {isLoading ? "…" : counts.courriersArrivee + counts.courriersDepart}
              </span>
              <span className="text-xs text-zinc-500 font-medium print:text-[10px]">
                ({counts.courriersArrivee} reçus / {counts.courriersDepart} envoyés)
              </span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4.5 hover:shadow-xs transition-shadow print:rounded-lg print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block print:text-[10px]">
                Archives (A vs B)
              </span>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <IconArchive size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 tracking-tight print:text-xl">
                {isLoading ? "…" : counts.archives}
              </span>
              <span className="text-xs text-zinc-500 font-medium print:text-[10px]">
                (A: {counts.archivesCatA} | B: {counts.archivesCatB})
              </span>
            </div>
          </div>

          <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-4.5 hover:shadow-xs transition-shadow print:rounded-lg print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block print:text-[10px]">
                Sécurité &amp; Armes
              </span>
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                <IconSword size={16} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 tracking-tight print:text-xl">
                {isLoading ? "…" : counts.servicesCourants + counts.situations}
              </span>
              <span className="text-xs text-zinc-500 font-medium print:text-[10px]">
                ({counts.servicesCourants} serv. / {counts.situations} armes)
              </span>
            </div>
          </div>
        </div>

        {/* ── ZONE DE GRAPHIQUE (Masquée à l'impression pour un rapport formel et net) ── */}
        <div className="print:hidden bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                <IconChart size={15} />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                Visualisation Graphique
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {activeMetrics.length} registre(s) affiché(s)
            </span>
          </div>

          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Chargement et calcul des métriques...</p>
            </div>
          ) : activeMetrics.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
              <p className="text-sm font-semibold text-zinc-800">
                Aucun registre sélectionné
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Veuillez cocher au moins un registre ci-dessus pour afficher le graphique.
              </p>
              <button
                onClick={() => selectAll(true)}
                className="mt-3 px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
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
                      stroke="#18181b"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "#18181b" }}
                      activeDot={{ r: 7, fill: "#000000" }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Tableau Détaillé du Rapport Imprimable ── */}
        <div className="bg-[var(--csi-surface)] border border-[var(--csi-border)] rounded-2xl overflow-hidden shadow-xs print:rounded-none print:border-gray-300 print:shadow-none">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:py-2 print:px-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center print:hidden">
                <IconClipboard size={13} />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider print:text-black print:text-sm">
                Récapitulatif des Chiffres Officiels
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium print:hidden">
              Base de données CSI Sakaraha certifiée
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs print:text-[11px]">
              <thead className="bg-[var(--csi-bg)] text-[var(--csi-text-secondary)] uppercase text-[10px] tracking-wider border-b border-[var(--csi-border)] print:bg-gray-100 print:text-gray-900 print:border-gray-400">
                <tr>
                  <th className="py-3 px-4 print:py-2">Registre / Catégorie</th>
                  <th className="py-3 px-4 text-center print:py-2">Statut Inclusion</th>
                  <th className="py-3 px-4 text-right print:py-2">Volume Enregistré</th>
                  <th className="py-3 px-4 text-right print:py-2">Part Relative (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--csi-border-subtle)] print:divide-gray-200">
                {allMetricDefinitions.map((m) => {
                  const isChecked = !!selectedMetrics[m.id];
                  const pct = totalActif > 0 && isChecked ? ((m.value / totalActif) * 100).toFixed(1) : "—";
                  const MetricIcon = m.icon;

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-zinc-50 transition-colors ${
                        !isChecked ? "opacity-40 print:hidden" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-zinc-900 flex items-center gap-2.5 print:py-1.5 print:text-gray-900">
                        <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 print:hidden">
                          <MetricIcon size={13} />
                        </div>
                        <span>{m.label}</span>
                      </td>
                      <td className="py-3 px-4 text-center print:py-1.5">
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isChecked ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {isChecked ? "Inclus" : "Exclu"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--csi-vert-deep)] print:py-1.5 print:text-gray-900">
                        {m.value}
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--csi-text-secondary)] print:py-1.5 print:text-gray-700">
                        {pct !== "—" ? `${pct} %` : pct}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[var(--csi-bg)] font-bold border-t border-[var(--csi-border)] print:bg-gray-100 print:border-gray-400">
                <tr>
                  <td className="py-3.5 px-4 text-[var(--csi-vert-deep)] uppercase print:py-2 print:text-gray-900">
                    Total Actif
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-[var(--csi-text-secondary)] print:py-2 print:text-gray-600">
                    {activeMetrics.length} modules
                  </td>
                  <td className="py-3.5 px-4 text-right text-base text-[var(--csi-vert-deep)] print:py-2 print:text-sm print:text-gray-900">
                    {totalActif}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--csi-vert-deep)] print:py-2 print:text-gray-900">
                    100 %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Ventilation détaillée pour impression ── */}
        <div className="hidden print:block border border-gray-300 rounded-none overflow-hidden mt-4">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h4 className="text-[11px] font-bold uppercase text-gray-800">
              Ventilation Détaillée par Sous-Registre
            </h4>
          </div>
          <table className="w-full text-left text-[10px]">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1.5 px-4">Archives Catégorie A (durée de conservation ≤ 3 ans)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.archivesCatA}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-4">Archives Catégorie B (durée de conservation ≤ 10 ans)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.archivesCatB}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-4">Courriers Arrivée Ordinaires (/3)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.courriersCat3}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-4">Courriers Arrivée Secrets (/3S)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.courriersCat3S}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-4">Flux Courriers Global (Reçus + Envoyés)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.courriersArrivee + counts.courriersDepart}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-4">Opérations de Sécurité Intérieure (Services courants + Situations d'armes)</td>
                <td className="py-1.5 px-4 text-right font-bold">{counts.servicesCourants + counts.situations}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Pied de page pour impression officielle (masqué à l'écran, affiché au print) ── */}
        <div className="hidden print:block pt-8 text-center text-xs text-gray-600 border-t border-gray-300 mt-6">
          <p className="font-semibold uppercase tracking-wider text-black">
            Gendarmerie Nationale de Madagascar — Compagnie de Sakaraha
          </p>
          <p className="mt-1 text-[10px]">
            Certifié exact et conforme aux registres numériques en vigueur dans le système CSI.
          </p>
          <div className="mt-8 flex justify-between px-10">
            <div className="text-left">
              <p className="font-medium underline text-[11px]">Le Gestionnaire des Registres :</p>
              <p className="mt-12 font-bold text-gray-900">{user?.nom_utilisateur || "L'Agent Habilité"}</p>
            </div>
            <div className="text-right">
              <p className="font-medium underline text-[11px]">Le Commandant de Brigade / CSI :</p>
              <p className="mt-12 font-bold text-gray-900">Pour Ordre et Visa</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
