window.getDeviceLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation is not supported by this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                console.warn("High-accuracy geolocation failed, attempting low-accuracy fallback:", error.message);
                navigator.geolocation.getCurrentPosition(
                    (fallbackPos) => {
                        resolve({
                            latitude: fallbackPos.coords.latitude,
                            longitude: fallbackPos.coords.longitude,
                            accuracy: fallbackPos.coords.accuracy
                        });
                    },
                    (fallbackError) => reject(fallbackError.message),
                    { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    });
};

window.getMobilePlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
    return "Unknown";
};

window.copyToClipboard = (text) => {
    if (!navigator.clipboard) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            document.body.removeChild(textarea);
            return true;
        } catch (err) {
            document.body.removeChild(textarea);
            return false;
        }
    }
    return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
};

