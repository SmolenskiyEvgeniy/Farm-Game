export enum GameState {
  GENERATING,
  SHOW_CHEESE,
  SHOW_BOXES,
  AWAITING_INPUT,
  CHECKING,
  SUCCESS,
  FAILURE
}

export interface Cheese {
  id: number;
  gridTop: string;
  gridLeft: string;
  finalTop: string;
  finalLeft: string;
}