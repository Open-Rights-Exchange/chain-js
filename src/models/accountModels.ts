export enum EstimationType {
  Exact = 'exact',
  Estimate = 'estimate',
  Partial = 'partial',
}

export type AccountResources = {
  [key: string]: any
  estimationType: EstimationType
}
