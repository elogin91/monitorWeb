import { NextResponse } from 'next/server';
import { MonitorService } from '@/services/monitorService';

export async function GET() {
    monitorService.sendDailySummary();
    return NextResponse.json({ ok: true });
}
