import { useState, useCallback } from 'react';
import { PendulumParameters, PendulumState } from '../types';

const DT = 0.01; // Time step

// Solves a linear system of equations Ax = b using Gaussian elimination with partial pivoting.
const solveLinearSystem = (A: number[][], b: number[]): number[] => {
    const n = A.length;
    const a = A.map((row, i) => [...row, b[i]]); // Augmented matrix

    for (let i = 0; i < n; i++) {
        // Partial Pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
                maxRow = k;
            }
        }
        [a[i], a[maxRow]] = [a[maxRow], a[i]];

        // Make upper triangular
        for (let k = i + 1; k < n; k++) {
            if (a[i][i] === 0) continue; // Avoid division by zero
            const factor = a[k][i] / a[i][i];
            for (let j = i; j < n + 1; j++) {
                a[k][j] -= factor * a[i][j];
            }
        }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += a[i][j] * x[j];
        }
        if (a[i][i] === 0) {
            console.error("Singular matrix detected in solveLinearSystem, cannot solve accurately.");
            return new Array(n).fill(0); // Return a zero vector to prevent crash
        }
        x[i] = (a[i][n] - sum) / a[i][i];
    }

    return x;
};

// Calculates the angular accelerations for an N-pendulum system.
const getAccelerations = (state: PendulumState, params: PendulumParameters): { alphas: number[] } => {
    const { thetas, omegas } = state;
    const { masses, lengths, g } = params;
    const n = masses.length;

    if (n === 0) {
        return { alphas: [] };
    }

    const { sin, cos } = Math;

    // Pre-calculate cumulative masses from the tail end for O(n) efficiency
    const tailMasses = new Array(n).fill(0);
    tailMasses[n - 1] = masses[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        tailMasses[i] = masses[i] + tailMasses[i+1];
    }

    const M: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const C: number[] = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        // Use pre-calculated tail mass for O(1) lookup
        let C_i = -g * sin(thetas[i]) * tailMasses[i];
        for (let j = 0; j < n; j++) {
            // Use pre-calculated tail mass for O(1) lookup
            const m_sum = tailMasses[Math.max(i, j)];
            M[i][j] = lengths[j] * cos(thetas[i] - thetas[j]) * m_sum;
            C_i -= lengths[j] * sin(thetas[i] - thetas[j]) * omegas[j] * omegas[j] * m_sum;
        }
        C[i] = C_i;
    }

    const alphas = solveLinearSystem(M, C);
    return { alphas };
};

const rk4Step = (state: PendulumState, params: PendulumParameters, dt: number): PendulumState => {
    const derivative = (s: PendulumState) => {
        const { alphas } = getAccelerations(s, params);
        return {
            thetas: s.omegas,
            omegas: alphas,
        };
    };

    const n = state.thetas.length;

    const a = derivative(state);
    
    const b_state: PendulumState = {
        thetas: state.thetas.map((theta, i) => theta + 0.5 * dt * a.thetas[i]),
        omegas: state.omegas.map((omega, i) => omega + 0.5 * dt * a.omegas[i]),
    };
    const b = derivative(b_state);

    const c_state: PendulumState = {
        thetas: state.thetas.map((theta, i) => theta + 0.5 * dt * b.thetas[i]),
        omegas: state.omegas.map((omega, i) => omega + 0.5 * dt * b.omegas[i]),
    };
    const c = derivative(c_state);

    const d_state: PendulumState = {
        thetas: state.thetas.map((theta, i) => theta + dt * c.thetas[i]),
        omegas: state.omegas.map((omega, i) => omega + dt * c.omegas[i]),
    };
    const d = derivative(d_state);

    return {
        thetas: state.thetas.map((theta, i) => theta + (dt / 6) * (a.thetas[i] + 2 * b.thetas[i] + 2 * c.thetas[i] + d.thetas[i])),
        omegas: state.omegas.map((omega, i) => omega + (dt / 6) * (a.omegas[i] + 2 * b.omegas[i] + 2 * c.omegas[i] + d.omegas[i])),
    };
};

export const useNthPendulum = (initialState: PendulumState, params: PendulumParameters) => {
    const [pendulumState, setPendulumState] = useState<PendulumState>(initialState);

    const step = useCallback(() => {
        setPendulumState(prevState => rk4Step(prevState, params, DT));
    }, [params]);

    const reset = useCallback((state: PendulumState) => {
        setPendulumState(state);
    }, []);
    
    return { pendulumState, step, reset };
};
