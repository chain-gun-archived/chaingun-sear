import root from 'window-or-global'

if (!('btoa' in root)) {
  root.btoa = function btoa(b: any) {
    return new root.Buffer.from(b, 'binary').toString('base64')
  }
}

if (!('atob' in root)) {
  root.atob = function atob(b: any) {
    return new root.Buffer.from(b, 'base64').toString('binary')
  }
}
