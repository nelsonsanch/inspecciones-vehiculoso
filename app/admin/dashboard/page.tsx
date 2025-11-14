
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo, Conductor, Inspeccion } from '@/lib/auth-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  Users, 
  ClipboardList, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import StatsChart from '@/components/dashboard/stats-chart';
import RecentInspections from '@/components/dashboard/recent-inspections';

interface DashboardStats {
  totalVehiculos: number;
  totalConductores: number;
  inspeccionesHoy: number;
  inspeccionesSemana: number;
  inspeccionesMes: number;
  inspeccionesAprobadas: number;
  inspeccionesRechazadas: number;
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
  });
  const [recentInspections, setRecentInspections] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener vehículos
        const vehiculosSnapshot = await getDocs(collection(db, 'vehiculos'));
        const totalVehiculos = vehiculosSnapshot.size;

        // Obtener conductores
        const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
        const totalConductores = conductoresSnapshot.size;

        // Obtener inspecciones
        const inspeccionesSnapshot = await getDocs(collection(db, 'inspecciones'));
        const inspecciones = inspeccionesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inspeccion));

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

        setStats({
          totalVehiculos,
          totalConductores,
          inspeccionesHoy,
          inspeccionesSemana,
          inspeccionesMes,
          inspeccionesAprobadas,
          inspeccionesRechazadas,
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
      title: 'Inspecciones Hoy',
      value: stats.inspeccionesHoy,
      description: 'Realizadas hoy',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Inspecciones Mes',
      value: stats.inspeccionesMes,
      description: 'Este mes',
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
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
