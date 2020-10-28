var Starfish = {
  sign: (msg) => {
    return fetch("http://localhost:21000/sign", {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: msg,
        host: location.host
      })
    }).then((res) => {
      return res.json()
    }).then((res) => {
      if (res.error) {
        throw new Error(res.error)
      } else {
        return res
      }
    })
  }
}
