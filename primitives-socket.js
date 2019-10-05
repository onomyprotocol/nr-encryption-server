import nodejs from 'nodejs-mobile-react-native'


export default function primitivesSocket() {
    return {
        
        cryptKeyGen() {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const encryptKeyPairRequest = { "type":"encryptionKeyPair" }
                    socketClient.send(JSON.stringify(encryptKeyPairRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(JSON.parse(event.data))
                }
            });
        },
        signKeyGen() {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const signatureKeyPairRequest = { "type":"signatureKeyPair" }
                    socketClient.send(JSON.stringify(signatureKeyPairRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(JSON.parse(event.data))
                }
            });
        },
        cryptTransformKeyGen(fromKeyPair, toPubKey, signKeyPair) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const signatureKeyPairRequest = { 
                        "type":"cryptTransformKeys",
                        "encryptPrivKey":fromKeyPair.privKey,
                        "encryptPubKey":fromKeyPair.pubKey,
                        "signPrivKey":signKeyPair.privKey,
                        "signPubKey":signKeyPair.pubKey,
                        "toPublicKey":toPubKey,
                    }
                    socketClient.send(JSON.stringify(signatureKeyPairRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(event.data)
                }
            });
        },
        encrypt(fromPublicKey, fromPlainText, fromSignKeyPair) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const encryptRequest = {
                        "type":"encrypt",
                        "encryptPubKey":fromPublicKey,
                        "plaintext":fromPlainText,
                        "signPrivKey":fromSignKeyPair.privKey,
                        "signPubKey":fromSignKeyPair.pubKey,
                    }
                    socketClient.send(JSON.stringify(encryptRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(event.data)
                }
            });
        },
        decrypt(decryptKeyPair, ciphertext) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const decryptRequest = {
                        "type":"decrypt",
                        "decryptPrivKey":decryptKeyPair.privKey,
                        "decryptPubKey":decryptKeyPair.pubKey,
                        "decryptCiphertext":ciphertext
                    }
                    console.log(JSON.stringify(decryptRequest))
                    socketClient.send(JSON.stringify(decryptRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    console.log("received")
                    res(event.data)
                }
            });                
        },
        cryptTransform(transformKey, ciphertext, signKeyPair) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const transformRequest = {
                        "type":"cryptTransform",
                        "transformKey":transformKey,
                        "transCiphertext":ciphertext,
                        "transSignPrivKey":signKeyPair.privKey,
                        "transSignPubKey":signKeyPair.pubKey
                    }
                    socketClient.send(JSON.stringify(transformRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(event.data)
                }
            });              
        },
        sign(signKeyPair, signtext) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const signRequest = {
                        "type":"sign",
                        "signPrivKey":signKeyPair.privKey,
                        "signPubKey":signKeyPair.pubKey,
                        "signtext":signtext
                    }
                    socketClient.send(JSON.stringify(signRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(event.data)
                }
            });              
        },
        verify(signPubKey, signature, signtext) {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const verifyRequest = {
                        "type":"verify",
                        "signPubKey":signPubKey,
                        "signature":signature,
                        "signtext":signtext
                    }
                    socketClient.send(JSON.stringify(verifyRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    const booleanSwitch = event.data == "true";
                    res(booleanSwitch)
                }
            });              
        },
        test() {
            return new Promise((res, err) => {
                const socketClient = new WebSocket("ws://localhost:8080")
                socketClient.onopen = function (event) {
                    const testDecryptionRequest = { "type":"testTransformKey" }
                    socketClient.send(JSON.stringify(testDecryptionRequest))
                }
                socketClient.onmessage = function (event) {
                    socketClient.close()
                    res(event.data)
                }
            });
        }
    }
}
