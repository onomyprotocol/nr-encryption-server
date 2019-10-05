const WebSocket = require('ws')
const Primitives = require('./primitives')

const wss = new WebSocket.Server({ port: 21007 })

wss.on('connection', ws => {
  ws.on('message', async message => {
    msg = JSON.parse(message)
    switch(msg.type) {

      case "encryptionKeyPair": {
        const encryptKeyPair = await Primitives.cryptKeyGen()
        const encryptKeyResponse = {
          "privKey":encryptKeyPair.privKey,
          "pubKey":encryptKeyPair.pubKey,
        }
        ws.send(JSON.stringify(encryptKeyResponse))
        break;
      }
        
      
      case "signatureKeyPair": {
        const signKeyPair = await Primitives.signKeyGen()
        const signKeyResponse = {
          "privKey":signKeyPair.privKey,
          "pubKey":signKeyPair.pubKey,
        }
        ws.send(JSON.stringify(signKeyResponse))
        break;
      }
          
      
      case "cryptTransformKeys": {
        const encryptKeyPair = {
          privKey:msg.encryptPrivKey,
          pubKey:msg.encryptPubKey
        }
        const signKeyPair = {
          privKey:msg.signPrivKey,
          pubKey:msg.signPubKey
        }
        const toPubKey = msg.toPublicKey
        const transformKeyResponse = await Primitives.cryptTransformKeyGen(encryptKeyPair, toPubKey, signKeyPair)
        ws.send(transformKeyResponse)
        break;
      }
        
      
      case "encrypt": {
        const publicKey = msg.encryptPubKey
        const plaintext = msg.plaintext
        const signKeyPair = {
          privKey:msg.signPrivKey,
          pubKey:msg.signPubKey
        }
        const encryptedTextResponse = await Primitives.encrypt(publicKey, plaintext, signKeyPair)
        ws.send(encryptedTextResponse) 
        break;
      }
        
      
      case "decrypt": {
        const decryptKeyPair = {
          privKey:msg.decryptPrivKey,
          pubKey:msg.decryptPubKey
        }
        const ciphertext = msg.decryptCiphertext
        const decryptedPlaintext = await Primitives.decrypt(decryptKeyPair, ciphertext)
        ws.send(decryptedPlaintext)
        break;
      }
        
      
      case "cryptTransform": {
        const transformKey = msg.transformKey
        const originalCiphertext = msg.transCiphertext
        const signKeyPair = {
          privKey:msg.transSignPrivKey,
          pubKey:msg.transSignPubKey
        }
        const transformedCiphertext = await Primitives.cryptTransform(transformKey, originalCiphertext, signKeyPair)
        ws.send(transformedCiphertext)
        break;
      }
        

      case "sign": {
        const signKeyPair = {
          privKey: msg.signPrivKey,
          pubKey: msg.signPubKey
        }
        const signtext = msg.signtext
        const signature = await Primitives.sign(signKeyPair, signtext)
        ws.send(signature)
        break;
      }
        

      case "verify": {
        const verifySignPubKey = msg.signPubKey
        const signature = msg.signature
        const signtext = msg.signtext
        const verified = await Primitives.verify(verifySignPubKey, signature, signtext)
        const verifiedString = verified.toString()
        ws.send(verifiedString)
        break;
      }
        
    }
  })
})
