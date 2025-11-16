
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo, Conductor, Inspeccion, AlertaMantenimiento } from '@/lib/auth-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Users, 
  ClipboardList, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';
import StatsChart from '@/components/dashboard/stats-chart';
import RecentInspections from '@/components/dashboard/recent-inspections';
import Link from 'next/link';

interface DashboardStats {
  totalVehiculos: number;
  totalConductores: number;
  inspeccionesHoy: number;
  inspeccionesSemana: number;
  inspeccionesMes: number;
  inspeccionesAprobadas: number;
  inspeccionesRechazadas: number;
  alertasPendientes: number;
  alertasCriticas: number;
  documentosVencidos: number;
  documentosPorVencer: number;
}

interface DocumentoVencimiento {
  vehiculoId: string;
  vehiculoPlaca: string;
  tipoDocumento: 'soat' | 'tecnomecanica';
  fechaVencimiento: string;
  diasRestantes: number;
  vencido: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehiculos: 0,
    totalConductores: 0,
    inspeccionesHoy: 0,
    inspeccionesSemana: 0,
    inspeccionesMes: 0,
    inspeccionesAprobadas: 0,
    inspeccionesRechazadas: 0,
    alertasPendientes: 0,
    alertasCriticas: 0,
    documentosVencidos: 0,
    documentosPorVencer: 0,
  });
  const [recentInspections, setRecentInspections] = useState<Inspeccion[]>([]);
  const [alertasCriticas, setAlertasCriticas] = useState<AlertaMantenimiento[]>([]);
  const [documentosVencimiento, setDocumentosVencimiento] = useState<DocumentoVencimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener vehículos
        const vehiculosSnapshot = await getDocs(collection(db, 'vehiculos'));
        const totalVehiculos = vehiculosSnapshot.size;
        const vehiculos = vehiculosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehiculo));

        // Obtener conductores
        const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
        const totalConductores = conductoresSnapshot.size;

        // Obtener inspecciones
        const inspeccionesSnapshot = await getDocs(collection(db, 'inspecciones'));
        const inspecciones = inspeccionesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inspeccion));

        // Obtener alertas
        const alertasSnapshot = await getDocs(collection(db, 'alertas'));
        const alertas = alertasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertaMantenimiento));

        // Calcular fechas
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Filtrar inspecciones por fecha
        const inspeccionesHoy = inspecciones.filter(i => {
          const inspeccionDate = new Date(i.fecha);
          return inspeccionDate >= startOfDay;
        }).length;

        const inspeccionesSemana = inspecciones.filter(i => {
          const inspeccionDate = new Date(i.fecha);
          return inspeccionDate >= startOfWeek;
        }).length;

        const inspeccionesMes = inspecciones.filter(i => {
          const inspeccionDate = new Date(i.fecha);
          return inspeccionDate >= startOfMonth;
        }).length;

        // Filtrar por estado
        const inspeccionesAprobadas = inspecciones.filter(i => i.estado === 'aprobado').length;
        const inspeccionesRechazadas = inspecciones.filter(i => i.estado === 'rechazado').length;

        // Estadísticas de alertas
        const alertasPendientes = alertas.filter(a => a.estado === 'pendiente').length;
        const alertasCriticasPendientes = alertas.filter(
          a => a.prioridad === 'critica' && a.estado === 'pendiente'
        ).length;

        // Alertas críticas para mostrar
        const alertasCriticasTop = alertas
          .filter(a => a.prioridad === 'critica' && a.estado === 'pendiente')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setAlertasCriticas(alertasCriticasTop);

        // Analizar documentos por vencer
        const documentosProximos: DocumentoVencimiento[] = [];
        let documentosVencidos = 0;
        let documentosPorVencer = 0;

        vehiculos.forEach(vehiculo => {
          const calcularDias = (fechaStr: string) => {
            const fecha = new Date(fechaStr);
            const diff = fecha.getTime() - today.getTime();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
          };

          if (vehiculo.soatVencimiento) {
            const dias = calcularDias(vehiculo.soatVencimiento);
            if (dias <= 15) {
              documentosProximos.push({
                vehiculoId: vehiculo.id,
                vehiculoPlaca: vehiculo.placa,
                tipoDocumento: 'soat',
                fechaVencimiento: vehiculo.soatVencimiento,
                diasRestantes: dias,
                vencido: dias <= 0
              });
              if (dias <= 0) documentosVencidos++;
              else documentosPorVencer++;
            }
          }

          if (vehiculo.tecnomecanicaVencimiento) {
            const dias = calcularDias(vehiculo.tecnomecanicaVencimiento);
            if (dias <= 15) {
              documentosProximos.push({
                vehiculoId: vehiculo.id,
                vehiculoPlaca: vehiculo.placa,
                tipoDocumento: 'tecnomecanica',
                fechaVencimiento: vehiculo.tecnomecanicaVencimiento,
                diasRestantes: dias,
                vencido: dias <= 0
              });
              if (dias <= 0) documentosVencidos++;
              else documentosPorVencer++;
            }
          }
        });

        // Ordenar por urgencia (vencidos primero, luego por días restantes)
        documentosProximos.sort((a, b) => {
          if (a.vencido !== b.vencido) return a.vencido ? -1 : 1;
          return a.diasRestantes - b.diasRestantes;
        });

        setDocumentosVencimiento(documentosProximos);

        setStats({
          totalVehiculos,
          totalConductores,
          inspeccionesHoy,
          inspeccionesSemana,
          inspeccionesMes,
          inspeccionesAprobadas,
          inspeccionesRechazadas,
          alertasPendientes,
          alertasCriticas: alertasCriticasPendientes,
          documentosVencidos,
          documentosPorVencer,
        });

        // Obtener inspecciones recientes
        const recent = inspecciones
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentInspections(recent);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Vehículos',
      value: stats.totalVehiculos,
      description: 'Vehículos registrados',
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Conductores',
      value: stats.totalConductores,
      description: 'Conductores activos',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Alertas Pendientes',
      value: stats.alertasPendientes,
      description: stats.alertasCriticas > 0 ? `${stats.alertasCriticas} críticas` : 'Ninguna crítica',
      icon: Bell,
      color: stats.alertasCriticas > 0 ? 'text-red-600' : 'text-yellow-600',
      bgColor: stats.alertasCriticas > 0 ? 'bg-red-100' : 'bg-yellow-100',
      link: '/admin/alertas'
    },
    {
      title: 'Documentos por Vencer',
      value: stats.documentosVencidos + stats.documentosPorVencer,
      description: stats.documentosVencidos > 0 ? `${stats.documentosVencidos} vencidos` : 'Próximos 15 días',
      icon: FileText,
      color: stats.documentosVencidos > 0 ? 'text-red-600' : 'text-orange-600',
      bgColor: stats.documentosVencidos > 0 ? 'bg-red-100' : 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema de inspecciones</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const cardContent = (
            <Card className={`hover:shadow-md transition-shadow ${card.link ? 'cursor-pointer' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                    </div>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
          
          return card.link ? (
            <Link key={index} href={card.link}>
              {cardContent}
            </Link>
          ) : (
            <div key={index}>{cardContent}</div>
          );
        })}
      </div>

      {/* Charts and Recent Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Inspecciones por Estado
            </CardTitle>
            <CardDescription>
              Comparación entre inspecciones aprobadas y rechazadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatsChart 
              approved={stats.inspeccionesAprobadas} 
              rejected={stats.inspeccionesRechazadas} 
            />
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Resumen de Estados</CardTitle>
            <CardDescription>
              Estado actual de las inspecciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Aprobadas</p>
                  <p className="text-sm text-green-600">Vehículos en condiciones</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.inspeccionesAprobadas}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Rechazadas</p>
                  <p className="text-sm text-red-600">Requieren atención</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats.inspeccionesRechazadas}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Esta semana:</span>
                  <span className="font-medium">{stats.inspeccionesSemana}</span>
                </div>
                <div className="flex justify-between">
                  <span>Este mes:</span>
                  <span className="font-medium">{stats.inspeccionesMes}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticas y Documentos por Vencer */}
      {(alertasCriticas.length > 0 || documentosVencimiento.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas Críticas */}
          {alertasCriticas.length > 0 && (
            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Alertas Críticas
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/alertas">Ver Todas</Link>
                  </Button>
                </div>
                <CardDescription>
                  Problemas que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alertasCriticas.map((alerta, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className="bg-red-600 text-white">🔴 CRÍTICA</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(alerta.fechaDeteccion).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-red-900 mb-1">
                      {alerta.titulo}
                    </h4>
                    <p className="text-xs text-red-700 line-clamp-2">
                      {alerta.descripcion}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Documentos por Vencer */}
          {documentosVencimiento.length > 0 && (
            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Documentos por Vencer
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/vehiculos">Gestionar</Link>
                  </Button>
                </div>
                <CardDescription>
                  Documentos vencidos o próximos a vencer (15 días)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {documentosVencimiento.slice(0, 5).map((doc, index) => (
                  <Link 
                    key={index}
                    href={`/admin/vehiculos/${doc.vehiculoId}`}
                    className="block"
                  >
                    <div className={`p-3 rounded-lg border ${
                      doc.vencido 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                        : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                    } transition-colors`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono">
                          {doc.vehiculoPlaca}
                        </Badge>
                        <Badge className={doc.vencido ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}>
                          {doc.tipoDocumento === 'soat' ? 'SOAT' : 'Tecnomecánica'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={doc.vencido ? 'text-red-900 font-semibold' : 'text-yellow-900'}>
                          {doc.vencido 
                            ? `Vencido hace ${Math.abs(doc.diasRestantes)} día(s)`
                            : `Vence en ${doc.diasRestantes} día(s)`
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.fechaVencimiento).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Inspections */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Últimas Inspecciones
          </CardTitle>
          <CardDescription>
            Las 5 inspecciones más recientes realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentInspections inspections={recentInspections} />
        </CardContent>
      </Card>
    </div>
  );
}
