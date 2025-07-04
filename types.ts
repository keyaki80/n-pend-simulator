export interface PendulumParameters {
  masses: number[]; // mass of bobs (kg)
  lengths: number[]; // length of rods (m)
  g: number;  // gravity (m/s^2)
}

export interface PendulumState {
  thetas: number[]; // angle of rods (rad)
  omegas: number[]; // angular velocity of rods (rad/s)
}

export interface Coordinates {
  x: number;
  y: number;
}
