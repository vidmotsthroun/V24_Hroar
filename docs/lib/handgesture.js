function calculatePlaneAngles(p1, p2, p3) {
    // Calculate two vectors in the plane

    // Calculate the angle with respect to the x-axis
    const referenceVectorX = { x: 1, y: 0, z: 0 }; // Positive x-axis
    const dotProductX = normalVector.x * referenceVectorX.x + normalVector.y * referenceVectorX.y + normalVector.z * referenceVectorX.z;
    const magnitudeProductX = Math.sqrt(
        normalVector.x ** 2 + normalVector.y ** 2 + normalVector.z ** 2
    ) * Math.sqrt(referenceVectorX.x ** 2 + referenceVectorX.y ** 2 + referenceVectorX.z ** 2);
    const angleX = Math.acos(dotProductX / magnitudeProductX) * (180 / Math.PI);

    // Calculate the angle with respect to the y-axis
    const referenceVectorY = { x: 0, y: 1, z: 0 }; // Positive y-axis
    const dotProductY = normalVector.x * referenceVectorY.x + normalVector.y * referenceVectorY.y + normalVector.z * referenceVectorY.z;
    const magnitudeProductY = Math.sqrt(
        normalVector.x ** 2 + normalVector.y ** 2 + normalVector.z ** 2
    ) * Math.sqrt(referenceVectorY.x ** 2 + referenceVectorY.y ** 2 + referenceVectorY.z ** 2);
    const angleY = Math.acos(dotProductY / magnitudeProductY) * (180 / Math.PI);

    return { angleX, angleY };
}

function calculateYawAngle(point1, point2, point3) {
    // Calculate the vectors v1 and v2
    let v1 = {
        x: point2.x - point1.x,
        y: point2.y - point1.y,
        z: point2.z - point1.z
    };

    let v2 = {
        x: point3.x - point1.x,
        y: point3.y - point1.y,
        z: point3.z - point1.z
    };

    // Calculate the cross product of v1 and v2 to get the normal vector N
    let N = {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };

    // Normalize the normal vector
    let magnitude = Math.sqrt(N.x * N.x + N.y * N.y + N.z * N.z);
    let normalizedN = {
        x: N.x / magnitude,
        y: N.y / magnitude,
        z: N.z / magnitude
    };

    // Calculate the yaw angle using atan2
    let yawRadians = Math.atan2(normalizedN.x, normalizedN.z);

    // Convert radians to degrees
    let yawDegrees = yawRadians * (180 / Math.PI);

    // Ensure the angle is in the range [0, 360)
    if (yawDegrees < 0) {
        yawDegrees += 360;
    }

    return yawDegrees;
}

function calculateYawAngleY(point1, point2, point3) {
    // Calculate the vectors v1 and v2
    let v1 = {
        x: point2.x - point1.x,
        y: point2.y - point1.y,
        z: point2.z - point1.z
    };

    let v2 = {
        x: point3.x - point1.x,
        y: point3.y - point1.y,
        z: point3.z - point1.z
    };

    // Calculate the cross product of v1 and v2 to get the normal vector N
    let N = {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    };

    // Normalize the normal vector
    let magnitude = Math.sqrt(N.x * N.x + N.y * N.y + N.z * N.z);
    let normalizedN = {
        x: N.x / magnitude,
        y: N.y / magnitude,
        z: N.z / magnitude
    };

    // Calculate the yaw angle using atan2
    let yawRadians = Math.atan2(normalizedN.x, normalizedN.y);

    // Convert radians to degrees
    let yawDegrees = yawRadians * (180 / Math.PI);

    // Ensure the angle is in the range [0, 360)
    yawDegrees -= 80;

    // Ensure the angle is in the range [0, 360)
    if (yawDegrees < 0) {
        yawDegrees += 360;
    } else if (yawDegrees >= 360) {
        yawDegrees -= 360;
    }

    return yawDegrees;
}
const alpha = 0.2; // Smoothing factor (adjust as needed)
let results = undefined;

// Variables to store the previous smoothed landmarks

let smoothedP1 = {x: 0, y: 0, z:0}; // Thumb
let smoothedP2 = {x: 0, y: 0, z:0}; //Pinky
let smoothedP3 = {x: 0, y: 0, z:0}; //Index

function applyLowPassFilter(current, previous) {
    return {
        x: previous.x + alpha * (current.x - previous.x),
        y: previous.y + alpha * (current.y - previous.y),
        z: previous.z + alpha * (current.z - previous.z),
    };
}


let planeAngle = {
    angleX: 0,
    angleY: 0
};


// Get a reference to the container element that will hold our scene

import { GestureRecognizer ,HandLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
        let handLandmarker;
        let runningMode = 'IMAGE';
        let enableWebcamButton;
        // let webcamRunning = false;
        const videoWidth = '380px';
        const videoHeight = '292px';

        const createHandLandmarker = async () => {
         
            const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm');
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',

                    delegate: 'GPU'
                },
                numHands: 2,
                runningMode: runningMode,
            });
        };
        // createGestureRecognizer();
        createHandLandmarker();


        const video = document.getElementById('webcam');
        const canvasElement = document.getElementById('output_canvas');
        const canvasCtx = canvasElement.getContext('2d');


        enableWebcamButton = document.getElementById('webcamButton');
        enableWebcamButton.addEventListener('click', enableCam);

        function enableCam(event) {

            if (!handLandmarker) {
                console.log("Wait for handLandmarker to load before clicking!");
                return;
              }
            
            if (webcamRunning === true) {
                webcamRunning = false;
            }
            else {
                webcamRunning = true;
            }
            // getUsermedia parameters.
            const constraints = {
                video: true
            };
            // Activate the webcam stream.
            navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                video.srcObject = stream;
                video.addEventListener('loadeddata', predictWebcam);
            });
        }
        let lastVideoTime = -1;

        async function predictWebcam() {

            const webcamElement = document.getElementById('webcam');
            if (runningMode === "IMAGE") {
                runningMode = "VIDEO";
                await handLandmarker.setOptions({ runningMode: "VIDEO" });
              }

            let nowInMs = Date.now();

            let startTimeMs = performance.now();

            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;

                results = handLandmarker.detectForVideo(video, startTimeMs);
            }

            
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            const drawingUtils = new DrawingUtils(canvasCtx);
            canvasElement.style.height = videoHeight;
            webcamElement.style.height = videoHeight;
            canvasElement.style.width = videoWidth;
            webcamElement.style.width = videoWidth;

            // segir hvort það sé verið að nota hægri eða vinstri
            if (results.landmarks.length > 0 ) {
                let r =null;
                let l = null;
                

                let telj = 0;
                for (const hendi of results.handednesses) {

                    if (hendi[0].displayName == "Right") {
                        r = telj;
            
                    } else {
                        l = telj;
                    }
                    telj += 1;
                }
                console.log("l", l,"r", r);
                if (l != null) {
                    const p1 = results.landmarks[l][5];
                    const p2 = results.landmarks[l][17];
                    const p3 = results.landmarks[l][0];
                    yangle = calculateYawAngle(p1, p2, p3);

                }
                if (r != null) {
                    const p21 = results.landmarks[r][5];
                    const p22 = results.landmarks[r][17];
                    const p23 = results.landmarks[r][0];
                    xangle = calculateYawAngle(p21, p22, p23);

                }


                for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 4
                    });
                    
                    drawingUtils.drawLandmarks(landmarks, {
                        color: '#FF0000',
                        lineWidth: 2
                    });
                }
            }

            canvasCtx.restore();

            

            if (webcamRunning === true) {
                window.requestAnimationFrame(predictWebcam);
            }
        }
