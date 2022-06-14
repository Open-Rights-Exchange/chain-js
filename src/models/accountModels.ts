export enum ResourceEstimationType {
  Exact = 'exact', // The resources returned are the deterministic and complete
  Estimate = 'estimate', // The resources returned are estimated or averaged
  Partial = 'partial', // Only some calculatable values are returned - the rest is null
}

export type AccountResources = {
  [key: string]: any
  estimationType: ResourceEstimationType
}
