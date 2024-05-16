// import "./lib/handgesture.js";


let lastTime;

function animation(){
    var now = new Date().getTime(); // Time in milliseconds
    if (now - lastTime < 2000) {
        return;
    } else {
        lastTime = now;
    }
    console.log("click");
    anime({
        targets: ".svg-object polygon",
        points: [
            {value: "194 242 , 423 41 , 678 246 , 418 472"},
            {value: "194 242 , 426 283 , 678 246 , 423 309"},
            {value: "194 242 , 913 81 , 678 246 , 22 463"}
        ],
        direction: "alternate",
        duration: 2000,
        easing: 'easeInOutExpo'
    });
}

function logo_animation(){
    anime({
        targets: ".svg-icon polygon",
        points: [
            {value: "150 150 , 200 50 , 100 50 , 150 150"},
            {value: "250 100 , 150 50 , 50 100 , 150 200"}
        ],
        loop: true,
        duration: 2000,
        easing:"easeInOutExpo",
        direction: "alternate"
    })
}

logo_animation();

function move(p, current){
    console.log("move-anim");
    let pos = p*window.innerWidth;
    
    console.log(pos);
    anime({
        targets: ".svg-object polygon",
        translateX: pos 
    })
}

// hand gesture dot

// result þarf að hafa því það er notað til þess að geyma alla punkkta á hendinni. (notað neðst í skránni)
let results;

function contact(point1, point2, threshold) {
    // Calculate the distance between the two points
    const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    // Check if the distance is less than or equal to the threshold
    return distance <= threshold;
}


// Get a reference to the container element that will hold our scene
import { GestureRecognizer,HandLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13';
        let handLandmarker;
        let runningMode = 'IMAGE';
        let enableWebcamButton;
        const videoWidth = '380px';
        const videoHeight = '292px';

        const createHandLandmarker = async () => {
         
            const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.13/wasm');
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',

                    delegate: 'GPU'
                },
                numHands: 2,
                runningMode: runningMode,
            });
        };
        createHandLandmarker();


        const video = document.getElementById('webcam');
        const canvasElement = document.getElementById('output_canvas');
        const canvasCtx = canvasElement.getContext('2d');
        let webcamRunning = false;

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

            // ef það eru einhverjar hendur á skjánum.
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
                // console.log("l", l,"r", r);
                
                if(r != null){
                    const p8 = results.landmarks[r][8];
                    const p4 = results.landmarks[r][4];
                    // hnitið neðst á lófanum.
                    const p0 = results.landmarks[r][0].x;
                    // console.log(p8, p4);
                    
                    // fall sem skilar true false yfir hvert þeir séu að snertast, vísi og þumall.
                    if(contact(p8, p4, 0.05)){
                        move(p0);
                    } 
                    //þá er kallað á move og fylgt 0 punkti og fært á x ás.
                } 
                if(l != null){
                    const p1 = results.landmarks[l][4];
                    const p2 = results.landmarks[l][12];
                    
                    if(contact(p1, p2, 0.05)){
                        animation();
                    }
                }

                for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 3
                    });
                    
                    drawingUtils.drawLandmarks(landmarks, {
                        color: '#FF0000',
                        lineWidth: 1
                    });
                }
            }
            canvasCtx.restore();

            if (webcamRunning === true) {
                window.requestAnimationFrame(predictWebcam);
            }
        }