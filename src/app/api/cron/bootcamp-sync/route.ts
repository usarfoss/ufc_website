import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bootcampService } from '@/lib/bootcamp';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting bootcamp sync...');
    
    // Update bootcamp statuses first
    await bootcampService.updateBootcampStatuses();
    
    // Get all active bootcamps
    const activeBootcamps = await prisma.bootcamp.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true }
    });

    console.log(`📊 Found ${activeBootcamps.length} active bootcamps`);

    const results = [];
    
    for (const bootcamp of activeBootcamps) {
      console.log(`🏆 Syncing bootcamp: ${bootcamp.name}`);
      
      const result = await bootcampService.syncBootcampParticipants(bootcamp.id);
      results.push({
        bootcampId: bootcamp.id,
        name: bootcamp.name,
        ...result
      });
      
      console.log(`✅ Synced ${result.synced || 0} participants for ${bootcamp.name}`);
    }

    const totalSynced = results.reduce((sum, r) => sum + (r.synced || 0), 0);
    console.log(`🎉 Bootcamp sync complete! Total participants synced: ${totalSynced}`);

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${totalSynced} participants across ${activeBootcamps.length} bootcamps`,
      results 
    });
  } catch (error) {
    console.error('❌ Bootcamp sync error:', error);
    return NextResponse.json({ 
      error: 'Bootcamp sync failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
