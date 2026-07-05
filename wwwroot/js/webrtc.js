window.webrtc = {
    peerConnection: null,
    dataChannel: null,
    dotNetRef: null,

    initDashboard: async (dotNetObj) => {
        window.webrtc.dotNetRef = dotNetObj;
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.cloudflare.com:3478" }
            ]
        });
        window.webrtc.peerConnection = pc;

        // Create data channel as the offerer
        const dc = pc.createDataChannel("eta-channel");
        window.webrtc.setupDataChannel(dc);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to Cloudflare Calls proxy to create a session
        const response = await fetch("/api/calls/sessions/new", {
            method: "POST",
            body: JSON.stringify({ sessionDescription: offer })
        });
        
        if (response.ok) {
            const result = await response.json();
            await pc.setRemoteDescription(result.sessionDescription);
            return result.sessionId; // Return this to Blazor so it can be put in the URL
        }
        return null;
    },

    joinSession: async (sessionId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.cloudflare.com:3478" }
            ]
        });
        window.webrtc.peerConnection = pc;

        pc.ondatachannel = (event) => {
            window.webrtc.setupDataChannel(event.channel);
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to join existing session
        const response = await fetch(`/api/calls/sessions/${sessionId}/tracks/new`, {
            method: "POST",
            body: JSON.stringify({ sessionDescription: offer })
        });

        if (response.ok) {
            const result = await response.json();
            await pc.setRemoteDescription(result.sessionDescription);
            return true;
        }
        return false;
    },

    setupDataChannel: (dc) => {
        window.webrtc.dataChannel = dc;
        dc.onopen = () => console.log("Data channel open!");
        dc.onmessage = (event) => {
            if (window.webrtc.dotNetRef) {
                window.webrtc.dotNetRef.invokeMethodAsync("OnEtaReceived", event.data);
            }
        };
    },

    sendEtaData: (etaMessage) => {
        if (window.webrtc.dataChannel && window.webrtc.dataChannel.readyState === "open") {
            window.webrtc.dataChannel.send(etaMessage);
            return true;
        }
        return false;
    }
};
