export interface DeliveryZone {
  id: string;
  name: string;
  color: string;
  polygon: [number, number][];
  baseDeliveryFee: number;
  estimatedTime: number;
}

export const deliveryZones: DeliveryZone[] = [
  {
    id: "zone_fdf_centre",
    name: "Fort-de-France Centre",
    color: "#3B82F6",
    baseDeliveryFee: 2.50,
    estimatedTime: 20,
    polygon: [
      [14.6200, -61.0800],
      [14.6150, -61.0650],
      [14.6050, -61.0650],
      [14.6000, -61.0800],
      [14.6050, -61.0900],
      [14.6150, -61.0900]
    ]
  },
  {
    id: "zone_schoelcher",
    name: "Schoelcher",
    color: "#10B981",
    baseDeliveryFee: 3.00,
    estimatedTime: 25,
    polygon: [
      [14.6300, -61.1100],
      [14.6250, -61.0950],
      [14.6150, -61.0950],
      [14.6100, -61.1100],
      [14.6150, -61.1200],
      [14.6250, -61.1200]
    ]
  },
  {
    id: "zone_lamentin",
    name: "Le Lamentin",
    color: "#F59E0B",
    baseDeliveryFee: 3.50,
    estimatedTime: 30,
    polygon: [
      [14.6200, -61.0050],
      [14.6150, -60.9900],
      [14.6050, -60.9900],
      [14.6000, -61.0050],
      [14.6050, -61.0150],
      [14.6150, -61.0150]
    ]
  },
  {
    id: "zone_robert",
    name: "Le Robert",
    color: "#8B5CF6",
    baseDeliveryFee: 4.00,
    estimatedTime: 35,
    polygon: [
      [14.6850, -60.9500],
      [14.6800, -60.9350],
      [14.6700, -60.9350],
      [14.6650, -60.9500],
      [14.6700, -60.9600],
      [14.6800, -60.9600]
    ]
  },
  {
    id: "zone_riviere_salee",
    name: "Rivière-Salée",
    color: "#EC4899",
    baseDeliveryFee: 4.50,
    estimatedTime: 40,
    polygon: [
      [14.5450, -60.9850],
      [14.5400, -60.9700],
      [14.5300, -60.9700],
      [14.5250, -60.9850],
      [14.5300, -60.9950],
      [14.5400, -60.9950]
    ]
  }
];
