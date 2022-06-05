'use strict'


const bufferToBase64 = buffer => btoa(String.fromCharCode(...new Uint8Array(buffer)))
const str2ab = (str) => {
    return base64url.decode(str)
}

const createWebAuthn = async (res) => {
    const credential = await navigator.credentials.create({
        publicKey: res
    })
    return credential  
}

const getWebAuthn = async (res) => {
    const credential = await navigator.credentials.get({
        publicKey: res
    })
    return credential   
}

const fecthPublicData = async (api, data) => {
   const res = await( await fetch(api, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })).json()
    if(res.status === 'failed'){
        alert(res.message)
        return
    }
    return res
}


const sendWebAuthnResponse = (body) => {
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`)

        return response
    })
}

// register verify
$('#register').submit( async function(event) {
    event.preventDefault()
    let username = this.username.value
    let name     = this.name.value
    if(!username || !name) {
        alert('Name or username is missing!')
        return
    }
    let formBody = {username, name}

   let res = await fecthPublicData('/webauthn/register', formBody)

    res.challenge = base64url.decode(res.challenge)
    res.user.id = base64url.decode(res.user.id)

    const credential = await createWebAuthn(res) 
    let makeCredResponse = publicKeyCredentialToJSON(credential)
    sendWebAuthnResponse(makeCredResponse).then(()=> {
        alert('Register Success !')
        $('#registerContainer').hide()
        $('#loginContainer').show()
    })
})

// login verify
$('#login').submit( async function(event) {
    event.preventDefault()
    let username = this.username.value
    if(!username) {
        alert('Username is missing!')
        return
    }

   let res = await fecthPublicData('/webauthn/login', { username })

    const credential = await getWebAuthn(preformatGetAssertReq(res)) 
    
    let getAssertionResponse = publicKeyCredentialToJSON(credential)
    sendWebAuthnResponse(getAssertionResponse).then((res)=> {
        alert('Login Success !')
    })
})
