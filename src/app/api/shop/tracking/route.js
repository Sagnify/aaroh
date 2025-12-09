import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')
    
    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID required' }, { status: 400 })
    }

    // Detect courier service based on tracking ID pattern
    const courierInfo = detectCourier(trackingId)
    
    // For now, return mock data since we don't have API keys
    // In production, you'd integrate with actual courier APIs
    const trackingData = {
      trackingId,
      courier: courierInfo.name,
      status: 'in_transit', // mock status
      lastUpdate: new Date().toISOString(),
      location: 'Processing Center',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      trackingUrl: courierInfo.trackingUrl
    }

    return NextResponse.json({ success: true, tracking: trackingData })
  } catch (error) {
    console.error('Error fetching tracking:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 })
  }
}

function detectCourier(trackingId) {
  const patterns = {
    bluedart: {
      pattern: /^[0-9]{10,11}$/,
      name: 'Blue Dart',
      trackingUrl: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingId}`
    },
    dtdc: {
      pattern: /^[A-Z0-9]{10,15}$/,
      name: 'DTDC',
      trackingUrl: `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strTnumber=${trackingId}`
    },
    delhivery: {
      pattern: /^[A-Z0-9]{10,20}$/,
      name: 'Delhivery',
      trackingUrl: `https://www.delhivery.com/track/package/${trackingId}`
    },
    ecom: {
      pattern: /^[0-9]{12,15}$/,
      name: 'Ecom Express',
      trackingUrl: `https://ecomexpress.in/tracking/?awb=${trackingId}`
    },
    indiapost: {
      pattern: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
      name: 'India Post',
      trackingUrl: `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=${trackingId}`
    }
  }

  for (const [key, courier] of Object.entries(patterns)) {
    if (courier.pattern.test(trackingId)) {
      return courier
    }
  }

  // Default fallback
  return {
    name: 'Unknown Courier',
    trackingUrl: `https://www.google.com/search?q=${trackingId}+tracking`
  }
}