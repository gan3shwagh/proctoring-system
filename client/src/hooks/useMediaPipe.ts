import { useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver, ImageEmbedder } from '@mediapipe/tasks-vision';

export const useMediaPipe = () => {
    const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
    const [imageEmbedder, setImageEmbedder] = useState<ImageEmbedder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                // Load Face Landmarker
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "/models/face_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 2,
                    outputFaceBlendshapes: true
                });
                setFaceLandmarker(landmarker);

                // Load Image Embedder (Fallback for Face Verification)
                const embedder = await ImageEmbedder.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "/models/mobilenet_v3_small.tflite",
                    },
                    runningMode: "IMAGE"
                });
                setImageEmbedder(embedder);

                setIsLoading(false);
            } catch (err) {
                console.error("Error loading MediaPipe models:", err);
                setIsLoading(false);
            }
        };

        loadModels();
    }, []);

    const compareFaces = (image1: HTMLImageElement | HTMLVideoElement, image2: HTMLImageElement | HTMLVideoElement): number => {
        if (!imageEmbedder) return 0;

        const result1 = imageEmbedder.embed(image1);
        const result2 = imageEmbedder.embed(image2);

        if (result1.embeddings.length > 0 && result2.embeddings.length > 0) {
            // Compute cosine similarity
            const embedding1 = result1.embeddings[0];
            const embedding2 = result2.embeddings[0];
            return ImageEmbedder.cosineSimilarity(embedding1, embedding2);
        }
        return 0;
    };

    return { faceLandmarker, imageEmbedder, compareFaces, isLoading };
};
