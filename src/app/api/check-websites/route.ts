import { NextResponse } from 'next/server';
import { MonitorService } from '@/services/monitorService';

const monitorService = new MonitorService();

// Endpoint para devolver el estado actual de las webs
export async function GET() {
  //await monitorService.refreshStatusesIfNeeded();-> Esta responsabilidad va en el servidor
  console.log("GET check-websites");
  const statuses = await monitorService.getStatuses();
  return NextResponse.json(statuses);
}
