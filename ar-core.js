// --- UNIVERSAL HOLOGRAPHIC AR INTERACTION CORE WITH CONTEXTUAL SCROLLING ---

function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.querySelector('.input_video');
  const cursor1 = document.querySelector('#hand-cursor-1');
  const cursor2 = document.querySelector('#hand-cursor-2');
  const cameraBtn = document.querySelector('#camera-toggle');
  
  if (!videoElement || !cameraBtn) {
    console.warn("AR Core: Missing basic video or button elements on this page.");
    return;
  }

  const camLabel = cameraBtn.querySelector('.cam-label');

  let arEnabled = false;
  let cameraInstance = null;
  let handsInstance = null;

  // Track dragging variables for scrolling
  const pinchState = {
    'Left': { isPinching: false, startY: 0, lastY: 0, hasScrolled: false, startTime: 0 },
    'Right': { isPinching: false, startY: 0, lastY: 0, hasScrolled: false, startTime: 0 }
  };

  let aimCursorX = window.innerWidth / 2;
  let aimCursorY = window.innerHeight / 2;

  // Programmatically guarantee tracking elements never block underlying UI targets
  if (cursor1) cursor1.style.pointerEvents = 'none';
  if (cursor2) cursor2.style.pointerEvents = 'none';
  if (videoElement) videoElement.style.pointerEvents = 'none';

  // Universal click simulation engine via browser-level event dispatching
  function executeClick(targetX, targetY) {
    const elementBelowCursor = document.elementFromPoint(targetX, targetY);
    if (!elementBelowCursor) return;

    // Build standard high-fidelity native click configurations
    const eventOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: targetX,
      clientY: targetY
    };

    // Trigger sequential event cycle so any JS handler (React/Vanilla/Drag-Drop) executes flawlessly
    elementBelowCursor.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    elementBelowCursor.dispatchEvent(new PointerEvent('pointerup', eventOptions));
    elementBelowCursor.dispatchEvent(new MouseEvent('click', eventOptions));

    // Instant physical cursor bounce confirmation feedback
    if (cursor1) {
      cursor1.classList.add('pinching');
      setTimeout(() => cursor1.classList.remove('pinching'), 200);
    }
  }

  function processHand(landmarks, handednessLabel) {
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];

    const xPos = (1 - indexTip.x) * window.innerWidth;
    const yPos = indexTip.y * window.innerHeight;

    const isPrimary = handednessLabel === 'Left'; // Physical Right Hand (Aim)
    const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

    if (isPrimary) {
      // === BLUE HAND LOGIC (AIM & ROTATE) ===
      if (cursor1) {
        cursor1.style.display = 'block';
        cursor1.style.left = `${xPos}px`;
        cursor1.style.top = `${yPos}px`;
      }
      
      aimCursorX = xPos;
      aimCursorY = yPos;

      if (window.pointer) {
        window.pointer.x = mapRange((1 - indexTip.x), 0, 1, 1, -1);
        window.pointer.y = mapRange(indexTip.y, 0, 1, -1, 1);
      }

    } else {
      // === PURPLE HAND LOGIC (CLICK & DRAG SCROLL) ===
      if (cursor2) {
        cursor2.style.display = 'block';
        cursor2.style.left = `${xPos}px`;
        cursor2.style.top = `${yPos}px`;
      }

      const state = pinchState[handednessLabel];

      if (distance < 0.06) { 
        // --- PINCH INITIALIZATION ---
        if (!state.isPinching) {
          state.isPinching = true;
          state.startY = yPos;
          state.lastY = yPos;
          state.hasScrolled = false;
          state.startTime = Date.now();
          if (cursor2) cursor2.classList.add('pinching');
        } else {
          // --- PINCH SUSTAINED (DRAG TO SCROLL DETECTOR) ---
          const currentY = yPos;
          const deltaY = currentY - state.lastY;
          const totalDistanceDragged = currentY - state.startY;

          if (Math.abs(totalDistanceDragged) > 10) {
            state.hasScrolled = true;
          }

          if (state.hasScrolled) {
            // Find scrollable sub-panels under the blue crosshair pointer
            const targetEl = document.elementFromPoint(aimCursorX, aimCursorY);
            let scrollTarget = null;

            if (targetEl) {
              let parent = targetEl;
              while (parent && parent !== document.body && parent !== document.documentElement) {
                const style = window.getComputedStyle(parent);
                const isScrollableY = parent.scrollHeight > parent.clientHeight;
                const hasScrollStyles = style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll';
                
                if (isScrollableY && hasScrollStyles) {
                  scrollTarget = parent;
                  break;
                }
                parent = parent.parentElement;
              }
            }

            if (scrollTarget) {
              scrollTarget.scrollTop -= deltaY * 2.5; // Drag speed multiplier inside panels
            } else {
              window.scrollBy({
                top: -deltaY * 2.2,
                behavior: 'auto'
              });
            }
          }
          state.lastY = currentY;
        }
      } else {
        // --- PINCH RELEASED ---
        if (state.isPinching) {
          state.isPinching = false;
          if (cursor2) cursor2.classList.remove('pinching');

          if (!state.hasScrolled) {
            const clickDuration = Date.now() - state.startTime;
            if (clickDuration < 500) {
              executeClick(aimCursorX, aimCursorY);
            }
          }
        }
      }
    }
  }

  function onResults(results) {
    if (cursor1) cursor1.style.display = 'none';
    if (cursor2) cursor2.style.display = 'none';

    if (results.multiHandLandmarks && results.multiHandedness) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index].label; 
        processHand(landmarks, handedness);
      });
    }
  }

  function startAR() {
    videoElement.classList.add('ar-active');
    videoElement.style.pointerEvents = 'none';
    if (camLabel) camLabel.innerHTML = 'Camera&nbsp;ON';
    cameraBtn.classList.add('ar-on');

    handsInstance = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    handsInstance.setOptions({
      maxNumHands: 2, 
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });
    handsInstance.onResults(onResults);

    cameraInstance = new window.Camera(videoElement, {
      onFrame: async () => {
        if (handsInstance) await handsInstance.send({ image: videoElement });
      },
      width: 1280,
      height: 720
    });
    cameraInstance.start();
  }

  function stopAR() {
    videoElement.classList.remove('ar-active');
    if (camLabel) camLabel.innerHTML = 'Camera&nbsp;OFF';
    cameraBtn.classList.remove('ar-on');
    if (cursor1) cursor1.style.display = 'none';
    if (cursor2) cursor2.style.display = 'none';

    if (cameraInstance) {
      cameraInstance.stop();
      cameraInstance = null;
    }
    if (videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(t => t.stop());
      videoElement.srcObject = null;
    }
    handsInstance = null;
  }

  cameraBtn.addEventListener('click', () => {
    arEnabled = !arEnabled;
    localStorage.setItem('holoTable_camera_global_state', arEnabled ? 'on' : 'off');
    if (arEnabled) startAR(); else stopAR();
  });

  const globalCameraState = localStorage.getItem('holoTable_camera_global_state');
  if (globalCameraState === 'on') {
    arEnabled = true;
    startAR();
  } else {
    arEnabled = false;
    stopAR();
  }
});
