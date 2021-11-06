export default function (ssh): any[] {
  return !ssh ? [] : [
    {
      "name": "SSH_PASSPHRASE",
      "valueFrom": {
        "secretKeyRef": {
          "name": ssh.secret,
          "key": ssh.passphrase
        }
      }
    },
    {
      "name": "SSH_KEY",
      "valueFrom": {
        "secretKeyRef": {
          "name": ssh.secret,
          "key": ssh.key
        }
      }
    }
  ]
}