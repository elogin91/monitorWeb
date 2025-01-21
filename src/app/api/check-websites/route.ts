import { NextResponse } from 'next/server';
import { MonitorService } from '../../../services/monitorService';

const monitorService = new MonitorService();

// Endpoint para devolver el estado actual de las webs
export async function GET() {
  await monitorService.refreshStatusesIfNeeded();
  const statuses = monitorService.getStatuses();
  return NextResponse.json(statuses);
}
