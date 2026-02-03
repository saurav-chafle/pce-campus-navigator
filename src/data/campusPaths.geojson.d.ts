declare const campusPathsData: {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, string>;
    geometry: {
      type: string;
      coordinates: [number, number][] | [number, number];
    };
    id?: number;
  }>;
};

export default campusPathsData;
