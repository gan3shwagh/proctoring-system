import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export type GazeDirection = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

export interface ViolationStatus {
    isLookingAway: boolean;
    gazeDirection: GazeDirection;
    faceCount: number;
    isMultipleFaces: boolean;
    isNoFace: boolean;
}

// Heuristic to estimate Head Yaw (Left/Right turn)
// Returns value between -1 (Left) and 1 (Right), roughly. 0 is Center.
const calculateHeadYaw = (landmarks: any[]): number => {
    // Key landmarks: 1 (Nose Tip), 234 (Left Ear/Cheek), 454 (Right Ear/Cheek)
    const nose = landmarks[1];
    const leftSide = landmarks[234];
    const rightSide = landmarks[454];

    if (!nose || !leftSide || !rightSide) return 0;

    // Calculate midpoint of face width
    const faceCenterX = (leftSide.x + rightSide.x) / 2;

    // Calculate face width for normalization
    const faceWidth = Math.abs(rightSide.x - leftSide.x);

    // Yaw is the deviation of the nose from the center, normalized by face width
    // Multiplied by constant to scale it to roughly -1 to 1 range for 90 degree turns
    return (nose.x - faceCenterX) / faceWidth * 2.5;
};

export const analyzeViolation = (result: FaceLandmarkerResult): ViolationStatus => {
    const faceCount = result.faceLandmarks.length;

    if (faceCount === 0) {
        return {
            isLookingAway: true,
            gazeDirection: 'CENTER',
            faceCount: 0,
            isMultipleFaces: false,
            isNoFace: true
        };
    }

    if (faceCount > 1) {
        return {
            isLookingAway: true,
            gazeDirection: 'CENTER',
            faceCount,
            isMultipleFaces: true,
            isNoFace: false
        };
    }

    // --- Single Face Logic ---
    const blendshapes = result.faceBlendshapes[0].categories;
    const landmarks = result.faceLandmarks[0];

    // 1. Calculate Head Pose (Yaw)
    const headYaw = calculateHeadYaw(landmarks);

    // 2. Get Eye Gaze Scores
    const eyeLookInLeft = blendshapes.find(b => b.categoryName === 'eyeLookInLeft')?.score || 0;
    const eyeLookOutLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
    const eyeLookInRight = blendshapes.find(b => b.categoryName === 'eyeLookInRight')?.score || 0;
    const eyeLookOutRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;

    // Net Eye Movement (Positive = Right, Negative = Left)
    // Left Eye: LookIn (Right) - LookOut (Left)
    // Right Eye: LookOut (Right) - LookIn (Left)
    const leftEyeNet = eyeLookInLeft - eyeLookOutLeft;
    const rightEyeNet = eyeLookOutRight - eyeLookInRight;
    const avgEyeGaze = (leftEyeNet + rightEyeNet) / 2;

    let gazeDirection: GazeDirection = 'CENTER';
    let isLookingAway = false;

    // Thresholds (Very Relaxed - Minimal false positives)
    const HEAD_YAW_THRESHOLD_EXTREME = 1.0; // ~70+ degrees - only extreme turns
    const HEAD_YAW_THRESHOLD_MODERATE = 0.6; // ~45 degrees - very lenient
    const EYE_GAZE_THRESHOLD = 0.7; // Very high - only obvious side glances

    // --- Logic ---

    // Case A: Extreme Head Turn (Violation regardless of eyes)
    if (Math.abs(headYaw) > HEAD_YAW_THRESHOLD_EXTREME) {
        isLookingAway = true;
        gazeDirection = headYaw > 0 ? 'RIGHT' : 'LEFT';
    }
    // Case B: Moderate Head Turn (Check for Eye Compensation)
    else if (Math.abs(headYaw) > HEAD_YAW_THRESHOLD_MODERATE) {
        // If Head Right (>0) AND Eyes Left (<0) -> Compensating (Safe)
        // If Head Left (<0) AND Eyes Right (>0) -> Compensating (Safe)

        // We check if they are NOT compensating (i.e., signs are same or eyes are center)
        // Actually, if head is right, eyes MUST be left to be safe.

        if (headYaw > 0 && avgEyeGaze > 0.1) {
            // Head Right, Eyes also Right -> Violation (very lenient)
            isLookingAway = true;
            gazeDirection = 'RIGHT';
        } else if (headYaw < 0 && avgEyeGaze < -0.1) {
            // Head Left, Eyes also Left -> Violation (very lenient)
            isLookingAway = true;
            gazeDirection = 'LEFT';
        }
    }
    // Case C: Head Center (Check for Side Glances)
    else {
        if (avgEyeGaze > EYE_GAZE_THRESHOLD) {
            isLookingAway = true;
            gazeDirection = 'RIGHT';
        } else if (avgEyeGaze < -EYE_GAZE_THRESHOLD) {
            isLookingAway = true;
            gazeDirection = 'LEFT';
        }
    }

    // Vertical Gaze (Very Lenient - Allow looking down at questions)
    const eyeLookUp = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
    const eyeLookDown = blendshapes.find(b => b.categoryName === 'eyeLookDownLeft')?.score || 0;

    // Only flag if looking VERY far up or down (very lenient)
    if (eyeLookUp > 0.8) { // Increased from 0.7
        isLookingAway = true;
        gazeDirection = 'UP';
    } else if (eyeLookDown > 0.9) { // Very lenient for looking down (reading questions)
        isLookingAway = true;
        gazeDirection = 'DOWN';
    }

    return {
        isLookingAway,
        gazeDirection,
        faceCount,
        isMultipleFaces: false,
        isNoFace: false
    };
};
