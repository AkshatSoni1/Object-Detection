"use client"
import { load as cocoSSDLoad } from '@tensorflow-models/coco-ssd';
import React, { useState, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'
import { renderPredictions } from '@/utils/render-predictions';

let detectInterval;

const ObjectDetection = () => {
    const webCamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const runCoco = async () => {
        setIsLoading(true);
        const model = await cocoSSDLoad();
        setIsLoading(false);

        detectInterval = setInterval(() => {
            runObjectDetection(model);
        }, 10);
    }

    async function runObjectDetection(model){
        if(canvasRef.current && webCamRef.current !== null && webCamRef.current.video?.readyState === 4){
            canvasRef.current.width = webCamRef.current.video.videoWidth;
            canvasRef.current.height = webCamRef.current.video.videoHeight;

            const detectedObjects = await model.detect(webCamRef.current.video, undefined, 0.6);

            // console.log(detectedObjects);

            const context = canvasRef.current.getContext("2d");
            renderPredictions(detectedObjects, context);
        }
    }

    const showVideo = () => {
        if (webCamRef.current !== null && webCamRef.current.video?.readyState === 4) {
            const myVideoWidth = webCamRef.current.video.videoWidth;
            const myVideoHeight = webCamRef.current.video.videoHeight;

            webCamRef.current.video.width = myVideoWidth;
            webCamRef.current.video.height = myVideoHeight;
        }
    }

    useEffect(() => {
        runCoco();
        showVideo();
    }, [])

    const videoConstraints = {
        facingMode: "user"
      };

    return (
        <div className='mt-8'>
            {
                isLoading ?
                    <div className="gradient-text">
                        Loading AI Model
                    </div>
                    :
                    <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
                        {/* WebCam */}
                        <Webcam
                            ref={webCamRef}
                            className='rounded-md w-full lg:h-[720px]'
                            muted
                            videoConstraints={videoConstraints}
                        />
                        {/* Canvas */}
                        <canvas 
                            ref={canvasRef}
                            className='absolute top-0 left-0 z-99999 w-full lg:h-[720px]'
                        >

                        </canvas>
                    </div>
            }
        </div>
    )
}

export default ObjectDetection
