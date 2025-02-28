import { NextResponse } from 'next/server';
import { MonitorService } from '@/services/monitorService';

const monitorService = new MonitorService();

export async function GET() {
    monitorService.sendDailySummary();
    return NextResponse.json({ ok: true });
}
