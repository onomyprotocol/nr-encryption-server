const Recrypt = require('./index.node')
const RecryptApi = new Recrypt.Api256()
const { TextEncoder, TextDecoder } = require('text-encoding-shim')
const { bufferToHex, hexToBuffer } = require('./hex-buffer')
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function replacer(key, value) {
    if (value instanceof Uint8Array) {
      return bufferToHex(value)
    }
    if (value instanceof Buffer) {
      return bufferToHex(new Uint8Array(value))
    }
  
    if (value && value.type === 'Buffer') {
      return bufferToHex(new Uint16Array(value.data))
    }
    return value
}
  
function reviver(key, value) {
    if (typeof value === 'string') {
    return hexToBuffer(value)
    }
    return value
}

function stringify(value, space) {
    const res = JSON.stringify(value, replacer, space)
    return res
}

function parse(text) {
    const res = JSON.parse(text, reviver)
    return res
}

module.exports = {
    
    serialize: function(obj) {
        return stringify(obj)
    },

    cryptKeyGen: async function() {
        const encryptionKeys = RecryptApi.generateKeyPair()
        const pubX = bufferToHex(encryptionKeys.publicKey.x)
        const pubY = bufferToHex(encryptionKeys.publicKey.y)
        return {
            privKey: bufferToHex(encryptionKeys.privateKey),
            pubKey: `${pubX}.${pubY}`
        }
    },

    cryptTransformKeyGen: async function(fromKeyPair, toPubKey, signKeyPair) {
        const [pubX, pubY] = toPubKey.split('.')
  
        
        const res = RecryptApi.generateTransformKey(
            hexToBuffer(fromKeyPair.privKey),
            {
                x: hexToBuffer(pubX),
                y: hexToBuffer(pubY)
            },
            hexToBuffer(signKeyPair.privKey)
        )

        return stringify(res)
        
    },

    signKeyGen: async function() {
        const signingKeys = RecryptApi.generateEd25519KeyPair()

        return {
            privKey: bufferToHex(signingKeys.privateKey),
            pubKey: bufferToHex(signingKeys.publicKey)
        }
    },

    encrypt: async function(pubKey, plaintext, signKeyPair) {
        const [pubX, pubY] = pubKey.split('.')
        let padded = plaintext
        
        while (padded.length < 384) padded += ' '

        const res = RecryptApi.encrypt(
            textEncoder.encode(padded),
            {
                x: hexToBuffer(pubX),
                y: hexToBuffer(pubY)
            },
            hexToBuffer(signKeyPair.privKey)
        )

        return stringify(res)
    },

    decrypt: async function(keyPair, ciphertext) {
        const result = RecryptApi.decrypt(parse(ciphertext), hexToBuffer(keyPair.privKey))
        return textDecoder.decode(result instanceof Buffer ? new Uint8Array(result) : result).trim()
    },

    cryptTransform: async function(transformKey, ciphertext, signKeyPair) {
        return stringify(
            RecryptApi.transform(
                parse(ciphertext),
                parse(transformKey),
                hexToBuffer(signKeyPair.privKey)
            )
        )
    },

    sign: async function(keyPair, text) {
        return bufferToHex(RecryptApi.ed25519Sign(hexToBuffer(keyPair.privKey), Buffer.from(text)))
    },

    verify: async function(pubKey, signature, text) {
        return RecryptApi.ed25519Verify(
            hexToBuffer(pubKey),
            Buffer.from(text),
            hexToBuffer(signature)
        )
    } 
}