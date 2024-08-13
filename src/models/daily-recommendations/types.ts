export interface ListDailyRecommendationsQueryParams
  extends Partial<{ [key: string]: string | string[] }> {
  startDate: string;
  endDate: string;
}

export interface ListDailyRecommendationsParams {
  startDate: Date;
  endDate: Date;
}
