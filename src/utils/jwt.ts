export const jwtDecoded = (jwt: string) => {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    const decoder = new TextDecoder('utf-8');
    const json = decoder.decode(outputArray);
    
    return JSON.parse(json);
}