import { NextResponse } from 'next/server';
import { MonitorService } from '@/services/monitorService';

const monitorService = new MonitorService();

// Endpoint para devolver el estado actual de las webs
export async function GET() {
  console.log("GET check-websites");
  await monitorService.refreshStatuses();// Esta responsabilidad deberia ir en el servidor
  console.log("Refressheddd doneee");
  const statuses = await monitorService.getStatuses();
  return NextResponse.json(statuses);
}
