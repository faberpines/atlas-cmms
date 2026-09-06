export const trackingCarriers = ['UPS', 'FEDEX', 'USPS', 'DHL', 'OTHER'] as const;

export const getTrackingUrl = (carrier: string, trackingNumber: string) => {
  const number = encodeURIComponent(trackingNumber.trim());
  switch (carrier) {
    case 'UPS':
      return `https://www.ups.com/track?loc=en_US&tracknum=${number}`;
    case 'FEDEX':
      return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
    case 'USPS':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`;
    case 'DHL':
      return `https://www.dhl.com/us-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${number}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${trackingNumber} tracking`)}`;
  }
};
